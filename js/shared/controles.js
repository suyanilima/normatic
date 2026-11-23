/* ===== PONTO DE ENTRADA DA APLICAÇÃO ===== */
/* ===== INICIALIZAÇÃO: roda por último, depois que todas as funções acima já existem ===== */

function tickClock(){
  const relogio = document.getElementById('clock');
  if(!relogio) return;
  const now = new Date();
  const data = now.toLocaleDateString('pt-BR', {weekday:'long', day:'2-digit', month:'long', year:'numeric'});
  relogio.textContent = data.charAt(0).toUpperCase() + data.slice(1);
}

function ajustarNumeroInvertido(id, direcao){
  const campo = document.getElementById(id);
  if(!campo) return;
  const minimo = Number.isFinite(Number(campo.min)) && campo.min !== '' ? Number(campo.min) : -Infinity;
  const maximo = Number.isFinite(Number(campo.max)) && campo.max !== '' ? Number(campo.max) : Infinity;
  const passo = Number(campo.step) || 1;
  const atual = Number(campo.value) || (Number.isFinite(minimo) ? minimo : 0);
  campo.value = String(Math.min(maximo,Math.max(minimo,atual+(direcao*passo))));
  campo.dispatchEvent(new Event('input',{bubbles:true}));
  campo.dispatchEvent(new Event('change',{bubbles:true}));
  campo.focus();
}

function fecharSeletoresToolbar(exceto=null){
  document.querySelectorAll('.toolbar-select-personalizado').forEach(componente=>{
    if(componente===exceto) return;
    componente.querySelector('.toolbar-select-opcoes').hidden=true;
    componente.querySelector('.toolbar-select-botao').setAttribute('aria-expanded','false');
  });
}

function posicionarOpcoesToolbar(botao, lista){
  const retangulo=botao.getBoundingClientRect();
  const alturaTela=window.innerHeight;
  const abaixo=Math.max(0,alturaTela-retangulo.bottom-16);
  const acima=Math.max(0,retangulo.top-16);
  const abrirAcima=abaixo<260 && acima>abaixo;
  lista.style.top=abrirAcima?'auto':'calc(100% + 4px)';
  lista.style.bottom=abrirAcima?'calc(100% + 4px)':'auto';
  lista.style.maxHeight=`${Math.min(320,abrirAcima?acima:abaixo)}px`;
}

function criarBotaoOpcaoToolbar(select, opcao, selecionada, botao, lista){
  const item=document.createElement('button');
  item.type='button';
  item.textContent=opcao.textContent;
  item.title=opcao.textContent;
  item.className=opcao===selecionada?'selecionada':'';
  item.setAttribute('role','option');
  item.setAttribute('aria-selected',String(opcao===selecionada));
  item.dataset.textoBusca=(opcao.textContent || '').toLocaleLowerCase('pt-BR');
  item.addEventListener('click',()=>{
    select.value=opcao.value;
    select.dispatchEvent(new Event('change',{bubbles:true}));
    atualizarSeletorToolbar(select,botao,lista);
    lista.hidden=true;
    botao.setAttribute('aria-expanded','false');
    botao.focus();
  });
  return item;
}

