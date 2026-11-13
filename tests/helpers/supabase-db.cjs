const fs=require('node:fs');
const {PGlite}=require('@electric-sql/pglite');
const IDS={admin:'10000000-0000-0000-0000-000000000001',viewer:'10000000-0000-0000-0000-000000000002',outsider:'10000000-0000-0000-0000-000000000003'};
const names=['documentos','unidades','reunioes','atas','projetos','responsaveis','tarefas','compromissos'];
const empty=()=>Object.fromEntries(names.map(n=>[n,[]]));
async function setup() {
  const db=new PGlite();
  await db.exec(`create role anon;create role authenticated;create schema auth;
    create table auth.users(id uuid primary key,email text);
    create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
    grant usage on schema auth to authenticated;
    insert into auth.users values('${IDS.admin}','admin@example.test'),('${IDS.viewer}','viewer@example.test'),('${IDS.outsider}','outsider@example.test');`);
  await db.exec(fs.readFileSync('supabase/migrations/202611130001_equipe.sql','utf8'));
  await db.exec(fs.readFileSync('supabase/02_primeiro_acesso.sql','utf8').replace('SEU_EMAIL_AQUI','admin@example.test'));
  await db.exec(`insert into public.normatic_members(user_id,role) values('${IDS.viewer}','viewer')`);
  async function asUser(id,role='authenticated') {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);
    await db.exec('set role '+role);
  }
  const snapshot=async()=> (await db.query('select public.normatic_snapshot() as state')).rows[0].state;
  const commit=async(revision,collections)=> (await db.query('select public.normatic_commit($1,$2::jsonb) as state',[revision,JSON.stringify(collections)])).rows[0].state;
  return {db,asUser,snapshot,commit};
}
module.exports={setup,IDS,names,empty};
