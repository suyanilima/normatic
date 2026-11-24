/* Busca, pendências, painel operacional e auditoria usam exclusivamente os registros existentes. */
let filtroNotificacoes='todas', abaResponsaveis='responsaveis', eventosAuditoria=[];
const CHAVE_NOTIFICACOES_LIDAS='normatic:notificacoes-lidas:v1';
function leiturasNotificacoes(){try{return JSON.parse(localStorage.getItem(CHAVE_NOTIFICACOES_LIDAS)||'{}');}catch(_){return {};}}
function idNotificacao(item){return `${item.tipo}:${item.id}:${item.texto}`;}
const textoControle=value=>String(value??'').toLocaleLowerCase('pt-BR');
function dadosControle(nome){ try{if(window.NormaticCloud?.enabled)return window.NormaticCloud.readCollection(nome);const local={documentos:typeof docs==='undefined'?[]:docs,reunioes:typeof reunioes==='undefined'?[]:reunioes,atas:typeof minutasHistorico==='undefined'?[]:minutasHistorico,projetos:typeof DATA==='undefined'?[]:DATA.projetos,tarefas:typeof DATA==='undefined'?[]:DATA.tarefas,responsaveis:typeof DATA==='undefined'?[]:DATA.responsaveis,compromissos:typeof DATA==='undefined'?[]:DATA.agenda};return local[nome]||[];}catch(_){return [];} }
function hojeControle(){return new Date().toISOString().slice(0,10);}
function statusDocumentoControle(doc){try{return calcularStatus(doc);}catch(_){return '';}}
function notificacoesAtuais(){
 const docs=dadosControle('documentos'), reunioes=dadosControle('reunioes'), atas=dadosControle('atas'), hoje=hojeControle();
 const itens=[];
 docs.filter(d=>d.semNormativo||d.tipo==='Sem normativo'||['Alerta','Vencido'].includes(statusDocumentoControle(d))).forEach(d=>itens.push({tipo:'documentos',titulo:d.nome||'Documento',texto:d.semNormativo?'Sem normativo':'Exige acompanhamento',id:d.id}));
 reunioes.filter(r=>!r.cancelada&&r.data>=hoje).sort((a,b)=>a.data.localeCompare(b.data)).slice(0,8).forEach(r=>itens.push({tipo:'reunioes',titulo:r.pauta||r.frequencia||'Reunião',texto:`Agendada para ${r.data}`,id:r.id}));
 reunioes.filter(r=>!atas.some(a=>a.reuniao?.id===r.id)&&r.data<hoje&&!r.cancelada).forEach(r=>itens.push({tipo:'atas',titulo:r.pauta||r.frequencia||'Reunião',texto:'Reunião sem ata registrada',id:r.id}));
 return itens.map(item=>({...item,chave:idNotificacao(item)}));
}
function renderizarNotificacoes(){const lista=notificacoesAtuais(),lidas=leiturasNotificacoes(),visiveis=filtroNotificacoes==='todas'?lista:lista.filter(i=>i.tipo===filtroNotificacoes),naoLidas=lista.filter(i=>!lidas[i.chave]);const total=document.getElementById('notificacoes-total');if(total)total.textContent=naoLidas.length||'';const marcar=document.getElementById('notificacoes-marcar-lidas');if(marcar)marcar.disabled=!naoLidas.length;const alvo=document.getElementById('notificacoes-lista');if(!alvo)return;alvo.innerHTML=visiveis.length?visiveis.map(i=>`<button type="button" class="notificacao-item ${lidas[i.chave]?'notificacao-lida':''}" onclick="abrirResultadoBusca(${argumentoJsHtml(i.tipo)},${argumentoJsHtml(i.id)})"><strong>${escapeHtml(i.titulo)}</strong><small>${escapeHtml(i.texto)}${lidas[i.chave]?' · Lida':''}</small></button>`).join(''):'<p class="muted">Nenhuma pendência neste filtro.</p>';document.querySelectorAll('.notificacoes-filtros button').forEach(b=>b.classList.toggle('ativo',b.textContent.toLocaleLowerCase('pt-BR')===(filtroNotificacoes==='todas'?'todas':filtroNotificacoes)));}
function marcarTodasNotificacoesLidas(){const lidas=leiturasNotificacoes();notificacoesAtuais().forEach(item=>lidas[item.chave]=Date.now());localStorage.setItem(CHAVE_NOTIFICACOES_LIDAS,JSON.stringify(lidas));renderizarNotificacoes();}
function alternarNotificacoes(){const painel=document.getElementById('painel-notificacoes');painel.hidden=!painel.hidden;if(!painel.hidden)renderizarNotificacoes();}
function filtrarNotificacoes(tipo){filtroNotificacoes=tipo;renderizarNotificacoes();}
function atualizarBuscaGlobal(valor){const anterior=document.getElementById('busca-resultados');anterior?.remove();const termo=textoControle(valor).trim();if(termo.length<2)return;const fontes=[['documentos',dadosControle('documentos'),r=>r.nome],['reunioes',dadosControle('reunioes'),r=>r.pauta],['atas',dadosControle('atas'),r=>r.reuniao?.pauta||r.reuniao?.frequencia],['tarefas',dadosControle('tarefas'),r=>r.titulo],['projetos',dadosControle('projetos'),r=>r.nome],['responsaveis',dadosControle('responsaveis'),r=>r.nome]];const resultados=fontes.flatMap(([tipo,linhas,nome])=>linhas.filter(r=>textoControle([nome(r),r.responsavel,r.sei,r.data].join(' ')).includes(termo)).map(r=>({tipo,id:r.id||r.codigo,titulo:nome(r)||tipo}))).slice(0,8);const caixa=document.createElement('section');caixa.id='busca-resultados';caixa.className='busca-resultados';caixa.innerHTML=resultados.length?resultados.map(r=>`<button type="button" onclick="abrirResultadoBusca(${argumentoJsHtml(r.tipo)},${argumentoJsHtml(r.id)})"><strong>${escapeHtml(r.titulo)}</strong><small>${escapeHtml(r.tipo)}</small></button>`).join(''):'<p class="muted">Nenhum registro encontrado.</p>';document.querySelector('.plataforma-topbar')?.append(caixa);}
function abrirResultadoBusca(tipo,id){document.getElementById('busca-resultados')?.remove();document.getElementById('painel-notificacoes').hidden=true;if(tipo==='documentos'){go('normativos');setTimeout(()=>frameDocumentos?.contentWindow?.abrirDocumentoDashboard?.(id),0);return;}if(tipo==='reunioes'||tipo==='atas'){go(tipo==='atas'?'minutas':'reunioes');return;}go(tipo==='tarefas'?'tarefas':tipo==='projetos'?'projetos':'responsaveis');}
function painelAcompanhamento(){const docs=dadosControle('documentos'), tarefas=dadosControle('tarefas'), reunioes=dadosControle('reunioes'), atas=dadosControle('atas'), hoje=hojeControle();const criticos=docs.filter(d=>d.semNormativo||['Alerta','Vencido'].includes(statusDocumentoControle(d)));const pendentes=tarefas.filter(t=>t.status!=='Concluída');const futuras=reunioes.filter(r=>!r.cancelada&&r.data>=hoje).sort((a,b)=>a.data.localeCompare(b.data)).slice(0,6);const metricas=[['Documentos',docs.length],['Documentos em atenção',criticos.length],['Tarefas em aberto',pendentes.length],['Tarefas concluídas',tarefas.filter(t=>t.status==='Concluída').length],['Reuniões futuras',futuras.length],['Atas salvas',atas.length]];const lista=(itens,vazia,linha)=>itens.length?`<ul class="acompanhamento-lista">${itens.map(linha).join('')}</ul>`:`<p class="muted">${vazia}</p>`;return `<section class="painel-acompanhamento"><div class="metric-grid">${metricas.map(([t,v])=>`<article class="card"><span class="muted">${t}</span><strong class="metric">${v}</strong></article>`).join('')}</div><div class="acompanhamento-grid"><article class="card"><h3>Documentos que exigem atenção</h3>${lista(criticos,'Nenhum documento exige atenção.',d=>`<li><strong>${escapeHtml(d.nome||'Documento')}</strong><br><small>${escapeHtml(d.semNormativo?'Sem normativo':statusDocumentoControle(d))}</small></li>`)}</article><article class="card"><h3>Situação das reuniões</h3>${lista(futuras,'Nenhuma reunião futura.',r=>`<li><strong>${escapeHtml(r.pauta||r.frequencia||'Reunião')}</strong><br><small>${escapeHtml(r.data)} às ${escapeHtml(r.horario||'--:--')}</small></li>`)}</article></div></section>`;}
const HISTORICO_POR_PAGINA = 15;
let paginaHistoricoAtividades = 1;
let filtroHistoricoBusca = '';
let filtroHistoricoAcao = '';
let filtroHistoricoModulo = '';
let filtroHistoricoPeriodo = '';

