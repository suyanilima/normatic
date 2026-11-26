/* ===== CALENDARIO LISTAGEM ===== */

/* ===== LISTAGEM, FILTROS E PAGINAÇÃO DE REUNIÕES ===== */

let visualizacaoReunioes='lista';
let calendarioReunioesMes=new Date(new Date().getFullYear(),new Date().getMonth(),1);
let calendarioReunioesDia=todayStr();

function alterarVisualizacaoReunioes(modo){
  if(!document.getElementById('reunioes-visualizacao-calendario')) modo='lista';
  visualizacaoReunioes=modo==='calendario'?'calendario':'lista';
  document.querySelector('.reunioes-blocos')?.classList.toggle('modo-calendario',visualizacaoReunioes==='calendario');
  const lista = document.getElementById('reunioes-visualizacao-lista');
  if(lista) lista.hidden=visualizacaoReunioes!=='lista';
  const calendario=document.getElementById('reunioes-visualizacao-calendario');
  if(calendario) calendario.hidden=visualizacaoReunioes!=='calendario';
  document.getElementById('reunioes-modo-lista')?.classList.toggle('active',visualizacaoReunioes==='lista');
  document.getElementById('reunioes-modo-calendario')?.classList.toggle('active',visualizacaoReunioes==='calendario');
  if(visualizacaoReunioes==='calendario')renderCalendarioReunioes();
}

function chaveDataCalendario(data){
  return `${data.getFullYear()}-${String(data.getMonth()+1).padStart(2,'0')}-${String(data.getDate()).padStart(2,'0')}`;
}

function classeSituacaoCalendario(reuniao){
  const situacao=obterSituacaoReuniao(reuniao);
  return situacao==='Concluída'?'concluida':situacao==='Cancelada'?'cancelada':situacao==='Reagendada'?'reagendada':'agendada';
}

function renderCalendarioReunioes(){
  const grade=document.getElementById('reunioes-calendario-grade');
  const titulo=document.getElementById('reunioes-calendario-titulo');
  if(!grade||!titulo)return;
  const filtradas=typeof obterReunioesFiltradas==='function'?obterReunioesFiltradas():reunioes;
  const porData=filtradas.reduce((mapa,reuniao)=>{if(reuniao.data)(mapa[reuniao.data]??=[]).push(reuniao);return mapa;},{});
  Object.values(porData).forEach(itens=>itens.sort((a,b)=>(a.horario||'').localeCompare(b.horario||'')));
  titulo.textContent=calendarioReunioesMes.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  const primeiro=new Date(calendarioReunioesMes.getFullYear(),calendarioReunioesMes.getMonth(),1);
  const inicio=new Date(primeiro);inicio.setDate(1-primeiro.getDay());
  const hoje=todayStr(),dias=[];
  const diasDoMes=new Date(primeiro.getFullYear(),primeiro.getMonth()+1,0).getDate();
  const quantidadeDias=Math.ceil((primeiro.getDay()+diasDoMes)/7)*7;
  for(let indice=0;indice<quantidadeDias;indice++){
    const data=new Date(inicio);data.setDate(inicio.getDate()+indice);
    const chave=chaveDataCalendario(data),eventos=porData[chave]||[];
    const classes=['calendario-dia'];
    if(data.getMonth()!==calendarioReunioesMes.getMonth())classes.push('fora-mes');
    if(chave===hoje)classes.push('hoje');
    if(chave===calendarioReunioesDia)classes.push('selecionado');
    const eventosHtml=eventos.slice(0,2).map(reuniao=>`<button class="calendario-evento ${classeSituacaoCalendario(reuniao)}" type="button" onclick="event.stopPropagation();verResumoReuniao(${argumentoJsHtml(reuniao.id)})" title="${escapeHtml(`${reuniao.horario||''} · ${reuniao.frequencia||''} · ${reuniao.pauta||'Sem pauta'}`)}"><strong>${escapeHtml(reuniao.horario||'--:--')}</strong> ${escapeHtml(reuniao.frequencia||'Reunião')}</button>`).join('');
    dias.push(`<div class="${classes.join(' ')}" role="button" tabindex="0" onclick="selecionarDiaCalendarioReunioes(${argumentoJsHtml(chave)})" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selecionarDiaCalendarioReunioes(${argumentoJsHtml(chave)})}" aria-label="${data.toLocaleDateString('pt-BR',{day:'numeric',month:'long'})}, ${eventos.length} reunião${eventos.length===1?'':'ões'}"><span class="calendario-dia-numero">${data.getDate()}</span>${eventosHtml}${eventos.length>2?`<span class="calendario-eventos-restantes">+${eventos.length-2} reunião${eventos.length-2===1?'':'ões'}</span>`:''}</div>`);
  }
  grade.innerHTML=dias.join('');
  renderAgendaDiaCalendario(porData[calendarioReunioesDia]||[]);
}

