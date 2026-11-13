/* ===== DASHBOARD PRINCIPAL ===== */

function definirTextoDashboard(id,valor){
  const elemento=document.getElementById(id);
  if(elemento) elemento.textContent=String(valor);
}

function nomeUnidadeDashboard(codigo){
  return unidadesPersonalizadas.find(unidade=>unidade.codigo===codigo)?.nome || codigo || 'Sem unidade';
}

function configurarTooltipAnelDashboard(elemento,itens){
  if(!elemento) return;
  const total=itens.reduce((soma,item)=>soma+item.valor,0);
  elemento._dadosTooltip=itens.map(item=>({...item,percentual:total?Math.round((item.valor/total)*100):0}));
  elemento.setAttribute('aria-label',elemento._dadosTooltip.map(item=>`${item.rotulo}: ${item.percentual}%`).join('; '));
  if(typeof elemento.appendChild!=='function' || typeof elemento.addEventListener!=='function') return;
  let tooltip=elemento.querySelector('.dashboard-anel-tooltip');
  if(!tooltip){
    tooltip=document.createElement('div');
    tooltip.className='dashboard-anel-tooltip';
    tooltip.setAttribute('role','status');
    elemento.appendChild(tooltip);
  }
  if(elemento.dataset.tooltipConfigurado) return;
  elemento.dataset.tooltipConfigurado='true';
  elemento.addEventListener('pointermove',evento=>{
    const caixa=elemento.getBoundingClientRect();
    const x=evento.clientX-caixa.left;
    const y=evento.clientY-caixa.top;
    const dx=x-caixa.width/2;
    const dy=y-caixa.height/2;
    const distancia=Math.hypot(dx,dy);
    const raio=Math.min(caixa.width,caixa.height)/2;
    const alvo=elemento.querySelector('.dashboard-anel-tooltip');
    if(!alvo || distancia<raio*.69 || distancia>raio || !elemento._dadosTooltip?.length){
      alvo?.classList.remove('visivel');
      return;
    }
    const angulo=(Math.atan2(dx,-dy)*180/Math.PI+360)%360;
    const totalAtual=elemento._dadosTooltip.reduce((soma,item)=>soma+item.valor,0);
    let acumulado=0;
    const item=elemento._dadosTooltip.find(dado=>{
      acumulado+=(dado.valor/Math.max(1,totalAtual))*360;
      return angulo<=acumulado && dado.valor>0;
    });
    if(!item){ alvo.classList.remove('visivel'); return; }
    alvo.textContent=`${item.rotulo}: ${item.valor} (${item.percentual}%)`;
    alvo.style.left=`${x}px`;
    alvo.style.top=`${y}px`;
    alvo.classList.add('visivel');
  });
  elemento.addEventListener('pointerleave',()=>elemento.querySelector('.dashboard-anel-tooltip')?.classList.remove('visivel'));
}

function abrirDocumentoDashboard(id){
  const documento=docs.find(item=>item.id===id);
  if(!documento) return;
  setTab('acompanhamento');
  ['busca-nome','filtro-ano','filtro-tipo'].forEach(campoId=>{
    const campo=document.getElementById(campoId);
    if(campo) campo.value='';
  });
  const filtroStatus=document.getElementById('filtro-status');
  if(filtroStatus) filtroStatus.value='todos';
  const codigoUnidade=documento.unidade || documento.gestorSetor;
  if(codigoUnidade && localizarUnidadeDocumento(codigoUnidade)) abrirUnidadeDocumentos(codigoUnidade);
  else abrirUnidadeDocumentos('SETOR:TODAS');
  verResumo(id);
}

