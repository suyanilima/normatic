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
    servidores: 'Servidores',
    normatic_servidores: 'Servidores',
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

const SERVIDORES_POR_PAGINA = 15;
let paginaServidoresTre = 1;
let filtroServidorTreBusca = '';
let filtroServidorTreSetor = '';
let servidorTreEditandoId = null;

function atualizarBuscaServidoresTre(valor) {
  const input = document.getElementById('srv-tre-busca');
  const caret = input?.selectionStart;
  filtroServidorTreBusca = valor;
  paginaServidoresTre = 1;
  render();
  const novo = document.getElementById('srv-tre-busca');
  novo?.focus();
  if (caret != null) novo?.setSelectionRange?.(caret, caret);
}

function limparFiltrosServidoresTre() {
  filtroServidorTreBusca = '';
  filtroServidorTreSetor = '';
  paginaServidoresTre = 1;
  render();
}

function irPaginaServidoresTre(pagina) {
  paginaServidoresTre = Math.max(1, Number(pagina) || 1);
  render();
}

function abrirModalServidorTre(id = null) {
  const catalogo = typeof obterCatalogoServidores === 'function' ? obterCatalogoServidores() : [];
  const item = id ? catalogo.find(s => s.id === id) : null;
  servidorTreEditandoId = item ? item.id : null;

  const titulo = document.getElementById('servidor-tre-modal-titulo');
  const btnSalvar = document.getElementById('btn-salvar-servidor-tre');
  const campoNome = document.getElementById('srv-tre-nome');
  const campoSetor = document.getElementById('srv-tre-setor');
  const campoCargo = document.getElementById('srv-tre-cargo');
  const campoEmail = document.getElementById('srv-tre-email');
  const campoWhats = document.getElementById('srv-tre-whatsapp');

  if (titulo) titulo.textContent = item ? 'Editar servidor ou membro' : 'Novo servidor ou membro';
  if (btnSalvar) btnSalvar.textContent = item ? 'Salvar alterações' : 'Cadastrar';
  if (campoNome) campoNome.value = item?.nome || '';
  if (campoSetor) campoSetor.value = item?.setor || '';
  if (campoCargo) campoCargo.value = item?.cargo || '';
  if (campoEmail) campoEmail.value = item?.email || '';
  if (campoWhats) campoWhats.value = item?.whatsapp || '';

  if (typeof configurarBuscaSetor === 'function') {
    configurarBuscaSetor('srv-tre-setor', 'srv-tre-setor-sugestoes');
  }
  abrirModalElemento('servidor-tre-modal-overlay');
}

function fecharModalServidorTre() {
  fecharModalElemento('servidor-tre-modal-overlay');
  servidorTreEditandoId = null;
}

async function salvarFormularioServidorTre(event) {
  event?.preventDefault?.();
  const nome = document.getElementById('srv-tre-nome')?.value.trim() || '';
  const setor = document.getElementById('srv-tre-setor')?.value.trim() || '';
  const cargo = document.getElementById('srv-tre-cargo')?.value.trim() || '';
  const email = document.getElementById('srv-tre-email')?.value.trim() || '';
  const whatsapp = document.getElementById('srv-tre-whatsapp')?.value.trim() || '';

  if (!nome || nome.length < 2) {
    toast('Informe o nome completo do servidor ou membro.', 'alerta');
    return;
  }
  if (!setor) {
    toast('Informe a sigla do setor ou lotação.', 'alerta');
    return;
  }

  const botao = document.getElementById('btn-salvar-servidor-tre');
  if (botao) botao.disabled = true;
  const editando = Boolean(servidorTreEditandoId);
  try {
    await salvarServidorSistema({
      id: servidorTreEditandoId || undefined,
      nome,
      setor,
      cargo,
      email,
      whatsapp
    });
    fecharModalServidorTre();
    render();
    toast(editando ? 'Cadastro atualizado com sucesso.' : 'Servidor ou membro cadastrado com sucesso.', 'valido');
  } catch (error) {
    toast(escapeHtml(error?.message || 'Não foi possível salvar o registro.'), 'vencido');
  } finally {
    if (botao) botao.disabled = false;
  }
}

