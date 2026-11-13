const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {requestInterceptor}=require('jsdom');
const {open,wait}=require('./integracao.test.cjs');
const names=['documentos','unidades','reunioes','atas','projetos','responsaveis','tarefas','compromissos'];
const state={revision:0,role:'admin',collections:Object.fromEntries(names.map(n=>[n,[]]))};
state.collections.projetos=[{id:'remoto',nome:'Projeto compartilhado',status:'Ativo'}];
const resources={interceptors:[requestInterceptor(request=>{
  const url=new URL(request.url);assert.equal(url.host,'plataforma.test','Testes de login não acessam contas externas');
  const file=url.pathname.slice(1);
  if(file==='js/cloud/config.js') return new Response('window.NORMATIC_SUPABASE_CONFIG={enabled:true,url:"http://mock.test",publishableKey:"public-test"}');
  if(file==='js/vendor/supabase.umd.js') return new Response(`window.supabase={createClient:()=>({
    auth:{mfa:{getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:'aal2'}})},onAuthStateChange:()=>{},getSession:async()=>({data:{session:null}}),signInWithPassword:async({email})=>{window.mockEmail=email;return {data:{session:{}},error:null}}},
    rpc:async()=>window.mockEmail==='equipe@example.test'?{data:${JSON.stringify(state)}}:{error:{code:'42501',message:'Conta sem acesso à equipe.'}}
  })};`);
  return new Response(fs.readFileSync(path.join(__dirname,'..',file)),{headers:{'Content-Type':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/javascript'}});
})]};
(async()=>{
  let current;
  try {
    const local={projetos:[{id:'local',nome:'Projeto somente local'}],tarefas:[],agenda:[],responsaveis:[]};
    current=await open('index.html#projetos',{'farol:dados:v1':local},{resources,waitForReady:false});
    const {w,d}=current;
    assert.ok(d.documentElement.classList.contains('cloud-locked'));
    assert.equal(d.querySelectorAll('#nav > button').length,0,'Aplicação não inicializa antes da autorização');
    d.getElementById('cloud-email').value='outsider@example.test';d.getElementById('cloud-password').value='senha-de-teste';
    d.querySelector('.cloud-login form').requestSubmit();await wait();await wait();
    assert.ok(d.querySelector('.cloud-access-message').textContent.includes('sem acesso'));
    assert.equal(d.querySelectorAll('#nav > button').length,0);
    d.getElementById('cloud-email').value='equipe@example.test';d.getElementById('cloud-password').value='senha-de-teste';
    d.querySelector('.cloud-login form').requestSubmit();await w.NORMATIC_READY;
    assert.equal(d.querySelector('.cloud-login'),null);
    assert.ok(!d.documentElement.classList.contains('cloud-locked'));
    assert.ok(d.getElementById('content').textContent.includes('Projeto compartilhado'));
    assert.ok(!d.getElementById('content').textContent.includes('Projeto somente local'));
    assert.equal(w.localStorage.getItem('farol:dados:v1'),JSON.stringify(local));
    assert.ok(d.querySelector('.plataforma-sidebar > .cloud-account [data-cloud-action=logout]'));
    assert.equal(d.querySelector('.cloud-toolbar'),null);
    assert.equal(d.querySelector('[data-cloud-action=backup]'),null);
    assert.deepEqual(current.errors.map(e=>e.message),[]);
    console.log('Login: bloqueio antes da autorização, conta não autorizada, sessão compartilhada e preservação local verificados no DOM.');
  } finally {current?.dom.window.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