function normalizarAcaoHistorico(acao) {
  const s = String(acao || '').trim().toLowerCase();
  if (s === 'insert' || s === 'create' || s === 'criação' || s === 'criacao') return 'create';
  if (s === 'update' || s === 'edit' || s === 'alteração' || s === 'alteracao') return 'update';
  if (s === 'delete' || s === 'remove' || s === 'exclusão' || s === 'exclusao') return 'delete';
  if (s === 'login' || s === 'access' || s === 'acesso' || s === 'sign_in') return 'login';
  return s || 'outro';
}

function rotuloAcaoHistorico(acao) {
  const map = { create: 'Criação', update: 'Alteração', delete: 'Exclusão', login: 'Acesso' };
  const chave = normalizarAcaoHistorico(acao);
  return map[chave] || String(acao || 'Ação');
}

function classeAcaoHistorico(acao) {
  const chave = normalizarAcaoHistorico(acao);
  if (chave === 'create') return 'status-verde';
  if (chave === 'update') return 'status-ambar';
  if (chave === 'delete') return 'status-vermelho';
  if (chave === 'login') return 'status-azul';
  return 'status-neutro';
}

function rotuloModuloHistorico(modulo) {
  const s = String(modulo || '').trim().toLowerCase();
  const map = {
    documentos: 'Normativos',
    normatic_documentos: 'Normativos',
    projetos: 'Projetos',
    normatic_projetos: 'Projetos',
    tarefas: 'Tarefas',
    normatic_tarefas: 'Tarefas',
    reunioes: 'Reuniões',
    normatic_reunioes: 'Reuniões',
    atas: 'Atas',
    minutas: 'Atas',
    normatic_atas: 'Atas',
    unidades: 'Unidades',
    normatic_unidades: 'Unidades',
    responsaveis: 'Responsáveis',
    normatic_responsaveis: 'Responsáveis',
    auditorias: 'Auditoria',
    normatic_auditorias: 'Auditoria',
    compromissos: 'Agenda',
    normatic_compromissos: 'Agenda',
    acesso: 'Sistema',
    access: 'Sistema',
    auth: 'Sistema',
    sessao: 'Sistema'
  };
  return map[s] || (modulo ? String(modulo) : 'Sistema');
}

