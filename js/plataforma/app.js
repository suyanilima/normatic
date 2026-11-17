/* Navegação única. Os motores existentes mantêm seus próprios dados e regras. */
MENU.splice(0,MENU.length,['dashboard','Dashboard'],['acompanhamento','Painel de acompanhamento'],['normativos','Normativos'],['projetos','Projetos'],['tarefas','Tarefas'],['agenda','Agenda'],['reunioes','Reuniões e compromissos'],['minutas','Atas'],['responsaveis','Responsáveis e acessos']);
const NAV_SECTIONS=[['PRINCIPAL',['dashboard','acompanhamento','normativos','projetos','tarefas']],['GOVERNANÇA',['agenda','reunioes','minutas']],['GESTÃO',['responsaveis']]];
const renderAtividades = render;
const novoRegistroAtividade = newRecord;
const eventosAtividades = calendarEvents;
const visualizarAtividade = viewCalendarRecord;
const areaReunioes = document.getElementById('farol-reunioes');
for(const child of [...areaReunioes.children]) if(!child.classList.contains('view')) document.body.appendChild(child);
const content = document.getElementById('content');
const painelKicker = document.createElement('span');
painelKicker.className = 'painel-kicker'; painelKicker.textContent = 'Painel';
document.querySelector('.top > div').prepend(painelKicker);
content.after(areaReunioes);
const subnav = document.createElement('nav');
subnav.className = 'gestao-navegacao'; subnav.setAttribute('aria-label','Reuniões e compromissos');
content.before(subnav);
const areaDocumentos = document.createElement('section');
areaDocumentos.className = 'documental-area'; areaDocumentos.hidden = true;
areaDocumentos.innerHTML = '<h3 id="documental-titulo">Normativos</h3><div class="documental-carregando" role="status">Carregando dados e gráficos...</div>';
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
      const pronto=()=>{
        frameDocumentos.contentWindow?.setTab?.(abaDocumental,{semHistorico:true,plataforma:true});
        areaDocumentos.classList.remove('documental-pendente');
      };
      const inicializacao=frameDocumentos.contentWindow?.NORMATIC_READY;
      if(inicializacao?.then) inicializacao.then(pronto).catch(erroDocumental);
      else frameDocumentos.contentWindow?.addEventListener('normatic:ready',pronto,{once:true});
    });
    areaDocumentos.classList.add('documental-pendente');
    areaDocumentos.appendChild(frameDocumentos);
  } else {
    frameDocumentos.contentWindow?.setTab?.(aba,{semHistorico:true,plataforma:true});
  }
}
function erroDocumental() {
  const aviso=areaDocumentos.querySelector('.documental-carregando');
  if(aviso) aviso.textContent='Não foi possível carregar os gráficos. Atualize a página e tente novamente.';
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
  document.getElementById('topbar-pagina').textContent = titulo;
  const atualizado=document.getElementById('topbar-atualizacao');
  if(atualizado) atualizado.textContent=page==='dashboard'||page==='acompanhamento'?`Atualizado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`:'';
}
function listaCompromissos() {
  const query = filtroCompromissos.toLocaleLowerCase('pt-BR');
  const rows = DATA.agenda.filter(item => [item.titulo,item.responsavel,item.observacoes,item.data].join(' ').toLocaleLowerCase('pt-BR').includes(query)).sort((a,b)=>(a.data+a.hora).localeCompare(b.data+b.hora));
  return `<section class="card"><div class="compromissos-filtro"><label for="compromisso-busca">Pesquisar compromissos</label><input id="compromisso-busca" type="search" maxlength="100" value="${esc(filtroCompromissos)}" placeholder="Título, responsável, data ou observações" oninput="filtrarCompromissos(this.value)"></div><p class="muted">${rows.length} compromisso(s)</p><div class="simple-list">${rows.map(item=>`<article class="simple-task"><div class="simple-task-info"><strong>${esc(item.titulo)}</strong><p class="muted">${dt(item.data)} · ${esc(item.hora)}${item.hora_fim?'–'+esc(item.hora_fim):''} · ${esc(item.responsavel||'Sem responsável')}</p></div><div class="actions"><button class="secondary" onclick="viewCalendarRecord('agenda',${argumentoJsHtml(item.id)})">Consultar</button>${actions('agenda',item.id)}</div></article>`).join('') || '<p class="empty-state">Nenhum compromisso encontrado.</p>'}</div></section>`;
}
function filtrarCompromissos(value) {
  const input = document.getElementById('compromisso-busca'), caret = input?.selectionStart;
  filtroCompromissos = value; content.innerHTML = listaCompromissos();
  const novo = document.getElementById('compromisso-busca'); novo?.focus();
  if(caret != null) novo?.setSelectionRange?.(caret,caret);
}
render = function() {
  fecharMenusAcoes();
  const nomeDaAba=MENU.find(item=>item[0]===page)?.[1] || ({'novo-normativo':'Novo normativo','cadastro-reuniao':'Nova reunião',compromissos:'Compromissos'})[page] || 'Painel';
  document.getElementById('topbar-pagina').textContent=nomeDaAba;
  const atualizadoTopo=document.getElementById('topbar-atualizacao');
  if(atualizadoTopo) atualizadoTopo.textContent=['dashboard','acompanhamento'].includes(page)?`Atualizado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`:'';
  document.body.classList.toggle('painel-ativo', page === 'dashboard');
  document.body.classList.toggle('cadastro-ativo', page === 'novo-normativo');
  document.getElementById('subtitle').hidden = page !== 'novo-normativo';
  const reuniao = ['reunioes','minutas','cadastro-reuniao'].includes(page);
  const documental = ['normativos','novo-normativo'].includes(page);
  const gestao = ['reunioes','compromissos','cadastro-reuniao'].includes(page);
  areaReunioes.hidden = !reuniao;
  areaDocumentos.hidden = !(documental || page === 'dashboard');
  document.getElementById('documental-titulo').hidden = true;
  content.hidden = reuniao || documental;
  subnav.hidden = !gestao;
  subnav.innerHTML = [['reunioes','Reuniões'],['compromissos','Compromissos'],['cadastro-reuniao','Unidades e nova reunião']].map(([id,label])=>`<button type="button" class="secondary ${page===id?'active':''}" ${page===id?'aria-current="page"':''} onclick="go(${argumentoJsHtml(id)})">${label}</button>`).join('');
  if(documental) {
    cabecalho(page === 'novo-normativo' ? 'Novo normativo' : 'Normativos');
    if(page === 'novo-normativo') {
      document.getElementById('crumb').textContent = 'Normativos › Novo';
      document.getElementById('subtitle').textContent = 'Escolha a categoria e preencha as informações para concluir o cadastro.';
    }
    abrirDocumentos(page === 'novo-normativo' ? 'cadastro' : 'acompanhamento');
  }
  else if(reuniao) {
    cabecalho(page === 'minutas' ? 'Atas' : 'Reuniões e compromissos');
    document.querySelectorAll('#farol-reunioes > .view').forEach(view => {
      const active = view.id === `view-${page === 'cadastro-reuniao' ? 'cadastro' : page}`;
      view.classList.toggle('active',active); view.setAttribute('aria-hidden',String(!active));
    });
  } else if(page === 'compromissos') { cabecalho('Reuniões e compromissos'); content.innerHTML = listaCompromissos(); }
  else if(page === 'acompanhamento') {
    cabecalho('Painel de acompanhamento');
    document.getElementById('subtitle').hidden=false;
    document.getElementById('subtitle').textContent='Resumo operacional de documentos, tarefas e reuniões que exigem atenção.';
    content.innerHTML=painelAcompanhamento();
  } else {
    renderAtividades();
    if(page === 'dashboard') {
      cabecalho('Painel'); abrirDocumentos('dashboard');
      document.getElementById('title').textContent = 'Normativos';
      const heading = document.createElement('section'); heading.className='card painel-atividades-head';
      const title=document.createElement('h3'); title.textContent='Atividades';
      const summary = document.createElement('div'); summary.className='module-meeting-summary';
      const active = reunioes.filter(r=>!r.cancelada && r.situacao!=='Cancelada');
      const atas = new Set(minutasHistorico.map(m=>m.reuniao?.id));
      summary.innerHTML=`<strong>Reuniões: ${reunioes.length}</strong><span>Atas salvas: ${minutasHistorico.length}</span><span>Sem ata: ${active.filter(r=>!atas.has(r.id)).length}</span><a href="#reunioes">Consultar reuniões</a>`;
      heading.append(title,summary); content.prepend(heading);
      content.querySelector(':scope > .grid')?.classList.add('painel-atividades-grid');
    }
    if(page === 'agenda') {
      const filters=document.createElement('div'); filters.className='agenda-filtros';
      filters.innerHTML=`<label for="agenda-tipo">Exibir na agenda</label><select id="agenda-tipo" onchange="filtroAgenda=this.value;render()">${[['todos','Todos os registros'],['reunioes','Reuniões'],['agenda','Compromissos'],['projetos','Prazos de projetos'],['tarefas','Prazos de tarefas']].map(([value,label])=>`<option value="${value}" ${filtroAgenda===value?'selected':''}>${label}</option>`).join('')}</select>`;
      content.prepend(filters);
    }
    if(page === 'responsaveis') {
      const corpo=abaResponsaveis==='auditoria'?painelAuditoria():people();
      content.innerHTML=`<div class="responsaveis-tabs"><button type="button" class="secondary ${abaResponsaveis==='responsaveis'?'active':''}" onclick="abaResponsaveis='responsaveis';render()">Responsáveis</button><button type="button" class="secondary ${abaResponsaveis==='auditoria'?'active':''}" onclick="abaResponsaveis='auditoria';carregarAuditoria().then(render)">Auditoria e acessos</button></div>${corpo}`;
    }
  }
  document.getElementById('add').style.display = ['dashboard','agenda'].includes(page) ? 'none' : '';
  document.getElementById('add').textContent = documental ? '+ Novo normativo' : gestao || page==='minutas' ? '+ Nova reunião' : document.getElementById('add').textContent;
  document.getElementById('add-compromisso').hidden = !gestao;
  document.getElementById('nav').innerHTML = NAV_SECTIONS.map(([grupo,ids])=>`<div class="nav-grupo">${grupo}</div>${ids.map(id=>{
    const label=MENU.find(item=>item[0]===id)?.[1]||id;
    const current = page===id || (id==='normativos' && documental) || (id==='reunioes' && gestao);
    return `<button type="button" ${current?'class="active" aria-current="page"':''} onclick="go(${argumentoJsHtml(id)})">${label}</button>`;
  }).join('')}`).join('');
  renderizarNotificacoes();
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
