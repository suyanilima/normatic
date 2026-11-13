// Execute no Apps Script ANTIGO vinculado à planilha para exportar dados.
// Os JSONs ficam em seu Google Drive; não compartilhe os arquivos publicamente.
function exportarFarolJSON() {
  const nomes=['responsaveis','projetos','tarefas','agenda'];
  const ss=SpreadsheetApp.getActiveSpreadsheet();
  nomes.forEach(nome=>{
    const s=ss.getSheetByName(nome); if(!s)return;
    const rows=s.getDataRange().getDisplayValues();
    const cols=rows.shift();
    const objects=rows.filter(r=>r[0]).map(r=>Object.fromEntries(cols.map((c,i)=>[c,r[i]])));
    DriveApp.createFile('FAROL_'+nome+'.json',JSON.stringify(objects,null,2),'application/json');
  });
}
