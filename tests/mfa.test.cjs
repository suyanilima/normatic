const assert = require('node:assert/strict');
const fs = require('node:fs');
const {JSDOM} = require('jsdom');
const {setup, IDS, empty} = require('./helpers/supabase-db.cjs');
const tick = () => new Promise(resolve => setImmediate(resolve));
async function flow({existing = false, cancel = false} = {}) {
  const dom = new JSDOM('<!doctype html><body></body>', {runScripts: 'outside-only'});
  const w = dom.window;
  w.eval(fs.readFileSync('js/cloud/mfa.js', 'utf8'));
  let aal = 'aal1', enrolled = 0, removed = [], calls = [], signedOut = 0;
  const client = {auth: {
    signOut: async () => { signedOut++; return {}; },
    mfa: {
      getAuthenticatorAssuranceLevel: async () => ({data: {currentLevel: aal}}),
      listFactors: async () => ({data: {totp: existing ? [{id: 'verified', status: 'verified', friendly_name: '<img onerror=x>'}] : [], all: [{id: 'abandoned', factor_type: 'totp', status: 'unverified'}, {id: 'verified', factor_type: 'totp', status: 'verified'}]}}),
      unenroll: async ({factorId}) => { removed.push(factorId); return {}; },
      enroll: async () => { enrolled++; return {data: {id: 'new', totp: {qr_code: '<svg xmlns="http://www.w3.org/2000/svg"></svg>', secret: 'TEST-SECRET'}}}; },
      challengeAndVerify: async args => {
        calls.push(args);
        if (args.code !== '123456') return {error: {code: 'mfa_verification_failed'}};
        aal = 'aal2'; return {};
      }
    }
  }};
  try {
    let resolved = false;
    const promise = w.NormaticMFA.ensure(client).then(() => {resolved = true;});
    await tick();
    const d = w.document;
    assert.ok(d.querySelector('.cloud-mfa'));
    assert.equal(resolved, false);
    if (cancel) {
      const rejection = assert.rejects(promise, /Entre novamente/);
      d.querySelector('.cloud-mfa-exit').click(); await rejection;
      assert.equal(signedOut, 1);
    } else {
      assert.equal(enrolled, existing ? 0 : 1);
      assert.deepEqual(removed, existing ? [] : ['abandoned']);
      assert.equal(d.querySelectorAll('[data-mfa-setup] img').length, existing ? 0 : 1);
      if (existing) assert.equal(d.querySelector('option').textContent, '<img onerror=x>');
      const input = d.querySelector('input');
      input.value = '000000'; d.querySelector('form').requestSubmit(); await tick();
      assert.equal(resolved, false);
      assert.match(d.querySelector('[role=status]').textContent, /inválido/);
      assert.equal(input.value, '');
      input.value = '123456'; d.querySelector('form').requestSubmit(); await promise;
      assert.equal(calls.at(-1).factorId, existing ? 'verified' : 'new');
      assert.equal(resolved, true);
      const count = calls.length;
      await w.NormaticMFA.ensure(client);
      assert.equal(calls.length, count, 'Sessão AAL2 não pede código a cada atualização');
    }
    assert.equal(d.querySelector('.cloud-mfa'), null);
    assert.ok(!d.body.textContent.includes('TEST-SECRET'));
  } finally {w.close();}
}
(async () => {
  await flow(); await flow({existing: true}); await flow({cancel: true});
  const fixture = await setup();
  const {db, asUser, snapshot, commit} = fixture;
  try {
    await db.exec(`create function auth.jwt() returns jsonb language sql stable as $$select jsonb_build_object('aal',current_setting('request.jwt.claim.aal',true))$$;`);
    await db.exec(fs.readFileSync('supabase/migrations/202611130002_mfa.sql', 'utf8'));
    await asUser(IDS.admin);
    await db.exec("select set_config('request.jwt.claim.aal','aal1',false)");
    await assert.rejects(snapshot(), /Acesso restrito/);
    await assert.rejects(commit(0, empty()), /permissão/);
    assert.equal((await db.query('select * from public.normatic_documentos')).rows.length, 0);
    assert.equal((await db.query('select * from public.normatic_revision')).rows.length, 0);
    await db.exec("select set_config('request.jwt.claim.aal','aal2',false)");
    assert.equal((await snapshot()).role, 'admin');
    const data = empty(); data.documentos = [{id: 'mfa-document', nome: 'Registro protegido'}];
    assert.equal((await commit(0, data)).revision, 1);
    await db.exec("select set_config('request.jwt.claim.aal','aal1',false)");
    assert.equal((await db.query('select * from public.normatic_documentos')).rows.length, 0, 'RLS esconde registros existentes sem segundo fator');
    await asUser(IDS.outsider);
    await db.exec("select set_config('request.jwt.claim.aal','aal2',false)");
    await assert.rejects(snapshot(), /Acesso restrito/);
    await asUser(IDS.viewer);
    assert.equal((await snapshot()).role, 'viewer');
    await assert.rejects(commit(1, data), /permissão/);
    console.log('MFA: cadastro, código incorreto, sessão verificada, cancelamento e exigência AAL2 em RPC/RLS validados.');
  } finally {await db.close();}
})().catch(error => {console.error(error); process.exitCode = 1;});
