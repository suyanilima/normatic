const assert = require('node:assert/strict');
const { open, wait } = require('./integracao.test.cjs');
const meetings = Array.from({length:12},(_,i) => ({id:'layout-'+i,data:'2099-11-'+String(i+1).padStart(2,'0'),horario:'10:00',frequencia:'CGTIC',formato:'Presencial',pauta:'Pauta longa para conferir truncamento e acesso ao conteúdo completo '+i,membros:[],convidados:[]}));
const minutes = meetings.map((r,i) => ({id:'ata-layout-'+i,reuniao:r,geradaEm:'2099-11-01T10:00:00Z',descricaoHtml:'<p>Registro da reunião.</p>',pautaHtml:r.pauta,providenciasHtml:'',minutaHtml:'<p>Ata preservada.</p>'}));
// Exercita os breakpoints do CSS no DOM. Não simula um motor de layout/renderização.
function mediaMatches(query, width) {
  return query.split(',').some(branch => {
    if(/print|prefers-reduced-motion/.test(branch)) return false;
    return [...branch.matchAll(/\(\s*(min|max)-width\s*:\s*([\d.]+)px\s*\)/g)].every(([,kind,value]) => kind === 'min' ? width >= +value : width <= +value);
  });
}
function rulesForWidth(rules, width) {
  return [...rules].map(rule => {
    if(rule.media) return mediaMatches(rule.conditionText || rule.media.mediaText,width) ? rulesForWidth(rule.cssRules,width) : '';
    if(rule.cssText.startsWith('@layer') && rule.cssRules) return rule.cssText.slice(0,rule.cssText.indexOf('{')+1)+rulesForWidth(rule.cssRules,width)+'}';
    return rule.cssText;
  }).join('\n');
}
function styleAtWidths(w, verify) {
  const sheets = [...w.document.styleSheets].map(sheet=>sheet.cssRules);
  w.document.querySelectorAll('style,link[rel=stylesheet]').forEach(node=>node.remove());
  const style = w.document.createElement('style'); w.document.head.appendChild(style);
  for(const width of [390,768,1024,1440]) {
    style.textContent = sheets.map(rules=>rulesForWidth(rules,width)).join('\n');
    verify(width, element=>w.getComputedStyle(element));
  }
}
(async()=>{
  let current;
  try {
    current = await open('normativos.html',{'normatic:apresentacao-concluida':'sim'});
    let {w,d}=current;
    assert.equal(d.getElementById('tab-sobre'),null); assert.equal(d.getElementById('view-sobre'),null);
    w.setTab('sobre'); assert.ok(d.getElementById('view-dashboard').classList.contains('active'));
    styleAtWidths(w,(width,style)=>{
      const grid=style(d.querySelector('.dashboard-indicadores'));
      assert.equal(grid.display,'grid');
      assert.equal(grid.gridTemplateColumns.replace(/\s/g,''), 'repeat(3,minmax(0,1fr))', 'Indicadores compactos em '+width);
      const card=style(d.querySelector('.dashboard-indicador'));
      assert.ok(!/span 2/.test(card.gridColumn));
      assert.equal(parseFloat(style(d.querySelector('.dashboard-documentos-atencao-card')).minHeight),width<740?0:300);
      assert.equal(style(d.querySelector('.dashboard-grid')).gridTemplateColumns.replace(/\s/g,''),width<740?'minmax(0,1fr)':'repeat(2,minmax(0,1fr))');
    });
    current.dom.window.close();
    current = await open('index.html#minutas',{'igov:reunioes':meetings,'igov:minutas':minutes});
    ({w,d}=current);
    const before=w.localStorage.getItem('igov:reunioes');
    const menuButton = () => d.querySelector('.minuta-reuniao-opcao .actions-toggle');
    assert.equal(w.getComputedStyle(d.querySelector('.actions-dropdown')).display,'none');
    menuButton().click();
    let menu=d.querySelector('body > .actions-dropdown.open');
    assert.ok(menu, 'Menu fora da tabela');
    assert.equal(menu.style.position,'fixed');
    assert.deepEqual([...menu.querySelectorAll('button')].map(b=>b.textContent.trim()),['Editar ata','Exportar ata','Excluir ata']);
    assert.equal(menuButton().getAttribute('aria-expanded'),'true');
    d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
    assert.equal(d.querySelector('.actions-dropdown.open'),null);
    menuButton().click();
    d.querySelector('body > .actions-dropdown.open button:nth-of-type(2)').click();
    assert.ok(d.getElementById('exportar-ata-modal-overlay').classList.contains('open'));
    w.fecharModalExportarAta();
    menuButton().click(); d.querySelector('body > .actions-dropdown.open button').click();
    assert.ok(d.getElementById('view-minutas').classList.contains('minuta-em-edicao'));
    w.fecharModalMinutaReuniao();
    menuButton().click(); d.querySelector('body > .actions-dropdown.open button.del').click();
    assert.ok(d.getElementById('delete-minuta-modal-overlay').classList.contains('open'));
    w.fecharModalExcluirMinuta();
    w.irParaPaginaAtas(2); assert.equal(d.querySelectorAll('.minuta-reuniao-opcao').length,2);
    menuButton().click(); assert.ok(d.querySelector('body > .actions-dropdown.open'));
    d.querySelector('body > .actions-dropdown.open button.del').click();
    await w.confirmarExclusaoMinuta();
    assert.equal(JSON.parse(w.localStorage.getItem('igov:minutas')).length,11, 'Exclusão pelo menu mantém a ação real');
    w.filtrarAtas(); assert.equal(d.querySelector('body > .actions-dropdown.open'),null);
    assert.equal(w.localStorage.getItem('igov:reunioes'),before, 'Layout não grava nem modifica reuniões');
    w.go('agenda'); w.irHojeAgenda();
    assert.ok(d.querySelector('.calendar-today [aria-current=date]'));
    assert.ok(d.querySelector('.calendar-selected [aria-pressed=true]'));
    const title=d.querySelector('.calendar-toolbar b').textContent;
    d.querySelector('[aria-label="Próximo mês"]').click();
    assert.notEqual(d.querySelector('.calendar-toolbar b').textContent,title);
    d.querySelector('.calendar-day-number').click();
    assert.ok(d.querySelector('.calendar-selected'));
    assert.ok(d.querySelector('.calendar-side h3').textContent.startsWith('Dia'));
    w.go('reunioes'); w.alterarVisualizacaoReunioes('lista');
    d.querySelector('.reuniao-acoes .actions-toggle').click();
    assert.ok(d.querySelector('body > .actions-dropdown.open'));
    w.fecharMenusAcoes(); w.alterarVisualizacaoReunioes('calendario');
    assert.equal(d.querySelectorAll('.calendario-dia').length,0,'Calendário duplicado retirado de Reuniões');
    styleAtWidths(w,(width,style)=>{
      assert.equal(style(d.querySelector('.reunioes-filtros')).display,'grid');
      assert.equal(parseFloat(style(d.querySelector('.calendar')).minWidth),0);
      assert.equal(style(d.querySelector('.calendar')).gridTemplateColumns.replace(/\s/g,''),'repeat(7,minmax(0,1fr))');
      assert.equal(style(d.querySelector('.calendar .day')).minHeight,width<=640?'56px':'72px');
      const row=style(d.querySelector('.minuta-reuniao-opcao'));
      assert.equal(row.display,'grid');
      assert.ok(!row.gridTemplateColumns.includes('260px'));
    });
    assert.deepEqual(current.errors.map(e=>e.message),[]);
    console.log('Layout: menus, ações de atas, paginação, calendários e CSS em 390/768/1024/1440 px verificados no DOM.');
  } finally { current?.dom.window.close(); }
})().catch(e=>{console.error(e);process.exitCode=1;});
