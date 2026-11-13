// Consulta apenas configuração pública de autenticação; não lê registros nem exige senha.
const fs=require('node:fs');
const vm=require('node:vm');
const context={window:{}};
vm.runInNewContext(fs.readFileSync('js/cloud/config.js','utf8'),context);
const config=context.window.NORMATIC_SUPABASE_CONFIG;
(async()=>{
  const response=await fetch(config.url+'/auth/v1/settings',{headers:{apikey:config.publishableKey},signal:AbortSignal.timeout(15000)});
  console.log('Supabase /auth/v1/settings: HTTP '+response.status);
  if(!response.ok) throw Error('Não foi possível validar a conexão pública.');
  const settings=await response.json();console.log('Login por e-mail habilitado: '+Boolean(settings.external?.email));
})().catch(e=>{console.error(e.message);process.exitCode=1;});
