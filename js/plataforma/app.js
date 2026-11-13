/* Navegação única. Os motores existentes mantêm seus próprios dados e regras. */
MENU.splice(0,MENU.length,['dashboard','Painel'],['normativos','Normativos'],['projetos','Projetos'],['tarefas','Tarefas'],['agenda','Agenda'],['reunioes','Reuniões e compromissos'],['minutas','Atas'],['responsaveis','Responsáveis']);
const renderAtividades = render;
const novoRegistroAtividade = newRecord;
const eventosAtividades = calendarEvents;
const visualizarAtividade = viewCalendarRecord;
const areaReunioes = document.getElementById('farol-reunioes');
for(const child of [...areaReunioes.children]) if(!child.classList.contains('view')) document.body.appendChild(child);
const content = document.getElementById('content');
content.after(areaReunioes);
const subnav = document.createElement('nav');
subnav.className = 'gestao-navegacao'; subnav.setAttribute('aria-label','Reuniões e compromissos');
content.before(subnav);
const areaDocumentos = document.createElement('section');
areaDocumentos.className = 'documental-area'; areaDocumentos.hidden = true;
areaDocumentos.innerHTML = '<h3 id="documental-titulo">Normativos</h3>';
content.before(areaDocumentos);
let frameDocumentos = null;
let modalDocumental = false;
let scrollAntesDoModal = 0;
let abaDocumental = 'dashboard';
let filtroCompromissos = '';
let filtroAgenda = 'todos';
function abrirDocumentos(aba) {
  abaDocumental = aba;
  if(!frameDocumentos) {
    frameDocumentos = document.createElement('iframe');
    frameDocumentos.id = 'normativos-frame'; frameDocumentos.className = 'normativos-frame';
    frameDocumentos.title = 'Gestão de normativos';
    const embutido = document.getElementById('normativos-embutidos')?.dataset.srcdoc;
    if(embutido) frameDocumentos.srcdoc = new TextDecoder().decode(Uint8Array.from(atob(embutido), c=>c.charCodeAt(0)));
    else frameDocumentos.src = 'normativos.html#' + aba;
    frameDocumentos.addEventListener('load', () => {
      frameDocumentos.contentWindow?.setTab?.(abaDocumental,{semHistorico:true,plataforma:true});
      frameDocumentos.contentWindow?.addEventListener('normatic:ready',()=>frameDocumentos.contentWindow?.setTab?.(abaDocumental,{semHistorico:true,plataforma:true}),{once:true});
    });
    areaDocumentos.appendChild(frameDocumentos);
  } else {
    frameDocumentos.contentWindow?.setTab?.(aba,{semHistorico:true,plataforma:true});
  }
}
window.addEventListener('message', event => {
  if(event.source !== frameDocumentos?.contentWindow || event.origin !== location.origin || event.data?.canal !== 'normatic:documental') return;
  if(event.data.acao === 'altura' && Number.isFinite(event.data.altura)) {
    const modal = event.data.modal === true;
    frameDocumentos.style.height = (modal ? Math.max(360,innerHeight-100) : Math.min(20000,Math.max(160,event.data.altura))) + 'px';
    if(modal && !modalDocumental) {
      scrollAntesDoModal = scrollY;
      frameDocumentos.scrollIntoView({block:'start'});
    }
    if(!modal && modalDocumental) window.scrollTo({top:scrollAntesDoModal});
    modalDocumental = modal;
  }
  if(event.data.acao === 'navegar') {
    const route = {dashboard:'dashboard',acompanhamento:'normativos',cadastro:'novo-normativo'}[event.data.tab];
    if(route) go(route);
  }
});
function selecionarModoCadastro() { document.getElementById('cadastro-reuniao-form').classList.remove('oculto'); }
function setTab(tab) { go(tab === 'cadastro' ? 'cadastro-reuniao' : tab); }
function cabecalho(titulo) {
  document.getElementById('title').textContent = titulo;
  document.getElementById('crumb').textContent = titulo;
  document.getElementById('subtitle').textContent = '';
}
function listaCompromissos() {
  const query = filtroCompromissos.toLocaleLowerCase('pt-BR');
  const rows = DATA.agenda.filter(item => [item.titulo,item.responsavel,item.observacoes,item.data].join(' ').toLocaleLowerCase('pt-BR').includes(query)).sort((a,b)=>(a.data+a.hora).localeCompare(b.data+b.hora));
  return `<section class="card"><div class="compromissos-filtro"><label for="compromisso-busca">Pesquisar compromissos</label><input id="compromisso-busca" type="search" maxlength="100" value="${esc(filtroCompromissos)}" placeholder="Título, responsável, data ou observações" oninput="filtrarCompromissos(this.value)"></div><p class="muted">${rows.length} compromisso(s)</p><div class="simple-list">${rows.map(item=>`<article class="simple-task"><div class="simple-task-info"><strong>${esc(item.titulo)}</strong><p class="muted">${dt(item.data)} · ${esc(item.hora)}${item.hora_fim?'–'+esc(item.hora_fim):''} · ${esc(item.responsavel||'Sem responsável')}</p></div><div class="actions"><button class="secondary" onclick="viewCalendarRecord('agenda','${item.id}')">Consultar</button>${actions('agenda',item.id)}</div></article>`).join('') || '<p class="empty-state">Nenhum compromisso encontrado.</p>'}</div></section>`;
}
function filtrarCompromissos(value) {
  const input = document.getElementById('compromisso-busca'), caret = input?.selectionStart;
  filtroCompromissos = value; content.innerHTML = listaCompromissos();
  const novo = document.getElementById('compromisso-busca'); novo?.focus();
  if(caret != null) novo?.setSelectionRange?.(caret,caret);
}
render = function() {
  fecharMenusAcoes();
  const reuniao = ['reunioes','minutas','cadastro-reuniao'].includes(page);
  const documental = ['normativos','novo-normativo'].includes(page);
  const gestao = ['reunioes','compromissos','cadastro-reuniao'].includes(page);
  areaReunioes.hidden = !reuniao;
  areaDocumentos.hidden = !(documental || page === 'dashboard');
  document.getElementById('documental-titulo').hidden = page !== 'dashboard';
  content.hidden = reuniao || documental;
  subnav.hidden = !gestao;
  subnav.innerHTML = [['reunioes','Reuniões'],['compromissos','Compromissos'],['cadastro-reuniao','Unidades e nova reunião']].map(([id,label])=>`<button type="button" class="secondary ${page===id?'active':''}" ${page===id?'aria-current="page"':''} onclick="go('${id}')">${label}</button>`).join('');
  if(documental) { cabecalho('Normativos'); abrirDocumentos(page === 'novo-normativo' ? 'cadastro' : 'acompanhamento'); }
  else if(reuniao) {
    cabecalho(page === 'minutas' ? 'Atas' : 'Reuniões e compromissos');
    document.querySelectorAll('#farol-reunioes > .view').forEach(view => {
      const active = view.id === `view-${page === 'cadastro-reuniao' ? 'cadastro' : page}`;
      view.classList.toggle('active',active); view.setAttribute('aria-hidden',String(!active));
    });
  } else if(page === 'compromissos') { cabecalho('Reuniões e compromissos'); content.innerHTML = listaCompromissos(); }
  else {
    renderAtividades();
    if(page === 'dashboard') {
      cabecalho('Painel'); abrirDocumentos('dashboard');
      const summary = document.createElement('section'); summary.className='card module-meeting-summary';
      const active = reunioes.filter(r=>!r.cancelada && r.situacao!=='Cancelada');
      const atas = new Set(minutasHistorico.map(m=>m.reuniao?.id));
      summary.innerHTML=`<strong>Reuniões: ${reunioes.length}</strong><span>Atas salvas: ${minutasHistorico.length}</span><span>Sem ata: ${active.filter(r=>!atas.has(r.id)).length}</span><a href="#reunioes">Consultar reuniões</a>`;
      content.prepend(summary);
      const title=document.createElement('h3'); title.textContent='Atividades'; content.prepend(title);
    }
    if(page === 'agenda') {
      const filters=document.createElement('div'); filters.className='agenda-filtros';
      filters.innerHTML=`<label for="agenda-tipo">Exibir na agenda</label><select id="agenda-tipo" onchange="filtroAgenda=this.value;render()">${[['todos','Todos os registros'],['reunioes','Reuniões'],['agenda','Compromissos'],['projetos','Prazos de projetos'],['tarefas','Prazos de tarefas']].map(([value,label])=>`<option value="${value}" ${filtroAgenda===value?'selected':''}>${label}</option>`).join('')}</select>`;
      content.prepend(filters);
    }
  }
  document.getElementById('add').style.display = ['dashboard','agenda'].includes(page) ? 'none' : '';
  document.getElementById('add').textContent = documental ? '+ Novo normativo' : gestao || page==='minutas' ? '+ Nova reunião' : document.getElementById('add').textContent;
  document.getElementById('add-compromisso').hidden = !gestao;
  document.getElementById('nav').innerHTML = MENU.map(([id,label])=>{
    const current = page===id || (id==='normativos' && documental) || (id==='reunioes' && gestao);
    return `<button type="button" ${current?'class="active" aria-current="page"':''} onclick="go('${id}')">${label}</button>`;
  }).join('');
};
go = function(target,options={}) {
  frameDocumentos?.contentWindow?.fecharMenusAcoes?.();
  const aliases={acompanhamento:'normativos',cadastro:'novo-normativo',sobre:'dashboard'};
  target=aliases[target] || target;
  page=[...MENU.map(([id])=>id),'cadastro-reuniao','compromissos','novo-normativo'].includes(target)?target:'dashboard';
  openProject=null;
  if(!options.semHistorico && location.hash!=='#'+page) history.pushState({page},'','#'+page);
  render();
};
newRecord = function(table,defaults={}) {
  if(!table && ['normativos','novo-normativo'].includes(page)) { go('novo-normativo'); return; }
  if(!table && ['reunioes','compromissos','cadastro-reuniao','minutas'].includes(page)) { go('cadastro-reuniao'); selecionarModoCadastro(); return; }
  novoRegistroAtividade(table,defaults);
};
calendarEvents = function(date) {
  const all=[...eventosAtividades(date),...reunioes.filter(r=>r.data===date).map(r=>({n:'reunioes',id:r.id,title:r.pauta||'Reunião',at:`${r.horario||''} · ${r.frequencia}${r.cancelada||r.situacao==='Cancelada'?' · Cancelada':''}`,prio:'Média'}))];
  return filtroAgenda==='todos'?all:all.filter(event=>event.n===filtroAgenda);
};
viewCalendarRecord = function(table,id) { if(table==='reunioes') verResumoReuniao(id); else visualizarAtividade(table,id); };
function renderDashboard() { if(['dashboard','agenda'].includes(page)) render(); }
inicializarInterfaceCompartilhada(); inicializarSeletoresToolbar(); popularSetoresConvidados();
document.addEventListener('click',event=>{ if(!event.target.closest?.('.toolbar-select-personalizado')) fecharSeletoresToolbar(); });
window.addEventListener('popstate',()=>go(location.hash.slice(1),{semHistorico:true}));
window.addEventListener('hashchange',()=>go(location.hash.slice(1),{semHistorico:true}));
document.addEventListener('DOMContentLoaded',()=>{
  if(!window.igovAI?.gerarDescricaoReuniao && !window.IGOV_CONFIG?.apiBaseUrl) {
    const button=document.getElementById('btn-gerar-descricao-ia'); button.disabled=true; button.title='Use Prosseguir para revisar manualmente.';
  }
});
window.addEventListener('storage',event=>{
  if(event.key===FarolStorage.key) refresh();
  if(['igov:reunioes','igov:minutas','igov:unidades-reuniao'].includes(event.key)) {carregarUnidades();carregarHistoricoMinutas();carregarReunioes();}
});
go(location.hash.slice(1),{semHistorico:true});
