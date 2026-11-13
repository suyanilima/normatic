// Mantém o adaptador opcional de documentos quando a tela é incorporada.
if(window.parent !== window) {
  try { if(window.parent.storage) window.storage = window.parent.storage; } catch(_) {}
}
