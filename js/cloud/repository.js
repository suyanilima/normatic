(function(global) {
  'use strict';
  if(global.parent !== global) {
    try { if(global.parent.NormaticCloud) { global.NormaticCloud=global.parent.NormaticCloud; return; } } catch(_) {}
  }
  const config=global.NORMATIC_SUPABASE_CONFIG || {};
  const enabled=config.enabled === true;
  const names=['documentos','unidades','reunioes','atas','projetos','responsaveis','tarefas','compromissos'];
  const localKeys={documentos:'igov:documentos',unidades:'igov:unidades-reuniao',reunioes:'igov:reunioes',atas:'igov:minutas'};
  const mapping={projetos:'projetos',tarefas:'tarefas',responsaveis:'responsaveis',agenda:'compromissos'};
  const copy=value=>JSON.parse(JSON.stringify(value));
  let client=null, snapshot=null, queue=Promise.resolve(), backup=null, collectionCommitAvailable=true;
  function empty() { return Object.fromEntries(names.map(n=>[n,[]])); }
  function checkSnapshot(value) {
    if(!value || !Number.isSafeInteger(value.revision) || !value.collections || names.some(n=>!Array.isArray(value.collections[n]))) throw Error('Resposta do banco inválida. Os dados locais não foram alterados.');
    return value;
  }
  function ready() { if(!snapshot) throw Error('Entre na conta da equipe antes de acessar os registros.'); }
  function serialized(fn) {
    const task=queue.then(fn); queue=task.catch(()=>{}); return task;
  }
  function database() {
    if(!enabled) throw Error('Supabase não ativado.');
    if(!client) client=global.supabase.createClient(config.url,config.publishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
    return client;
  }
  async function reload() {
    const {data,error}=await database().rpc('normatic_snapshot');
    if(error) throw Error(error.message || 'Não foi possível carregar os dados da equipe.');
    snapshot=checkSnapshot(data); return copy(snapshot);
  }
  async function persist(collections,revision) {
    if(!['admin','editor'].includes(snapshot?.role)) throw Error('Sua conta possui acesso somente para leitura.');
    global.dispatchEvent?.(new CustomEvent('normatic:cloud-saving',{detail:true}));
    try {
      const {data,error}=await database().rpc('normatic_commit',{expected_revision:revision,collections});
      if(error) throw Error(error.code==='23503'?'Desvincule as tarefas antes de excluir o projeto.':error.message || 'Não foi possível salvar. Os dados locais não foram alterados.');
      snapshot=checkSnapshot(data);
    } finally {global.dispatchEvent?.(new CustomEvent('normatic:cloud-saving',{detail:false}));}
  }
  async function persistCollection(name,items,revision) {
    if(!['admin','editor'].includes(snapshot?.role)) throw Error('Sua conta possui acesso somente para leitura.');
    global.dispatchEvent?.(new CustomEvent('normatic:cloud-saving',{detail:true}));
    try {
      let data,error;
      if(collectionCommitAvailable) {
        ({data,error}=await database().rpc('normatic_commit_collection',{expected_revision:revision,collection_name:name,collection:items}));
        // Instalações sem a migração continuam funcionando pelo método completo.
        if(error?.code==='PGRST202' || /normatic_commit_collection/i.test(error?.message||'')) collectionCommitAvailable=false;
      }
      if(!collectionCommitAvailable) {
        const next=copy(snapshot.collections); next[name]=items;
        await persist(next,revision); return;
      }
      if(error) throw Error(error.code==='23503'?'Desvincule as tarefas antes de excluir o projeto.':error.message || 'Não foi possível salvar. Os dados locais não foram alterados.');
      if(!data || !Number.isSafeInteger(data.revision) || !Array.isArray(data.collection)) throw Error('Resposta do banco inválida. Os dados locais não foram alterados.');
      snapshot={...snapshot,revision:data.revision,collections:{...snapshot.collections,[name]:data.collection}};
    } finally {global.dispatchEvent?.(new CustomEvent('normatic:cloud-saving',{detail:false}));}
  }
  function readCollection(name) { ready(); if(!names.includes(name)) throw Error('Coleção inválida.'); return copy(snapshot.collections[name]); }
  function writeCollection(name,items) {
    if(!names.includes(name) || !Array.isArray(items)) return Promise.reject(Error('Coleção inválida.'));
    const payload=copy(items);
    return serialized(async()=>{ready();await persistCollection(name,payload,snapshot.revision);return true;});
  }
  function activities(handler) {
    return serialized(async()=>{
      ready();const baseline=copy(snapshot);
      const data=Object.fromEntries(Object.entries(mapping).map(([local,remote])=>[local,copy(baseline.collections[remote])]));
      return handler(data,async updated=>{
        const changed=Object.entries(mapping).filter(([local,remote])=>JSON.stringify(updated[local])!==JSON.stringify(baseline.collections[remote]));
        // Alterações relacionadas (ex.: renomear responsável e todos os seus vínculos) continuam atômicas.
        if(changed.length>1) {
          const next=copy(snapshot.collections);
          changed.forEach(([local,remote])=>next[remote]=copy(updated[local]));
          await persist(next,snapshot.revision);
          return;
        }
        for(const [local,remote] of changed) await persistCollection(remote,copy(updated[local]),snapshot.revision);
      });
    });
  }
  async function captureLocal() {
    const collections=empty();
    for(const [name,key] of Object.entries(localKeys)) {
      const raw=name==='documentos' && global.storage?.get ? (await global.storage.get(key,false))?.value : global.localStorage.getItem(key);
      const items=raw?JSON.parse(raw):[];
      if(!Array.isArray(items)) throw Error('Backup local inválido: '+name);
      collections[name]=items;
    }
    const activitiesRaw=global.localStorage.getItem('farol:dados:v1');
    if(activitiesRaw) {
      const data=JSON.parse(activitiesRaw);
      for(const [local,remote] of Object.entries(mapping)) {
        if(!Array.isArray(data[local])) throw Error('Backup de atividades inválido.');
        collections[remote]=data[local];
      }
    }
    backup={version:1,exportedAt:new Date().toISOString(),collections};
    return copy(backup);
  }
  function importLocal() {
    return serialized(async()=>{
      ready();
      // Recarrega antes de importar; jamais substituir uma base já utilizada.
      await reload();
      if(names.some(n=>snapshot.collections[n].length)) throw Error('O banco já possui registros. A importação foi cancelada para não substituir dados da equipe.');
      const local=await captureLocal();
      await persist(local.collections,snapshot.revision);
      return copy(snapshot);
    });
  }
  async function audit() {
    if(snapshot?.role!=='admin') throw Error('Somente administradores podem consultar a auditoria.');
    const {data,error}=await database().rpc('normatic_audit_log',{limit_rows:200});
    if(error) throw Error(error.message || 'Não foi possível carregar a auditoria.');
    return Array.isArray(data)?copy(data):[];
  }
  async function registerAccess() {
    if(!enabled || !snapshot) return;
    try { await database().rpc('normatic_register_access'); } catch(_) { /* Migração ainda não aplicada. */ }
  }
  async function readAuditorias() {
    if(!enabled || !snapshot) return null;
    try {
      const {data,error}=await database().rpc('normatic_auditorias_list');
      if(error) {
        if(error.code==='PGRST202' || /normatic_auditorias_list/i.test(error.message||'')) return null;
        throw Error(error.message || 'Não foi possível carregar o acompanhamento de auditoria.');
      }
      return Array.isArray(data)?copy(data):[];
    } catch(error) {
      if(error?.code==='PGRST202' || /normatic_auditorias_list/i.test(error?.message||'')) return null;
      throw error;
    }
  }
  async function writeAuditorias(items) {
    if(!enabled || !snapshot) return null;
    if(!['admin','editor'].includes(snapshot?.role)) throw Error('Sua conta possui acesso somente para leitura.');
    global.dispatchEvent?.(new CustomEvent('normatic:cloud-saving',{detail:true}));
    try {
      const {data,error}=await database().rpc('normatic_auditorias_save',{items:copy(items)});
      if(error) {
        if(error.code==='PGRST202' || /normatic_auditorias_save/i.test(error.message||'')) return null;
        throw Error(error.message || 'Não foi possível salvar o acompanhamento de auditoria.');
      }
      return Array.isArray(data)?copy(data):copy(items);
    } finally {global.dispatchEvent?.(new CustomEvent('normatic:cloud-saving',{detail:false}));}
  }
  global.NormaticCloud=Object.freeze({enabled,database,reload,readCollection,writeCollection,activities,captureLocal,importLocal,audit,registerAccess,readAuditorias,writeAuditorias,
    get ready(){return !!snapshot;},get role(){return snapshot?.role;},get backup(){return backup?copy(backup):null;}});
})(globalThis);
