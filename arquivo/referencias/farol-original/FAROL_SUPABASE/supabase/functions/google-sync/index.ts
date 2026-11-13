import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
const env=(k:string)=>Deno.env.get(k)||'';
async function googleToken(){
 const body=new URLSearchParams({client_id:env('GOOGLE_CLIENT_ID'),client_secret:env('GOOGLE_CLIENT_SECRET'),refresh_token:env('GOOGLE_REFRESH_TOKEN'),grant_type:'refresh_token'});
 const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',body});const d=await r.json();if(!r.ok) throw Error('Falha OAuth Google: '+JSON.stringify(d));return d.access_token as string;
}
async function google(url:string,token:string,method='GET',body?:unknown){
 const r=await fetch(url,{method,headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:body===undefined?undefined:JSON.stringify(body)});
 if(!r.ok){const detail=await r.text();if(r.status===404 && method==='DELETE')return null;throw Error('Google API '+r.status+': '+detail.slice(0,350));}
 return r.status===204?null:await r.json();
}
const iso=(day:string,time:string)=>`${day}T${time}:00-05:00`;
serve(async req=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 try{
  const auth=req.headers.get('Authorization')||'';
  if(!auth.startsWith('Bearer '))throw Error('Autenticação obrigatória');
  const admin=createClient(env('SUPABASE_URL'),env('SUPABASE_SERVICE_ROLE_KEY'));
  const {data:{user},error}=await admin.auth.getUser(auth.slice(7));if(error||!user?.email)throw Error('Sessão inválida');
  const {data:allowed,error:allowError}=await admin.from('usuarios_autorizados').select('email').ilike('email',user.email).maybeSingle();
  if(allowError||!allowed)throw Error('Usuário não autorizado');
  const {table,record,action='upsert'}=await req.json();
  if(!['agenda','tarefas'].includes(table)||!record?.id)throw Error('Registro inválido');
  // O banco é a fonte de verdade. Não confiar em campos enviados pelo navegador.
  const {data:stored}=await admin.from(table).select('*').eq('id',record.id).maybeSingle();
  if(action!=='delete' && !stored)throw Error('Registro não encontrado');
  const item=stored||record;
  if(!env('GOOGLE_REFRESH_TOKEN'))return Response.json({status:'erro',message:'Integração Google não configurada'},{headers:cors});
  const token=await googleToken();
  const calendarId=encodeURIComponent(env('GOOGLE_CALENDAR_ID')||'primary');
  const base=`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events`;
  const eventId=item.calendar_event_id;
  if(action==='delete'||item.enviar_convite!=='Sim'||(table==='tarefas'&&item.status==='Concluída')){
    if(eventId)await google(base+'/'+encodeURIComponent(eventId),token,'DELETE');
    if(stored && eventId)await admin.from(table).update({calendar_event_id:null}).eq('id',item.id);
    return Response.json({status:eventId?'removido':'ignorado'},{headers:cors});
  }
  const day=table==='tarefas'?item.prazo:item.data;
  if(!day)return Response.json({status:'ignorado'},{headers:cors});
  const start=table==='tarefas'?'09:00':item.hora;
  const end=table==='tarefas'?'10:00':(item.hora_fim||'');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end)||end<=start)throw Error('Data/horário inválido');
  const {data:person}=await admin.from('responsaveis').select('email').eq('nome',item.responsavel||'').eq('ativo','Sim').maybeSingle();
  const attendees=person?.email?[{email:person.email}]:[];
  const event={summary:(table==='tarefas'?'[FAROL] ':'')+item.titulo,description:[item.observacoes,'Responsável: '+(item.responsavel||'')].filter(Boolean).join('\n'),start:{dateTime:iso(day,start),timeZone:'America/Rio_Branco'},end:{dateTime:iso(day,end),timeZone:'America/Rio_Branco'},attendees,reminders:{useDefault:false,overrides:[{method:'popup',minutes:1440},{method:'popup',minutes:60}]}};
  let result;let status='criado';
  if(eventId){
    try{result=await google(base+'/'+encodeURIComponent(eventId)+'?sendUpdates=all',token,'PUT',event);status='atualizado';}
    catch(e){if(!String(e).includes('404'))throw e;}
  }
  if(!result)result=await google(base+'?sendUpdates=all',token,'POST',event);
  if(stored && result?.id)await admin.from(table).update({calendar_event_id:result.id}).eq('id',item.id);
  return Response.json({status},{headers:cors});
 }catch(e){return Response.json({status:'erro',message:String(e instanceof Error?e.message:e)},{status:400,headers:cors});}
});
