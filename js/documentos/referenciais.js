/* Referenciais normativos e preenchimento livre. */
function atualizarOutroReferencial(prefixo){
  const outros=document.getElementById(prefixo+'-baselegal').value==='Outros';
  const campo=document.getElementById(prefixo+'-baselegal-outro');
  document.getElementById(prefixo+'-baselegal-outro-campo').hidden=!outros;
  campo.required=outros;
  campo.disabled=!outros;
  if(!outros) campo.value='';
  limparErroCampo(campo);
}
function definirReferencialDocumento(prefixo,valor=''){
  const select=document.getElementById(prefixo+'-baselegal');
  const conhecido=[...select.options].some(opcao=>opcao.value===valor && valor!=='Outros');
  select.value=conhecido?valor:(valor?'Outros':'');
  atualizarOutroReferencial(prefixo);
  if(!conhecido && valor) document.getElementById(prefixo+'-baselegal-outro').value=valor;
}
function obterReferencialDocumento(prefixo){
  const valor=document.getElementById(prefixo+'-baselegal').value;
  return valor==='Outros'?document.getElementById(prefixo+'-baselegal-outro').value.trim().slice(0,250):valor;
}
function validarOutroReferencial(prefixo){
  if(document.getElementById(prefixo+'-baselegal').value!=='Outros') return true;
  const campo=document.getElementById(prefixo+'-baselegal-outro');
  if(campo.value.trim() && campo.checkValidity()) return true;
  mostrarErroCampo(campo,'Informe o referencial normativo.');campo.focus();return false;
}
