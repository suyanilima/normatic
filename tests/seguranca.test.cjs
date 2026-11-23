const assert = require('node:assert/strict');
const {open} = require('./integracao.test.cjs');

(async () => {
  let current;
  const attack = "'-alert(1)-'";
  const escapedId = 'id\'"<&\\\n-end';
  const name = `D'Ávila "Equipe" <img src=x onerror=alert(1)> & ${attack}`;
  const data = {
    responsaveis: [{id: 'person', nome: name, email: 'teste@example.test'}, {id: 'attack', nome: attack}],
    tarefas: [{id: escapedId, titulo: 'Tarefa preservada', responsavel: name, status: 'A fazer'}],
    projetos: [{id: escapedId, nome: 'Projeto preservado', status: 'Ativo'}],
    agenda: [{id: escapedId, titulo: 'Compromisso preservado', data: '2099-12-01', hora: '10:00'}]
  };
  try {
    const meeting = {id: escapedId, data: '2099-12-01', horario: '10:00', frequencia: 'CGTIC', pauta: 'Pauta preservada', membros: [], convidados: []};
    current = await open('index.html#dashboard', {'farol:dados:v1': data, 'igov:reunioes': [meeting], 'igov:minutas': [{id: escapedId, reuniao: meeting, geradaEm: new Date().toISOString()}]});
    let {w, d} = current;
    let scripts = 0;
    w.alert = () => scripts++;
    assert.equal(d.querySelector('#content img'), null, 'Novo Dashboard resiste a injeção de HTML');
    assert.equal(scripts, 0, 'Novo Dashboard não executa código injetado');
    w.eval('renderAtividades()');
    const person = d.querySelector('.dashboard-person button');
    assert.equal(person.dataset.responsavel, name);
    person.click();
    assert.equal(scripts, 0, 'Nome não vira código JavaScript');
    assert.ok(d.getElementById('detailsTitle').textContent.includes(name));
    assert.ok(d.getElementById('detailsBody').textContent.includes('Tarefa preservada'));
    assert.equal(d.querySelector('#content img'), null);
    d.getElementById('details').close();
    d.querySelectorAll('.dashboard-person button')[1].click();
    assert.equal(scripts, 0, 'Reprodução exata do ataque confirmado não executa mais');
    assert.ok(d.getElementById('detailsTitle').textContent.includes(attack));
    d.getElementById('details').close();
    const values = [attack, escapedId, '&quot;);alert(1);//', '</script><img src=x>', '\u2028\u2029', 'Maria D’Ávila'];
    for (const value of values) {
      const holder = d.createElement('div');
      holder.innerHTML = `<button onclick="window.received(${w.argumentoJsHtml(value)})">Testar</button>`;
      let received;
      w.received = result => received = result;
      holder.firstChild.click();
      assert.equal(received, value, 'Argumento conserva aspas e caracteres sem interpretar código');
      assert.equal(holder.querySelectorAll('button').length, 1);
      assert.equal(holder.querySelector('img'), null);
    }
    for (const [route, selector] of [['projetos','.project-entry .actions button'], ['tarefas','.simple-task .actions button']]) {
      w.go(route);
      let received;
      w.edit = (table, id) => received = id;
      w.viewTask = id => received = id;
      w.viewCalendarRecord = (table, id) => received = id;
      const button = d.querySelector(selector); assert.ok(button, route); button.click();
      assert.equal(received, escapedId, route + ' mantém ação e ID original');
      for (const element of d.querySelectorAll('#content [onclick]')) new w.Function('event', element.getAttribute('onclick'));
      assert.equal(d.querySelector('#content img'), null);
    }
    assert.equal(scripts, 0);
    w.go('reunioes');
    let meetingId;
    w.verResumoReuniao = id => meetingId = id;
    d.querySelector('#reunioes-lista button[onclick^="verResumoReuniao"]').click();
    assert.equal(meetingId, escapedId);
    assert.equal(d.getElementById('acoes-reuniao-' + escapedId)?.className, 'actions-dropdown');
    w.go('minutas');
    let minuteId;
    w.abrirMinutaHistorico = id => minuteId = id;
    const minute = d.querySelector('.minuta-reuniao-opcao');
    assert.ok(minute);
    minute.dispatchEvent(new w.KeyboardEvent('keydown', {key: 'Enter', bubbles: true}));
    assert.equal(minuteId, escapedId, 'Ação de teclado da ata preserva o ID sem injeção');
    for (const element of d.querySelectorAll('#farol-reunioes [onclick],#farol-reunioes [onkeydown]')) {
      for (const attribute of ['onclick','onkeydown']) if (element.hasAttribute(attribute)) new w.Function('event', element.getAttribute(attribute));
    }
    assert.equal(scripts, 0);
    assert.equal(w.sanitizarHtmlMinuta('<p onclick="alert(1)"><b>Texto</b><img src=x onerror=alert(1)><script>alert(1)</script></p>'), '<p><strong>Texto</strong></p>');
    current.dom.window.close();
    const doc = {id: escapedId, nome: 'Documento protegido', tipo: 'Normativo', data: '2099-12-01', historico: [{tipo: 'edicao"><img src=x data-attack onerror=alert(1)>', texto: '<svg onload=alert(1)>', responsavel: 'Nome com aspas "', dataHora: new Date().toISOString()}]};
    current = await open('normativos.html', {'igov:documentos': [doc]});
    ({w, d} = current);
    w.verHistorico(escapedId);
    assert.equal(d.querySelector('#historico-lista img'), null, 'Tipo de histórico não pode criar elementos HTML');
    assert.equal(d.querySelector('#historico-lista svg'), null);
    assert.ok(d.getElementById('historico-lista').textContent.includes('<svg onload=alert(1)>'));
    assert.equal(w.fmtData('<svg/onload=alert(1)>'), '-');
    assert.equal(w.fmtData('2026-11-13'), '13/11/2026');
    console.log('Segurança: nomes, IDs, ações, histórico, datas e HTML de atas resistem a injeções sem perder os valores originais.');
  } finally {current?.dom.window.close();}
})().catch(error => {console.error(error);process.exitCode = 1;});
