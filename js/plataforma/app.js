/* Navegação única. Os motores existentes mantêm seus próprios dados e regras. */
MENU.splice(0,MENU.length,['dashboard','Dashboard'],['normativos','Normativos'],['projetos','Projetos'],['tarefas','Tarefas'],['agenda','Agenda'],['reunioes','Reuniões'],['minutas','Atas'],['auditorias','Acompanhamento de Auditoria'],['responsaveis','Responsáveis e acessos']);
const NAV_SECTIONS=[['PRINCIPAL',['dashboard','normativos','projetos','tarefas']],['GOVERNANÇA',['agenda','reunioes','minutas','auditorias']],['GESTÃO',['responsaveis']]];
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
subnav.className = 'gestao-navegacao'; subnav.setAttribute('aria-label','Reuniões');
content.before(subnav);
const areaDocumentos = document.createElement('section');
areaDocumentos.className = 'documental-area'; areaDocumentos.hidden = true;
areaDocumentos.innerHTML = '<h3 id="documental-titulo">Normativos</h3><div class="documental-carregando" role="status">Carregando dados e gráficos...</div>';
content.before(areaDocumentos);
let frameDocumentos = null;
let modalDocumental = false;
let scrollAntesDoModal = 0;
let abaDocumental = 'dashboard';
let filtroAgenda = 'todos';
let abaProjetos = 'visualizacao';
let abaTarefas = 'visualizacao';

function trocarAbaProjetos(aba) {
  abaProjetos = aba === 'cadastro' ? 'cadastro' : 'visualizacao';
  render();
}

function trocarAbaTarefas(aba) {
  abaTarefas = aba === 'cadastro' ? 'cadastro' : 'visualizacao';
  render();
}