function renderAgendaDiaCalendario(eventos){
  const agenda=document.getElementById('reunioes-calendario-agenda');
  if(!agenda)return;
  const partes=calendarioReunioesDia.split('-').map(Number),data=new Date(partes[0],partes[1]-1,partes[2]);
  const titulo=document.getElementById('agenda-dia-reuniao-titulo');
  const contagem=document.getElementById('agenda-dia-reuniao-contagem');
  if(titulo) titulo.textContent=data.toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
  if(contagem) contagem.textContent=`${eventos.length} ${eventos.length===1?'reunião':'reuniões'}`;
  agenda.innerHTML=eventos.length?eventos.map(reuniao=>{
    const situacao=obterSituacaoReuniao(reuniao);
    return `<button class="calendario-agenda-item" type="button" onclick="fecharAgendaDiaCalendario();verResumoReuniao(${argumentoJsHtml(reuniao.id)})"><i class="${classeSituacaoCalendario(reuniao)}"></i><span><strong>${escapeHtml(reuniao.horario||'--:--')} · ${escapeHtml(reuniao.frequencia||'Reunião')}</strong><small>${escapeHtml(reuniao.pauta||'Sem pauta informada')}</small></span><em class="${classeSituacaoCalendario(reuniao)}">${escapeHtml(situacao)}</em></button>`;
  }).join(''):'<p>Nenhuma reunião neste dia.</p>';
}

function fecharAgendaDiaCalendario(){
  fecharModalElemento('agenda-dia-reuniao-modal-overlay');
}

function selecionarDiaCalendarioReunioes(chave){
  calendarioReunioesDia=chave;
  const [ano,mes]=chave.split('-').map(Number);
  if(ano!==calendarioReunioesMes.getFullYear()||mes-1!==calendarioReunioesMes.getMonth())calendarioReunioesMes=new Date(ano,mes-1,1);
  renderCalendarioReunioes();
  abrirModalElemento('agenda-dia-reuniao-modal-overlay');
}

function navegarCalendarioReunioes(direcao){
  calendarioReunioesMes=new Date(calendarioReunioesMes.getFullYear(),calendarioReunioesMes.getMonth()+direcao,1);
  calendarioReunioesDia=chaveDataCalendario(calendarioReunioesMes);
  renderCalendarioReunioes();
}

function irHojeCalendarioReunioes(){
  const hoje=new Date();calendarioReunioesMes=new Date(hoje.getFullYear(),hoje.getMonth(),1);calendarioReunioesDia=todayStr();renderCalendarioReunioes();
}