function renderDashboard(){
  const statusDocumentos=docs.map(documento=>({...documento,status:calcularStatus(documento)}));
  const semNormativo=statusDocumentos.filter(documento=>documento.semNormativo || documento.tipo==='Sem normativo').length;
  const documentosNormativos=statusDocumentos.filter(documento=>!(documento.semNormativo || documento.tipo==='Sem normativo'));
  const vigentes=documentosNormativos.filter(documento=>documento.status==='Vigente').length;
  const alertas=documentosNormativos.filter(documento=>documento.status==='Alerta').length;
  const vencidos=documentosNormativos.filter(documento=>documento.status==='Vencido').length;
  const idsComMinuta=new Set(minutasHistorico.map(registro=>registro.reuniao?.id).filter(Boolean));
  const reunioesComMinuta=reunioes.filter(reuniao=>idsComMinuta.has(reuniao.id)).length;
  const semMinuta=Math.max(0,reunioes.length-reunioesComMinuta);
  const cobertura=reunioes.length?Math.round((reunioesComMinuta/reunioes.length)*100):0;
  const percentualVigentes=documentosNormativos.length?Math.round((vigentes/documentosNormativos.length)*100):0;
  const hoje=new Date();
  hoje.setHours(0,0,0,0);
  const situacaoReuniao=reuniao=>{
    if(typeof obterSituacaoReuniao==='function') return obterSituacaoReuniao(reuniao);
    const situacao=String(reuniao.situacao || reuniao.status || '').toLocaleLowerCase('pt-BR');
    if(situacao.includes('cancel')) return 'Cancelada';
    if(situacao.includes('conclu')) return 'Concluída';
    if(situacao.includes('agend')) return 'Agendada';
    const data=new Date(`${reuniao.data || '9999-12-31'}T00:00:00`);
    return !Number.isNaN(data.getTime()) && data < hoje ? 'Concluída' : 'Agendada';
  };
  const reunioesConcluidas=reunioes.filter(item=>situacaoReuniao(item)==='Concluída').length;
  const reunioesAgendadas=reunioes.filter(item=>['Agendada','Reagendada'].includes(situacaoReuniao(item))).length;
  const reunioesCanceladas=reunioes.filter(item=>situacaoReuniao(item)==='Cancelada').length;
  const percentualReunioesConcluidas=reunioes.length?Math.round((reunioesConcluidas/reunioes.length)*100):0;
  const reunioesComAtaPrevista=reunioes.filter(reuniao=>situacaoReuniao(reuniao)!=='Cancelada');
  const atasConcluidas=reunioesComAtaPrevista.filter(reuniao=>idsComMinuta.has(reuniao.id)).length;
  const atasEmAndamento=reunioesComAtaPrevista.filter(reuniao=>!idsComMinuta.has(reuniao.id) && situacaoReuniao(reuniao)==='Concluída').length;
  const atasPendentes=reunioesComAtaPrevista.filter(reuniao=>!idsComMinuta.has(reuniao.id) && ['Agendada','Reagendada'].includes(situacaoReuniao(reuniao))).length;
  const percentualAtasConcluidas=reunioesComAtaPrevista.length?Math.round((atasConcluidas/reunioesComAtaPrevista.length)*100):0;

  definirTextoDashboard('dashboard-total-documentos',docs.length);
  definirTextoDashboard('dashboard-total-documentos-vencidos',vencidos);
  definirTextoDashboard('dashboard-total-documentos-sem-normativo',semNormativo);
  definirTextoDashboard('dashboard-documentos-detalhe','Acompanhe prazos');
  definirTextoDashboard('dashboard-total-reunioes',reunioes.length);
  definirTextoDashboard('dashboard-reunioes-detalhe',`${new Set(reunioes.map(item=>item.frequencia).filter(Boolean)).size} unidade(s)`);
  definirTextoDashboard('dashboard-total-minutas',minutasHistorico.length);
  definirTextoDashboard('dashboard-minutas-detalhe',`${cobertura}% das reuniões`);
  definirTextoDashboard('dashboard-reunioes-sem-minuta',semMinuta);
  definirTextoDashboard('dashboard-percentual-vigentes',`${percentualVigentes}%`);
  definirTextoDashboard('dashboard-doc-vigentes',vigentes);
  definirTextoDashboard('dashboard-doc-alerta',alertas);
  definirTextoDashboard('dashboard-doc-vencidos',vencidos);
  definirTextoDashboard('dashboard-doc-sem-normativo',semNormativo);
  definirTextoDashboard('dashboard-reunioes-concluidas',reunioesConcluidas);
  definirTextoDashboard('dashboard-reunioes-agendadas',reunioesAgendadas);
  definirTextoDashboard('dashboard-reunioes-canceladas',reunioesCanceladas);
  definirTextoDashboard('dashboard-percentual-reunioes-concluidas',`${percentualReunioesConcluidas}%`);
  definirTextoDashboard('dashboard-atas-concluidas',atasConcluidas);
  definirTextoDashboard('dashboard-atas-andamento',atasEmAndamento);
  definirTextoDashboard('dashboard-atas-pendentes',atasPendentes);
  definirTextoDashboard('dashboard-percentual-atas-concluidas',`${percentualAtasConcluidas}%`);
  definirTextoDashboard('dashboard-atualizacao',`Atualizado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}`);

  const anel=document.getElementById('dashboard-anel-documentos');
  if(anel){
    const totalStatus=Math.max(1,docs.length);
    const fimVigentes=(vigentes/totalStatus)*360;
    const fimAlertas=((vigentes+alertas)/totalStatus)*360;
    const fimVencidos=((vigentes+alertas+vencidos)/totalStatus)*360;
    const fimSemNormativo=((vigentes+alertas+vencidos+semNormativo)/totalStatus)*360;
    anel.style.background=docs.length
      ? `conic-gradient(#168A4B 0deg ${fimVigentes}deg,#C47A00 ${fimVigentes}deg ${fimAlertas}deg,#C62828 ${fimAlertas}deg ${fimVencidos}deg,#64748B ${fimVencidos}deg ${fimSemNormativo}deg,#E9EEF5 ${fimSemNormativo}deg 360deg)`
      : '#E9EEF5';
    configurarTooltipAnelDashboard(anel,[
      {rotulo:'Vigentes',valor:vigentes},
      {rotulo:'A vencer',valor:alertas},
      {rotulo:'Vencidos',valor:vencidos},
      {rotulo:'Sem normativo',valor:semNormativo}
    ]);
  }
  const pintarAnel=(id,valores,cores,rotulos)=>{
    const elemento=document.getElementById(id);
    if(!elemento) return;
    const total=valores.reduce((soma,valor)=>soma+valor,0);
    configurarTooltipAnelDashboard(elemento,valores.map((valor,indice)=>({rotulo:rotulos[indice],valor})));
    if(!total){ elemento.style.background='#E9EEF5'; return; }
    let inicio=0;
    elemento.style.background=`conic-gradient(${valores.map((valor,indice)=>{
      const fim=inicio+(valor/total)*360;
      const faixa=`${cores[indice]} ${inicio}deg ${fim}deg`;
      inicio=fim;
      return faixa;
    }).join(',')})`;
  };
  pintarAnel('dashboard-anel-reunioes',[reunioesConcluidas,reunioesAgendadas,reunioesCanceladas],['#168A4B','#C47A00','#C62828'],['Concluídas','Agendadas','Canceladas']);
  pintarAnel('dashboard-anel-atas',[atasConcluidas,atasEmAndamento,atasPendentes],['#168A4B','#C47A00','#4F7FC1'],['Concluídas','Em andamento','Pendentes']);

  const documentosPorUnidade=new Map();
  statusDocumentos.forEach(documento=>{
    const codigo=documento.unidade || documento.gestorSetor || 'SEM_UNIDADE';
    const resumo=documentosPorUnidade.get(codigo) || {total:0,atencao:0};
    resumo.total+=1;
    if(documento.semNormativo || documento.tipo==='Sem normativo' || ['Alerta','Vencido'].includes(documento.status)) resumo.atencao+=1;
    documentosPorUnidade.set(codigo,resumo);
  });
  const unidadesDocumentos=document.getElementById('dashboard-documentos-unidades');
  if(unidadesDocumentos){
    const unidadesComAtencao=[...documentosPorUnidade.entries()]
      .filter(([,resumo])=>resumo.atencao>0)
      .sort((a,b)=>b[1].atencao-a[1].atencao || b[1].total-a[1].total);
    unidadesDocumentos.innerHTML=unidadesComAtencao.length
      ? unidadesComAtencao.map(([codigo,resumo])=>{
        const sigla=codigo==='SEM_UNIDADE'?'Sem unidade':codigo;
        const percentual=Math.round((resumo.atencao/resumo.total)*100);
        return `<div class="dashboard-unidade-linha"><b title="${escapeHtml(sigla)}">${escapeHtml(sigla)}</b><span class="dashboard-unidade-barra" role="progressbar" aria-label="${escapeHtml(sigla)}: ${resumo.atencao} de ${resumo.total} documentos exigem atenção" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percentual}"><i style="width:${percentual}%"></i></span><strong>${resumo.atencao} de ${resumo.total}</strong></div>`;
      }).join('')
      : '<div class="dashboard-lista-vazia">Nenhuma unidade exige atenção.</div>';
  }

  const porUnidade=new Map();
  reunioes.forEach(reuniao=>porUnidade.set(reuniao.frequencia,(porUnidade.get(reuniao.frequencia)||0)+1));
  const unidades=document.getElementById('dashboard-unidades');
  if(unidades){
    unidades.innerHTML=porUnidade.size
      ? [...porUnidade.entries()].sort((a,b)=>b[1]-a[1]).map(([codigo,total])=>{
        const concluidas=reunioes.filter(reuniao=>reuniao.frequencia===codigo && idsComMinuta.has(reuniao.id)).length;
        const percentual=Math.round((concluidas/total)*100);
        return `<div class="dashboard-unidade-linha"><b title="${escapeHtml(nomeUnidadeDashboard(codigo))}">${escapeHtml(nomeUnidadeDashboard(codigo))}</b><span class="dashboard-unidade-barra" role="progressbar" aria-label="${escapeHtml(nomeUnidadeDashboard(codigo))}: ${concluidas} de ${total} atas concluídas" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percentual}"><i style="width:${percentual}%"></i></span><strong>${concluidas} de ${total} atas</strong></div>`;
      }).join('')
      : '<div class="dashboard-lista-vazia">Nenhuma reunião cadastrada.</div>';
  }

  const documentoSemNormativo=documento=>documento.semNormativo || documento.tipo==='Sem normativo';
  const documentosAtencao=statusDocumentos
    .filter(documento=>documentoSemNormativo(documento) || ['Alerta','Vencido'].includes(documento.status))
    .sort((a,b)=>{
      const semNormativoA=documentoSemNormativo(a);
      const semNormativoB=documentoSemNormativo(b);
      if(semNormativoA!==semNormativoB) return semNormativoA?1:-1;
      return String(a.data||'').localeCompare(String(b.data||''));
    });
  const listaDocumentos=document.getElementById('dashboard-documentos-atencao');
  if(listaDocumentos){
    listaDocumentos.innerHTML=documentosAtencao.length
      ? documentosAtencao.map(documento=>{
        const semNormativo=documentoSemNormativo(documento);
        const detalhe=semNormativo?'Documento sem vigência normativa':`Vencimento: ${documento.data?fmtData(documento.data):'não informado'}`;
        const classe=semNormativo?'sem-normativo':documento.status==='Vencido'?'vencido':'alerta';
        const rotulo=semNormativo?'Sem normativo':statusLabel(documento.status);
        return `<button class="dashboard-lista-item dashboard-lista-item-clicavel" type="button" data-documento-id="${escapeHtml(documento.id)}" onclick="abrirDocumentoDashboard(this.dataset.documentoId)" aria-label="Abrir documento ${escapeHtml(documento.nome)}"><span class="dashboard-lista-item-conteudo"><strong title="${escapeHtml(documento.nome)}">${escapeHtml(documento.nome)}</strong><span>${escapeHtml(detalhe)}</span></span><em class="${classe}">${escapeHtml(rotulo)}</em></button>`;
      }).join('')
      : '<div class="dashboard-lista-vazia">Nenhum documento exige atenção.</div>';
  }

  const recentes=[...reunioes].sort((a,b)=>`${b.data || ''}T${b.horario || ''}`.localeCompare(`${a.data || ''}T${a.horario || ''}`));
  const listaReunioes=document.getElementById('dashboard-reunioes-recentes');
  if(listaReunioes){
    listaReunioes.innerHTML=recentes.length
      ? recentes.map(reuniao=>{
        const situacao=situacaoReuniao(reuniao);
        const classe=situacao==='Concluída'?'completa':situacao==='Cancelada'?'vencido':'alerta';
        return `<div class="dashboard-lista-item"><div><strong>${escapeHtml(nomeUnidadeDashboard(reuniao.frequencia))}</strong><span title="${escapeHtml(reuniao.pauta || 'Sem pauta informada')}">${escapeHtml(reuniao.pauta || 'Sem pauta informada')}</span></div><em class="${classe}">${escapeHtml(situacao)}</em></div>`;
      }).join('')
      : '<div class="dashboard-lista-vazia">Nenhuma reunião cadastrada.</div>';
  }

}