function formatarDataHistorico(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function atualizarBuscaHistorico(valor) {
  const input = document.getElementById('hist-busca');
  const caret = input?.selectionStart;
  filtroHistoricoBusca = valor;
  paginaHistoricoAtividades = 1;
  render();
  const novo = document.getElementById('hist-busca');
  novo?.focus();
  if (caret != null) novo?.setSelectionRange?.(caret, caret);
}

function limparFiltrosHistorico() {
  filtroHistoricoBusca = '';
  filtroHistoricoAcao = '';
  filtroHistoricoModulo = '';
  filtroHistoricoPeriodo = '';
  paginaHistoricoAtividades = 1;
  render();
}

function irPaginaHistorico(pagina) {
  paginaHistoricoAtividades = Math.max(1, Number(pagina) || 1);
  render();
}

async function carregarAuditoria(){if(!window.NormaticCloud?.enabled)return;try{eventosAuditoria=await window.NormaticCloud.audit();paginaHistoricoAtividades=1;}catch(_){eventosAuditoria=[];}}

function painelAuditoria(){
  const pode = window.NormaticCloud?.role === 'admin';
  if(!pode) return '<section class="card"><h3>Histórico de atividades</h3><p class="muted">Somente administradores podem consultar o histórico de atividades da equipe.</p></section>';

  const modulosDisponiveis = [...new Set(eventosAuditoria.map(e => rotuloModuloHistorico(e.collection_name)))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const termo = textoControle(filtroHistoricoBusca).trim();
  const agora = Date.now();
  const inicioHoje = new Date(); inicioHoje.setHours(0, 0, 0, 0);

  const filtrados = eventosAuditoria.filter(e => {
    const acaoNorm = normalizarAcaoHistorico(e.action);
    const modRotulo = rotuloModuloHistorico(e.collection_name);
    if (filtroHistoricoAcao && acaoNorm !== filtroHistoricoAcao) return false;
    if (filtroHistoricoModulo && modRotulo !== filtroHistoricoModulo) return false;
    if (filtroHistoricoPeriodo) {
      const ts = new Date(e.occurred_at).getTime();
      if (Number.isNaN(ts)) return false;
      if (filtroHistoricoPeriodo === 'hoje' && ts < inicioHoje.getTime()) return false;
      if (filtroHistoricoPeriodo === '7d' && (agora - ts) > 7 * 86400000) return false;
      if (filtroHistoricoPeriodo === '30d' && (agora - ts) > 30 * 86400000) return false;
    }
    if (termo) {
      const alvo = textoControle([e.actor_email, rotuloAcaoHistorico(e.action), modRotulo, e.record_label, e.record_id].join(' '));
      if (!alvo.includes(termo)) return false;
    }
    return true;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / HISTORICO_POR_PAGINA));
  if (paginaHistoricoAtividades > totalPaginas) paginaHistoricoAtividades = totalPaginas;
  const inicio = (paginaHistoricoAtividades - 1) * HISTORICO_POR_PAGINA;
  const visiveis = filtrados.slice(inicio, inicio + HISTORICO_POR_PAGINA);
  const faixaTexto = filtrados.length
    ? `Mostrando ${inicio + 1}–${inicio + visiveis.length} de ${filtrados.length} ${filtrados.length === 1 ? 'evento' : 'eventos'}`
    : '0 eventos';

  const botoesPaginacao = totalPaginas > 1 ? `
    <div class="paginacao" role="navigation" aria-label="Paginação do histórico de atividades">
      <button type="button" class="pagina-btn pagina-seta" ${paginaHistoricoAtividades <= 1 ? 'disabled' : ''} onclick="irPaginaHistorico(${paginaHistoricoAtividades - 1})">Anterior</button>
      ${Array.from({ length: totalPaginas }, (_, i) => {
        const num = i + 1;
        return `<button type="button" class="pagina-btn ${paginaHistoricoAtividades === num ? 'active' : ''}" onclick="irPaginaHistorico(${num})">${num}</button>`;
      }).join('')}
      <button type="button" class="pagina-btn pagina-seta" ${paginaHistoricoAtividades >= totalPaginas ? 'disabled' : ''} onclick="irPaginaHistorico(${paginaHistoricoAtividades + 1})">Próximo</button>
    </div>
  ` : '';

  return `
    <div class="projetos-modulo">
      <section class="card auditoria-filtros-card">
        <div class="auditoria-filtros-grid">
          <div class="auditoria-field">
            <label for="hist-busca">Buscar</label>
            <input id="hist-busca" type="search" maxlength="120" placeholder="Usuário, e-mail ou registro..." value="${escapeHtml(filtroHistoricoBusca)}" oninput="atualizarBuscaHistorico(this.value)">
          </div>
          <div class="auditoria-field">
            <label for="hist-filtro-acao">Ação</label>
            <select id="hist-filtro-acao" onchange="filtroHistoricoAcao=this.value;paginaHistoricoAtividades=1;render()">
              <option value="">Todas as ações</option>
              <option value="login" ${filtroHistoricoAcao === 'login' ? 'selected' : ''}>Acesso</option>
              <option value="create" ${filtroHistoricoAcao === 'create' ? 'selected' : ''}>Criação</option>
              <option value="update" ${filtroHistoricoAcao === 'update' ? 'selected' : ''}>Alteração</option>
              <option value="delete" ${filtroHistoricoAcao === 'delete' ? 'selected' : ''}>Exclusão</option>
            </select>
          </div>
          <div class="auditoria-field">
            <label for="hist-filtro-modulo">Módulo</label>
            <select id="hist-filtro-modulo" onchange="filtroHistoricoModulo=this.value;paginaHistoricoAtividades=1;render()">
              <option value="">Todos os módulos</option>
              ${modulosDisponiveis.map(m => `<option value="${escapeHtml(m)}" ${filtroHistoricoModulo === m ? 'selected' : ''}>${escapeHtml(m)}</option>`).join('')}
            </select>
          </div>
          <div class="auditoria-field">
            <label for="hist-filtro-periodo">Período</label>
            <select id="hist-filtro-periodo" onchange="filtroHistoricoPeriodo=this.value;paginaHistoricoAtividades=1;render()">
              <option value="">Todo o período</option>
              <option value="hoje" ${filtroHistoricoPeriodo === 'hoje' ? 'selected' : ''}>Hoje</option>
              <option value="7d" ${filtroHistoricoPeriodo === '7d' ? 'selected' : ''}>Últimos 7 dias</option>
              <option value="30d" ${filtroHistoricoPeriodo === '30d' ? 'selected' : ''}>Últimos 30 dias</option>
            </select>
          </div>
          <div class="auditoria-filtros-limpar historico-filtros-acoes">
            <button type="button" class="secondary" onclick="limparFiltrosHistorico()">Limpar</button>
            <button type="button" class="primary" onclick="carregarAuditoria().then(render)">Atualizar</button>
          </div>
        </div>
      </section>

      <section class="card projetos-tabela-card">
        <div class="projetos-tabela-topo">
          <div>
            <h3>Histórico de atividades</h3>
            <p class="muted">${faixaTexto} · Trilha de acessos, criações, alterações e exclusões da equipe</p>
          </div>
        </div>
        ${visiveis.length ? `
          <div class="projetos-tabela-wrap">
            <table class="projetos-tabela historico-atividades-tabela">
              <thead>
                <tr>
                  <th>Data / Hora</th>
                  <th>Usuário</th>
                  <th>Ação</th>
                  <th>Módulo</th>
                  <th>Registro</th>
                </tr>
              </thead>
              <tbody>
                ${visiveis.map(e => `
                  <tr>
                    <td class="proj-col-prazo">${escapeHtml(formatarDataHistorico(e.occurred_at))}</td>
                    <td class="proj-col-resp">${escapeHtml(e.actor_email || 'Usuário')}</td>
                    <td><span class="dash-status-pill ${classeAcaoHistorico(e.action)}">${escapeHtml(rotuloAcaoHistorico(e.action))}</span></td>
                    <td><span class="dash-modulo-pill">${escapeHtml(rotuloModuloHistorico(e.collection_name))}</span></td>
                    <td class="hist-col-reg">${escapeHtml(e.record_label || e.record_id || '—')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          ${totalPaginas > 1 ? `
            <div class="paginacao-rodape">
              <div class="paginacao-total-texto">Página ${paginaHistoricoAtividades} de ${totalPaginas}</div>
              ${botoesPaginacao}
            </div>
          ` : ''}
        ` : `<div class="tarefas-vazio"><h3>Nenhum evento encontrado</h3><p>${eventosAuditoria.length ? 'Ajuste os filtros acima para visualizar outros registros.' : 'Nenhum evento disponível. Clique em Atualizar ou verifique se a migração de auditoria foi aplicada no Supabase.'}</p></div>`}
      </section>
    </div>
  `;
}
document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();document.getElementById('busca-global')?.focus();}});
