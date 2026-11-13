inicializarNavbar();
inicializarInterfaceCompartilhada();
tickClock();
setInterval(tickClock, 60000);


carregar();
inicializarSeletoresToolbar();
document.addEventListener('click',evento=>{
  if(!evento.target.closest?.('.toolbar-select-personalizado')) fecharSeletoresToolbar();
});

function reposicionarSeletoresAbertos(){
  document.querySelectorAll('.toolbar-select-botao[aria-expanded="true"]').forEach(botao=>{
    posicionarOpcoesToolbar(botao,botao.parentElement.querySelector('.toolbar-select-opcoes'));
  });
}
window.addEventListener('resize',reposicionarSeletoresAbertos);
document.addEventListener('scroll',evento=>{
  if(!evento.target.classList?.contains('toolbar-select-opcoes')) reposicionarSeletoresAbertos();
},true);
