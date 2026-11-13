/* ===== CALENDARIO LISTAGEM ===== */

/* ===== LISTAGEM, FILTROS E PAGINAÇÃO DE REUNIÕES ===== */

let visualizacaoReunioes='lista';
let calendarioReunioesMes=new Date(new Date().getFullYear(),new Date().getMonth(),1);
let calendarioReunioesDia=todayStr();

function alterarVisualizacaoReunioes(modo){
  if(!document.getElementById('reunioes-visualizacao-calendario')) modo='lista';
  visualizacaoReunioes=modo==='calendario'?'calendario':'lista';
  document.querySelector('.reunioes-blocos')?.classList.toggle('modo-calendario',visualizacaoReunioes==='calendario');
  document.getElementById('reunioes-visualizacao-lista').hidden=visualizacaoReunioes!=='lista';
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
      <div><span class="reuniao-frequencia">${escapeHtml(item.frequencia)}</span><span class="reuniao-periodicidade">${FREQUENCIAS_REUNIAO[item.frequencia]}</span><span class="reuniao-formato">${escapeHtml(rotuloFormatoReuniao(item.formato))}</span></div>
      <div class="reuniao-sei-celula">${escapeHtml(item.numeroEventoSei || 'Não informado')}</div>
      <div class="reuniao-link-celula">${item.link ? `<a class="reuniao-link" href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer">Abrir</a>` : '-'}</div>
      <div class="reuniao-celula reuniao-pauta">${escapeHtml(item.pauta)}</div>
      <div class="reuniao-celula reuniao-participantes-celula" title="${escapeHtml(participantes.join(' • '))}">${participantesResumo}</div>
      <div class="reuniao-situacao"><span class="${classeSituacao}">${escapeHtml(situacao)}</span></div>
      <div class="actions reuniao-acoes">
        <button class="actions-toggle" type="button" onclick="toggleAcoes(event,${argumentoJsHtml("reuniao-"+item.id)})" aria-label="Ações da reunião">⋮</button>
        <div class="actions-dropdown" id="acoes-reuniao-${escapeHtml(item.id)}">
          <button type="button" onclick="verResumoReuniao(${argumentoJsHtml(item.id)})">Resumo</button>
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