function renderFormularioTarefaInline() {
  const responsaveis = (DATA.responsaveis || []).filter(p => p.ativo !== 'Não');
  const projetos = DATA.projetos || [];
  return `
    <section class="card auditoria-form-card">
      <div class="auditoria-form-head">
        <div>
          <h3>Cadastrar nova tarefa</h3>
          <p class="muted">Preencha os detalhes da tarefa para distribuir e acompanhar entregas no modo Lista ou Quadro.</p>
        </div>
      </div>
      <form id="form-tarefa-inline" class="auditoria-form" onsubmit="salvarTarefaInline(event)">
        <div class="auditoria-field">
          <label for="tar-inline-titulo">Título da tarefa <span class="required-mark">*</span></label>
          <input id="tar-inline-titulo" type="text" maxlength="160" placeholder="Descreva a tarefa de forma objetiva" required>
        </div>
        <div class="auditoria-grid-2">
          <div class="auditoria-field">
            <label for="tar-inline-projeto">Projeto</label>
            <select id="tar-inline-projeto">
              <option value="">Sem projeto</option>
              ${projetos.map(p => `<option value="${esc(p.id)}">${esc(p.nome)}</option>`).join('')}
            </select>
          </div>
          <div class="auditoria-field">
            <label for="tar-inline-responsavel">Responsável</label>
            <select id="tar-inline-responsavel">
              <option value="">Sem responsável</option>
              ${responsaveis.map(p => `<option value="${esc(p.nome)}">${esc(p.nome)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="auditoria-grid-3">
          <div class="auditoria-field">
            <label for="tar-inline-prioridade">Prioridade</label>
            <select id="tar-inline-prioridade">
              <option value="Baixa">Baixa</option>
              <option value="Média" selected>Média</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
          <div class="auditoria-field">
            <label for="tar-inline-status">Status</label>
            <select id="tar-inline-status">
              <option value="A fazer" selected>Pendente</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Concluída">Concluída</option>
            </select>
          </div>
          <div class="auditoria-field">
            <label for="tar-inline-prazo">Prazo</label>
            <input id="tar-inline-prazo" type="date" min="1900-01-01" max="9999-12-31">
          </div>
        </div>
        <div class="auditoria-field">
          <label for="tar-inline-obs">Observações</label>
          <textarea id="tar-inline-obs" rows="3" placeholder="Detalhes adicionais, orientações ou critérios de conclusão..."></textarea>
        </div>
        <div class="auditoria-form-actions">
          <button type="button" class="secondary" onclick="trocarAbaTarefas('visualizacao')">Cancelar</button>
          <button type="submit" class="primary" id="btn-salvar-tarefa-inline">Cadastrar tarefa</button>
        </div>
      </form>
    </section>
  `;
}

async function salvarTarefaInline(event) {
  event?.preventDefault();
  const titulo = document.getElementById('tar-inline-titulo')?.value.trim();
  if(!titulo) { notify('Informe o título da tarefa.'); return; }
  const payload = {
    titulo,
    projeto_id: document.getElementById('tar-inline-projeto')?.value || '',
    responsavel: document.getElementById('tar-inline-responsavel')?.value || '',
    prioridade: document.getElementById('tar-inline-prioridade')?.value || 'Média',
    status: document.getElementById('tar-inline-status')?.value || 'A fazer',
    prazo: document.getElementById('tar-inline-prazo')?.value || '',
    observacoes: document.getElementById('tar-inline-obs')?.value.trim() || ''
  };
  try {
    await FarolStorage.api('saveRecord', 'tarefas', payload);
    abaTarefas = 'visualizacao';
    await refresh();
    notify('Tarefa cadastrada com sucesso.');
  } catch(error) {
    notify(error?.message || 'Não foi possível salvar a tarefa.');
  }
}

function renderFormularioProjetoInline() {
  const responsaveis = (DATA.responsaveis || []).filter(p => p.ativo !== 'Não');
  return `
    <section class="card auditoria-form-card">
      <div class="auditoria-form-head">
        <div>
          <h3>Cadastrar novo projeto</h3>
          <p class="muted">Preencha as informações do projeto para acompanhar prazos, responsáveis e tarefas vinculadas.</p>
        </div>
      </div>
      <form id="form-projeto-inline" class="auditoria-form" onsubmit="salvarProjetoInline(event)">
        <div class="auditoria-field">
          <label for="proj-inline-nome">Nome <span class="required-mark">*</span></label>
          <input id="proj-inline-nome" type="text" maxlength="160" placeholder="Digite o nome do projeto" required>
        </div>
        <div class="auditoria-field">
          <label for="proj-inline-objetivo">Descrição</label>
          <textarea id="proj-inline-objetivo" rows="3" placeholder="Objetivo e escopo do projeto..."></textarea>
        </div>
        <div class="auditoria-grid-2">
          <div class="auditoria-field">
            <label for="proj-inline-responsavel">Responsável</label>
            <select id="proj-inline-responsavel">
              <option value="">Sem responsável</option>
              ${responsaveis.map(p => `<option value="${esc(p.nome)}">${esc(p.nome)}</option>`).join('')}
            </select>
          </div>
          <div class="auditoria-field">
            <label for="proj-inline-prazo">Prazo</label>
            <input id="proj-inline-prazo" type="date" min="1900-01-01" max="9999-12-31">
          </div>
        </div>
        <div class="auditoria-grid-2">
          <div class="auditoria-field">
            <label for="proj-inline-prioridade">Prioridade</label>
            <select id="proj-inline-prioridade">
              <option value="Baixa">Baixa</option>
              <option value="Média" selected>Média</option>
              <option value="Alta">Alta</option>
              <option value="Urgente">Urgente</option>
            </select>
          </div>
          <div class="auditoria-field">
            <label for="proj-inline-status">Status</label>
            <select id="proj-inline-status">
              <option value="Ativo" selected>Ativo</option>
              <option value="Em andamento">Em andamento</option>
              <option value="Pausado">Pausado</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>
        </div>
        <div class="auditoria-form-actions">
          <button type="button" class="secondary" onclick="trocarAbaProjetos('visualizacao')">Cancelar</button>
          <button type="submit" class="primary" id="btn-salvar-projeto-inline">Cadastrar projeto</button>
        </div>
      </form>
    </section>
  `;
}

async function salvarProjetoInline(event) {
  event?.preventDefault();
  const nome = document.getElementById('proj-inline-nome')?.value.trim();
  if(!nome) { notify('Informe o nome do projeto.'); return; }
  const payload = {
    nome,
    objetivo: document.getElementById('proj-inline-objetivo')?.value.trim() || '',
    responsavel: document.getElementById('proj-inline-responsavel')?.value || '',
    prioridade: document.getElementById('proj-inline-prioridade')?.value || 'Média',
    status: document.getElementById('proj-inline-status')?.value || 'Ativo',
    prazo: document.getElementById('proj-inline-prazo')?.value || ''
  };
  try {
    await FarolStorage.api('saveRecord', 'projetos', payload);
    abaProjetos = 'visualizacao';
    await refresh();
    notify('Projeto cadastrado com sucesso.');
  } catch(error) {
    notify(error?.message || 'Não foi possível salvar o projeto.');
  }
}
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
render = function() {
  fecharMenusAcoes();
  const nomeDaAba=MENU.find(item=>item[0]===page)?.[1] || ({'novo-normativo':'Novo normativo','cadastro-reuniao':'Nova reunião'})[page] || 'Painel';
  document.getElementById('topbar-pagina').textContent=nomeDaAba;
  const atualizadoTopo=document.getElementById('topbar-atualizacao');
  if(atualizadoTopo) atualizadoTopo.textContent=['dashboard','acompanhamento'].includes(page)?`Atualizado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`:'';
  document.body.classList.toggle('painel-ativo', page === 'dashboard');
  document.body.classList.toggle('cadastro-ativo', page === 'novo-normativo');
  document.getElementById('subtitle').hidden = !['novo-normativo','tarefas'].includes(page);
  const reuniao = ['reunioes','minutas','cadastro-reuniao'].includes(page);
  const documental = ['normativos','novo-normativo'].includes(page);
  const gestao = ['reunioes','cadastro-reuniao'].includes(page);
  areaReunioes.hidden = !reuniao;
  areaDocumentos.hidden = !documental;
  document.getElementById('documental-titulo').hidden = true;
  content.hidden = reuniao || documental;
  const temAbasPadrao = documental || page === 'projetos' || page === 'tarefas' || reuniao;
  subnav.hidden = !temAbasPadrao;
  if(documental) {
    subnav.setAttribute('aria-label', 'Normativos');
    subnav.innerHTML = `<button type="button" class="secondary ${page==='normativos'?'active':''}" ${page==='normativos'?'aria-current="page"':''} onclick="go('normativos')">Visualização</button><button type="button" class="secondary ${page==='novo-normativo'?'active':''}" ${page==='novo-normativo'?'aria-current="page"':''} onclick="go('novo-normativo')">Cadastrar normativo</button>${page==='normativos'?'<button type="button" class="primary gestao-acao-direita" onclick="frameDocumentos?.contentWindow?.prepararRelatorioDocumentosFiltrados?.()">Exportar relatório</button>':''}`;
  } else if(page === 'projetos') {
    subnav.setAttribute('aria-label', 'Projetos');
    subnav.innerHTML = `<button type="button" class="secondary ${abaProjetos==='visualizacao'?'active':''}" ${abaProjetos==='visualizacao'?'aria-current="page"':''} onclick="trocarAbaProjetos('visualizacao')">Visualização</button><button type="button" class="secondary ${abaProjetos==='cadastro'?'active':''}" ${abaProjetos==='cadastro'?'aria-current="page"':''} onclick="trocarAbaProjetos('cadastro')">Cadastrar projeto</button>`;
  } else if(page === 'tarefas') {
    subnav.setAttribute('aria-label', 'Tarefas');
    const modoToggle = abaTarefas === 'visualizacao'
      ? `<div class="tarefas-modo-toggle gestao-acao-direita" role="group" aria-label="Modo de exibição das tarefas"><button type="button" class="${taskViewMode==='lista'?'active':''}" onclick="definirModoTarefas('lista')"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/></svg>Lista</button><button type="button" class="${taskViewMode==='quadro'?'active':''}" onclick="definirModoTarefas('quadro')"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="9" y1="4" x2="9" y2="20"/><line x1="15" y1="4" x2="15" y2="20"/></svg>Quadro</button></div>`
      : '';
    subnav.innerHTML = `<button type="button" class="secondary ${abaTarefas==='visualizacao'?'active':''}" ${abaTarefas==='visualizacao'?'aria-current="page"':''} onclick="trocarAbaTarefas('visualizacao')">Visualização</button><button type="button" class="secondary ${abaTarefas==='cadastro'?'active':''}" ${abaTarefas==='cadastro'?'aria-current="page"':''} onclick="trocarAbaTarefas('cadastro')">Cadastrar tarefa</button>${modoToggle}`;
  } else if(gestao) {
    subnav.setAttribute('aria-label', 'Reuniões');
    subnav.innerHTML = `<button type="button" class="secondary ${page==='reunioes'?'active':''}" ${page==='reunioes'?'aria-current="page"':''} onclick="go('reunioes')">Visualização</button><button type="button" id="aba-cadastrar-reuniao" class="secondary ${page==='cadastro-reuniao'?'active':''}" ${page==='cadastro-reuniao'?'aria-current="page"':''} onclick="abrirEscolhaCadastroReuniao()">Cadastrar reunião</button>`;
  } else if(page === 'minutas') {
    subnav.setAttribute('aria-label', 'Atas');
    subnav.innerHTML = `<button type="button" class="secondary active" aria-current="page" onclick="go('minutas')">Visualização</button><button type="button" class="secondary" onclick="abrirEscolhaCadastroReuniao()">Cadastrar reunião</button>`;
  } else {
    subnav.innerHTML = '';
  }
  if(documental) {
    cabecalho(page === 'novo-normativo' ? 'Novo normativo' : 'Normativos');
    if(page === 'novo-normativo') {
      document.getElementById('crumb').textContent = 'Normativos › Novo';
      document.getElementById('subtitle').textContent = 'Escolha a categoria e preencha as informações para concluir o cadastro.';
    }
    abrirDocumentos(page === 'novo-normativo' ? 'cadastro' : 'acompanhamento');
  }
  else if(reuniao) {
    cabecalho(page === 'minutas' ? 'Atas' : page === 'cadastro-reuniao' ? 'Reunião de unidade demandante' : 'Reuniões');
    if(page === 'cadastro-reuniao') document.getElementById('crumb').textContent = 'Reuniões › Unidade demandante';
    document.querySelectorAll('#farol-reunioes > .view').forEach(view => {
      const active = view.id === `view-${page === 'cadastro-reuniao' ? 'cadastro' : page}`;
      view.classList.toggle('active',active); view.setAttribute('aria-hidden',String(!active));
    });
  }
  else if(page === 'dashboard') {
    cabecalho('Dashboard');
    content.innerHTML = renderDashboardUnificado();
  }
  else if(page === 'auditorias') {
    cabecalho('Acompanhamento de Auditoria');
    content.innerHTML = painelAcompanhamentoAuditoria();
  }
  else if(page === 'acompanhamento') {
    cabecalho('Painel de acompanhamento');
    document.getElementById('subtitle').hidden=false;
    document.getElementById('subtitle').textContent='Resumo operacional de documentos, tarefas e reuniões que exigem atenção.';
    content.innerHTML=painelAcompanhamento();
  } else {
    renderAtividades();
    if(page === 'projetos' && abaProjetos === 'cadastro') {
      content.innerHTML = renderFormularioProjetoInline();
    }
    if(page === 'tarefas') {
      document.getElementById('subtitle').textContent = 'Acompanhe atividades operacionais, prioridades e prazos por projeto ou quadro Kanban.';
      if(abaTarefas === 'cadastro') {
        content.innerHTML = renderFormularioTarefaInline();
      }
    }
    if(page === 'agenda') {
      const opcoesFiltro = [['todos','Todos'],['reunioes','Reuniões'],['projetos','Prazos de projetos'],['tarefas','Prazos de tarefas']];
      const filters=document.createElement('div'); filters.className='agenda-filtros-chips';
      filters.innerHTML=`<span class="agenda-filtros-label">Exibir:</span><div class="agenda-chips-group" role="group" aria-label="Filtrar agenda">${opcoesFiltro.map(([value,label])=>`<button type="button" class="agenda-chip chip-${value} ${filtroAgenda===value?'active':''}" onclick="filtroAgenda=${argumentoJsHtml(value)};render()">${label}</button>`).join('')}</div><select id="agenda-tipo" hidden aria-label="Exibir na agenda" onchange="filtroAgenda=this.value;render()">${opcoesFiltro.map(([value,label])=>`<option value="${value}" ${filtroAgenda===value?'selected':''}>${label}</option>`).join('')}</select>`;
      const card = content.querySelector('.calendar-card');
      if(card) card.prepend(filters);
      else content.prepend(filters);
    }
    if(page === 'responsaveis') {
      const corpo=abaResponsaveis==='auditoria'?painelAuditoria():people();
      content.innerHTML=`<div class="responsaveis-tabs"><button type="button" class="secondary ${abaResponsaveis==='responsaveis'?'active':''}" onclick="abaResponsaveis='responsaveis';render()">Responsáveis</button><button type="button" class="secondary ${abaResponsaveis==='auditoria'?'active':''}" onclick="abaResponsaveis='auditoria';carregarAuditoria().then(render)">Auditoria e acessos</button></div>${corpo}`;
    }
  }
  document.getElementById('add').style.display = ['dashboard','agenda','normativos','novo-normativo','projetos','tarefas','reunioes','cadastro-reuniao','minutas','auditorias'].includes(page) ? 'none' : '';
  document.getElementById('add').textContent = documental ? '+ Novo normativo' : gestao || page==='minutas' ? '+ Cadastrar reunião' : document.getElementById('add').textContent;
  document.getElementById('nav').innerHTML = NAV_SECTIONS.map(([grupo,ids])=>`<div class="nav-grupo">${grupo}</div>${ids.map(id=>{
    const label=MENU.find(item=>item[0]===id)?.[1]||id;
    const current = page===id || (id==='normativos' && documental) || (id==='reunioes' && gestao);
    return `<button type="button" ${current?'class="active" aria-current="page"':''} onclick="go(${argumentoJsHtml(id)})">${label}</button>`;
  }).join('')}`).join('');
  renderizarNotificacoes();
  if(typeof inicializarSeletoresToolbar === 'function') inicializarSeletoresToolbar();
};
go = function(target,options={}) {
  frameDocumentos?.contentWindow?.fecharMenusAcoes?.();
  const aliases={acompanhamento:'normativos',cadastro:'novo-normativo',sobre:'dashboard'};
  target=aliases[target] || target;
  page=[...MENU.map(([id])=>id),'cadastro-reuniao','novo-normativo'].includes(target)?target:'dashboard';
  openProject=null;
  abaProjetos='visualizacao';
  abaTarefas='visualizacao';
  if(!options.semHistorico && location.hash!=='#'+page) history.pushState({page},'','#'+page);
  render();
};
newRecord = function(table,defaults={}) {
  if(!table && ['normativos','novo-normativo'].includes(page)) { go('novo-normativo'); return; }
  if(!table && ['reunioes','cadastro-reuniao','minutas'].includes(page)) { abrirEscolhaCadastroReuniao(); return; }
  if(!table && page === 'auditorias') { abrirCadastroAuditoria(); return; }
  novoRegistroAtividade(table,defaults);
};
calendarEvents = function(date) {
  const all=[...eventosAtividades(date).filter(event=>event.n!=='agenda'),...reunioes.filter(r=>r.data===date).map(r=>({n:'reunioes',id:r.id,title:r.pauta||'Reunião',at:`${r.horario||''} · ${r.frequencia}${r.cancelada||r.situacao==='Cancelada'?' · Cancelada':''}`,prio:'Média'}))];
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
