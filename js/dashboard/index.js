/* ===== DASHBOARD PRINCIPAL ===== */

function definirTextoDashboard(id,valor){
  const elemento=document.getElementById(id);
  if(elemento) elemento.textContent=String(valor);
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
  const percentualVigentes=documentosNormativos.length?Math.round((vigentes/documentosNormativos.length)*100):0;
  definirTextoDashboard('dashboard-total-documentos',docs.length);
  definirTextoDashboard('dashboard-total-documentos-vencidos',vencidos);
  definirTextoDashboard('dashboard-total-documentos-sem-normativo',semNormativo);
  definirTextoDashboard('dashboard-documentos-detalhe','Acompanhe prazos');
  definirTextoDashboard('dashboard-percentual-vigentes',`${percentualVigentes}%`);
  definirTextoDashboard('dashboard-doc-vigentes',vigentes);
  definirTextoDashboard('dashboard-doc-alerta',alertas);
  definirTextoDashboard('dashboard-doc-vencidos',vencidos);
  definirTextoDashboard('dashboard-doc-sem-normativo',semNormativo);
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

}
