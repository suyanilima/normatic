/* ===== EXCLUSAO ===== */

async function excluir(id){
  const doc = docs.find(d=>d.id===id);
  if(!doc) return;
  excluindoId = id;
  if(window.parent && window.parent !== window && typeof window.parent.pedirConfirmacaoExclusao === 'function'){
    const confirmado = await window.parent.pedirConfirmacaoExclusao({
      titulo: 'Excluir documento?',
      mensagem: `Tem certeza que deseja excluir "${doc.nome}"? Essa ação não pode ser desfeita.`,
      textoBotao: 'Excluir'
    });
    if(confirmado) await confirmarExclusao();
    else excluindoId = null;
    return;
  }
  document.getElementById('delete-doc-nome').textContent = doc.nome;
  abrirModalElemento('delete-modal-overlay');
}

function fecharModalExcluir(){
  fecharModalElemento('delete-modal-overlay');
  excluindoId = null;
}

async function confirmarExclusao(){
  const doc = docs.find(d=>d.id===excluindoId);
  if(!doc){ fecharModalExcluir(); return; }
  const anteriores = docs;
  docs = docs.filter(d=>d.id!==excluindoId);
  if(!await salvar()){
    docs = anteriores;
    return;
  }
  render();
  fecharModalExcluir();
  toast(`<b>${escapeHtml(doc.nome)}</b> foi excluído.`, 'vencido');
}

let editandoId = null;

