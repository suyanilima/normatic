const MENU = [['dashboard', 'Visão geral'], ['projetos', 'Projetos'], ['tarefas', 'Tarefas'], ['agenda', 'Agenda'], ['responsaveis', 'Responsáveis']];
    const COLORS = [['green', 'Baixa'], ['blue', 'Média'], ['orange', 'Alta'], ['red', 'Urgente']];
    const PRIORITY_ORDER = {
        Urgente: 0, Alta: 1, 'Média': 2, Baixa: 3
    };
    const CONFIG = {
        projetos: {
            label: 'projeto', fields: [['nome', 'Nome', 'text', 1], ['objetivo', 'Descrição', 'textarea'], ['responsavel', 'Responsável', 'person'], ['prioridade', 'Prioridade', 'select', ['Baixa', 'Média', 'Alta', 'Urgente']], ['status', 'Status', 'select', ['Ativo', 'Em andamento', 'Pausado', 'Concluído']], ['prazo', 'Prazo', 'date']]
        },
        tarefas: {
            label: 'tarefa', fields: [['titulo', 'Título', 'text', 1], ['projeto_id', 'Projeto (opcional)', 'project'], ['responsavel', 'Responsável', 'person'], ['prioridade', 'Prioridade', 'select', ['Baixa', 'Média', 'Alta', 'Urgente']], ['status', 'Status', 'select', ['A fazer', 'Em andamento', 'Concluída']], ['prazo', 'Prazo', 'date'], ['enviar_convite', 'Receber lembretes por e-mail', 'select', ['Não', 'Sim']], ['observacoes', 'Observações', 'textarea']]
        },
        agenda: {
            label: 'compromisso', fields: [['titulo', 'Título', 'text', 1], ['data', 'Data', 'date', 1], ['hora', 'Início', 'time', 1], ['hora_fim', 'Fim', 'time'], ['responsavel', 'Responsável', 'person'], ['enviar_convite', 'Preferência de convite (envio indisponível nesta etapa)', 'select', ['Não', 'Sim']], ['observacoes', 'Observações', 'textarea']]
        },
        responsaveis: {
            label: 'responsável', fields: [['nome', 'Nome', 'text', 1], ['email', 'E-mail', 'email'], ['ativo', 'Ativo', 'select', ['Sim', 'Não']]]
        }
    };
    let DATA = {
        projetos: [], tarefas: [], agenda: [], responsaveis: []
    }, page = 'dashboard', editing = null, editTable = null, openProject = null, taskFilter = 'Todos', month = new Date().getMonth(), year = new Date().getFullYear();
    let paginaProjetos = 1;
    const PROJETOS_POR_PAGINA = 10;
    // Persistência substituível, sem serviços externos nesta etapa.
    const api = (fn, ...args) => FarolStorage.api(fn, ...args);
    function esc(x) {
        return String(x ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    }
    function dt(x) { if (!x)
        return 'Sem prazo'; const a = String(x).slice(0, 10).split('-'); return a.length === 3 ? esc(`${a[2]}/${a[1]}/${a[0]}`) : esc(x); }
    function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
    function notify(s) { const e = document.getElementById('notice'); e.textContent = s; e.style.display = 'block'; clearTimeout(window.noticeTimer); window.noticeTimer = setTimeout(() => e.style.display = 'none', 6000); }
    function done(t) { return t.status === 'Concluída'; }
    function taskStatus(t) { const v = String(t?.status || '').trim(); return v === 'Pendente' ? 'A fazer' : (v || 'A fazer'); }
    function projectOf(t) { return DATA.projetos.find(p => p.id === t.projeto_id || (!t.projeto_id && p.nome === t.projeto)); }
    function colorTag(t) { return ''; }
    function priority(t) { const name = t.prioridade || 'Média', c = COLORS.find(x => x[1] === name)?.[0] || 'blue'; return `<span class="tag ${c}">${esc(name)}</span>`; }
    async function refresh() { document.getElementById('busy').style.display = 'block'; try {
        DATA = await api('getData');
        render();
    }
    catch (e) {
        notify('Erro ao carregar: ' + (e.message || e));
    }
    finally {
        document.getElementById('busy').style.display = 'none';
    } }
    function go(p) { page = p; openProject = null; render(); }
    function render() { document.getElementById('nav').innerHTML = MENU.map(([p, t]) => `<button class="${p === page ? 'active' : ''}" onclick="go(${argumentoJsHtml(p)})">${t}</button>`).join(''); document.getElementById('title').textContent = MENU.find(x => x[0] === page)?.[1] || page; document.getElementById('crumb').textContent = document.getElementById('title').textContent; document.getElementById('subtitle').textContent = ({ dashboard: 'Seu trabalho, em foco.', projetos: 'Do planejamento à entrega, cada projeto em foco.', tarefas: 'Organize prioridades. Faça acontecer.', agenda: 'Seu tempo e suas entregas, em sintonia.', responsaveis: 'As pessoas que fazem os projetos acontecerem.' })[page]; document.getElementById('add').textContent = ({ projetos: '+ Novo projeto', tarefas: '+ Nova tarefa', agenda: '+ Novo compromisso', responsaveis: '+ Novo responsável' })[page] || '+ Novo'; document.getElementById('add').style.display = page === 'dashboard' ? 'none' : ''; document.getElementById('content').innerHTML = ({ dashboard: dashboard, projetos: projects, tarefas: tasks, agenda: calendar, responsaveis: people })[page](); }
    function metric(v, l) { return `<div class="card"><div class="muted">${l}</div><div class="metric">${v}</div></div>`; }
    function dashboard() { const pending = DATA.tarefas.filter(t => !done(t)), late = pending.filter(t => t.prazo && t.prazo < today()), names = [...new Set([...DATA.responsaveis.map(r => r.nome), ...DATA.tarefas.map(t => t.responsavel).filter(Boolean)])]; return `<div class="grid"><section class="card scroll-card"><h3>Responsáveis</h3><div class="card-scroll">${names.map(n => { const ts = DATA.tarefas.filter(t => t.responsavel === n), c = ts.filter(done).length; return `<div class="item dashboard-person"><div class="person-summary"><div class="person-copy"><b>${esc(n)}</b><p class="muted">${c} de ${ts.length} concluídas</p></div><button class="secondary" data-responsavel="${esc(n)}" onclick="showResponsibleTasks(this.dataset.responsavel)">Visualizar tarefas</button></div></div>`; }).join('') || '<div class="empty-state"><div class="empty-icon">♙</div><h3>Nenhum responsável</h3><p>Cadastre alguém para acompanhar as tarefas.</p></div>'}</div></section><section class="card scroll-card"><h3>Prioridades</h3><div class="card-scroll">${pending.slice().sort((a, b) => (PRIORITY_ORDER[a.prioridade] ?? 4) - (PRIORITY_ORDER[b.prioridade] ?? 4)).slice(0, 7).map(t => `<div class="item"><div><b>${esc(t.titulo)}</b><p class="muted">${esc(t.responsavel || 'Sem responsável')} · ${dt(t.prazo)}</p>${priority(t)}</div><button class="secondary" onclick="viewTask(${argumentoJsHtml(t.id)})">Visualizar</button></div>`).join('') || '<div class="empty-state"><div class="empty-icon">✓</div><h3>Nenhuma pendência</h3><p>Suas tarefas prioritárias aparecerão aqui.</p></div>'}</div></section></div>`; }
    function actions(n, id) { return `<div class="actions"><button class="secondary" onclick="edit(${argumentoJsHtml(n)},${argumentoJsHtml(id)})">Editar</button><button class="secondary danger" onclick="removeRecord(${argumentoJsHtml(n)},${argumentoJsHtml(id)})">Excluir</button></div>`; }
    function taskCard(t) { const isDone = done(t); return `<article class="task-card ${isDone ? 'is-done' : ''}"><div class="task-head"><button type="button" class="complete-toggle ${isDone ? 'checked' : ''}" title="${isDone ? 'Reabrir tarefa' : 'Marcar como concluída'}" aria-label="${isDone ? 'Reabrir tarefa' : 'Concluir tarefa'}" onclick="changeStatus(${argumentoJsHtml(t.id)},'${isDone ? 'A fazer' : 'Concluída'}')">${isDone ? 'Reabrir' : 'Concluir'}</button><div class="task-main"><h4>${esc(t.titulo)}</h4>${priority(t)}${colorTag(t)}<p class="muted">${esc(t.responsavel || 'Não atribuído')} · ${dt(t.prazo)}</p></div></div><div class="actions"><button type="button" class="${isDone ? 'secondary' : 'primary'} complete-action" onclick="changeStatus(${argumentoJsHtml(t.id)},'${isDone ? 'A fazer' : 'Concluída'}')">${isDone ? 'Reabrir tarefa' : 'Concluir tarefa'}</button>${taskStatus(t) === 'A fazer' ? `<button class="secondary" onclick="changeStatus(${argumentoJsHtml(t.id)},'Em andamento')">Iniciar</button>` : ''}<button class="secondary" onclick="edit('tarefas',${argumentoJsHtml(t.id)})">Editar</button></div></article>`; }
    function board(ts) { return `<div class="board">${[['A fazer', 'A fazer'], ['Em andamento', 'Em andamento'], ['Concluída', 'Concluído']].map(([s, title]) => `<div class="lane"><h4>${title} · ${ts.filter(t => taskStatus(t) === s).length}</h4>${ts.filter(t => taskStatus(t) === s).map(taskCard).join('') || '<p class="muted">Nenhuma tarefa</p>'}</div>`).join('')}</div>`; }
    function projectTaskRows(ts) { return `<div class="simple-list">${ts.map(t => `<div class="simple-task"><div class="simple-task-info"><b>${esc(t.titulo)}</b><div class="task-meta">${priority(t)}<span class="tag">${esc(taskStatus(t))}</span><span>${esc(t.responsavel || 'Sem responsável')}</span><span>${dt(t.prazo)}</span></div></div><div class="actions"><button class="secondary" onclick="viewTask(${argumentoJsHtml(t.id)})">Visualizar</button><button class="secondary" onclick="edit('tarefas',${argumentoJsHtml(t.id)})">Editar</button><button class="secondary" onclick="changeStatus(${argumentoJsHtml(t.id)},'${done(t) ? 'A fazer' : 'Concluída'}')">${done(t) ? 'Reabrir' : 'Concluir'}</button><button class="secondary danger" onclick="removeRecord('tarefas',${argumentoJsHtml(t.id)})">Excluir</button></div></div>`).join('') || '<p class="muted">Nenhuma tarefa neste projeto.</p>'}</div>`; }
    function showResponsibleTasks(name) { ocultarAcoesCompromisso();
        const tasks = DATA.tarefas.filter(t => (t.responsavel || 'Não atribuído') === name);
        document.getElementById('detailsTitle').textContent = 'Tarefas de ' + name;
        document.getElementById('detailsBody').innerHTML = tasks.length ? projectTaskRows(tasks) : '<p class="muted">Nenhuma tarefa atribuída.</p>';
        document.getElementById('details').showModal();
    }
    function viewTask(id) { ocultarAcoesCompromisso(); const t = DATA.tarefas.find(x => x.id === id); if (!t)
        return; const p = projectOf(t); document.getElementById('detailsTitle').textContent = t.titulo; document.getElementById('detailsBody').innerHTML = `<p><b>Projeto:</b> ${esc(p?.nome || 'Sem projeto')}</p><p><b>Status:</b> ${esc(taskStatus(t))}</p><p><b>Prioridade:</b> ${priority(t)}</p><p><b>Responsável:</b> ${esc(t.responsavel || 'Não atribuído')}</p><p><b>Prazo:</b> ${dt(t.prazo)}</p><p><b>Observações:</b> ${esc(t.observacoes || 'Nenhuma')}</p>`; document.getElementById('details').showModal(); }
    let filtroProjetoBusca = '';
    let filtroProjetoStatus = '';
    let filtroProjetoPrioridade = '';
    let filtroProjetoResponsavel = '';
    function atualizarBuscaProjetos(valor) {
        const ativo = document.getElementById('proj-busca');
        const caret = ativo?.selectionStart;
        filtroProjetoBusca = valor;
        paginaProjetos = 1;
        render();
        const novo = document.getElementById('proj-busca');
        novo?.focus();
        if (caret != null) novo?.setSelectionRange?.(caret, caret);
    }
    function limparFiltrosProjetos() {
        filtroProjetoBusca = '';
        filtroProjetoStatus = '';
        filtroProjetoPrioridade = '';
        filtroProjetoResponsavel = '';
        paginaProjetos = 1;
        render();
    }
    function classeStatusProjeto(status) {
        const s = String(status || 'Ativo').toLocaleLowerCase('pt-BR');
        if (s.includes('conclu')) return 'status-verde';
        if (s.includes('andamento')) return 'status-ambar';
        if (s.includes('pausad')) return 'status-neutro';
        return 'status-azul';
    }
    function projects() {
        const termo = String(filtroProjetoBusca || '').trim().toLocaleLowerCase('pt-BR');
        const responsaveisUnicos = [...new Set(DATA.projetos.map(p => p.responsavel).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
        const filtrados = DATA.projetos.filter(p => {
            const casaBusca = !termo || [p.nome, p.objetivo, p.responsavel].some(v => String(v || '').toLocaleLowerCase('pt-BR').includes(termo));
            const casaStatus = !filtroProjetoStatus || (p.status || 'Ativo') === filtroProjetoStatus;
            const casaPrio = !filtroProjetoPrioridade || (p.prioridade || 'Média') === filtroProjetoPrioridade;
            const casaResp = !filtroProjetoResponsavel || (p.responsavel || '') === filtroProjetoResponsavel;
            return casaBusca && casaStatus && casaPrio && casaResp;
        });

        const totalPaginas = Math.max(1, Math.ceil(filtrados.length / PROJETOS_POR_PAGINA));
        paginaProjetos = Math.max(1, Math.min(paginaProjetos, totalPaginas));
        const inicio = (paginaProjetos - 1) * PROJETOS_POR_PAGINA;
        const projetosVisiveis = filtrados.slice(inicio, inicio + PROJETOS_POR_PAGINA);
        const exibindoDe = filtrados.length ? inicio + 1 : 0;
        const exibindoAte = Math.min(inicio + PROJETOS_POR_PAGINA, filtrados.length);
        const totalTexto = filtrados.length
            ? `Mostrando ${exibindoDe}–${exibindoAte} de ${filtrados.length} ${filtrados.length === 1 ? 'projeto' : 'projetos'}`
            : '0 projetos';

        const botoesPaginacao = totalPaginas > 1 ? `
            <div class="paginacao" role="navigation" aria-label="Paginação de projetos">
                <button type="button" class="pagina-btn pagina-seta" ${paginaProjetos <= 1 ? 'disabled' : ''} onclick="mudarPaginaProjetos(${paginaProjetos - 1})">Anterior</button>
                ${Array.from({ length: totalPaginas }, (_, i) => {
                    const num = i + 1;
                    return `<button type="button" class="pagina-btn ${paginaProjetos === num ? 'active' : ''}" onclick="mudarPaginaProjetos(${num})">${num}</button>`;
                }).join('')}
                <button type="button" class="pagina-btn pagina-seta" ${paginaProjetos >= totalPaginas ? 'disabled' : ''} onclick="mudarPaginaProjetos(${paginaProjetos + 1})">Próximo</button>
            </div>
        ` : '';

        return `
            <div class="projetos-modulo">
                <section class="card auditoria-filtros-card">
                    <div class="auditoria-filtros-grid">
                        <div class="auditoria-field">
                            <label for="proj-busca">Buscar</label>
                            <input id="proj-busca" type="search" maxlength="120" placeholder="Nome, descrição ou responsável..." value="${esc(filtroProjetoBusca)}" oninput="atualizarBuscaProjetos(this.value)">
                        </div>
                        <div class="auditoria-field">
                            <label for="proj-filtro-status">Status</label>
                            <select id="proj-filtro-status" onchange="filtroProjetoStatus=this.value;paginaProjetos=1;render()">
                                <option value="">Todos</option>
                                ${['Ativo', 'Em andamento', 'Pausado', 'Concluído'].map(st => `<option value="${st}" ${filtroProjetoStatus === st ? 'selected' : ''}>${st}</option>`).join('')}
                            </select>
                        </div>
                        <div class="auditoria-field">
                            <label for="proj-filtro-prioridade">Prioridade</label>
                            <select id="proj-filtro-prioridade" onchange="filtroProjetoPrioridade=this.value;paginaProjetos=1;render()">
                                <option value="">Todas</option>
                                ${['Urgente', 'Alta', 'Média', 'Baixa'].map(pr => `<option value="${pr}" ${filtroProjetoPrioridade === pr ? 'selected' : ''}>${pr}</option>`).join('')}
                            </select>
                        </div>
                        <div class="auditoria-field">
                            <label for="proj-filtro-responsavel">Responsável</label>
                            <select id="proj-filtro-responsavel" onchange="filtroProjetoResponsavel=this.value;paginaProjetos=1;render()">
                                <option value="">Todos os responsáveis</option>
                                ${responsaveisUnicos.map(r => `<option value="${esc(r)}" ${filtroProjetoResponsavel === r ? 'selected' : ''}>${esc(r)}</option>`).join('')}
                            </select>
                        </div>
                        <div class="auditoria-filtros-limpar">
                            <button type="button" class="secondary" onclick="limparFiltrosProjetos()">Limpar filtros</button>
                        </div>
                    </div>
                </section>

                <section class="card projetos-tabela-card">
                    <div class="projetos-tabela-topo">
                        <div>
                            <h3>Projetos cadastrados</h3>
                            <p class="muted">${totalTexto}</p>
                        </div>
                    </div>
                    ${projetosVisiveis.length ? `
                        <div class="projetos-tabela-wrap">
                            <table class="projetos-tabela">
                                <thead>
                                    <tr>
                                        <th>Projeto</th>
                                        <th>Responsável</th>
                                        <th>Prioridade</th>
                                        <th>Status</th>
                                        <th>Progresso</th>
                                        <th>Prazo</th>
                                        <th style="text-align:right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${projetosVisiveis.map(p => {
                                        const ts = DATA.tarefas.filter(t => projectOf(t)?.id === p.id);
                                        const c = ts.filter(done).length;
                                        const pct = ts.length ? Math.round((c / ts.length) * 100) : 0;
                                        const expandido = openProject === p.id;
                                        return `
                                            <tr class="project-entry ${expandido ? 'is-expanded' : ''}">
                                                <td class="proj-col-nome">
                                                    <strong>${esc(p.nome)}</strong>
                                                    <small>${esc(p.objetivo || 'Sem descrição')}</small>
                                                </td>
                                                <td class="proj-col-resp">${esc(p.responsavel || 'Não atribuído')}</td>
                                                <td class="proj-col-prio">${priority(p)}</td>
                                                <td class="proj-col-status">
                                                    <span class="dash-status-pill ${classeStatusProjeto(p.status)}">${esc(p.status || 'Ativo')}</span>
                                                </td>
                                                <td class="proj-col-prog">
                                                    <div class="proj-progresso">
                                                        <div class="proj-progresso-trilha"><div class="proj-progresso-fill" style="width:${pct}%"></div></div>
                                                        <span>${c}/${ts.length} concluídas</span>
                                                    </div>
                                                </td>
                                                <td class="proj-col-prazo">${p.prazo ? dt(p.prazo) : '—'}</td>
                                                <td class="proj-col-acoes">
                                                    <div class="proj-acoes-wrap">
                                                        <button type="button" class="secondary" onclick="toggleProject(${argumentoJsHtml(p.id)})">${expandido ? 'Ocultar' : `Tarefas (${ts.length})`}</button>
                                                        <button type="button" class="primary" onclick="newRecord('tarefas',{projeto_id:${argumentoJsHtml(p.id)}})">+ Tarefa</button>
                                                        <div class="actions">
                                                            <button type="button" class="secondary" onclick="edit('projetos',${argumentoJsHtml(p.id)})">Editar</button>
                                                            <button type="button" class="secondary danger" onclick="removeRecord('projetos',${argumentoJsHtml(p.id)})">Excluir</button>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                            ${expandido ? `
                                                <tr class="projeto-tarefas-expandida">
                                                    <td colspan="7">
                                                        <div class="projeto-tarefas-box">
                                                            <div class="projeto-tarefas-box-head">
                                                                <span>Tarefas vinculadas (${ts.length})</span>
                                                            </div>
                                                            ${projectTaskRows(ts)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ` : ''}
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                        ${totalPaginas > 1 ? `
                            <div class="paginacao-rodape">
                                <div class="paginacao-total-texto">Página ${paginaProjetos} de ${totalPaginas}</div>
                                ${botoesPaginacao}
                            </div>
                        ` : ''}
                    ` : `
                        <div class="tarefas-vazio">
                            <div class="tarefas-vazio-icone" aria-hidden="true">
                                <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="16" rx="3"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                            </div>
                            <h3>Nenhum projeto encontrado</h3>
                            <p>${DATA.projetos.length ? 'Ajuste os filtros ou limpe a busca para visualizar os projetos.' : 'Crie seu primeiro projeto para organizar entregas e tarefas da equipe.'}</p>
                            <button type="button" class="primary" onclick="typeof trocarAbaProjetos==='function'?trocarAbaProjetos('cadastro'):newRecord('projetos')">+ Cadastrar projeto</button>
                        </div>
                    `}
                </section>
            </div>
        `;
    }
    function mudarPaginaProjetos(numero) {
        const total = Math.max(1, Math.ceil(DATA.projetos.length / PROJETOS_POR_PAGINA));
        paginaProjetos = Math.max(1, Math.min(numero, total));
        openProject = null;
        render();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function toggleProject(id) { openProject = openProject === id ? null : id; render(); }
    let taskStatusFilter = 'Todos';
    let taskViewMode = 'lista';
    let taskPriorityFilter = 'Todas';
    let taskSearchQuery = '';
    function atualizarBuscaTarefas(valor) {
      const ativo = document.getElementById('taskSearchInput');
      const caret = ativo?.selectionStart;
      taskSearchQuery = valor;
      render();
      const novo = document.getElementById('taskSearchInput');
      novo?.focus();
      if (caret != null) novo?.setSelectionRange?.(caret, caret);
    }
    function definirModoTarefas(modo) {
      taskViewMode = modo === 'quadro' ? 'quadro' : 'lista';
      render();
    }
    function renderKanbanTarefas(ts) {
      const colunas = [
        { status: 'A fazer', titulo: 'Pendente', classe: 'col-pendente' },
        { status: 'Em andamento', titulo: 'Em andamento', classe: 'col-andamento' },
        { status: 'Concluída', titulo: 'Concluída', classe: 'col-concluida' }
      ];
      return `<div class="tarefas-kanban-grid">${colunas.map(col => {
        const itens = ts.filter(t => taskStatus(t) === col.status);
        return `
          <section class="tarefas-kanban-col ${col.classe}">
            <header class="tarefas-kanban-head">
              <h4>${col.titulo}</h4>
              <span class="tarefas-kanban-qtd">${itens.length}</span>
            </header>
            <div class="tarefas-kanban-body">
              ${itens.length ? itens.map(t => {
                const proj = projectOf(t);
                const st = taskStatus(t);
                return `
                  <article class="tarefas-kanban-card ${st === 'Concluída' ? 'is-done' : ''}">
                    <div class="tarefas-kanban-card-top">
                      <strong>${esc(t.titulo)}</strong>
                      ${priority(t)}
                    </div>
                    <div class="tarefas-kanban-card-meta">
                      ${proj ? `<span class="tarefas-proj-tag">${esc(proj.nome)}</span>` : ''}
                      <span>${esc(t.responsavel || 'Sem responsável')}</span>
                      ${t.prazo ? `<span>${dt(t.prazo)}</span>` : ''}
                    </div>
                    <div class="tarefas-kanban-card-actions">
                      ${st === 'A fazer' ? `<button type="button" class="secondary" onclick="changeStatus(${argumentoJsHtml(t.id)},'Em andamento')">Iniciar</button>` : ''}
                      ${st !== 'Concluída' ? `<button type="button" class="primary" onclick="changeStatus(${argumentoJsHtml(t.id)},'Concluída')">Concluir</button>` : `<button type="button" class="secondary" onclick="changeStatus(${argumentoJsHtml(t.id)},'A fazer')">Reabrir</button>`}
                      <button type="button" class="secondary" onclick="edit('tarefas',${argumentoJsHtml(t.id)})">Editar</button>
                    </div>
                  </article>
                `;
              }).join('') : '<div class="tarefas-kanban-vazio">Nenhuma tarefa nesta etapa.</div>'}
            </div>
          </section>
        `;
      }).join('')}</div>`;
    }
    function tasks() {
      const projetos = ['Todos', 'Sem projeto', ...DATA.projetos.map(p => p.id)];
      const termo = String(taskSearchQuery || '').trim().toLocaleLowerCase('pt-BR');
      const filtradasBase = DATA.tarefas.filter(t => {
        const casaProjeto = taskFilter === 'Todos' || (taskFilter === 'Sem projeto' ? !projectOf(t) : projectOf(t)?.id === taskFilter);
        const casaPrioridade = taskPriorityFilter === 'Todas' || (t.prioridade || 'Média') === taskPriorityFilter;
        const projNome = projectOf(t)?.nome || '';
        const casaBusca = !termo || [t.titulo, t.responsavel, projNome, t.observacoes].some(v => String(v || '').toLocaleLowerCase('pt-BR').includes(termo));
        return casaProjeto && casaPrioridade && casaBusca;
      });
      const ts = taskViewMode === 'lista'
        ? filtradasBase.filter(t => taskStatusFilter === 'Todos' || taskStatus(t) === taskStatusFilter)
        : filtradasBase;

      const barraEsquerda = taskViewMode === 'lista'
        ? `<div class="tarefas-status-pills" role="tablist" aria-label="Filtrar por status">${[['Todos', 'Todas'], ['A fazer', 'Pendentes'], ['Em andamento', 'Em andamento'], ['Concluída', 'Concluídas']].map(([key, label]) => `<button type="button" class="${taskStatusFilter === key ? 'active' : ''}" onclick="taskStatusFilter=${argumentoJsHtml(key)};render()">${label}</button>`).join('')}</div>`
        : `<span class="tarefas-quadro-legenda">Visualização em colunas por estágio de execução</span>`;

      const filtrosHtml = `
        <section class="card tarefas-filtros-card">
          <div class="tarefas-filtros-bar">
            <div class="tarefas-filtros-esquerda">${barraEsquerda}</div>
            <div class="tarefas-filtros-direita">
              <div class="tarefas-select-wrap">
                <select id="projectFilter" aria-label="Filtrar por projeto" onchange="taskFilter=this.value;render()">
                  ${projetos.map(n => `<option value="${esc(n)}" ${taskFilter === n ? 'selected' : ''}>${esc(n === 'Todos' ? 'Todos os projetos' : (DATA.projetos.find(p => p.id === n)?.nome || n))}</option>`).join('')}
                </select>
              </div>
              <div class="tarefas-select-wrap">
                <select id="taskPriorityFilter" aria-label="Filtrar por prioridade" onchange="taskPriorityFilter=this.value;render()">
                  <option value="Todas" ${taskPriorityFilter === 'Todas' ? 'selected' : ''}>Todas as prioridades</option>
                  ${['Urgente', 'Alta', 'Média', 'Baixa'].map(pr => `<option value="${pr}" ${taskPriorityFilter === pr ? 'selected' : ''}>${pr}</option>`).join('')}
                </select>
              </div>
              <div class="tarefas-busca-wrap">
                <input id="taskSearchInput" type="search" maxlength="100" placeholder="Buscar tarefa, projeto ou responsável..." value="${esc(taskSearchQuery)}" oninput="atualizarBuscaTarefas(this.value)">
              </div>
            </div>
          </div>
        </section>
      `;

      const corpoHtml = taskViewMode === 'quadro'
        ? renderKanbanTarefas(filtradasBase)
        : `<section class="card tarefas-lista-card">${ts.length
            ? `<div class="task-table page-scroll">${projectTaskRows(ts).replace('<div class="simple-list">', '').replace(/<\/div>$/, '')}</div>`
            : `<div class="tarefas-vazio">
                <div class="tarefas-vazio-icone" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="m9 12 2 2 4-4"/></svg>
                </div>
                <h3>Nenhuma tarefa encontrada</h3>
                <p>Altere os filtros ou crie uma nova tarefa para distribuir as entregas da equipe.</p>
                <button type="button" class="primary" onclick="typeof trocarAbaTarefas==='function'?trocarAbaTarefas('cadastro'):newRecord('tarefas')">+ Criar primeira tarefa</button>
              </div>`
          }</section>`;

      return `<div class="tarefas-modulo">${filtrosHtml}${corpoHtml}</div>`;
    }
    let openPerson = null;
    function togglePerson(id) { openPerson = openPerson === id ? null : id; render(); }
    function people() { return `<div class="section-heading"><div><h3>Responsáveis</h3></div><span class="muted">${DATA.responsaveis.length} responsáveis</span></div><div class="page-scroll">${DATA.responsaveis.map(p => { const ts = DATA.tarefas.filter(t => t.responsavel === p.nome), c = ts.filter(done).length; return `<section class="card person-entry"><div class="item"><div style="flex:1;min-width:0"><b>${esc(p.nome)}</b><p class="muted">${esc(p.email || 'Sem e-mail')} · ${ts.length} tarefas · ${c} concluídas</p></div><div class="actions"><button class="secondary" onclick="togglePerson(${argumentoJsHtml(p.id)})">${openPerson === p.id ? 'Ocultar tarefas' : 'Visualizar tarefas'}</button>${actions('responsaveis', p.id)}</div></div>${openPerson === p.id ? projectTaskRows(ts) : ''}</section>`; }).join('') || '<section class="card empty-state"><div class="empty-icon">♙</div><h3>Uma equipe, muitas possibilidades</h3><p>Cadastre responsáveis para os projetos e tarefas.</p><button class="primary" onclick="newRecord(&quot;responsaveis&quot;)">+ Adicionar responsável</button></section>'}</div>`; }
    let selectedCalendarDay = today();
    function calendarEvents(date) { return [...DATA.agenda.filter(a => a.data === date).map(a => ({ n: 'agenda', id: a.id, title: a.titulo, at: a.hora || 'Compromisso', prio: 'Média' })), ...DATA.projetos.filter(p => p.prazo === date).map(p => ({ n: 'projetos', id: p.id, title: p.nome, at: 'Projeto', prio: p.prioridade || 'Média' })), ...DATA.tarefas.filter(t => t.prazo === date).map(t => ({ n: 'tarefas', id: t.id, title: t.titulo, at: 'Tarefa', prio: t.prioridade || 'Média' }))]; }
    function calendarPriority(e) { return 'priority-' + (({ 'Baixa': 'low', 'Média': 'medium', 'Alta': 'high', 'Urgente': 'urgent' })[e.prio] || 'medium'); }
    function selectCalendarDay(date) { selectedCalendarDay = date; render(); }
    // As ações de edição e exclusão só aparecem ao visualizar compromissos da agenda.
    function ocultarAcoesCompromisso() {
        const editar = document.getElementById('detailsEdit');
        const excluir = document.getElementById('detailsDelete');
        editar.hidden = true;
        excluir.hidden = true;
        editar.onclick = null;
        excluir.onclick = null;
    }

    function configurarAcoesCompromisso(id) {
        const editar = document.getElementById('detailsEdit');
        const excluir = document.getElementById('detailsDelete');
        editar.hidden = false;
        excluir.hidden = false;
        editar.onclick = () => {
            document.getElementById('details').close();
            edit('agenda', id);
        };
        excluir.onclick = () => {
            document.getElementById('details').close();
            removeRecord('agenda', id);
        };
    }

    function viewCalendarRecord(n, id) { ocultarAcoesCompromisso(); const r = DATA[n]?.find(x => x.id === id); if (!r)
        return notify('Registro não encontrado'); if (n === 'tarefas')
        return viewTask(id); const fields = n === 'projetos' ? [['Descrição', r.objetivo], ['Responsável', r.responsavel], ['Prioridade', r.prioridade], ['Status', r.status], ['Prazo', dt(r.prazo)]] : [['Data', dt(r.data)], ['Horário', r.hora], ['Término', r.hora_fim], ['Responsável', r.responsavel], ['Observações', r.observacoes]]; document.getElementById('detailsTitle').textContent = r.nome || r.titulo || 'Detalhes'; document.getElementById('detailsBody').innerHTML = fields.map(([k, v]) => `<p><b>${k}:</b> ${esc(v || 'Não informado')}</p>`).join(''); if (n === 'agenda') configurarAcoesCompromisso(id); document.getElementById('details').showModal(); }
    function calendar() {
      const first = new Date(year, month, 1), last = new Date(year, month + 1, 0).getDate();
      const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}-`;
      const monthEvents = [];
      let cells = '<div class="calendar-pad" aria-hidden="true"></div>'.repeat(first.getDay());
      for (let d = 1; d <= last; d++) {
        const date = `${monthPrefix}${String(d).padStart(2, '0')}`;
        const events = calendarEvents(date), selected = selectedCalendarDay === date;
        events.forEach(ev => monthEvents.push({ ...ev, date }));
        cells += `<div class="day ${selected ? 'calendar-selected' : ''} ${date === today() ? 'calendar-today' : ''}" onclick="if(!event.target.closest('.event'))selectCalendarDay(${argumentoJsHtml(date)})">
          <button type="button" class="calendar-day-number" onclick="selectCalendarDay(${argumentoJsHtml(date)})" aria-label="Visualizar dia ${d}" aria-pressed="${selected}" ${date === today() ? 'aria-current="date"' : ''}>${d}</button>
          ${events.slice(0, 2).map(e => `<button type="button" class="event ${calendarPriority(e)} event-type-${esc(e.n)}" onclick="viewCalendarRecord(${argumentoJsHtml(e.n)},${argumentoJsHtml(e.id)})" title="Visualizar ${esc(e.title)}">${esc(e.at)} · ${esc(e.title)}</button>`).join('')}
          ${events.length > 2 ? `<button type="button" class="calendar-more" onclick="selectCalendarDay(${argumentoJsHtml(date)})">+ ${events.length - 2} mais · Ver dia</button>` : ''}</div>`;
      }
      const trailing = (7 - (first.getDay() + last) % 7) % 7;
      cells += '<div class="calendar-pad" aria-hidden="true"></div>'.repeat(trailing);
      const selected = selectedCalendarDay && selectedCalendarDay.startsWith(monthPrefix) ? selectedCalendarDay : null;
      const dayEvents = selected ? calendarEvents(selected) : [];
      const monthLabel = first.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
      const monthTitle = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);
      const upcoming = monthEvents.filter(e => e.date !== selected).slice(0, 5);
      return `<section class="card calendar-card"><div class="calendar-toolbar" aria-label="Navegação da agenda">
        <button type="button" onclick="changeMonth(-1)" aria-label="Mês anterior">‹ Anterior</button>
        <b aria-live="polite">${monthTitle}</b>
        <button type="button" onclick="changeMonth(1)" aria-label="Próximo mês">Próximo ›</button>
        <button type="button" onclick="irHojeAgenda()">Hoje</button></div>
        <div class="calendar-shell"><div class="calendar-main"><div class="calendar">
        ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(x => `<div class="weekday">${x}</div>`).join('')}${cells}</div>
        <div class="calendar-legend"><span class="legend-item"><i class="legend-dot dot-reunioes"></i> Reuniões</span><span class="legend-item"><i class="legend-dot dot-projetos"></i> Prazos de projetos</span><span class="legend-item"><i class="legend-dot dot-tarefas"></i> Prazos de tarefas</span></div></div>
        <aside class="calendar-side" aria-label="Atividades da data selecionada"><h3>${selected ? `Dia ${dt(selected)}` : 'Selecione um dia'}</h3>
        <p class="muted">${selected ? `${dayEvents.length} registro(s) neste dia` : 'Clique em um dia do calendário para visualizar as atividades.'}</p>
        <div class="calendar-day-list">${dayEvents.length ? dayEvents.map(e => `<div class="calendar-entry-actions"><button type="button" class="calendar-day-entry event-type-${esc(e.n)}" onclick="viewCalendarRecord(${argumentoJsHtml(e.n)},${argumentoJsHtml(e.id)})"><strong>${esc(e.title)}</strong><span>${esc(e.at)} · ${esc(e.prio)}</span></button></div>`).join('') : selected ? '<p class="muted">Nenhuma atividade neste dia.</p>' : ''}</div>
        ${upcoming.length ? `<div class="calendar-upcoming"><h4>Outros registros do mês</h4><div class="calendar-day-list">${upcoming.map(e => `<div class="calendar-entry-actions"><button type="button" class="calendar-day-entry event-type-${esc(e.n)}" onclick="selectCalendarDay(${argumentoJsHtml(e.date)});viewCalendarRecord(${argumentoJsHtml(e.n)},${argumentoJsHtml(e.id)})"><strong>${esc(e.title)}</strong><span>${dt(e.date)} · ${esc(e.at)}</span></button></div>`).join('')}</div></div>` : ''}</aside></div></section>`;
    }
    function irHojeAgenda() {
      month = new Date().getMonth(); year = new Date().getFullYear(); selectedCalendarDay = today(); render();
    }
    function changeMonth(n) { month += n; if (month < 0) {
        month = 11;
        year--;
    } if (month > 11) {
        month = 0;
        year++;
    } render(); }
    function newRecord(n, defaults = {}) { openEditor(n || page, { prioridade: 'Média', ...(n === 'tarefas' || page === 'tarefas' ? { status: 'A fazer' } : {}), ...defaults }); }
    function edit(n, id) { const item = DATA[n].find(x => x.id === id); if (!item)
        return notify('Registro não encontrado'); openEditor(n, item); }
    // Monta datas independentes para uma reunião com horários diferentes.
    function atualizarModoAgenda() {
        const varias = document.querySelector('input[name="modo_agenda"]:checked')?.value === 'varias';
        const grupo = document.getElementById('agendaDatasMultiplas');
        if (!grupo) return;
        grupo.hidden = !varias;
        for (const nome of ['data', 'hora', 'hora_fim']) {
            const campo = document.querySelector(`#fields [name="${nome}"]`);
            if (campo) {
                campo.closest('div').hidden = varias;
                campo.disabled = varias;
                campo.required = !varias && nome !== 'hora_fim';
            }
        }
        grupo.querySelectorAll('input').forEach(campo => { campo.disabled = !varias; campo.required = varias; });
    }
    function adicionarDataAgenda(data = '', inicio = '09:00', fim = '10:00') {
        const lista = document.getElementById('agendaListaDatas');
        if (!lista) return;
        const linha = document.createElement('div');
        linha.className = 'agenda-data-linha';
        linha.innerHTML = `<div><label>Data</label><input type="date" class="agenda-data" required></div>
            <div><label>Início</label><input type="time" class="agenda-inicio" required></div>
            <div><label>Término</label><input type="time" class="agenda-fim" required></div>
            <button type="button" class="secondary" onclick="this.closest('.agenda-data-linha').remove()">Remover</button>`;
        linha.querySelector('.agenda-data').value = data;
        linha.querySelector('.agenda-inicio').value = inicio;
        linha.querySelector('.agenda-fim').value = fim;
        lista.appendChild(linha);
        atualizarModoAgenda();
    }
    function prepararMultiplasDatasAgenda() {
        const fields = document.getElementById('fields');
        fields.insertAdjacentHTML('beforeend', `<div class="agenda-modo">
            <strong>Agendamento</strong><div class="agenda-modo-opcoes">
            <label><input type="radio" name="modo_agenda" value="unica" checked onchange="atualizarModoAgenda()"> Uma data</label>
            <label><input type="radio" name="modo_agenda" value="varias" onchange="atualizarModoAgenda()"> Várias datas</label>
            </div></div><div id="agendaDatasMultiplas" class="agenda-datas" hidden>
            <strong>Datas e horários personalizados</strong><div id="agendaListaDatas"></div>
            <button type="button" class="secondary" onclick="adicionarDataAgenda()">+ Adicionar outra data</button></div>`);
        const data = fields.querySelector('[name="data"]')?.value || '';
        const inicio = fields.querySelector('[name="hora"]')?.value || '09:00';
        const fim = fields.querySelector('[name="hora_fim"]')?.value || '10:00';
        adicionarDataAgenda(data, inicio, fim);
        adicionarDataAgenda('', inicio, fim);
        atualizarModoAgenda();
    }
    function openEditor(n, r) { editTable = n; editing = r.id || null; const cfg = CONFIG[n]; if (!cfg)
        return notify('Módulo inválido'); document.getElementById('modalTitle').textContent = (editing ? 'Editar ' : 'Novo ') + cfg.label; document.getElementById('fields').innerHTML = cfg.fields.map(([key, title, type, opts]) => { const v = r[key] ?? '', sel = (choices) => `<select name="${key}"><option value="">Selecione</option>${choices.map(([id, name]) => `<option value="${esc(id)}" ${String(v) === String(id) ? 'selected' : ''}>${esc(name)}</option>`).join('')}</select>`; let field; if (type === 'textarea')
        field = `<textarea name="${key}" rows="3">${esc(v)}</textarea>`;
    else if (type === 'select')
        field = sel(opts.map(x => [x, x]));
    else if (type === 'colors')
        field = sel(COLORS);
    else if (type === 'project')
        field = sel(DATA.projetos.map(p => [p.id, p.nome]));
    else if (type === 'person')
        field = sel(DATA.responsaveis.filter(p => p.ativo !== 'Não' || p.nome === v).map(p => [p.nome, p.nome]));
    else
        field = `<input name="${key}" type="${type}" value="${esc(v)}" ${opts === 1 ? 'required' : ''}>`; return `<div class="${type === 'textarea' ? 'wide' : ''}"><label>${title}</label>${field}</div>`; }).join(''); if (n === 'agenda' && !editing) prepararMultiplasDatasAgenda(); document.getElementById('modal').showModal(); }
    // Atualiza a interface antes da confirmação do servidor.
    document.getElementById('editor').addEventListener('submit', async (e) => {
      e.preventDefault();
      const button = e.target.querySelector('[type=submit]');
      if (button.disabled) return;
      button.disabled = true;

      const table = editTable;
      const original = editing ? DATA[table].find(x => x.id === editing) : null;
      const previous = original ? { ...original } : null;
      const form = Object.fromEntries(new FormData(e.target).entries());
      const variasDatas = table === 'agenda' && !editing && form.modo_agenda === 'varias';
      delete form.modo_agenda;
      if (editing) form.id = editing;

      if (variasDatas) {
        const linhas = [...document.querySelectorAll('#agendaListaDatas .agenda-data-linha')];
        const datas = linhas.map(linha => ({
          data: linha.querySelector('.agenda-data').value,
          hora: linha.querySelector('.agenda-inicio').value,
          hora_fim: linha.querySelector('.agenda-fim').value
        }));
        const chaves = datas.map(d => d.data + '|' + d.hora);
        if (!datas.length || datas.some(d => !d.data || !d.hora || !d.hora_fim || d.hora_fim <= d.hora)
            || new Set(chaves).size !== chaves.length) {
          button.disabled = false;
          return notify('Preencha as datas e os horários corretamente, sem datas e inícios duplicados.');
        }
        // Exibe imediatamente os compromissos, sem esperar cada gravação.
        const temporarios = datas.map((data, i) => ({
          ...form, ...data,
          id: `temporario-lote-${Date.now()}-${i}`
        }));
        DATA.agenda.push(...temporarios);
        document.getElementById('modal').close();
        render();
        notify(`Salvando ${datas.length} compromisso(s)...`);

        try {
        // Grava o lote inteiro em uma operação do adaptador.
          const resultado = await api('saveAgendaEmLote', form, datas);
          const ids = new Set(temporarios.map(item => item.id));
          DATA.agenda = DATA.agenda.filter(item => !ids.has(item.id));
          DATA.agenda.push(...resultado.records);
          render();
          const avisos = resultado.avisos || [];
          notify(`${resultado.records.length} compromisso(s) salvo(s).` +
            (avisos.length ? ' Avisos do Google Agenda: ' + avisos.join('; ') : ''));
        } catch (erro) {
          const ids = new Set(temporarios.map(item => item.id));
          DATA.agenda = DATA.agenda.filter(item => !ids.has(item.id));
          // Se houve falha após a gravação, recarrega os dados para evitar duplicações.
          try {
            DATA = await api('getData');
          } catch (_) {
            // Mantém a interface utilizável mesmo se a atualização falhar.
          }
          render();
          notify('Não foi possível confirmar o lote. Confira a agenda antes de tentar novamente: ' +
            (erro.message || erro));
        } finally {
          button.disabled = false;
        }
        return;
      }

      const temporaryId = editing || `temporario-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const optimistic = { ...(original || {}), ...form, id: temporaryId };
      const index = DATA[table].findIndex(x => x.id === temporaryId);

      if (index >= 0) DATA[table][index] = optimistic;
      else DATA[table].push(optimistic);

      document.getElementById('modal').close();
      render();

      try {
        await api('saveRecord', table, form);
        DATA = await api('getData');
        render();
        notify('Registro salvo neste navegador');
      } catch (err) {
        const position = DATA[table].findIndex(x => x.id === temporaryId);
        if (previous) {
          if (position >= 0) DATA[table][position] = previous;
          else DATA[table].push(previous);
        } else if (position >= 0) {
          DATA[table].splice(position, 1);
        }
        render();
        notify('Erro ao salvar; alteração desfeita: ' + (err.message || err));
        openEditor(table, form);
      } finally {
        button.disabled = false;
      }
    });

    const savingStatus = new Set();
    async function changeStatus(id, status) { if (savingStatus.has(id))
        return; const t = DATA.tarefas.find(x => x.id === id); if (!t)
        return; const old = t.status; savingStatus.add(id); t.status = status; render(); if (document.getElementById('details').open)
        document.getElementById('details').close(); try {
        const result = await api('setTaskStatus', id, status);
        notify(result.calendar?.status === 'erro' ? 'Status salvo, mas Google Agenda falhou: ' + result.calendar.message : status === 'Concluída' ? 'Tarefa concluída' : 'Status atualizado');
    }
    catch (e) {
        t.status = old;
        render();
        notify('Erro ao salvar; alteração desfeita: ' + (e.message || e));
    }
    finally {
        savingStatus.delete(id);
    } }
    const deletingRecords = new Set();

    async function removeRecord(n, id) {
      if (deletingRecords.has(`${n}:${id}`)) return;
      const index = DATA[n].findIndex(x => x.id === id);
      if (index < 0) return;

      const removed = DATA[n][index];
      const nomesTipo = { projetos: 'projeto', tarefas: 'tarefa', responsaveis: 'responsável', agenda: 'compromisso' };
      const rotulo = nomesTipo[n] || 'registro';
      const nomeItem = removed?.titulo || removed?.nome || '';
      const confirmado = typeof pedirConfirmacaoExclusao === 'function'
        ? await pedirConfirmacaoExclusao({
            titulo: `Excluir ${rotulo}?`,
            mensagem: nomeItem
              ? `Tem certeza que deseja excluir ${n === 'tarefas' ? 'a' : 'o'} ${rotulo} "${nomeItem}"? Essa ação não pode ser desfeita.`
              : `Tem certeza que deseja excluir este ${rotulo}? Essa ação não pode ser desfeita.`,
            textoBotao: 'Excluir'
          })
        : confirm('Excluir este registro?');
      if (!confirmado) return;

      const idxAtual = DATA[n].findIndex(x => x.id === id);
      if (idxAtual < 0) return;
      const key = `${n}:${id}`;
      deletingRecords.add(key);
      DATA[n].splice(idxAtual, 1);
      render();

      try {
        await api('deleteRecord', n, id);
        notify('Registro excluído');
      } catch (e) {
        DATA[n].splice(Math.min(idxAtual, DATA[n].length), 0, removed);
        render();
        notify('Erro ao excluir; registro restaurado: ' + (e.message || e));
      } finally {
        deletingRecords.delete(key);
      }
    }

    refresh();
