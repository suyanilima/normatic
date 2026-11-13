/* Uma navegação FAROL; reuniões/atas reutilizam o motor já existente do Normatic. */
MENU.splice(3, 0, ['reunioes', 'Reuniões e pautas'], ['minutas', 'Atas']);
const PAGINAS_REUNIAO = ['reunioes', 'minutas', 'cadastro'];
const renderAtividades = render;
const novoRegistroAtividade = newRecord;
const eventosAtividades = calendarEvents;
const visualizarAtividade = viewCalendarRecord;
const areaReunioes = document.getElementById('farol-reunioes');
// Diálogos ficam fora dos painéis ocultos: a agenda também abre resumos de reuniões.
for (const child of [...areaReunioes.children]) {
  if (!child.classList.contains('view')) document.body.appendChild(child);
}
document.getElementById('content').after(areaReunioes);

function selecionarModoCadastro() {
  document.getElementById('cadastro-reuniao-form').classList.remove('oculto');
}
function setTab(tab) { go(tab === 'cadastro' ? 'cadastro' : tab); }

render = function () {
  fecharMenusAcoes();
  const isMeeting = PAGINAS_REUNIAO.includes(page);
  document.getElementById('farol-reunioes').hidden = !isMeeting;
  document.getElementById('content').hidden = isMeeting;
  if (!isMeeting) {
    renderAtividades();
  } else {
    const title = page === 'cadastro' ? 'Nova reunião' : MENU.find(([id]) => id === page)?.[1];
    document.getElementById('title').textContent = title;
    document.getElementById('crumb').textContent = title;
    document.getElementById('add').style.display = '';
    document.getElementById('add').textContent = '+ Nova reunião';
    document.querySelectorAll('#farol-reunioes > .view').forEach(view => {
      const active = view.id === `view-${page}`;
      view.classList.toggle('active', active);
      view.setAttribute('aria-hidden', String(!active));
    });
  }
  document.getElementById('nav').innerHTML = MENU.map(([id, title]) => `<button type="button" ${id === page || (id === 'reunioes' && page === 'cadastro') ? 'class="active" aria-current="page"' : ''} onclick="go('${id}')">${title}</button>`).join('');
  if (page === 'dashboard') {
    const summary = document.createElement('section');
    summary.className = 'card module-meeting-summary';
    const active = reunioes.filter(r => !r.cancelada && r.situacao !== 'Cancelada');
    const withMinutes = new Set(minutasHistorico.map(m => m.reuniao?.id));
    summary.innerHTML = `<strong>Reuniões: ${reunioes.length}</strong><span>Atas salvas: ${minutasHistorico.length}</span><span>Sem ata: ${active.filter(r => !withMinutes.has(r.id)).length}</span><a href="#reunioes">Consultar reuniões e pautas</a>`;
    document.getElementById('content').prepend(summary);
  }
};

go = function (target, options = {}) {
  page = [...MENU.map(([id]) => id), 'cadastro'].includes(target) ? target : 'dashboard';
  openProject = null;
  if (!options.semHistorico && location.hash !== '#' + page) history.pushState({ page }, '', '#' + page);
  render();
};
newRecord = function (table, defaults = {}) {
  if (!table && PAGINAS_REUNIAO.includes(page)) { go('cadastro'); selecionarModoCadastro(); return; }
  novoRegistroAtividade(table, defaults);
};
calendarEvents = function (date) {
  return [...eventosAtividades(date), ...reunioes.filter(r => r.data === date).map(r => ({
    n: 'reunioes', id: r.id, title: r.pauta || 'Reunião',
    at: `${r.horario || ''} · ${r.frequencia}${r.cancelada || r.situacao === 'Cancelada' ? ' · Cancelada' : ''}`, prio: 'Média'
  }))];
};
viewCalendarRecord = function (table, id) {
  if (table === 'reunioes') { verResumoReuniao(id); return; }
  visualizarAtividade(table, id);
};
function renderDashboard() {
  if (page === 'dashboard' || page === 'agenda') render();
}

inicializarInterfaceCompartilhada();
inicializarSeletoresToolbar();
popularSetoresConvidados();
document.addEventListener('click', event => {
  if (!event.target.closest?.('.toolbar-select-personalizado')) fecharSeletoresToolbar();
});
window.addEventListener('popstate', () => go(location.hash.slice(1), { semHistorico: true }));
window.addEventListener('hashchange', () => go(location.hash.slice(1), { semHistorico: true }));
document.addEventListener('DOMContentLoaded', () => {
  if (!window.igovAI?.gerarDescricaoReuniao && !window.IGOV_CONFIG?.apiBaseUrl) {
    const button = document.getElementById('btn-gerar-descricao-ia');
    button.disabled = true;
    button.title = 'Serviço não configurado. Use Prosseguir para revisar e gerar a ata manualmente.';
  }
});
window.addEventListener('storage', event => {
  if (event.key === FarolStorage.key) refresh();
  if (['igov:reunioes', 'igov:minutas', 'igov:unidades-reuniao'].includes(event.key)) {
    carregarUnidades(); carregarHistoricoMinutas(); carregarReunioes();
  }
});
go(location.hash.slice(1), { semHistorico: true });