function atualizarSeletorToolbar(select, botao, lista){
  const opcoes=[...select.options];
  const selecionada=opcoes.find(opcao=>opcao.value===select.value) || opcoes[0];
  botao.textContent=selecionada?.textContent || 'Selecione...';
  botao.title=selecionada?.textContent || '';

  const elementos=[];
  const usarBusca=opcoes.length>12;
  let campoBusca=null;
  if(usarBusca){
    const buscaWrap=document.createElement('div');
    buscaWrap.className='toolbar-select-busca-wrap';
    campoBusca=document.createElement('input');
    campoBusca.type='search';
    campoBusca.className='toolbar-select-busca';
    campoBusca.placeholder='Buscar por sigla, nome ou setor...';
    campoBusca.setAttribute('aria-label','Filtrar opções');
    campoBusca.addEventListener('click',e=>e.stopPropagation());
    buscaWrap.appendChild(campoBusca);
    elementos.push(buscaWrap);
  }

  const temGrupos=[...select.children].some(el=>el.tagName==='OPTGROUP');
  if(temGrupos){
    [...select.children].forEach(filho=>{
      if(filho.tagName==='OPTGROUP'){
        const grupoWrap=document.createElement('div');
        grupoWrap.className='toolbar-select-grupo-wrap';
        grupoWrap.dataset.grupoBusca=(filho.label || '').toLocaleLowerCase('pt-BR');
        const titulo=document.createElement('div');
        titulo.className='toolbar-select-grupo';
        titulo.textContent=filho.label;
        grupoWrap.appendChild(titulo);
        [...filho.children].forEach(opt=>{
          if(opt.tagName==='OPTION') grupoWrap.appendChild(criarBotaoOpcaoToolbar(select,opt,selecionada,botao,lista));
        });
        elementos.push(grupoWrap);
      } else if(filho.tagName==='OPTION'){
        elementos.push(criarBotaoOpcaoToolbar(select,filho,selecionada,botao,lista));
      }
    });
  } else {
    opcoes.forEach(opcao=>elementos.push(criarBotaoOpcaoToolbar(select,opcao,selecionada,botao,lista)));
  }

  if(usarBusca){
    const vazio=document.createElement('div');
    vazio.className='tema-documento-vazio';
    vazio.textContent='Nenhuma opção encontrada.';
    vazio.hidden=true;
    elementos.push(vazio);

    campoBusca.addEventListener('input',()=>{
      const termo=campoBusca.value.trim().toLocaleLowerCase('pt-BR');
      let visiveis=0;
      lista.querySelectorAll('.toolbar-select-grupo-wrap').forEach(gw=>{
        const grupoCasa=termo && (gw.dataset.grupoBusca || '').includes(termo);
        let grupoVisiveis=0;
        gw.querySelectorAll('button[role="option"]').forEach(btn=>{
          const mostra=!termo || grupoCasa || (btn.dataset.textoBusca || '').includes(termo);
          btn.hidden=!mostra;
          if(mostra){ grupoVisiveis++; visiveis++; }
        });
        gw.hidden=grupoVisiveis===0;
      });
      [...lista.children].forEach(el=>{
        if(el.matches?.('button[role="option"]')){
          const mostra=!termo || (el.dataset.textoBusca || '').includes(termo);
          el.hidden=!mostra;
          if(mostra) visiveis++;
        }
      });
      vazio.hidden=visiveis>0;
    });
  }

  lista.replaceChildren(...elementos);
}

function inicializarSeletoresToolbar(){
  document.querySelectorAll('.toolbar select, #f-tipo, #f-baselegal, #edit-tipo, #edit-baselegal, #r-formato, #edit-r-formato, #f-area-tematica, #edit-area-tematica, #nr-situacao, #nr-documento, #nr-setor, #aud-unidade, #aud-status, #auditoria-filtro-processo, #auditoria-filtro-unidade, #auditoria-filtro-status, #projectFilter, #taskPriorityFilter, #tar-inline-projeto, #tar-inline-responsavel, #tar-inline-prioridade, #tar-inline-status, #proj-inline-responsavel, #proj-inline-prioridade, #proj-inline-status, #proj-filtro-status, #proj-filtro-prioridade, #proj-filtro-responsavel').forEach(select=>{
    if(select.closest('.toolbar-select-personalizado')) return;
    const componente=document.createElement('div');
    componente.className='toolbar-select-personalizado';
    const botao=document.createElement('button');
    botao.type='button';
    botao.className='toolbar-select-botao';
    botao.setAttribute('aria-haspopup','listbox');
    botao.setAttribute('aria-expanded','false');
    botao.setAttribute('aria-label',select.getAttribute('aria-label') || select.previousElementSibling?.textContent || 'Selecionar opção');
    const lista=document.createElement('div');
    lista.className='toolbar-select-opcoes';
    lista.setAttribute('role','listbox');
    lista.hidden=true;
    select.parentNode.insertBefore(componente,select);
    componente.append(select,botao,lista);
    atualizarSeletorToolbar(select,botao,lista);
    select._sincronizarSeletorPersonalizado=()=>atualizarSeletorToolbar(select,botao,lista);
    botao.addEventListener('click',()=>{
      const abrir=lista.hidden;
      fecharSeletoresToolbar(abrir?componente:null);
      lista.hidden=!abrir;
      botao.setAttribute('aria-expanded',String(abrir));
      if(abrir){
        posicionarOpcoesToolbar(botao,lista);
        const busca=lista.querySelector('.toolbar-select-busca');
        if(busca){
          busca.value='';
          busca.dispatchEvent(new Event('input'));
          busca.focus();
        } else {
          const selecionada=lista.querySelector('.selecionada');
          if(selecionada) lista.scrollTop=selecionada.offsetTop;
        }
      }
    });
    botao.addEventListener('keydown',evento=>{
      if(evento.key==='Escape'){ lista.hidden=true; botao.setAttribute('aria-expanded','false'); }
      if(['ArrowDown','Enter',' '].includes(evento.key) && lista.hidden){ evento.preventDefault(); botao.click(); lista.querySelector('button')?.focus(); }
    });
    select.addEventListener('change',()=>atualizarSeletorToolbar(select,botao,lista));
    if(typeof MutationObserver!=='undefined') new MutationObserver(()=>atualizarSeletorToolbar(select,botao,lista)).observe(select,{childList:true,subtree:true});
  });
}

function sincronizarSeletoresPersonalizados(){
  document.querySelectorAll('select').forEach(select=>select._sincronizarSeletorPersonalizado?.());
}

