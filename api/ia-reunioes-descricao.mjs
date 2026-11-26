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
  const colegiado = limitar(reuniao?.colegiado || '', 120);
  const pautaContexto = limitar(reuniao?.pauta || '', 300);

  return [
    'Você é redator oficial de atas administrativas e técnicas do Tribunal Regional Eleitoral do Acre (TRE-AC), escrevendo para publicação no Sistema Eletrônico de Informações (SEI).',
    'O cabeçalho (Local, Data - Hora, Comitê/Unidade, Participantes, Convidados e Pauta) já está preenchido em campos próprios do sistema. Portanto, NÃO repita cabeçalho, data, lista de participantes nem o título da pauta na resposta.',
    'Fidelidade estrita: baseie-se EXCLUSIVAMENTE na transcrição/anotações fornecidas. Corrija erros gramaticais, marcas de oralidade e digitação para a norma culta jurídica/administrativa, mas NUNCA invente nomes, cargos, siglas, números de itens, processos ou prazos.',
    '',
    'DIRETRIZES DE ESTILO E LINGUAGEM OFICIAL DO TRE-AC:',
    '1. Tom impessoal, técnico-administrativo e em 3ª pessoa do singular/plural (ex.: "convocou a presente reunião com a finalidade de...", "apresentou...", "esclareceu que...", "Informou, ainda, que...", "os membros deliberaram...").',
    '2. Estrutura de "descricao" (separe cada parágrafo com uma linha em branco "\\n\\n"):',
    '   - 1º parágrafo (contextualização): apresente de forma formal a finalidade/motivação da reunião conforme o relato (ex.: "Em atendimento à solicitação de..., a... convocou a presente reunião com a finalidade de apresentar..., expor... e deliberar sobre..." ou formulação equivalente fiel ao texto).',
    '   - Parágrafos seguintes (exposição, esclarecimentos e deliberações): utilize conectivos institucionais do SEI como "Aberta a reunião, ... apresentou...", "destacando..., quais sejam:" (quando houver enumeração de pontos/itens, liste cada item em linha própria iniciada por "• ", finalizando os itens intermediários com ";" , o penúltimo com "; e" e o último com "."), "Na sequência, ... esclareceu que...", "Informou, ainda, que...", e "Em relação a..., deliberou-se / os membros deliberaram pela..., considerando que...".',
    '   - Último parágrafo obrigatório de fechamento: encerre SEMPRE com a frase exata: "Nada mais havendo a ser tratado, a reunião foi encerrada."',
    '3. Estrutura de "providencias":',
    '   - Redija em prosa administrativa formal e direta no padrão SEI do TRE-AC indicando a unidade/responsável e a providência a ser adotada (ex.: "A STI irá solicitar reunião com urgência para apresentação das evidências aos membros do CGOVTIC, a ser designada data e horário pela Presidência do Comitê de Governança."). Se houver múltiplas providências distintas para setores diferentes, apresente uma por linha iniciada por "• " mantendo a mesma redação formal completa.',
    '   - Se nenhuma providência ou encaminhamento futuro tiver sido mencionado na transcrição, retorne exatamente: "Não foram registradas providências."',
    '',
    'EXEMPLO DE ESTILO REAL DO TRE-AC (apenas referência de tom e estrutura — NÃO copie os dados deste exemplo):',
    '{"descricao":"Em atendimento à solicitação da Assistente de Planejamento e Governança de TIC, a Secretaria de Tecnologia da Informação (STI) convocou a presente reunião com a finalidade de apresentar o resultado preliminar do ciclo avaliativo, expor as evidências reprovadas e deliberar sobre as providências a serem adotadas para saneamento das inconsistências identificadas.\\n\\nAberta a reunião, a Assistente apresentou o resultado preliminar da avaliação, destacando os pareceres que motivaram a reprovação das evidências avaliadas, quais sejam:\\n• Item 1.1 - Comprovar que a coordenação dos macroprocessos de TIC é realizada por servidores do quadro permanente, conforme percentual informado; e\\n• Item 24 - Comprovar que o órgão formalizou, definiu processos, executa e revisa o Plano de Gestão de Riscos de TIC.\\n\\nNa sequência, esclareceu que as reprovações decorreram de inconsistência nas informações constantes da planilha encaminhada. Informou, ainda, que tais inconsistências poderão ser sanadas pela STI mediante a atualização das informações dentro do prazo estabelecido.\\n\\nEm relação aos demais pontos, os membros deliberaram, por unanimidade, pela submissão da matéria ao Comitê de Governança de Tecnologia da Informação e Comunicação (CGOVTIC), para análise mais aprofundada e deliberação acerca da conveniência e oportunidade de interposição de recurso.\\n\\nNada mais havendo a ser tratado, a reunião foi encerrada.","providencias":"A STI irá solicitar reunião com urgência para apresentação das evidências aos membros do CGOVTIC, a ser designada data e horário pela Presidência do Comitê de Governança."}',
    '',
    'Retorne EXCLUSIVAMENTE um objeto JSON válido com exatamente as chaves "descricao" (máximo 4500 caracteres) e "providencias" (máximo 2800 caracteres).',
    colegiado ? `Contexto da unidade/colegiado da reunião (apenas referência): ${colegiado}` : '',
    pautaContexto ? `Contexto da pauta cadastrada (apenas referência, não repita como título): ${pautaContexto}` : '',
    '',
    'TRANSCRIÇÃO / ANOTAÇÕES DA REUNIÃO A REDIGIR:',
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

async function descobrirModelosDisponiveis(apiKey, fetcher) {
  try {
    const resp = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`, {
      method: 'GET',
      signal: AbortSignal.timeout(8000)
    });
    if (!resp.ok) return [];
    const data = await resp.json();
    const lista = Array.isArray(data?.models) ? data.models : [];
    const validos = lista
      .filter(m => Array.isArray(m?.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
      .map(m => String(m?.name || '').replace(/^models\//, ''))
      .filter(Boolean);
    const flash = validos.filter(n => /flash/i.test(n) && !/image|audio|tts|thinking/i.test(n));
    const outros = validos.filter(n => !flash.includes(n) && !/embedding|aqa|imagen|veo|tts|audio/i.test(n));
    return [...flash, ...outros].slice(0, 6);
  } catch (_) {
    return [];
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
    const modelosIniciais = [...new Set([modeloPreferido, 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest', 'gemini-2.0-flash'])];
    const prompt = montarPrompt(body?.reuniao || {}, transcricao);

    const tentarModelo = async (model) => {
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
        return { ok: true, descricao, providencias };
      }
      let erroJson = null;
      try { erroJson = await response.json(); } catch (_) { erroJson = null; }
      return {
        ok: false,
        status: response.status,
        codigo: String(erroJson?.error?.status || erroJson?.error?.message || '').slice(0, 120)
      };
    };

    try {
      const tentados = new Set();
      let ultimoStatus = 502;
      let ultimoCodigo = '';

      const executarLista = async (lista) => {
        for (const model of lista) {
          if (tentados.has(model)) continue;
          tentados.add(model);
          const r = await tentarModelo(model);
          if (r.ok) return r;
          ultimoStatus = r.status;
          ultimoCodigo = r.codigo;
          if (r.status === 404 || r.status === 503) continue;
          return r;
        }
        return null;
      };

      let resultado = await executarLista(modelosIniciais);
      if (!resultado && ultimoStatus === 404) {
        const descobertos = await descobrirModelosDisponiveis(apiKey, fetcher);
        if (descobertos.length) resultado = await executarLista(descobertos);
      }

      if (resultado?.ok) {
        if (!resultado.descricao) {
          return res.status(502).json({ error: 'A IA retornou uma resposta vazia. Tente novamente.' });
        }
        return res.status(200).json({ descricao: resultado.descricao, providencias: resultado.providencias });
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
