const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {requestInterceptor}=require('jsdom');
const {open,wait}=require('./integracao.test.cjs');
const {setup,IDS}=require('./helpers/supabase-db.cjs');
const resources={interceptors:[requestInterceptor(request=>{
  const url=new URL(request.url);assert.equal(url.host,'plataforma.test');const file=url.pathname.slice(1);
  if(file==='js/cloud/config.js') return new Response('window.NORMATIC_SUPABASE_CONFIG={enabled:true,url:"http://mock.test",publishableKey:"public-test"}');
  if(file==='js/vendor/supabase.umd.js') return new Response('window.supabase={createClient:()=>window.__cloudClient};');
  return new Response(fs.readFileSync(path.join(__dirname,'..',file)),{headers:{'Content-Type':file.endsWith('.css')?'text/css':file.endsWith('.html')?'text/html':'application/javascript'}});
})]};
function set(w,selector,value){const field=w.document.querySelector(selector);assert.ok(field,selector);field.value=value;field.dispatchEvent(new w.Event('input',{bubbles:true}));}
(async()=>{
  const {db,asUser,snapshot,commit}=await setup();let current,fail=false;
  try {
    await asUser(IDS.admin);
    const client={auth:{mfa:{getAuthenticatorAssuranceLevel:async()=>({data:{currentLevel:'aal2'}})},getSession:async()=>({data:{session:{}}}),onAuthStateChange:()=>{}},rpc:async(name,args)=>{
      if(fail)return {error:{message:'Falha de rede controlada'}};
      try{return {data:await(name==='normatic_snapshot'?snapshot():commit(args.expected_revision,args.collections))};}catch(error){return {error};}
    }};
    current=await open('index.html#reunioes',{'igov:documentos':[{id:'backup',nome:'Backup local intacto'}]}, {resources,beforeParse:w=>{w.__cloudClient=client;}});
    const {w,d}=current;
    w.go('cadastro-reuniao');w.abrirCadastroUnidade();set(w,'#unidade-nome','Equipe de teste');w.selecionarPeriodicidadeUnidade('Mensal');
    set(w,'#unidade-cargo-0','Gestor');set(w,'#unidade-membros-lista input[placeholder="Nome do membro"]','Pessoa de teste');
    await w.cadastrarUnidade();assert.equal((await snapshot()).collections.unidades.length,1);
    set(w,'#r-data','2099-12-01');set(w,'#r-horario','10:00');set(w,'#r-pauta','Pauta em banco');await w.cadastrarReuniao();
    let data=await snapshot();assert.equal(data.collections.reunioes.length,1);const meeting=data.collections.reunioes[0];
    w.abrirMinutaReuniao(meeting.id);set(w,'#minuta-reuniao-transcricao','Decisão registrada para a equipe.');w.iniciarRevisaoManualMinuta();
    await w.gerarMinutaReuniao();await w.concluirAta();
    assert.equal((await snapshot()).collections.atas[0].concluida,true);
    const safe=w.sanitizarHtmlMinuta('<img src=x onerror="alert(1)"><script>alert(1)</script><p onclick="alert(1)"><strong>Conteúdo válido</strong></p>');
    assert.equal(safe,'<p><strong>Conteúdo válido</strong></p>','HTML compartilhado não executa conteúdo ativo');
    w.go('novo-normativo');const frame=d.getElementById('normativos-frame');
    await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));await frame.contentWindow.NORMATIC_READY;await wait();
    const documentWindow=frame.contentWindow;
    assert.equal(documentWindow.NormaticCloud,w.NormaticCloud,'Uma sessão e um cache para toda a plataforma');
    documentWindow.selecionarModoCadastro('semNormativo');
    set(documentWindow,'#f-nome','Documento compartilhado');set(documentWindow,'#f-gestor-nome','Gestor');set(documentWindow,'#f-gestor-setor','STI');
    set(documentWindow,'#f-gestor-email','teste@example.test');set(documentWindow,'#f-gestor-whatsapp','68999999999');set(documentWindow,'#f-desc','Cadastro no PostgreSQL');
    await documentWindow.cadastrar();assert.equal((await snapshot()).collections.documentos[0].nome,'Documento compartilhado');
    assert.equal(JSON.parse(w.localStorage.getItem('igov:documentos'))[0].nome,'Backup local intacto');
    fail=true;
    documentWindow.editar((await snapshot()).collections.documentos[0].id);set(documentWindow,'#edit-nome','Não deve ser confirmado');await documentWindow.confirmarEdicao();
    assert.equal((await snapshot()).collections.documentos[0].nome,'Documento compartilhado');
    assert.ok(documentWindow.document.getElementById('edit-modal-overlay').classList.contains('open'),'Erro mantém a edição disponível');
    fail=false;documentWindow.fecharModalEditar();
    w.go('reunioes');w.editarReuniao(meeting.id);set(w,'#edit-r-pauta','Pauta revisada em banco');await w.confirmarEdicaoReuniao();
    assert.equal((await snapshot()).collections.reunioes[0].pauta,'Pauta revisada em banco');
    await w.excluirReuniao(meeting.id);await w.confirmarExclusaoReuniao();
    data=await snapshot();assert.equal(data.collections.reunioes.length,0);assert.equal(data.collections.atas.length,1,'Ata histórica sobrevive à exclusão da reunião, como antes');
    assert.deepEqual(current.errors.map(e=>e.message),[]);
    console.log('Interface em nuvem: sessão única, unidades, reuniões, atas, documentos e falhas de gravação verificados contra PostgreSQL local.');
  } finally {current?.dom.window.close();await db.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
