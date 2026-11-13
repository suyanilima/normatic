// Contrato do componente documental com a navegação única, na mesma origem.
if(window.parent !== window) {
  const origem = parent.location.origin === 'null' ? '*' : parent.location.origin;
  const trocarAba = setTab;
  setTab = function(tab, options = {}) {
    trocarAba(tab, {...options,semHistorico:true});
    if(!options.plataforma && ['dashboard','acompanhamento','cadastro'].includes(tab)) {
      parent.postMessage({canal:'normatic:documental',acao:'navegar',tab}, origem);
    }
  };
  let agendado = false;
  function informarAltura() {
    if(agendado || !document?.body) return;
    agendado = true;
    requestAnimationFrame(() => {
      agendado = false;
      if(!document?.body || !parent.document?.body) return;
      const modal = !!document.querySelector('[id$="modal-overlay"].open');
      parent.postMessage({canal:'normatic:documental',acao:'altura',modal,altura:Math.max(160,document.body.scrollHeight+16)}, origem);
    });
  }
  new MutationObserver(informarAltura).observe(document.body,{childList:true,subtree:true,attributes:true,characterData:true});
  if(typeof ResizeObserver === 'function') new ResizeObserver(informarAltura).observe(document.body);
  window.addEventListener('resize', informarAltura);
  window.addEventListener('storage', event => { if(event.key === STORAGE_KEY) carregar(); });
  window.addEventListener('load', informarAltura);
  informarAltura();
}
