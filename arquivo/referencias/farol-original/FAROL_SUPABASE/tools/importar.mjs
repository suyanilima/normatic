// node tools/importar.mjs; requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
import fs from 'node:fs';
const base=process.env.SUPABASE_URL, key=process.env.SUPABASE_SERVICE_ROLE_KEY;
if(!base||!key)throw Error('Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no terminal.');
for(const table of ['responsaveis','projetos','tarefas','agenda']) {
 const file=`FAROL_${table}.json`;if(!fs.existsSync(file)){console.log('Ignorando',file);continue;}
 const rows=JSON.parse(fs.readFileSync(file,'utf8'));
 for(let i=0;i<rows.length;i+=100){
  const batch=rows.slice(i,i+100).map(r=>Object.fromEntries(Object.entries(r).map(([k,v])=>[k,v===''?null:v])));
  const res=await fetch(`${base}/rest/v1/${table}?on_conflict=id`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'resolution=merge-duplicates'},body:JSON.stringify(batch)});
  if(!res.ok)throw Error(`${table}: ${res.status} ${await res.text()}`);
 }
 console.log(table,rows.length,'registros importados');
}
