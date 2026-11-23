/* ===== DASHBOARD UNIFICADO COM FILTROS, GRÁFICOS E TABELA ===== */

const DASHBOARD_MODULOS = [
  { id: 'normativos', nome: 'Normativos', cor: '#1351B4', rota: 'normativos' },
  { id: 'auditorias', nome: 'Auditoria', cor: '#DC2626', rota: 'auditorias' },
  { id: 'reunioes', nome: 'Reuniões', cor: '#0EA5E9', rota: 'reunioes' },
  { id: 'atas', nome: 'Atas', cor: '#7C3AED', rota: 'minutas' },
  { id: 'projetos', nome: 'Projetos', cor: '#D97706', rota: 'projetos' },
  { id: 'tarefas', nome: 'Tarefas', cor: '#059669', rota: 'tarefas' }
];

const dashboardFiltroModulos = new Set();
const dashboardFiltroStatus = new Set();
const DASHBOARD_POR_PAGINA = 6;
let dashboardPaginaAtual = 1;

function corModuloDashboard(moduloId) {
  const m = DASHBOARD_MODULOS.find(x => x.id === moduloId);
  return m ? m.cor : '#1351B4';
}

function corStatusDashboard(status) {
  const s = String(status || '').toLocaleLowerCase('pt-BR');
  if (s.includes('não implement') || s.includes('vencid') || s.includes('cancelad') || s.includes('sem normativo')) return '#DC2626';
  if (s.includes('em implement') || s.includes('em andamento') || s.includes('a vencer') || s.includes('alerta') || s.includes('reagend') || s.includes('revis') || s.includes('pausad')) return '#D97706';
  if (s.includes('implementad') || s.includes('vigente') || s.includes('concluíd') || s.includes('concluid')) return '#16A34A';
  if (s.includes('agendad') || s.includes('ativo') || s.includes('a fazer')) return '#1351B4';
  return '#64748B';
}

function classeBadgeStatusDashboard(status) {
  const cor = corStatusDashboard(status);
  if (cor === '#DC2626') return 'status-vermelho';
  if (cor === '#D97706') return 'status-ambar';
  if (cor === '#16A34A') return 'status-verde';
  if (cor === '#1351B4') return 'status-azul';
  return 'status-neutro';
}

function calcularStatusNormativoDashboard(doc) {
  if (doc?.semNormativo || doc?.tipo === 'Sem normativo') return 'Sem normativo';
  const dataFim = String(doc?.data || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataFim)) return 'Vigente';
  const hoje = new Date();
  const hojeZero = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  const [a, m, d] = dataFim.split('-').map(Number);
  const venc = new Date(a, m - 1, d);
  const diffDias = Math.ceil((venc - hojeZero) / 86400000);
  if (diffDias < 0) return 'Vencido';
  if (diffDias <= 90) return 'A vencer';
  return 'Vigente';
}

