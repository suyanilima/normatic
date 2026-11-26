const assert = require('node:assert/strict');

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    setHeader(k, v) { this.headers[k] = v; },
    status(code) { this.statusCode = code; return this; },
    json(data) { this.body = data; return this; }
  };
}

(async () => {
  const { createHandler } = await import('../api/ia-reunioes-descricao.mjs');

  const hGet = createHandler({ env: { GEMINI_API_KEY: 'test-key' } });
  const rGet = makeRes();
  await hGet({ method: 'GET', headers: {} }, rGet);
  assert.equal(rGet.statusCode, 405);

  const hNoKey = createHandler({ env: {} });
  const rNoKey = makeRes();
  await hNoKey({ method: 'POST', headers: {}, body: { transcricao: 'Teste' } }, rNoKey);
  assert.equal(rNoKey.statusCode, 503);

  const hEmpty = createHandler({ env: { GEMINI_API_KEY: 'test-key' } });
  const rEmpty = makeRes();
  await hEmpty({ method: 'POST', headers: {}, body: { transcricao: '   ' } }, rEmpty);
  assert.equal(rEmpty.statusCode, 400);

  let calledUrl = '';
  let capturedBody = null;
  const hOk = createHandler({
    env: { GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-2.5-flash' },
    fetcher: async (url, init) => {
      calledUrl = String(url);
      capturedBody = init?.body ? JSON.parse(init.body) : null;
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{
            content: {
              parts: [{
                text: JSON.stringify({
                  descricao: 'Deliberou-se pela aprovação do cronograma.',
                  providencias: 'STI enviará relatório até 30/11.'
                })
              }]
            }
          }]
        })
      };
    }
  });
  const rOk = makeRes();
  await hOk({
    method: 'POST',
    headers: {},
    body: {
      reuniao: { colegiado: 'CGTIC', data: '2026-11-25', horario: '10:00', pauta: 'Cronograma' },
      transcricao: 'Aprovamos o cronograma e a STI vai mandar o relatório até dia 30/11.'
    }
  }, rOk);
  assert.equal(rOk.statusCode, 200);
  assert.ok(calledUrl.includes('gemini-2.5-flash:generateContent'));
  const promptEnviado = capturedBody?.contents?.[0]?.parts?.[0]?.text || '';
  assert.ok(promptEnviado.includes('Tribunal Regional Eleitoral do Acre (TRE-AC)'), 'Prompt utiliza o padrão oficial do TRE-AC');
  assert.ok(promptEnviado.includes('Nada mais havendo a ser tratado, a reunião foi encerrada.'), 'Prompt exige o fecho oficial das atas do TRE-AC');
  assert.equal(capturedBody?.generationConfig?.thinkingConfig?.thinkingBudget, 0, 'Desativa raciocínio oculto lento no Gemini 2.5 Flash');
  assert.equal(rOk.body.descricao, 'Deliberou-se pela aprovação do cronograma.');
  assert.equal(rOk.body.providencias, 'STI enviará relatório até 30/11.');

  // Se o primeiro modelo der timeout/lentidão, cai automaticamente para o próximo modelo rápido
  const tentadosFallback = [];
  const hFallback = createHandler({
    env: { GEMINI_API_KEY: 'test-key', GEMINI_MODEL: 'gemini-2.5-flash' },
    fetcher: async (url) => {
      tentadosFallback.push(String(url));
      if (String(url).includes('gemini-2.5-flash:')) {
        const err = new Error('Timeout');
        err.name = 'TimeoutError';
        throw err;
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          candidates: [{ content: { parts: [{ text: JSON.stringify({ descricao: 'Gerado via fallback rápido.', providencias: 'Não foram registradas providências.' }) }] } }]
        })
      };
    }
  });
  const rFallback = makeRes();
  await hFallback({ method: 'POST', headers: {}, body: { transcricao: 'Anotação rápida' } }, rFallback);
  assert.equal(rFallback.statusCode, 200);
  assert.ok(tentadosFallback.some(u => u.includes('gemini-2.5-flash-lite:generateContent')), 'Usa gemini-2.5-flash-lite automaticamente quando o principal atrasa');
  assert.equal(rFallback.body.descricao, 'Gerado via fallback rápido.');

  console.log('IA Atas: validação de método, chave, payload e geração via Gemini verificadas.');
})().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