function renderReunioes(){
  if(typeof renderDashboard === 'function') renderDashboard();
  const lista = document.getElementById('reunioes-lista');
  const total = document.getElementById('reunioes-total');
  if(!lista || !total) return;
  renderEscolhaReuniaoMinuta();

  popularFiltroAnoReunioes();
  renderCalendarioReunioes();

  if(!reunioes.length){
    total.textContent = '0 reuniões';
    if(typeof atualizarSelecaoVisivelRelatorio === 'function') atualizarSelecaoVisivelRelatorio('reunioes', []);
    lista.innerHTML = '<div class="reunioes-vazio"><b>Nenhuma reunião cadastrada</b>Acesse Cadastros e escolha a categoria Reunião para criar o primeiro registro.</div>';
    renderPaginacaoReunioes(0);
    return;
  }

  const filtradas = obterReunioesFiltradas();
  total.textContent = `${filtradas.length} ${filtradas.length === 1 ? 'reunião' : 'reuniões'}`;
  if(!filtradas.length){
    if(typeof atualizarSelecaoVisivelRelatorio === 'function') atualizarSelecaoVisivelRelatorio('reunioes', []);
    lista.innerHTML = '<div class="reunioes-vazio"><b>Nenhuma reunião encontrada</b>Revise a busca ou os filtros selecionados.</div>';
    renderPaginacaoReunioes(0);
    return;
  }

  const totalPaginas = Math.ceil(filtradas.length / itensPorPaginaReunioes);
  if(paginaReunioes > totalPaginas) paginaReunioes = totalPaginas;
  const inicio = (paginaReunioes - 1) * itensPorPaginaReunioes;
  const pagina = filtradas.slice(inicio, inicio + itensPorPaginaReunioes);

  lista.innerHTML = pagina.map(item => {
    const situacao=obterSituacaoReuniao(item);
    const classeSituacao=situacao==='Concluída'?'concluida':situacao==='Cancelada'?'cancelada':situacao==='Reagendada'?'reagendada':'agendada';
    const participantes=todosParticipantesReuniao(item);
    const participantesResumo=participantes.length
      ? `<span title="${escapeHtml(participantes[0])}">${escapeHtml(participantes[0])}</span>${participantes.length>1?`<span class="reuniao-participantes-restantes">+${participantes.length-1} ${participantes.length===2?'participante':'participantes'}</span>`:''}`
      : '—';
    return `
    <div class="reuniao-item">
      <label class="selecao-registro" onclick="event.stopPropagation()"><input type="checkbox" ${typeof relatorioSelecao!=='undefined'&&relatorioSelecao.reunioes.has(item.id)?'checked':''} onchange="selecionarRegistroParaRelatorio('reunioes',${argumentoJsHtml(item.id)},this.checked)" aria-label="Selecionar reunião de ${fmtData(item.data)}"></label>
      <div class="reuniao-data"><strong>${fmtData(item.data)}</strong><span>${escapeHtml(item.horario)}</span></div>
      <div><span class="reuniao-frequencia">${escapeHtml(item.frequencia)}</span><span class="reuniao-periodicidade">${escapeHtml(item.origemPontual ? 'Pontual' : (FREQUENCIAS_REUNIAO[item.frequencia] || 'Pontual'))}</span><span class="reuniao-formato">${escapeHtml(rotuloFormatoReuniao(item.formato))}</span></div>
      <div class="reuniao-sei-celula">${escapeHtml(item.numeroEventoSei || 'Não informado')}</div>
      <div class="reuniao-link-celula">${item.link ? `<a class="reuniao-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Abrir</a>` : '-'}</div>
      <div class="reuniao-celula reuniao-pauta">${escapeHtml(item.pauta)}</div>
      <div class="reuniao-celula reuniao-participantes-celula" title="${escapeHtml(participantes.join(' • '))}">${participantesResumo}</div>
      <div class="reuniao-situacao"><span class="${classeSituacao}">${escapeHtml(situacao)}</span></div>
      <div class="actions reuniao-acoes">
        <button class="actions-toggle" type="button" onclick="toggleAcoes(event,${argumentoJsHtml("reuniao-"+item.id)})" aria-label="Ações da reunião">⋮</button>
        <div class="actions-dropdown" id="acoes-reuniao-${escapeHtml(item.id)}">
          <button type="button" onclick="verResumoReuniao(${argumentoJsHtml(item.id)})">Resumo</button>
          <button type="button" onclick="agendarReuniaoNoTeams(${argumentoJsHtml(item.id)})">Agendar no Teams</button>
          <button type="button" onclick="baixarConviteReuniaoIcs(${argumentoJsHtml(item.id)})">Baixar convite (.ics)</button>
          <button type="button" onclick="abrirMinutaReuniao(${argumentoJsHtml(item.id)})">Gerar ata</button>
          <button type="button" onclick="remarcarReuniao(${argumentoJsHtml(item.id)})">Remarcar</button>
          <button type="button" onclick="cancelarReuniao(${argumentoJsHtml(item.id)})">Cancelar reunião</button>
          <button type="button" onclick="editarReuniao(${argumentoJsHtml(item.id)})">Editar</button>
          <button type="button" onclick="notificarReuniao(${argumentoJsHtml(item.id)})">Notificar</button>
          <div class="divider"></div>
          <button class="del" type="button" onclick="excluirReuniao(${argumentoJsHtml(item.id)})">Excluir</button>
        </div>
      </div>
    </div>
  `}).join('');
  if(typeof atualizarSelecaoVisivelRelatorio === 'function') atualizarSelecaoVisivelRelatorio('reunioes', pagina);
  renderPaginacaoReunioes(filtradas.length);
}

function verResumoReuniao(id){
  const reuniao = reunioes.find(item => item.id === id);
  if(!reuniao) return;
  const participantes = todosParticipantesReuniao(reuniao);
  const membros = normalizarMembros(reuniao.membros, reuniao.frequencia).filter(membro => membro.nome);
  const convidados = normalizarParticipantes(reuniao.convidados ?? reuniao.participantes);
  const unidade = typeof nomeUnidadeFiltroMinuta === 'function' ? nomeUnidadeFiltroMinuta(reuniao.frequencia) : reuniao.frequencia;

  document.getElementById('resumo-reuniao-titulo').textContent = reuniao.pauta || 'Reunião sem pauta';
  document.getElementById('resumo-reuniao-data').textContent = `${fmtData(reuniao.data)} às ${reuniao.horario || '—'}`;
  document.getElementById('resumo-reuniao-unidade').textContent = unidade || reuniao.frequencia || 'Não informada';
  document.getElementById('resumo-reuniao-numero-evento-sei').textContent = reuniao.numeroEventoSei || 'Não informado';
  document.getElementById('resumo-reuniao-formato').textContent = rotuloFormatoReuniao(reuniao.formato);
  document.getElementById('resumo-reuniao-situacao').textContent = obterSituacaoReuniao(reuniao);
  document.getElementById('resumo-reuniao-link').innerHTML = reuniao.link
    ? `<a href="${escapeHtml(reuniao.link)}" target="_blank" rel="noopener noreferrer">Abrir link da reunião</a>`
    : 'Não informado';
  document.getElementById('resumo-reuniao-pauta').textContent = reuniao.pauta || 'Nenhuma pauta cadastrada.';
  document.getElementById('resumo-reuniao-membros').textContent = membros.length
    ? membros.map(membro => `${membro.nome} — ${membro.cargo}`).join('\n')
    : 'Nenhum membro informado.';
  document.getElementById('resumo-reuniao-convidados').textContent = convidados.length ? convidados.join('\n') : 'Nenhum convidado informado.';
  document.getElementById('resumo-reuniao-participantes-total').textContent = `${participantes.length} ${participantes.length === 1 ? 'participante' : 'participantes'}`;
  abrirModalElemento('resumo-reuniao-modal-overlay');
}

function fecharResumoReuniao(){
  fecharModalElemento('resumo-reuniao-modal-overlay');
}

function obterIntervaloReuniaoDatas(reuniao){
  const dataIso = String(reuniao?.data || '').slice(0, 10);
  const horaRaw = String(reuniao?.horario || '09:00').trim();
  const [hh, mm] = horaRaw.split(':').map(n => Number(n) || 0);
  const inicio = /^\d{4}-\d{2}-\d{2}$/.test(dataIso)
    ? new Date(`${dataIso}T${String(hh).padStart(2,'0')}:${String(mm).padStart(2,'0')}:00`)
    : new Date();
  const fim = new Date(inicio.getTime() + 60 * 60 * 1000);
  return { inicio, fim };
}

function montarTextoConviteReuniao(reuniao){
  const participantes = typeof todosParticipantesReuniao === 'function' ? todosParticipantesReuniao(reuniao) : [];
  const linhas = [
    reuniao.frequencia ? `Unidade/Colegiado: ${reuniao.frequencia}` : '',
    reuniao.numeroEventoSei ? `Evento SEI / Código: ${reuniao.numeroEventoSei}` : '',
    reuniao.pauta ? `Pauta: ${reuniao.pauta}` : '',
    participantes.length ? `Participantes: ${participantes.join(', ')}` : '',
    reuniao.link ? `Link: ${reuniao.link}` : ''
  ].filter(Boolean);
  return linhas.join('\n');
}

function agendarReuniaoNoTeams(id){
  if(typeof fecharMenusAcoes === 'function') fecharMenusAcoes();
  const reuniao = reunioes.find(item => item.id === id);
  if(!reuniao) return;
  const { inicio, fim } = obterIntervaloReuniaoDatas(reuniao);
  const titulo = reuniao.resumo || reuniao.pauta || `Reunião ${reuniao.frequencia || 'Normatic'}`;
  const corpo = montarTextoConviteReuniao(reuniao);
  // Deep link oficial do Teams: abre o formulário "Nova reunião" no app ou no Teams Web,
  // sem depender de caixa de correio do Outlook Web (evita OwaUserHasNoMailboxAndNoLicenseAssignedException).
  const params = new URLSearchParams({
    subject: titulo,
    startTime: inicio.toISOString(),
    endTime: fim.toISOString(),
    content: corpo
  });
  const url = `https://teams.microsoft.com/l/meeting/new?${params.toString()}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  if(typeof toast === 'function') toast('Abrindo o agendamento no Microsoft Teams. Se não abrir, use "Baixar convite (.ics)".', 'valido');
}

function formatarDataIcsUtc(date){
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escaparTextoIcs(texto){
  return String(texto || '').replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

function baixarConviteReuniaoIcs(id){
  if(typeof fecharMenusAcoes === 'function') fecharMenusAcoes();
  const reuniao = reunioes.find(item => item.id === id);
  if(!reuniao) return;
  const { inicio, fim } = obterIntervaloReuniaoDatas(reuniao);
  const titulo = reuniao.resumo || reuniao.pauta || `Reunião ${reuniao.frequencia || 'Normatic'}`;
  const corpo = montarTextoConviteReuniao(reuniao);
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Normatic//Reunioes//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${reuniao.id || Date.now()}@normatic`,
    `DTSTAMP:${formatarDataIcsUtc(new Date())}`,
    `DTSTART:${formatarDataIcsUtc(inicio)}`,
    `DTEND:${formatarDataIcsUtc(fim)}`,
    `SUMMARY:${escaparTextoIcs(titulo)}`,
    `DESCRIPTION:${escaparTextoIcs(corpo)}`,
    reuniao.link ? `LOCATION:${escaparTextoIcs(reuniao.link)}` : 'LOCATION:Microsoft Teams',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `reuniao-${(reuniao.data || 'normatic').replace(/[^0-9-]/g, '')}.ics`;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => { URL.revokeObjectURL(link.href); link.remove(); }, 100);
  if(typeof toast === 'function') toast('Convite .ics baixado. Abra-o para salvar no Teams / Outlook.', 'valido');
}

/* ===== ESCOLHA E NOVO MODAL: CADASTRAR REUNIÃO DIRETA ===== */

function abrirEscolhaCadastroReuniao(){
  abrirModalElemento('modal-escolha-reuniao-overlay');
  document.getElementById('btn-escolher-reuniao-pontual')?.focus();
}

function fecharEscolhaCadastroReuniao(){
  fecharModalElemento('modal-escolha-reuniao-overlay');
}

function escolherReuniaoPontual(){
  fecharEscolhaCadastroReuniao();
  abrirModalNovaReuniao();
}

function escolherReuniaoUnidade(){
  fecharEscolhaCadastroReuniao();
  if(typeof go === 'function') go('cadastro-reuniao');
  if(typeof selecionarModoCadastro === 'function') selecionarModoCadastro();
}

function popularSetoresNovaReuniao(){
  const select = document.getElementById('nr-setor');
  if(!select || select._populado) return;
  select._populado = true;
  if(typeof construirOptionsSetoresAgrupados === 'function'){
    select.innerHTML = construirOptionsSetoresAgrupados('', { placeholder: 'Selecione o setor (opcional)' });
  } else {
    select.innerHTML = '<option value="">Selecione o setor (opcional)</option>';
    if(typeof SETORES_CONVIDADOS === 'object' && SETORES_CONVIDADOS) {
      for(const [sigla, nome] of Object.entries(SETORES_CONVIDADOS)){
        const opt = document.createElement('option');
        opt.value = sigla;
        opt.textContent = `${sigla} — ${nome}`;
        select.appendChild(opt);
      }
    }
  }
  select._sincronizarSeletorPersonalizado?.();
}

function popularDocumentosNovaReuniao(){
  const select = document.getElementById('nr-documento');
  if(!select) return;
  select.innerHTML = '<option value="">Selecione o documento (opcional)</option>';
  let lista = [];
  try {
    if(window.NormaticCloud?.enabled) lista = window.NormaticCloud.readCollection('documentos') || [];
    else if(typeof docs !== 'undefined' && Array.isArray(docs)) lista = docs;
    else lista = JSON.parse(localStorage.getItem('igov:documentos') || '[]');
  } catch(_) { lista = []; }
  lista.forEach(doc => {
    const opt = document.createElement('option');
    opt.value = doc.id;
    opt.textContent = doc.nome || doc.titulo || doc.id;
    select.appendChild(opt);
  });
  select._sincronizarSeletorPersonalizado?.();
}

function sugerirProximoCodigoReuniao(){
  const ano = new Date().getFullYear();
  const reunioesAno = (typeof reunioes !== 'undefined' ? reunioes : []).filter(r => (r.data || '').startsWith(String(ano)));
  return `REU-${ano}-${String(reunioesAno.length + 1).padStart(2,'0')}`;
}

let reuniaoPontualEditandoId = null;

function adicionarServidorNaReuniaoPontual(item){
  const campoPart = document.getElementById('nr-participantes');
  if(!campoPart || !item?.nome) return;
  const rotulo = item.setor ? `${item.nome} - ${item.setor}` : item.nome;
  const atuais = campoPart.value.split('\n').map(l => l.trim()).filter(Boolean);
  const jaTem = atuais.some(l => l.toLowerCase() === rotulo.toLowerCase() || l.toLowerCase().startsWith(`${item.nome.toLowerCase()} -`));
  if(!jaTem) atuais.push(rotulo);
  campoPart.value = atuais.join('\n');
}

function abrirModalNovaReuniao(reuniaoEdicao = null){
  popularSetoresNovaReuniao();
  popularDocumentosNovaReuniao();
  if(typeof inicializarSeletoresToolbar === 'function') inicializarSeletoresToolbar();
  if(typeof configurarBuscaServidor === 'function'){
    configurarBuscaServidor('nr-busca-servidor', {
      limparAoSelecionar: true,
      apenasSelecao: true,
      aoSelecionar: adicionarServidorNaReuniaoPontual
    });
  }
  const campoBuscaSrv = document.getElementById('nr-busca-servidor');
  if(campoBuscaSrv) campoBuscaSrv.value = '';

  const editando = reuniaoEdicao && typeof reuniaoEdicao === 'object' && reuniaoEdicao.id ? reuniaoEdicao : null;
  reuniaoPontualEditandoId = editando ? editando.id : null;

  const tituloModal = document.getElementById('nova-reuniao-titulo');
  const btnSalvar = document.getElementById('btn-salvar-nova-reuniao');
  if(tituloModal) tituloModal.textContent = editando ? 'Editar reunião' : 'Cadastrar reunião';
  if(btnSalvar) btnSalvar.textContent = editando ? 'Salvar alterações' : 'Cadastrar reunião';

  const campoTitulo = document.getElementById('nr-titulo');
  const campoCodigo = document.getElementById('nr-codigo');
  const campoTipo = document.getElementById('nr-tipo');
  const campoData = document.getElementById('nr-data');
  const campoHora = document.getElementById('nr-horario');
  const campoSituacao = document.getElementById('nr-situacao');
  const campoDoc = document.getElementById('nr-documento');
  const campoSetor = document.getElementById('nr-setor');
  const campoLink = document.getElementById('nr-link');
  const campoPart = document.getElementById('nr-participantes');
  const campoPauta = document.getElementById('nr-pauta');

  if(editando){
    const tituloValor = editando.resumo || editando.pauta || '';
    let pautaValor = editando.pautaDetalhes || '';
    if(!pautaValor && editando.pauta && editando.resumo && editando.pauta.startsWith(`${editando.resumo} — `)){
      pautaValor = editando.pauta.slice(`${editando.resumo} — `.length);
    }
    const listaPart = Array.isArray(editando.convidados) ? editando.convidados : (Array.isArray(editando.participantes) ? editando.participantes : []);
    const textoPart = listaPart.map(p => typeof p === 'string' ? p : [p?.nome, p?.setor].filter(Boolean).join(' - ')).filter(Boolean).join('\n');

    if(campoTitulo) campoTitulo.value = tituloValor;
    if(campoCodigo) campoCodigo.value = editando.numeroEventoSei || '';
    if(campoTipo) campoTipo.value = editando.tipo || '';
    if(campoData) campoData.value = editando.data || '';
    if(campoHora) campoHora.value = editando.horario || '';
    if(campoSituacao) campoSituacao.value = editando.situacao || 'Agendada';
    if(campoDoc) campoDoc.value = editando.documentoId || '';
    if(campoSetor) campoSetor.value = editando.setor || '';
    if(campoLink) campoLink.value = editando.link || '';
    if(campoPart) campoPart.value = textoPart;
    if(campoPauta) campoPauta.value = pautaValor;
  } else {
    if(campoTitulo) campoTitulo.value = '';
    if(campoCodigo) campoCodigo.value = '';
    if(campoTipo) campoTipo.value = '';
    if(campoData) campoData.value = '';
    if(campoHora) campoHora.value = '';
    if(campoSituacao) campoSituacao.value = '';
    if(campoDoc) campoDoc.value = '';
    if(campoSetor) campoSetor.value = '';
    if(campoLink) campoLink.value = '';
    if(campoPart) campoPart.value = '';
    if(campoPauta) campoPauta.value = '';
  }
  if(typeof sincronizarSeletoresPersonalizados === 'function') sincronizarSeletoresPersonalizados();

  abrirModalElemento('modal-nova-reuniao-overlay');
  campoTitulo?.focus();
}

function fecharModalNovaReuniao(){
  reuniaoPontualEditandoId = null;
  fecharModalElemento('modal-nova-reuniao-overlay');
}

async function salvarNovaReuniao(){
  const titulo = document.getElementById('nr-titulo')?.value.trim();
  const data = document.getElementById('nr-data')?.value.trim();
  const horario = document.getElementById('nr-horario')?.value.trim();
  if(!titulo || !data || !horario){
    toast('Preencha o título, a data e o horário da reunião.', 'vencido');
    return;
  }
  const codigo = document.getElementById('nr-codigo')?.value.trim();
  const tipo = document.getElementById('nr-tipo')?.value.trim() || '';
  const situacao = document.getElementById('nr-situacao')?.value || 'Agendada';
  const documentoId = document.getElementById('nr-documento')?.value || '';
  const setor = document.getElementById('nr-setor')?.value || '';
  const link = normalizarLinkReuniao(document.getElementById('nr-link')?.value.trim());
  const participantesTexto = document.getElementById('nr-participantes')?.value || '';
  const participantes = participantesTexto.split('\n').map(p=>p.trim()).filter(Boolean);
  const pauta = document.getElementById('nr-pauta')?.value.trim() || '';

  const editandoId = reuniaoPontualEditandoId;
  const frequenciaRotulo = setor || tipo || 'Geral';
  const registro = {
    id: editandoId || ('reu-' + Date.now()),
    origemPontual: true,
    data,
    horario,
    numeroEventoSei: codigo,
    frequencia: frequenciaRotulo,
    tipo,
    setor,
    formato: link ? 'Online' : 'Presencial',
    link,
    pauta: pauta ? `${titulo} — ${pauta}` : titulo,
    pautaDetalhes: pauta,
    resumo: titulo,
    situacao,
    cancelada: situacao === 'Cancelada',
    reagendada: situacao === 'Remarcada',
    documentoId,
    membros: [],
    convidados: participantes,
    participantes
  };

  const anteriores = [...reunioes];
  if(editandoId){
    const idx = reunioes.findIndex(r => r.id === editandoId);
    if(idx >= 0) reunioes[idx] = { ...reunioes[idx], ...registro };
    else reunioes.unshift(registro);
  } else {
    reunioes.unshift(registro);
  }

  fecharModalNovaReuniao();
  renderReunioes();
  if(typeof renderizarCalendarioReunioes === 'function') renderizarCalendarioReunioes();
  if(typeof renderDashboard === 'function') renderDashboard();

  const salvo = await salvarReunioes();
  if(!salvo){
    reunioes = anteriores;
    renderReunioes();
    if(typeof renderizarCalendarioReunioes === 'function') renderizarCalendarioReunioes();
    return;
  }
  if(typeof registrarServidorNoSistema === 'function'){
    participantes.forEach(linha => {
      const partes = String(linha || '').split(/\s+[-—–]\s+/);
      const nomeLimpo = partes[0]?.trim();
      const setorLinha = partes[1]?.trim() || setor || '';
      if(nomeLimpo && nomeLimpo.length >= 3) registrarServidorNoSistema({ nome: nomeLimpo, setor: setorLinha });
    });
  }
  toast(editandoId ? 'Reunião atualizada com sucesso!' : 'Reunião cadastrada com sucesso!', 'valido');
}