async function confirmarExclusaoServidorTre(id) {
  const catalogo = typeof obterCatalogoServidores === 'function' ? obterCatalogoServidores() : [];
  const item = catalogo.find(s => s.id === id);
  if (!item) return;

  const ok = await pedirConfirmacaoExclusao({
    titulo: 'Excluir servidor ou membro?',
    mensagem: `Deseja remover "${item.nome}" (${item.setor || 'Sem setor'}) do catálogo de Normativos e Reuniões?`,
    textoBotao: 'Excluir'
  });
  if (!ok) return;

  try {
    await excluirServidorSistema(id);
    render();
    toast('Servidor ou membro removido do catálogo.', 'valido');
  } catch (error) {
    toast(escapeHtml(error?.message || 'Não foi possível excluir o registro.'), 'vencido');
  }
}

function painelServidoresTre() {
  const catalogo = typeof obterCatalogoServidores === 'function' ? obterCatalogoServidores() : [];
  const podeEditar = !window.NormaticCloud?.enabled || ['admin', 'editor'].includes(window.NormaticCloud?.role);
  const setoresDisponiveis = [...new Set(catalogo.map(s => s.setor).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const termo = typeof normalizarTextoBuscaServidor === 'function'
    ? normalizarTextoBuscaServidor(filtroServidorTreBusca)
    : textoControle(filtroServidorTreBusca).trim();

  const filtrados = catalogo.filter(item => {
    if (filtroServidorTreSetor && item.setor !== filtroServidorTreSetor) return false;
    if (termo) {
      const nomeSetor = (typeof SETORES_CONVIDADOS === 'object' && SETORES_CONVIDADOS?.[item.setor]) || '';
      const textoAlvo = `${item.nome} ${item.setor} ${nomeSetor} ${item.cargo} ${item.email} ${item.whatsapp}`;
      const norm = typeof normalizarTextoBuscaServidor === 'function'
        ? normalizarTextoBuscaServidor(textoAlvo)
        : textoControle(textoAlvo);
      if (!norm.includes(termo)) return false;
    }
    return true;
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / SERVIDORES_POR_PAGINA));
  if (paginaServidoresTre > totalPaginas) paginaServidoresTre = totalPaginas;
  const inicio = (paginaServidoresTre - 1) * SERVIDORES_POR_PAGINA;
  const visiveis = filtrados.slice(inicio, inicio + SERVIDORES_POR_PAGINA);
  const faixaTexto = filtrados.length
    ? `Exibindo ${inicio + 1}–${Math.min(inicio + SERVIDORES_POR_PAGINA, filtrados.length)} de ${filtrados.length} pessoas`
    : '0 pessoas encontradas';

  const botoesPaginacao = totalPaginas > 1 ? `
    <div class="paginacao" role="navigation" aria-label="Paginação de servidores e membros">
      <button type="button" class="pagina-btn pagina-seta" ${paginaServidoresTre <= 1 ? 'disabled' : ''} onclick="irPaginaServidoresTre(${paginaServidoresTre - 1})">Anterior</button>
      ${Array.from({ length: totalPaginas }, (_, i) => {
        const num = i + 1;
        return `<button type="button" class="pagina-btn ${paginaServidoresTre === num ? 'active' : ''}" onclick="irPaginaServidoresTre(${num})">${num}</button>`;
      }).join('')}
      <button type="button" class="pagina-btn pagina-seta" ${paginaServidoresTre >= totalPaginas ? 'disabled' : ''} onclick="irPaginaServidoresTre(${paginaServidoresTre + 1})">Próximo</button>
    </div>
  ` : '';

  return `
    <div class="projetos-modulo servidores-tre-modulo">
      <section class="card auditoria-filtros-card">
        <div class="auditoria-filtros-grid">
          <div class="auditoria-field auditoria-field-busca">
            <label for="srv-tre-busca">Buscar pessoa</label>
            <input id="srv-tre-busca" type="search" maxlength="120" placeholder="Nome, sigla/setor, cargo ou e-mail..." value="${escapeHtml(filtroServidorTreBusca)}" oninput="atualizarBuscaServidoresTre(this.value)">
          </div>
          <div class="auditoria-field">
            <label for="srv-tre-filtro-setor">Setor / Lotação</label>
            <select id="srv-tre-filtro-setor" onchange="filtroServidorTreSetor=this.value;paginaServidoresTre=1;render()">
              <option value="">Todos os setores (${setoresDisponiveis.length})</option>
              ${setoresDisponiveis.map(sigla => {
                const rotulo = typeof formatarRotuloSetor === 'function' ? formatarRotuloSetor(sigla) : sigla;
                return `<option value="${escapeHtml(sigla)}" ${filtroServidorTreSetor === sigla ? 'selected' : ''}>${escapeHtml(rotulo)}</option>`;
              }).join('')}
            </select>
          </div>
          <div class="auditoria-filtros-limpar historico-filtros-acoes">
            <button type="button" class="secondary" onclick="limparFiltrosServidoresTre()">Limpar</button>
            ${podeEditar ? `<button type="button" class="primary" onclick="abrirModalServidorTre()">+ Novo servidor</button>` : ''}
          </div>
        </div>
      </section>

      <section class="card projetos-tabela-card">
        <div class="projetos-tabela-topo">
          <div>
            <h3>Servidores e membros do TRE-AC</h3>
            <p class="muted">${faixaTexto} · Catálogo utilizado na busca rápida de Normativos e Reuniões</p>
          </div>
        </div>
        ${visiveis.length ? `
          <div class="projetos-tabela-wrap">
            <table class="projetos-tabela servidores-tre-tabela">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Setor / Lotação</th>
                  <th>Cargo / Função</th>
                  ${podeEditar ? '<th class="proj-th-acoes">Ações</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${visiveis.map(item => {
                  const nomeSetor = (typeof SETORES_CONVIDADOS === 'object' && SETORES_CONVIDADOS?.[item.setor]) || '';
                  const contato = [item.email, item.whatsapp].filter(Boolean).join(' · ');
                  return `
                    <tr>
                      <td>
                        <div class="proj-titulo-cel">
                          <strong>${escapeHtml(item.nome)}</strong>
                          ${contato ? `<span>${escapeHtml(contato)}</span>` : ''}
                        </div>
                      </td>
                      <td>
                        <div class="proj-titulo-cel">
                          <span><span class="dash-modulo-pill">${escapeHtml(item.setor || '—')}</span></span>
                          ${nomeSetor ? `<span>${escapeHtml(nomeSetor)}</span>` : ''}
                        </div>
                      </td>
                      <td class="proj-col-resp">${escapeHtml(item.cargo || '—')}</td>
                      ${podeEditar ? `
                        <td class="proj-col-acoes">
                          <div class="proj-acoes-wrap">
                            <div class="actions">
                              <button type="button" class="secondary" onclick="abrirModalServidorTre(${argumentoJsHtml(item.id)})">Editar</button>
                              <button type="button" class="secondary danger" onclick="confirmarExclusaoServidorTre(${argumentoJsHtml(item.id)})">Excluir</button>
                            </div>
                          </div>
                        </td>
                      ` : ''}
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          ${totalPaginas > 1 ? `
            <div class="paginacao-rodape">
              <div class="paginacao-total-texto">Página ${paginaServidoresTre} de ${totalPaginas}</div>
              ${botoesPaginacao}
            </div>
          ` : ''}
        ` : `
          <div class="tarefas-vazio">
            <h3>Nenhum servidor ou membro encontrado</h3>
            <p>${catalogo.length ? 'Ajuste a busca ou limpe o filtro de setor acima.' : 'Cadastre servidores e membros para utilizá-los em Normativos e Reuniões.'}</p>
            ${podeEditar ? '<button type="button" class="primary" onclick="abrirModalServidorTre()">+ Novo servidor</button>' : ''}
          </div>
        `}
      </section>
    </div>
  `;
}

document.addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();document.getElementById('busca-global')?.focus();}});
