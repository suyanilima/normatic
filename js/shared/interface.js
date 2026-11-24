/* ===== INTERAÇÕES COMPARTILHADAS DA INTERFACE ===== */

function toast(html, kind){
  const t = document.getElementById('toast');
  t.innerHTML = html;
  t.className = kind || '';
  t.style.display = 'block';
  clearTimeout(t._timer);
  t._timer = setTimeout(()=> t.style.display='none', 4200);
}

let focoAntesDoModal = null;

function sincronizarBackdropModalPai(aberto){
  try {
    if(window.parent && window.parent !== window && window.parent.document?.body){
      window.parent.document.documentElement.classList.toggle('iframe-modal-aberto', Boolean(aberto));
      window.parent.document.body.classList.toggle('iframe-modal-aberto', Boolean(aberto));
    }
  } catch(_) {}
}

function abrirModalElemento(id){
  const overlay = document.getElementById(id);
  if(!overlay) return;
  inicializarContadoresCaracteres(overlay);
  focoAntesDoModal = document.activeElement;
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.documentElement.classList.add('modal-aberto');
  document.body.classList.add('modal-aberto');
  sincronizarBackdropModalPai(true);
  if(typeof sincronizarSeletoresPersonalizados === 'function') sincronizarSeletoresPersonalizados();
  requestAnimationFrame(() => overlay.querySelector('.modal')?.focus());
}

function fecharModalElemento(id){
  const overlay = document.getElementById(id);
  if(!overlay) return;
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  if(!document.querySelector('[id$="modal-overlay"].open')) {
    document.documentElement.classList.remove('modal-aberto');
    document.body.classList.remove('modal-aberto');
    sincronizarBackdropModalPai(false);
  }
  focoAntesDoModal?.focus?.();
  focoAntesDoModal = null;
}

document.addEventListener('keydown', event => {
  if(event.key !== 'Escape') return;
  const aberto = document.querySelector('[id$="modal-overlay"].open');
  if(!aberto) return;
  const fechadores = {
    'modal-overlay': 'fecharModal',
    'delete-modal-overlay': 'fecharModalExcluir',
    'delete-reuniao-modal-overlay': 'fecharModalExcluirReuniao',
    'delete-minuta-modal-overlay': 'fecharModalExcluirMinuta',
    'delete-registro-modal-overlay': 'cancelarConfirmacaoExclusao',
    'exportar-ata-modal-overlay': 'fecharModalExportarAta',
    'edit-reuniao-modal-overlay': 'fecharModalEditarReuniao',
    'cancelar-reuniao-modal-overlay': 'fecharCancelamentoReuniao',
    'agenda-dia-reuniao-modal-overlay': 'fecharAgendaDiaCalendario',
    'resumo-reuniao-modal-overlay': 'fecharResumoReuniao',
    'unidade-modal-overlay': 'fecharCadastroUnidade',
    'delete-unidade-modal-overlay': 'fecharExclusaoUnidade',
    'remarcar-reuniao-modal-overlay': 'fecharRemarcacaoReuniao',
    'tabela-minuta-modal-overlay': 'fecharConfiguracaoTabelaMinuta',
    'edit-modal-overlay': 'fecharModalEditar',
    'resumo-modal-overlay': 'fecharModalResumo',
    'notificar-modal-overlay': 'fecharModalNotificar',
    'historico-modal-overlay': 'fecharModalHistorico'
  };
  const fechar = window[fechadores[aberto.id]];
  if(typeof fechar === 'function') fechar();
});

let _resolverConfirmacaoExclusao = null;

function pedirConfirmacaoExclusao({ titulo = 'Excluir registro?', mensagem = 'Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.', textoBotao = 'Excluir' } = {}){
  const overlay = document.getElementById('delete-registro-modal-overlay');
  if(!overlay) return Promise.resolve(typeof window.confirm === 'function' ? window.confirm(mensagem) : true);
  if(_resolverConfirmacaoExclusao){
    const anterior = _resolverConfirmacaoExclusao;
    _resolverConfirmacaoExclusao = null;
    anterior(false);
  }
  const elTitulo = document.getElementById('confirm-exclusao-titulo');
  const elMensagem = document.getElementById('confirm-exclusao-mensagem');
  const elOk = document.getElementById('confirm-exclusao-ok');
  if(elTitulo) elTitulo.textContent = titulo;
  if(elMensagem) elMensagem.textContent = mensagem;
  if(elOk) elOk.textContent = textoBotao;
  abrirModalElemento('delete-registro-modal-overlay');
  return new Promise(resolve => { _resolverConfirmacaoExclusao = resolve; });
}

function confirmarConfirmacaoExclusao(){
  const resolver = _resolverConfirmacaoExclusao;
  _resolverConfirmacaoExclusao = null;
  fecharModalElemento('delete-registro-modal-overlay');
  if(resolver) resolver(true);
}

function cancelarConfirmacaoExclusao(){
  const resolver = _resolverConfirmacaoExclusao;
  _resolverConfirmacaoExclusao = null;
  fecharModalElemento('delete-registro-modal-overlay');
  if(resolver) resolver(false);
}

function inicializarLimpezaErrosCampos(){
  document.querySelectorAll('input, select, textarea').forEach(campo => {
    campo.addEventListener('input', () => limparErroCampo(campo));
    campo.addEventListener('change', () => limparErroCampo(campo));
  });
}

function escapeHtml(s){
  return String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

// Primeiro serializa como string JavaScript, depois protege o atributo HTML.
// escapeHtml isoladamente não protege aspas interpretadas por um handler.
function argumentoJsHtml(valor){
  return escapeHtml(JSON.stringify(String(valor ?? '')).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029'));
}

function atualizarContadorCampo(campo){
  if(!campo || campo.readOnly || campo.disabled || campo.type === 'hidden') return;
  const limite = Number(campo.maxLength);
  if(!Number.isFinite(limite) || limite <= 0) return;
  let contador = campo.nextElementSibling;
  if(!contador?.classList?.contains('contador-caracteres') && !contador?.classList?.contains('contador-caracteres-campo')){
    contador = document.createElement('div');
    contador.className = 'contador-caracteres-campo';
    contador.setAttribute('aria-live', 'polite');
    campo.insertAdjacentElement('afterend', contador);
  }
  const quantidade = String(campo.value || '').length;
  contador.textContent = `${quantidade}/${limite}`;
  contador.classList.toggle('proximo-limite', quantidade >= Math.ceil(limite * .9));
  campo.dataset.contadorCaracteres = 'ativo';
}

function inicializarContadoresCaracteres(raiz = document){
  raiz.querySelectorAll?.('textarea[maxlength]').forEach(atualizarContadorCampo);
}

document.addEventListener('input', evento => {
  if(evento.target?.matches?.('textarea[maxlength]')) atualizarContadorCampo(evento.target);
});

document.addEventListener('focusin', evento => {
  if(evento.target?.matches?.('textarea[maxlength]')) atualizarContadorCampo(evento.target);
});

function inicializarInterfaceCompartilhada(){
  inicializarLimpezaErrosCampos();
  inicializarContadoresCaracteres();
  if(typeof MutationObserver === 'function'){
    new MutationObserver(mudancas => mudancas.forEach(mudanca => mudanca.addedNodes.forEach(no => {
      if(no.nodeType !== 1) return;
      if(no.matches?.('textarea[maxlength]')) atualizarContadorCampo(no);
      inicializarContadoresCaracteres(no);
    }))).observe(document.body, {childList:true, subtree:true});
  }
}
