const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { randomUUID } = require('node:crypto');
const saved = new Map();
let quota = false;
const context = { crypto: { randomUUID }, Event, localStorage: {
  getItem: key => saved.get(key) ?? null,
  setItem(key, value) { if (quota) throw Error('Quota excedida'); saved.set(key,value); }
} };
vm.runInNewContext(fs.readFileSync('js/farol/storage.js','utf8'), context);
const api = context.FarolStorage.api;
(async () => {
  assert.equal((await api('getData')).tarefas.length, 0);
  const person = await api('saveRecord','responsaveis',{ nome: 'Responsável de teste' });
  const project = await api('saveRecord','projetos',{ nome: 'Projeto de teste', responsavel: person.record.nome });
  const task = await api('saveRecord','tarefas',{ titulo: 'Tarefa', projeto_id: project.id, responsavel: person.record.nome, prazo: '2099-12-01' });
  await assert.rejects(api('deleteRecord','projetos',project.id), /Desvincule/);
  await assert.rejects(api('deleteRecord','responsaveis',person.id), /vinculados/);
  await api('saveRecord','responsaveis',{id:person.id,nome:'Nome revisado'});
  assert.equal((await api('getData')).tarefas[0].responsavel, 'Nome revisado');
  await api('setTaskStatus',task.id,'Concluída');
  assert.equal((await api('getData')).tarefas[0].status,'Concluída');
  await assert.rejects(api('setTaskStatus',task.id,'Inválido'), /inválido/);
  await assert.rejects(api('saveRecord','tarefas',{titulo:'Inválida',projeto_id:'ausente'}), /não encontrado/);
  const original = saved.get(context.FarolStorage.key);
  const dates = [{data:'2099-12-01',hora:'09:00',hora_fim:'10:00'},{data:'2099-12-02',hora:'11:00',hora_fim:'12:00'}];
  await assert.rejects(api('saveAgendaEmLote',{titulo:'Lote'},[dates[0],dates[0]]), /duplicados/);
  await assert.rejects(api('saveAgendaEmLote',{titulo:'Lote'},[dates[0],{...dates[1],hora_fim:'08:00'}]), /posterior/);
  assert.equal(saved.get(context.FarolStorage.key), original, 'Lote inválido não grava parcialmente');
  await api('saveAgendaEmLote',{titulo:'Lote'},dates);
  assert.equal((await api('getData')).agenda.length,2);
  await assert.rejects(api('saveRecord','agenda',{titulo:'Data inválida',data:'2099-02-30',hora:'09:00'}), /válidos/);
  const beforeQuota = saved.get(context.FarolStorage.key);
  quota = true;
  await assert.rejects(api('saveRecord','tarefas',{titulo:'Sem espaço'}), /Quota/);
  assert.equal(saved.get(context.FarolStorage.key), beforeQuota);
  quota = false;
  await api('deleteRecord','tarefas',task.id); await api('deleteRecord','projetos',project.id);
  assert.equal((await api('getData')).projetos.length,0);
  saved.set(context.FarolStorage.key,'conteúdo corrompido');
  await assert.rejects(api('getData'), /preservado/);
  await assert.rejects(api('saveRecord','projetos',{nome:'Não sobrescrever'}), /preservado/);
  assert.equal(saved.get(context.FarolStorage.key),'conteúdo corrompido');
  console.log('Persistência FAROL: CRUD, vínculos, lotes, validação e proteção contra perda de dados verificados.');
})().catch(error => { console.error(error); process.exitCode=1; });
