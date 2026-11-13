/* ===== APRESENTAÇÃO INICIAL DO NORMATIC ===== */
const APRESENTACAO_NORMATIC_KEY='normatic:apresentacao-concluida';
const APRESENTACAO_NORMATIC_ETAPAS=[
  {
    numero:'01',
    kicker:'Documentos',
    titulo:'Gerencie documentos e prazos',
    texto:'Cadastre documentos, acompanhe a vigência e identifique rapidamente os itens vencidos ou que exigem atenção.'
  },
  {
    numero:'02',
    kicker:'Vigências',
    titulo:'Acompanhe os prazos',
    texto:'Consulte normativos por unidade, renove vigências e acompanhe o histórico dos registros.'
  },
  {
    numero:'03',
    kicker:'FAROL',
    titulo:'Acesse a gestão de atividades',
    texto:'Use o botão FAROL no menu para gerenciar projetos, tarefas, reuniões, pautas, atas e agenda.'
  }
];

let apresentacaoNormaticEtapa=0;
let apresentacaoNormaticAberturaManual=false;

function renderizarApresentacaoNormatic(){
  const etapa=APRESENTACAO_NORMATIC_ETAPAS[apresentacaoNormaticEtapa];
  if(!etapa) return;
  document.getElementById('apresentacao-normatic-icone').textContent=etapa.numero;
  document.getElementById('apresentacao-normatic-kicker').textContent=etapa.kicker;
  document.getElementById('apresentacao-normatic-titulo').textContent=etapa.titulo;
  document.getElementById('apresentacao-normatic-texto').textContent=etapa.texto;
  document.querySelectorAll('.apresentacao-etapas span').forEach((item,indice)=>item.classList.toggle('ativo',indice===apresentacaoNormaticEtapa));
  document.getElementById('apresentacao-voltar').disabled=apresentacaoNormaticEtapa===0;
  document.getElementById('apresentacao-avancar').textContent=apresentacaoNormaticEtapa===APRESENTACAO_NORMATIC_ETAPAS.length-1?'Começar':'Próximo';
}

function abrirApresentacaoNormatic(manual=false){
  const overlay=document.getElementById('apresentacao-normatic-overlay');
  if(!overlay) return;
  apresentacaoNormaticEtapa=0;
  apresentacaoNormaticAberturaManual=manual;
  document.getElementById('apresentacao-nao-mostrar').checked=!manual;
  renderizarApresentacaoNormatic();
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  document.body.style.overflow='hidden';
  requestAnimationFrame(()=>overlay.querySelector('.apresentacao-normatic')?.focus());
}

function concluirApresentacaoNormatic(){
  const overlay=document.getElementById('apresentacao-normatic-overlay');
  if(!overlay) return;
  const naoMostrar=document.getElementById('apresentacao-nao-mostrar')?.checked;
  try{
    if(naoMostrar) localStorage.setItem(APRESENTACAO_NORMATIC_KEY,'sim');
    else if(!apresentacaoNormaticAberturaManual) localStorage.removeItem(APRESENTACAO_NORMATIC_KEY);
  }catch(e){}
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  document.body.style.overflow='';
}

function avancarApresentacaoNormatic(){
  if(apresentacaoNormaticEtapa<APRESENTACAO_NORMATIC_ETAPAS.length-1){
    apresentacaoNormaticEtapa++;
    renderizarApresentacaoNormatic();
    return;
  }
  concluirApresentacaoNormatic();
}

function voltarApresentacaoNormatic(){
  if(apresentacaoNormaticEtapa>0){
    apresentacaoNormaticEtapa--;
    renderizarApresentacaoNormatic();
  }
}

function pularApresentacaoNormatic(){
  concluirApresentacaoNormatic();
}

document.addEventListener('keydown',evento=>{
  const aberto=document.getElementById('apresentacao-normatic-overlay')?.classList.contains('open');
  if(!aberto) return;
  if(evento.key==='Escape') pularApresentacaoNormatic();
  if(evento.key==='ArrowRight') avancarApresentacaoNormatic();
  if(evento.key==='ArrowLeft') voltarApresentacaoNormatic();
});

document.addEventListener('DOMContentLoaded',()=>{
  if(document.body.classList.contains('documento-incorporado')) return;
  let concluida=false;
  try{ concluida=localStorage.getItem(APRESENTACAO_NORMATIC_KEY)==='sim'; }catch(e){}
  if(!concluida) setTimeout(()=>abrirApresentacaoNormatic(false),350);
});
