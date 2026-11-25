const DEFAULT_MODEL = 'gemini-2.5-flash';
const MAX_TRANSCRICAO = 20000;
const MAX_DESCRICAO = 5000;
const MAX_PROVIDENCIAS = 3000;

function limitar(texto, max) {
  return String(texto || '').trim().slice(0, max);
}

function extrairJson(texto) {
  const limpo = String(texto || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  try {
    return JSON.parse(limpo);
  } catch (_) {
    const inicio = limpo.indexOf('{');
    const fim = limpo.lastIndexOf('}');
    if (inicio >= 0 && fim > inicio) {
      try { return JSON.parse(limpo.slice(inicio, fim + 1)); } catch (_) { return null; }
    }
    return null;
  }
}

function montarPrompt(reuniao, transcricao) {
  const colegiado = limitar(reuniao?.colegiado || 'Reunião institucional', 120);
  const data = limitar(reuniao?.data || '', 30);
  const horario = limitar(reuniao?.horario || '', 20);
  const pauta = limitar(reuniao?.pauta || '', 400);
  const membros = Array.isArray(reuniao?.membros)
    ? reuniao.membros.map(m => [m?.nome, m?.cargo].filter(Boolean).join(' - ')).filter(Boolean).slice(0, 30)
    : [];
  const convidados = Array.isArray(reuniao?.convidados)
    ? reuniao.convidados.map(c => typeof c === 'string' ? c : [c?.nome, c?.setor].filter(Boolean).join(' - ')).filter(Boolean).slice(0, 30)
    : [];

  return [
    'Você é um secretário técnico redigindo uma ata oficial em português do Brasil (padrão institucional do Poder Judiciário).',
    'Organize a transcrição ou anotações abaixo em dois campos JSON objetivos, claros e formais, sem inventar fatos, nomes, números ou prazos que não estejam no texto fornecido.',
    '',
    'Retorne EXCLUSIVAMENTE um objeto JSON válido com exatamente estas duas chaves:',
    '- "descricao": resumo formal, coeso e bem estruturado das discussões, problemas relatados, solicitações e deliberações da reunião (máximo 4500 caracteres).',
    '- "providencias": lista clara de encaminhamentos e providências com responsáveis e prazos quando citados no texto. Se não houver providências mencionadas, retorne exatamente "Não foram registradas providências.".',
    '',
    'DADOS DA REUNIÃO:',
    `Unidade/Colegiado: ${colegiado}`,
    data ? `Data: ${data}${horario ? ' às ' + horario : ''}` : '',
    pauta ? `Pauta: ${pauta}` : '',
    membros.length ? `Membros: ${membros.join('; ')}` : '',
    convidados.length ? `Convidados: ${convidados.join('; ')}` : '',
    '',
    'TRANSCRIÇÃO / ANOTAÇÕES:',
    transcricao
  ].filter(Boolean).join('\n');
}

async function verificarUsuarioSupabase(req, env, fetcher) {
  const supabaseUrl = String(env.SUPABASE_URL || '').replace(/\/$/, '');
  const apiKey = env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!supabaseUrl || !apiKey) return { ok: true };
  const authHeader = String(req.headers?.authorization || '');
  if (!authHeader.startsWith('Bearer ')) return { ok: false, status: 401, error: 'Sessão não informada. Entre no sistema para usar a edição com IA.' };
  try {
    const resp = await fetcher(`${supabaseUrl}/auth/v1/user`, {
      method: 'GET',
      headers: { apikey: apiKey, Authorization: authHeader },
      signal: AbortSignal.timeout(6000)
    });
    if (!resp.ok) return { ok: false, status: 401, error: 'Sessão expirada ou inválida. Atualize a página e entre novamente.' };
    return { ok: true };
  } catch (_) {
    return { ok: false, status: 503, error: 'Não foi possível validar sua sessão no momento.' };
  }
}

export function createHandler({ env = process.env, fetcher = fetch } = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido.' });

    const apiKey = String(env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '');
    if (!apiKey) {
      return res.status(503).json({ error: 'Serviço de IA ainda não configurado no Vercel (defina GEMINI_API_KEY).' });
    }

    const auth = await verificarUsuarioSupabase(req, env, fetcher);
    if (!auth.ok) return res.status(auth.status).json({ error: auth.error });

    const body = typeof req.body === 'string' ? extrairJson(req.body) : req.body;
    const transcricao = limitar(body?.transcricao, MAX_TRANSCRICAO);
    if (!transcricao) {
      return res.status(400).json({ error: 'Informe a transcrição ou anotações da reunião.' });
    }

    const modeloPreferido = String(env.GEMINI_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
    const modelos = [...new Set([modeloPreferido, 'gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-1.5-flash'])];
    const prompt = montarPrompt(body?.reuniao || {}, transcricao);

    try {
      let ultimoStatus = 502;
      let ultimoCodigo = '';
      for (const model of modelos) {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const response = await fetcher(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json'
            }
          }),
          signal: AbortSignal.timeout(25000)
        });

        if (response.ok) {
          const data = await response.json();
          const textoBruto = data?.candidates?.[0]?.content?.parts?.map(p => p?.text || '').join('\n').trim() || '';
          const parsed = extrairJson(textoBruto);
          const descricao = limitar(parsed?.descricao || textoBruto, MAX_DESCRICAO);
          const providencias = limitar(parsed?.providencias || 'Não foram registradas providências.', MAX_PROVIDENCIAS);
          if (!descricao) {
            return res.status(502).json({ error: 'A IA retornou uma resposta vazia. Tente novamente.' });
          }
          return res.status(200).json({ descricao, providencias });
        }

        ultimoStatus = response.status;
        let erroJson = null;
        try { erroJson = await response.json(); } catch (_) { erroJson = null; }
        ultimoCodigo = String(erroJson?.error?.status || erroJson?.error?.message || '').slice(0, 120);

        // Se o modelo não existir ou estiver sobrecarregado, tenta o próximo modelo gratuito.
        if (response.status === 404 || response.status === 503) continue;
        break;
      }

      if (ultimoStatus === 429) {
        return res.status(429).json({ error: 'Limite gratuito temporário da IA atingido. Aguarde alguns instantes e tente novamente.' });
      }
      if (ultimoStatus === 400 || ultimoStatus === 401 || ultimoStatus === 403) {
        return res.status(502).json({ error: `Chave GEMINI_API_KEY inválida ou sem permissão no Google AI Studio (HTTP ${ultimoStatus}).` });
      }
      return res.status(502).json({ error: `Não foi possível gerar o resumo com a IA (HTTP ${ultimoStatus}${ultimoCodigo ? ` · ${ultimoCodigo}` : ''}).` });
    } catch (_) {
      return res.status(503).json({ error: 'Tempo limite ou falha de comunicação com o serviço de IA. Use Prosseguir para revisar manualmente.' });
    }
  };
}

export default createHandler();
