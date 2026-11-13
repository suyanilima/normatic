const assert = require('node:assert/strict');
const fs = require('node:fs');
const {setup, IDS} = require('./helpers/supabase-db.cjs');
(async () => {
  const {planReminders, localClock, digestMessage} = await import('../server/email-core.mjs');
  const {createHandler} = await import('../api/email-reminders.mjs');
  const now = new Date('2026-11-13T12:00:00Z');
  assert.equal(localClock(new Date('2026-11-13T03:00:00Z')).day, '2026-11-12');
  const people = [{nome: 'Ana Silva', email: 'ana@example.test', ativo: 'Sim'}, {nome: 'Bruno', email: 'bruno@example.test'}, {nome: 'Inativo', email: 'off@example.test', ativo: 'Não'}, {nome: 'Ambíguo', email: 'a@example.test'}, {nome: 'AMBIGUO', email: 'b@example.test'}];
  const tasks = [
    {id: 't1', titulo: '<script>texto</script>', prazo: '2026-11-13', responsavel: 'Ana Silva', enviar_convite: 'Sim'},
    {id: 't2', titulo: 'Amanhã', prazo: '2026-11-14', responsavel: 'Bruno', enviar_convite: 'Sim'},
    {id: 'done', prazo: '2026-11-13', responsavel: 'Ana Silva', enviar_convite: 'Sim', status: 'Concluída'},
    {id: 'no', prazo: '2026-11-13', responsavel: 'Ana Silva', enviar_convite: 'Não'},
    {id: 'old', prazo: '2026-11-12', responsavel: 'Ana Silva', enviar_convite: 'Sim'},
    {id: 'off', prazo: '2026-11-13', responsavel: 'Inativo', enviar_convite: 'Sim'},
    {id: 'amb', prazo: '2026-11-13', responsavel: 'Ambíguo', enviar_convite: 'Sim'}
  ];
  const meetings = [
    {id: 'm1', data: '2026-11-13', horario: '10:00', pauta: 'Reunião', membros: [{nome: 'ANA SILVA'}], convidados: ['Ana Silva (STI)']},
    {id: 'm2', data: '2026-11-14', horario: '09:00', pauta: 'Amanhã', convidados: ['Bruno']},
    {id: 'cancel', data: '2026-11-13', horario: '10:00', cancelada: true, convidados: ['Ana Silva']},
    {id: 'past', data: '2026-11-13', horario: '06:00', convidados: ['Ana Silva']}
  ];
  const plan = planReminders({tarefas: tasks, reunioes: meetings, responsaveis: people}, now);
  assert.equal(plan.digests.length, 2);
  assert.equal(plan.digests[0].items.length, 2, 'Sem concluídas, opt-out, canceladas, reuniões passadas ou duplicadas');
  assert.equal(plan.missingContacts, 2, 'Não adivinha destinatários ambíguos ou inativos');
  const message = digestMessage(plan.digests[0], plan.day, 'Normatic <onboarding@resend.dev>');
  assert.ok(message.text.includes('<script>texto</script>'));
  assert.equal(message.html, undefined, 'Dados dos registros são texto, sem execução de HTML');
  const fixture = await setup(), {db, asUser} = fixture;
  try {
    await db.exec('create role service_role bypassrls;grant usage on schema public to service_role;');
    await db.exec(fs.readFileSync('supabase/migrations/202611130003_email.sql', 'utf8'));
    await asUser(IDS.admin);
    await assert.rejects(db.query("select * from public.normatic_email_claim($1,$2,$3::jsonb,$4::date)", ['a'.repeat(64), 'ana@example.test', '{}', plan.day]), /permission denied/);
    await assert.rejects(db.query('select * from public.normatic_email_deliveries'), /permission denied/);
    await db.exec('reset role');
    for (const [table, records] of Object.entries({tarefas: tasks, reunioes: meetings, responsaveis: people.map((p, i) => ({...p, id: 'p' + i}))})) {
      for (const record of records) await db.query(`insert into public.normatic_${table}(id,payload) values($1,$2::jsonb)`, [record.id, JSON.stringify(record)]);
    }
    await db.exec('set role service_role');
    let sends = 0, failProvider = false, fetchCalls = 0;
    async function fetcher(url, options) {
      fetchCalls++;
      if (url === 'https://api.resend.com/emails') {
        sends++;
        assert.equal(JSON.parse(options.body).to[0], 'ana@example.test', 'Teste não redireciona mensagens de Bruno');
        assert.match(options.headers['Idempotency-Key'], /^[a-f0-9]{64}$/);
        return failProvider ? new Response('{}', {status: 429}) : new Response('{"id":"provider-1"}');
      }
      const location = new URL(url), name = location.pathname.split('/').at(-1);
      let data;
      if (name === 'normatic_email_claim') {
        const p = JSON.parse(options.body);
        data = (await db.query('select * from public.normatic_email_claim($1,$2,$3::jsonb,$4::date)', [p.p_key, p.p_recipient, JSON.stringify(p.p_message), p.p_day])).rows;
      } else if (name === 'normatic_email_finish') {
        const p = JSON.parse(options.body);
        await db.query('select public.normatic_email_finish($1,$2::uuid,$3,$4)', [p.p_key, p.p_lease, p.p_provider_id, p.p_error]); data = null;
      } else data = (await db.query(`select payload from public.${name} order by id`)).rows;
      return new Response(JSON.stringify(data));
    }
    const env = {CRON_SECRET: 'test-secret', EMAIL_ENABLED: 'true', SUPABASE_URL: 'https://db.example.test', SUPABASE_SERVICE_ROLE_KEY: 'server-only-test', RESEND_API_KEY: 'server-only-test', EMAIL_FROM: 'Normatic <onboarding@resend.dev>', EMAIL_TEST_TO: 'ana@example.test'};
    const handler = createHandler({env, fetcher, now: () => now, pause: async () => {}});
    async function invoke(auth = 'Bearer test-secret') {
      const res = {setHeader() {}, status(code) {this.code = code; return this;}, json(data) {this.data = data; return this;}};
      await handler({method: 'GET', headers: {authorization: auth}}, res); return res;
    }
    assert.equal((await invoke('')).code, 401); assert.equal(fetchCalls, 0);
    assert.equal((await invoke()).data.accepted, 1);
    assert.equal((await invoke()).data.accepted, 0); assert.equal(sends, 1, 'Resumo já aceito não é reenviado');
    await db.exec('reset role');
    await db.exec("update public.normatic_email_deliveries set accepted_at=null, provider_id=null, lease_until=null");
    await db.exec('set role service_role');
    failProvider = true;
    assert.equal((await invoke()).code, 503);
    assert.equal((await db.query('select accepted_at,last_error from public.normatic_email_deliveries')).rows[0].accepted_at, null);
    assert.equal((await invoke()).data.accepted, 0, 'Lease impede concorrência e repetição imediata');
    await db.exec('reset role');
    await db.exec("update public.normatic_email_deliveries set lease_until=now()-interval '1 minute',first_attempt=now()-interval '21 hours'");
    await db.exec('set role service_role');
    const previous = sends; await invoke(); assert.equal(sends, previous, 'Não repete envio fora da janela de idempotência');
    env.EMAIL_ENABLED = 'false'; assert.equal((await invoke()).data.enabled, false);
    console.log('E-mail: destinatários, preferências, datas, segurança, persistência, falhas e proteção contra duplicidade validados sem envios reais.');
  } finally {await db.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
