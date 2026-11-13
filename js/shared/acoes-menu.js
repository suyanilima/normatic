/* Menu de ações compartilhado. O painel abre no body para não ser cortado por tabelas. */
let menuAcoesAberto = null;
function fecharMenusAcoes(devolverFoco = false) {
  if(!menuAcoesAberto) return;
  const {menu, botao, marcador} = menuAcoesAberto;
  menu.classList.remove('open', 'above');
  menu.removeAttribute('style');
  if(marcador.parentNode) marcador.replaceWith(menu);
  else menu.remove();
  botao.classList.remove('open');
  botao.setAttribute('aria-expanded', 'false');
  menuAcoesAberto = null;
  if(devolverFoco && botao.isConnected) botao.focus();
}
function posicionarMenuAcoes(menu, botao) {
  const rect = botao.getBoundingClientRect();
  let limiteSuperior = 12, limiteInferior = window.innerHeight - 12;
  // O componente documental compartilha a rolagem da plataforma.
  if(window.frameElement) {
    const frame = window.frameElement.getBoundingClientRect();
    limiteSuperior = Math.max(12,12-frame.top);
    limiteInferior = Math.min(limiteInferior,window.parent.innerHeight-frame.top-12);
  }
  const largura = Math.min(216, Math.max(0, window.innerWidth - 24));
  menu.style.cssText = `position:fixed;inset:auto;bottom:auto;width:${largura}px;min-width:0;max-height:${Math.max(80, limiteInferior-limiteSuperior)}px;overflow-y:auto;z-index:1100`;
  const altura = menu.offsetHeight || 160;
  const abaixo = rect.bottom + 6;
  const top = abaixo + altura <= limiteInferior ? abaixo : Math.max(limiteSuperior, rect.top - altura - 6);
  menu.style.top = `${top}px`;
  menu.style.left = `${Math.max(12, Math.min(rect.right - largura, window.innerWidth - largura - 12))}px`;
}
function toggleAcoes(evento, id) {
  evento.stopPropagation();
  const menu = document.getElementById('acoes-' + id);
  const botao = evento.currentTarget;
  if(!menu || !botao) return;
  const mesmo = menuAcoesAberto?.menu === menu;
  fecharMenusAcoes();
  if(mesmo) return;
  const marcador = document.createComment('posição do menu');
  menu.before(marcador);
  document.body.appendChild(menu);
  menuAcoesAberto = {menu, botao, marcador};
  menu.setAttribute('role', 'menu');
  menu.setAttribute('aria-label', 'Ações do registro');
  menu.querySelectorAll('button').forEach(item => item.setAttribute('role', 'menuitem'));
  menu.classList.add('open');
  botao.classList.add('open');
  botao.setAttribute('aria-expanded', 'true');
  botao.setAttribute('aria-haspopup', 'menu');
  botao.setAttribute('aria-controls', menu.id);
  posicionarMenuAcoes(menu, botao);
  menu.querySelector('button')?.focus();
}
document.addEventListener('click', evento => {
  if(menuAcoesAberto && !evento.target.closest?.('.actions-toggle')) fecharMenusAcoes();
});
document.addEventListener('keydown', evento => {
  if(!menuAcoesAberto) return;
  if(evento.key === 'Escape') { evento.preventDefault(); fecharMenusAcoes(true); return; }
  if(evento.key === 'Tab') { fecharMenusAcoes(true); return; }
  if(!['ArrowDown','ArrowUp','Home','End'].includes(evento.key)) return;
  evento.preventDefault();
  const itens = [...menuAcoesAberto.menu.querySelectorAll('button:not(:disabled)')];
  const indice = itens.indexOf(document.activeElement);
  const proximo = evento.key === 'Home' ? 0 : evento.key === 'End' ? itens.length-1 : (indice + (evento.key === 'ArrowUp' ? -1 : 1) + itens.length) % itens.length;
  itens[proximo]?.focus();
});
window.addEventListener('resize', () => fecharMenusAcoes());
document.addEventListener('scroll', evento => {
  if(menuAcoesAberto && !menuAcoesAberto.menu.contains(evento.target)) fecharMenusAcoes();
}, true);
