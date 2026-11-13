/* Adaptador local do FAROL. A interface depende apenas de api(), não do serviço. */
(function (global) {
  'use strict';
  const KEY = 'farol:dados:v1';
  const TABLES = ['projetos', 'tarefas', 'agenda', 'responsaveis'];
  const STATUS = ['A fazer', 'Pendente', 'Em andamento', 'Concluída'];
  function empty() { return Object.fromEntries(TABLES.map(n => [n, []])); }
  function validateData(data) {
    if (!data || TABLES.some(n => !Array.isArray(data[n]))) throw Error('Arquivo de dados FAROL inválido.');
    for (const n of TABLES) {
      if (data[n].some(r => !r || typeof r !== 'object' || typeof r.id !== 'string' || !r.id)) throw Error('Registro FAROL sem identificação válida.');
      if (new Set(data[n].map(r => r.id)).size !== data[n].length) throw Error('Identificações duplicadas em ' + n);
    }
    return data;
  }
  function read() {
    const raw = global.localStorage.getItem(KEY);
    if (raw === null) return empty();
    try { return validateData(JSON.parse(raw)); }
    catch (_) { throw Error('Os dados locais do FAROL não puderam ser lidos. O conteúdo original foi preservado; restaure um backup antes de salvar.'); }
  }
  function write(data) {
    validateData(data);
    // Um único setItem: lote, alterações relacionadas e vínculos são gravados juntos.
    global.localStorage.setItem(KEY, JSON.stringify(data));
    global.dispatchEvent?.(new Event('farol:dados-alterados'));
  }
  function tableName(n) { if (!TABLES.includes(n)) throw Error('Cadastro inválido.'); return n; }
  function validDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const parsed = new Date(value + 'T12:00:00Z');
    return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
  }
  function validateRecord(table, row, data) {
    const title = table === 'projetos' || table === 'responsaveis' ? 'nome' : 'titulo';
    row[title] = String(row[title] || '').trim();
    if (!row[title]) throw Error('Informe ' + (title === 'nome' ? 'o nome.' : 'o título.'));
    if (row.prazo && !validDate(row.prazo)) throw Error('Informe um prazo válido.');
    if (table === 'tarefas') {
      if (row.projeto_id && !data.projetos.some(p => p.id === row.projeto_id)) throw Error('Projeto não encontrado.');
      row.status ||= 'A fazer'; row.prioridade ||= 'Média';
      if (!STATUS.includes(row.status)) throw Error('Status de tarefa inválido.');
    }
    if (table === 'projetos') { row.status ||= 'Ativo'; row.prioridade ||= 'Média'; }
    if (table === 'responsaveis') row.ativo ||= 'Sim';
    if (table === 'agenda') {
      if (!validDate(row.data) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(row.hora || '')) throw Error('Informe data e horário válidos.');
      if (row.hora_fim && (!/^([01]\d|2[0-3]):[0-5]\d$/.test(row.hora_fim) || row.hora_fim <= row.hora)) throw Error('O fim deve ser posterior ao início.');
    }
  }
  async function execute(operation, args, data, persist) {
    if (operation === 'getData') return data;
    if (operation === 'saveRecord') {
      const [table, input] = args; tableName(table);
      const index = input.id ? data[table].findIndex(r => r.id === input.id) : -1;
      if (input.id && index < 0) throw Error('Registro não encontrado; recarregue a página.');
      const previous = index >= 0 ? data[table][index] : null;
      const row = { ...previous, ...input, id: input.id || global.crypto.randomUUID() };
      validateRecord(table, row, data);
      if (table === 'responsaveis' && data.responsaveis.some(r => r.id !== row.id && r.nome === row.nome)) throw Error('Já existe um responsável com esse nome.');
      if (table === 'responsaveis' && previous && previous.nome !== row.nome) {
        for (const n of ['projetos', 'tarefas', 'agenda']) data[n].forEach(r => { if (r.responsavel === previous.nome) r.responsavel = row.nome; });
      }
      if (index < 0) data[table].push(row); else data[table][index] = row;
      await persist(data);
      return { id: row.id, record: row };
    }
    if (operation === 'saveAgendaEmLote') {
      const [common, dates] = args;
      if (!Array.isArray(dates) || !dates.length || dates.length > 100) throw Error('Informe entre 1 e 100 datas.');
      const records = dates.map(date => ({ ...common, ...date, id: global.crypto.randomUUID() }));
      records.forEach(row => { validateRecord('agenda', row, data); if (!row.hora_fim) throw Error('Informe o fim de cada compromisso.'); });
      if (new Set(records.map(r => r.data + '|' + r.hora)).size !== records.length) throw Error('Datas e horários duplicados no lote.');
      data.agenda.push(...records); await persist(data); return { records, avisos: [] };
    }
    if (operation === 'setTaskStatus') {
      const [id, status] = args;
      const row = data.tarefas.find(t => t.id === id);
      if (!row || !STATUS.includes(status)) throw Error('Tarefa ou status inválido.');
      row.status = status; await persist(data); return { ok: true, record: row };
    }
    if (operation === 'deleteRecord') {
      const [table, id] = args; tableName(table);
      const row = data[table].find(r => r.id === id);
      if (!row) throw Error('Registro não encontrado.');
      if (table === 'projetos' && data.tarefas.some(t => t.projeto_id === id || (!t.projeto_id && t.projeto === row.nome))) throw Error('Desvincule as tarefas antes de excluir o projeto.');
      if (table === 'responsaveis' && ['projetos', 'tarefas', 'agenda'].some(n => data[n].some(r => r.responsavel === row.nome))) throw Error('Este responsável possui registros vinculados. Reatribua os registros ou marque-o como inativo.');
      data[table] = data[table].filter(r => r.id !== id); await persist(data); return true;
    }
    throw Error('Operação indisponível nesta etapa.');
  }
  async function api(operation, ...args) {
    if(global.NormaticCloud?.enabled) return global.NormaticCloud.activities((data,persist)=>execute(operation,args,data,persist));
    return execute(operation,args,read(),write);
  }
  global.FarolStorage = Object.freeze({ api, key: KEY });
})(globalThis);