function formatarDataCurtaDashboard(iso) {
  const s = String(iso || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return '—';
  const [a, m, d] = s.split('-');
  return `${d}/${m}/${a}`;
}

function coletarRegistrosDashboard() {
  const itens = [];

  // 1. Normativos
  let listaDocs = [];
  try {
    if (window.NormaticCloud?.enabled) listaDocs = window.NormaticCloud.readCollection('documentos') || [];
    else listaDocs = JSON.parse(localStorage.getItem('igov:documentos') || '[]');
  } catch (_) { listaDocs = []; }
  if (Array.isArray(listaDocs)) {
    listaDocs.forEach(doc => {
      itens.push({
        id: doc.id,
        modulo: 'normativos',
        moduloNome: 'Normativos',
        rota: 'normativos',
        descricao: doc.nome || doc.titulo || 'Documento sem nome',
        subtitulo: [doc.tipo, doc.unidade || doc.gestorSetor].filter(Boolean).join(' · '),
        status: calcularStatusNormativoDashboard(doc),
        data: doc.data || ''
      });
    });
  }

  // 2. Acompanhamento de Auditoria
  if (typeof auditoriasCarregadas !== 'undefined' && !auditoriasCarregadas && typeof carregarAuditoriasLocal === 'function') {
    auditoriasLista = carregarAuditoriasLocal();
    auditoriasCarregadas = true;
  }
  const listaAud = typeof auditoriasLista !== 'undefined' && Array.isArray(auditoriasLista) ? auditoriasLista : [];
  listaAud.forEach(aud => {
    itens.push({
      id: aud.id,
      modulo: 'auditorias',
      moduloNome: 'Auditoria',
      rota: 'auditorias',
      descricao: `Rec. ${aud.numeroRecomendacao || '—'} — ${aud.descricaoRecomendacao || aud.assunto || 'Recomendação'}`,
      subtitulo: `${aud.processoSei || ''} · ${aud.unidadeResponsavel || ''}`.replace(/^\s*·\s*|\s*·\s*$/g, ''),
      status: aud.status || 'Não implementada',
      data: aud.inicioAcompanhamento || ''
    });
  });

  // 3. Reuniões
  const listaReu = typeof reunioes !== 'undefined' && Array.isArray(reunioes) ? reunioes : [];
  listaReu.forEach(r => {
    const sit = typeof obterSituacaoReuniao === 'function' ? obterSituacaoReuniao(r) : (r.situacao || 'Agendada');
    itens.push({
      id: r.id,
      modulo: 'reunioes',
      moduloNome: 'Reuniões',
      rota: 'reunioes',
      descricao: r.pauta || r.resumo || 'Reunião agendada',
      subtitulo: [r.frequencia, r.horario].filter(Boolean).join(' · '),
      status: sit,
      data: r.data || ''
    });
  });

  // 4. Atas
  const listaAtas = typeof minutasHistorico !== 'undefined' && Array.isArray(minutasHistorico) ? minutasHistorico : [];
  listaAtas.forEach(m => {
    itens.push({
      id: m.id,
      modulo: 'atas',
      moduloNome: 'Atas',
      rota: 'minutas',
      descricao: m.reuniao?.pauta || m.titulo || 'Ata registrada',
      subtitulo: m.reuniao?.frequencia || '',
      status: m.concluida || m.status === 'Concluída' ? 'Concluída' : 'Em revisão',
      data: m.reuniao?.data || (m.geradaEm ? String(m.geradaEm).slice(0, 10) : '')
    });
  });

  // 5. Projetos
  const listaProj = typeof DATA !== 'undefined' && Array.isArray(DATA.projetos) ? DATA.projetos : [];
  listaProj.forEach(p => {
    itens.push({
      id: p.id,
      modulo: 'projetos',
      moduloNome: 'Projetos',
      rota: 'projetos',
      descricao: p.nome || 'Projeto sem nome',
      subtitulo: [p.responsavel, p.prioridade ? `Prioridade ${p.prioridade}` : ''].filter(Boolean).join(' · '),
      status: p.status || 'Ativo',
      data: p.prazo || ''
    });
  });

  // 6. Tarefas
  const listaTar = typeof DATA !== 'undefined' && Array.isArray(DATA.tarefas) ? DATA.tarefas : [];
  listaTar.forEach(t => {
    const st = typeof taskStatus === 'function' ? taskStatus(t) : (t.status || 'A fazer');
    itens.push({
      id: t.id,
      modulo: 'tarefas',
      moduloNome: 'Tarefas',
      rota: 'tarefas',
      descricao: t.titulo || 'Tarefa sem título',
      subtitulo: [t.responsavel, t.prioridade ? `Prioridade ${t.prioridade}` : ''].filter(Boolean).join(' · '),
      status: st,
      data: t.prazo || ''
    });
  });

  return itens;
}

function alternarFiltroModuloDashboard(moduloId) {
  if (dashboardFiltroModulos.has(moduloId)) dashboardFiltroModulos.delete(moduloId);
  else dashboardFiltroModulos.add(moduloId);
  dashboardPaginaAtual = 1;
  render();
}

function alternarFiltroStatusDashboard(status) {
  if (dashboardFiltroStatus.has(status)) dashboardFiltroStatus.delete(status);
  else dashboardFiltroStatus.add(status);
  dashboardPaginaAtual = 1;
  render();
}

function limparFiltrosDashboard() {
  dashboardFiltroModulos.clear();
  dashboardFiltroStatus.clear();
  dashboardPaginaAtual = 1;
  render();
}

function irPaginaDashboard(pagina) {
  const n = Number(pagina);
  if (!Number.isFinite(n) || n < 1) return;
  dashboardPaginaAtual = n;
  render();
}

function renderDonutDashboard(statusContagem, total) {
  if (!total) {
    return '<div class="dash-vazio">Nenhum registro para exibir com os filtros atuais.</div>';
  }
  const raio = 66;
  const circunferencia = 2 * Math.PI * raio;
  let acumulado = 0;
  const fatias = statusContagem.map(([status, qtd]) => {
    const fracao = qtd / total;
    const comprimento = fracao * circunferencia;
    const offset = -acumulado;
    acumulado += comprimento;
    const cor = corStatusDashboard(status);
    return `<circle cx="88" cy="88" r="${raio}" fill="none" stroke="${cor}" stroke-width="22" stroke-dasharray="${comprimento.toFixed(2)} ${circunferencia.toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}" transform="rotate(-90 88 88)"><title>${escapeHtml(status)}: ${qtd} (${(fracao * 100).toFixed(1)}%)</title></circle>`;
  }).join('');

  const legenda = statusContagem.map(([status, qtd]) => {
    const pct = ((qtd / total) * 100).toFixed(1).replace('.', ',');
    const cor = corStatusDashboard(status);
    const ativo = dashboardFiltroStatus.has(status);
    return `
      <button type="button" class="dash-donut-item ${ativo ? 'ativo' : ''}" onclick="alternarFiltroStatusDashboard(${argumentoJsHtml(status)})">
        <span class="dash-donut-dot" style="background:${cor}"></span>
        <span class="dash-donut-nome">${escapeHtml(status)}</span>
        <strong class="dash-donut-val">${qtd}</strong>
        <small class="dash-donut-pct">${pct}%</small>
      </button>
    `;
  }).join('');

  return `
    <div class="dash-donut-wrap">
      <div class="dash-donut-svg-box">
        <svg viewBox="0 0 176 176" class="dash-donut-svg" role="img" aria-label="Distribuição por status">
          <circle cx="88" cy="88" r="${raio}" fill="none" stroke="#EDF2F7" stroke-width="22"></circle>
          ${fatias}
        </svg>
        <div class="dash-donut-centro">
          <strong>${total}</strong>
          <span>${total === 1 ? 'registro' : 'registros'}</span>
        </div>
      </div>
      <div class="dash-donut-legenda">${legenda}</div>
    </div>
  `;
}

function renderBarrasModulosDashboard(itensFiltradosPorStatus) {
  const totalGeral = itensFiltradosPorStatus.length || 1;
  const contagens = DASHBOARD_MODULOS.map(m => {
    const qtd = itensFiltradosPorStatus.filter(i => i.modulo === m.id).length;
    return { ...m, qtd };
  });
  const maxQtd = Math.max(1, ...contagens.map(c => c.qtd));

  return `
    <div class="dash-barras-lista">
      ${contagens.map(m => {
        const largura = m.qtd ? Math.max(4, Math.round((m.qtd / maxQtd) * 100)) : 0;
        const pct = itensFiltradosPorStatus.length ? ((m.qtd / totalGeral) * 100).toFixed(1).replace('.', ',') : '0,0';
        const ativo = dashboardFiltroModulos.has(m.id);
        const esmaecido = dashboardFiltroModulos.size > 0 && !ativo;
        return `
          <button type="button" class="dash-barra-row ${ativo ? 'ativo' : ''} ${esmaecido ? 'esmaecido' : ''}" onclick="alternarFiltroModuloDashboard(${argumentoJsHtml(m.id)})">
            <div class="dash-barra-head">
              <span class="dash-barra-nome"><span class="dash-barra-dot" style="background:${m.cor}"></span>${escapeHtml(m.nome)}</span>
              <span class="dash-barra-num"><strong>${m.qtd}</strong> <small>(${pct}%)</small></span>
            </div>
            <div class="dash-barra-trilha">
              <div class="dash-barra-fill" style="width:${largura}%;background:${m.cor}"></div>
            </div>
          </button>
        `;
      }).join('')}
    </div>
  `;
}

function renderDashboardUnificado() {
  const todos = coletarRegistrosDashboard();

  const filtradosPorModulo = dashboardFiltroModulos.size
    ? todos.filter(i => dashboardFiltroModulos.has(i.modulo))
    : todos;

  const statusDisponiveis = [...new Set(filtradosPorModulo.map(i => i.status).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));

  // Remove filtros de status que não existem mais nos módulos selecionados
  [...dashboardFiltroStatus].forEach(st => {
    if (!statusDisponiveis.includes(st)) dashboardFiltroStatus.delete(st);
  });

  const filtradosPorStatus = dashboardFiltroStatus.size
    ? todos.filter(i => dashboardFiltroStatus.has(i.status))
    : todos;

  const exibidos = filtradosPorModulo.filter(i => !dashboardFiltroStatus.size || dashboardFiltroStatus.has(i.status));

  const mapaStatus = new Map();
  exibidos.forEach(i => mapaStatus.set(i.status, (mapaStatus.get(i.status) || 0) + 1));
  const statusContagem = [...mapaStatus.entries()].sort((a, b) => b[1] - a[1]);

  const temFiltro = dashboardFiltroModulos.size > 0 || dashboardFiltroStatus.size > 0;
  const totalPaginas = Math.max(1, Math.ceil(exibidos.length / DASHBOARD_POR_PAGINA));
  if (dashboardPaginaAtual > totalPaginas) dashboardPaginaAtual = totalPaginas;
  const inicioIdx = (dashboardPaginaAtual - 1) * DASHBOARD_POR_PAGINA;
  const paginaItens = exibidos.slice(inicioIdx, inicioIdx + DASHBOARD_POR_PAGINA);
  const faixaTexto = exibidos.length
    ? `Mostrando ${inicioIdx + 1}–${inicioIdx + paginaItens.length} de ${exibidos.length} ${exibidos.length === 1 ? 'registro' : 'registros'}`
    : '0 registros';

  const paginacaoHtml = totalPaginas > 1 ? `
    <div class="dash-paginacao">
      <button type="button" class="dash-pag-btn" ${dashboardPaginaAtual <= 1 ? 'disabled' : ''} onclick="irPaginaDashboard(${dashboardPaginaAtual - 1})">Anterior</button>
      <div class="dash-pag-numeros">
        ${Array.from({ length: totalPaginas }, (_, idx) => {
          const p = idx + 1;
          return `<button type="button" class="dash-pag-btn ${p === dashboardPaginaAtual ? 'ativo' : ''}" onclick="irPaginaDashboard(${p})">${p}</button>`;
        }).join('')}
      </div>
      <button type="button" class="dash-pag-btn" ${dashboardPaginaAtual >= totalPaginas ? 'disabled' : ''} onclick="irPaginaDashboard(${dashboardPaginaAtual + 1})">Próximo</button>
    </div>
  ` : '';

  return `
    <div class="dash-unificado">
      <div class="dash-sidebar-filtros" role="region" aria-label="Filtros do painel">
        <section class="card dash-filtro-card">
          <div class="dash-filtro-head">
            <h3>Módulos</h3>
            ${temFiltro ? '<button type="button" class="dash-limpar-btn" onclick="limparFiltrosDashboard()">Limpar</button>' : ''}
          </div>
          <div class="dash-check-lista">
            ${DASHBOARD_MODULOS.map(m => {
              const checked = dashboardFiltroModulos.has(m.id);
              const qtd = todos.filter(i => i.modulo === m.id).length;
              return `
                <label class="dash-check-item ${checked ? 'checked' : ''}">
                  <input type="checkbox" ${checked ? 'checked' : ''} onchange="alternarFiltroModuloDashboard(${argumentoJsHtml(m.id)})">
                  <span class="dash-check-cor" style="background:${m.cor}"></span>
                  <span class="dash-check-texto">${escapeHtml(m.nome)}</span>
                  <small class="dash-check-qtd">${qtd}</small>
                </label>
              `;
            }).join('')}
          </div>
        </section>

        <section class="card dash-filtro-card">
          <div class="dash-filtro-head">
            <h3>Status</h3>
          </div>
          <div class="dash-check-lista">
            ${statusDisponiveis.length ? statusDisponiveis.map(st => {
              const checked = dashboardFiltroStatus.has(st);
              const qtd = filtradosPorModulo.filter(i => i.status === st).length;
              const cor = corStatusDashboard(st);
              return `
                <label class="dash-check-item ${checked ? 'checked' : ''}">
                  <input type="checkbox" ${checked ? 'checked' : ''} onchange="alternarFiltroStatusDashboard(${argumentoJsHtml(st)})">
                  <span class="dash-check-cor" style="background:${cor}"></span>
                  <span class="dash-check-texto">${escapeHtml(st)}</span>
                  <small class="dash-check-qtd">${qtd}</small>
                </label>
              `;
            }).join('') : '<p class="muted" style="margin:0;font-size:12px;">Sem status disponíveis.</p>'}
          </div>
        </section>
      </div>

      <div class="dash-principal">
        <section class="card dash-tabela-card">
          <div class="dash-card-head">
            <h3>Registros e Atividades</h3>
            <span class="muted" id="dash-total-exibidos">${faixaTexto}</span>
          </div>
          <div class="dash-tabela-scroll">
            ${paginaItens.length ? `
              <table class="dash-tabela">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Módulo</th>
                    <th>Status</th>
                    <th>Data / Prazo</th>
                  </tr>
                </thead>
                <tbody>
                  ${paginaItens.map(item => `
                    <tr class="dash-tabela-row" onclick="go(${argumentoJsHtml(item.rota)})" title="Abrir ${escapeHtml(item.moduloNome)}">
                      <td class="dash-col-desc">
                        <strong>${escapeHtml(item.descricao)}</strong>
                        ${item.subtitulo ? `<small>${escapeHtml(item.subtitulo)}</small>` : ''}
                      </td>
                      <td class="dash-col-mod">
                        <span class="dash-modulo-pill"><span class="dash-modulo-dot" style="background:${corModuloDashboard(item.modulo)}"></span>${escapeHtml(item.moduloNome)}</span>
                      </td>
                      <td class="dash-col-status">
                        <span class="dash-status-pill ${classeBadgeStatusDashboard(item.status)}">${escapeHtml(item.status)}</span>
                      </td>
                      <td class="dash-col-data">${escapeHtml(formatarDataCurtaDashboard(item.data))}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            ` : '<div class="dash-vazio">Nenhum registro corresponde aos filtros selecionados.</div>'}
          </div>
          ${paginacaoHtml}
        </section>

        <div class="card dash-graficos-grid">
          <section class="dash-grafico-card">
            <div class="dash-card-head">
              <h3>Total por Status</h3>
              <span class="muted">Distribuição dos itens filtrados</span>
            </div>
            ${renderDonutDashboard(statusContagem, exibidos.length)}
          </section>

          <section class="dash-grafico-card dash-grafico-separador">
            <div class="dash-card-head">
              <h3>Registros por Módulo</h3>
              <span class="muted">Clique em uma barra para filtrar</span>
            </div>
            ${renderBarrasModulosDashboard(filtradosPorStatus)}
          </section>
        </div>
      </div>
    </div>
  `;
}
