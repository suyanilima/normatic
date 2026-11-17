const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {randomUUID}=require('node:crypto');
const {setup,IDS}=require('./helpers/supabase-db.cjs');
(async()=>{
  const {db,asUser,snapshot,commit,commitCollection}=await setup();
  try {
    await asUser(IDS.admin);
    const local=new Map([
      ['igov:documentos',JSON.stringify([{id:'doc-original',nome:'Documento local',historico:[{texto:'Preservado'}]}])],
      ['igov:reunioes',JSON.stringify([{id:'reuniao-original',pauta:'Pauta local'}])],
      ['igov:minutas',JSON.stringify([{id:'ata-original',reuniao:{id:'reuniao-original'},minutaHtml:'<p>Ata</p>'}])],
      ['igov:unidades-reuniao',JSON.stringify([{codigo:'UNIDADE',nome:'Unidade'}])],
      ['farol:dados:v1',JSON.stringify({projetos:[],tarefas:[],responsaveis:[],agenda:[]})]
    ]);
    const originals=JSON.stringify([...local]);
    let failure=false;
    const rpc=async(name,args)=>{
      if(failure) return {error:{message:'Rede indisponível'}};
      try { return {data:await (name==='normatic_snapshot'?snapshot():name==='normatic_commit_collection'?commitCollection(args.expected_revision,args.collection_name,args.collection):commit(args.expected_revision,args.collections))}; }
      catch(error){return {error};}
    };
    const context={console,JSON,Date,crypto:{randomUUID},Event,CustomEvent,
      NORMATIC_SUPABASE_CONFIG:{enabled:true,url:'http://local.test',publishableKey:'public-test'},
      supabase:{createClient:()=>({rpc})},localStorage:{getItem:key=>local.get(key)??null,setItem:(key,value)=>local.set(key,value)}};
    context.window=context;context.parent=context;
    vm.runInNewContext(fs.readFileSync('js/cloud/repository.js','utf8'),context);
    vm.runInNewContext(fs.readFileSync('js/farol/storage.js','utf8'),context);
    const cloud=context.NormaticCloud,api=context.FarolStorage.api;
    await assert.rejects(cloud.writeCollection('documentos',[]),/Entre na conta/);
    await cloud.reload();
    const exported=await cloud.captureLocal();assert.equal(exported.collections.documentos[0].id,'doc-original');
    await cloud.importLocal();
    assert.equal(cloud.readCollection('documentos')[0].historico[0].texto,'Preservado');
    assert.equal(cloud.readCollection('atas')[0].minutaHtml,'<p>Ata</p>');
    assert.equal(cloud.readCollection('unidades')[0].codigo,'UNIDADE');
    assert.equal(JSON.stringify([...local]),originals,'Importar não apaga nem substitui dados locais');
    await assert.rejects(cloud.importLocal(),/já possui registros/);
    const project=await api('saveRecord','projetos',{nome:'Projeto em nuvem'});
    const task=await api('saveRecord','tarefas',{titulo:'Tarefa em nuvem',projeto_id:project.id});
    await api('setTaskStatus',task.id,'Concluída');
    assert.equal((await api('getData')).tarefas[0].status,'Concluída');
    await assert.rejects(api('deleteRecord','projetos',project.id),/Desvincule/);
    await api('saveAgendaEmLote',{titulo:'Compromisso'},[{data:'2099-12-01',hora:'09:00',hora_fim:'10:00'},{data:'2099-12-02',hora:'14:00',hora_fim:'15:00'}]);
    assert.equal((await snapshot()).collections.compromissos.length,2);
    failure=true;
    await assert.rejects(cloud.writeCollection('documentos',[]),/Rede indisponível/);
    assert.equal(cloud.readCollection('documentos').length,1,'Erro não atualiza o cache como se tivesse salvo');
    failure=false;
    const stale=await snapshot(),other=structuredClone(stale.collections);other.documentos[0].nome='Edição concorrente';await commit(stale.revision,other);
    await assert.rejects(cloud.writeCollection('documentos',[{id:'doc-original',nome:'Estado antigo'}]),/outra pessoa/);
    assert.equal((await snapshot()).collections.documentos[0].nome,'Edição concorrente');
    await cloud.reload();
    await Promise.all([api('saveRecord','projetos',{nome:'Projeto dois'}),api('saveRecord','projetos',{nome:'Projeto três'})]);
    assert.equal((await snapshot()).collections.projetos.length,3,'Operações da mesma página são serializadas');
    await cloud.writeCollection('atas',[]);assert.equal((await snapshot()).collections.atas.length,0);
    assert.equal(JSON.stringify([...local]),originals,'Nenhuma gravação em nuvem substitui os backups locais');
    await asUser(IDS.viewer);await cloud.reload();
    await assert.rejects(api('saveRecord','projetos',{nome:'Sem permissão'}),/somente para leitura/);
    console.log('Adaptador Supabase: importação completa, backups, CRUD, lotes, erros, concorrência e leitura restrita verificados.');
  } finally {await db.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
