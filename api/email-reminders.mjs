import {timingSafeEqual} from 'node:crypto';
import {planReminders, digestMessage, deliveryKey, validEmail} from '../server/email-core.mjs';

export function createHandler({env = process.env, fetcher = fetch, now = () => new Date(), pause = ms => new Promise(resolve => setTimeout(resolve, ms))} = {}) {
  return async function handler(req, res) {
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET') return res.status(405).json({error: 'Método não permitido'});
    const expected = Buffer.from('Bearer ' + (env.CRON_SECRET || ''));
    const received = Buffer.from(String(req.headers.authorization || ''));
    if (!env.CRON_SECRET || received.length !== expected.length || !timingSafeEqual(received, expected)) return res.status(401).json({error: 'Não autorizado'});
    if (env.EMAIL_ENABLED !== 'true') return res.status(200).json({enabled: false});
    const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY', 'EMAIL_FROM'];
    if (required.some(key => !env[key]) || (env.EMAIL_TEST_TO && !validEmail(env.EMAIL_TEST_TO))) return res.status(503).json({error: 'Configuração de e-mail incompleta'});
    if (/resend\.dev>?$/i.test(env.EMAIL_FROM) && !env.EMAIL_TEST_TO) return res.status(503).json({error: 'Configure o destinatário de teste'});
    const started = Date.now();
    const headers = {apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: 'Bearer ' + env.SUPABASE_SERVICE_ROLE_KEY, 'Content-Type': 'application/json'};
    async function db(path, body) {
      const response = await fetcher(env.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/' + path, {method: body ? 'POST' : 'GET', headers, ...(body ? {body: JSON.stringify(body)} : {}), signal: AbortSignal.timeout(8000)});
      if (!response.ok) throw Error('database');
      return response.status === 204 ? null : response.json();
    }
    async function read(table) {
      let values = [];
      for (let offset = 0; ; offset += 1000) {
        const page = await db(`normatic_${table}?select=payload&order=id&limit=1000&offset=${offset}`);
        values.push(...page.map(row => row.payload));
        if (page.length < 1000) return values;
        if (Date.now() - started > 15000) throw Error('read-limit');
      }
    }
    try {
      const [tarefas, reunioes, responsaveis] = await Promise.all(['tarefas', 'reunioes', 'responsaveis'].map(read));
      const plan = planReminders({tarefas, reunioes, responsaveis}, now());
      let accepted = 0, failed = 0, skipped = 0, deferred = 0;
      for (const digest of plan.digests) {
        // No modo de teste, nunca redireciona dados de outros destinatários.
        if (env.EMAIL_TEST_TO && digest.email !== env.EMAIL_TEST_TO.trim().toLowerCase()) { skipped++; continue; }
        if (Date.now() - started > 40000) { deferred++; continue; }
        const key = deliveryKey(plan.day, digest.email);
        const message = digestMessage(digest, plan.day, env.EMAIL_FROM, env.APP_URL);
        const claimed = await db('rpc/normatic_email_claim', {p_key: key, p_recipient: digest.email, p_message: message, p_day: plan.day});
        if (!claimed.length) { skipped++; continue; }
        const job = claimed[0];
        let providerId = null, errorCode = null;
        try {
          const response = await fetcher('https://api.resend.com/emails', {method: 'POST', headers: {Authorization: 'Bearer ' + env.RESEND_API_KEY, 'Content-Type': 'application/json', 'Idempotency-Key': key}, body: JSON.stringify(job.message), signal: AbortSignal.timeout(8000)});
          if (!response.ok) errorCode = 'provider_http_' + response.status;
          else { const result = await response.json(); providerId = result.id; if (!providerId) errorCode = 'provider_missing_id'; }
        } catch (_) {errorCode = 'provider_network';}
        await db('rpc/normatic_email_finish', {p_key: key, p_lease: job.lease, p_provider_id: providerId || null, p_error: errorCode});
        if (providerId) accepted++; else failed++;
        await pause(600);
      }
      return res.status(failed || deferred ? 503 : 200).json({accepted, failed, skipped, deferred, missingContacts: plan.missingContacts});
    } catch (_) {
      // Nunca devolve mensagens de provedores, dados pessoais ou credenciais.
      return res.status(503).json({error: 'Não foi possível processar os lembretes. Confira a configuração e o histórico de envios.'});
    }
  };
}
export default createHandler();
