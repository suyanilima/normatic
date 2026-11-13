import {createHash} from 'node:crypto';

const normalize = value => String(value || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const validEmail = value => typeof value === 'string' && /^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(value) && value.length <= 254;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
function validDate(value) {
  return typeof value === 'string' && datePattern.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
export function localClock(now) {
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-CA', {timeZone: 'America/Rio_Branco', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'}).formatToParts(now).map(part => [part.type, part.value]));
  return {day: `${parts.year}-${parts.month}-${parts.day}`, time: `${parts.hour}:${parts.minute}`};
}
export function planReminders({tarefas = [], reunioes = [], responsaveis = []}, now = new Date()) {
  const {day, time} = localClock(now);
  const tomorrow = new Date(Date.parse(day) + 86400000).toISOString().slice(0, 10);
  const directory = new Map(), groups = new Map();
  let missingContacts = 0;
  for (const person of responsaveis) {
    if (normalize(person.ativo) === 'nao' || !validEmail(person.email?.trim())) continue;
    const name = normalize(person.nome);
    if (!name) continue;
    if (!directory.has(name)) directory.set(name, new Set());
    directory.get(name).add(person.email.trim().toLowerCase());
  }
  function recipient(name) {
    const matches = directory.get(normalize(String(name || '').replace(/\s*\([^()]*\)\s*$/, '')));
    if (matches?.size !== 1) { missingContacts++; return null; }
    return [...matches][0];
  }
  function append(email, item) {
    if (!email) return;
    if (!groups.has(email)) groups.set(email, new Map());
    groups.get(email).set(`${item.type}:${item.id}`, item);
  }
  for (const task of tarefas) {
    if (normalize(task.enviar_convite) !== 'sim' || normalize(task.status) === 'concluida' || !validDate(task.prazo) || ![day, tomorrow].includes(task.prazo)) continue;
    append(recipient(task.responsavel), {type: 'Tarefa', id: task.id, title: String(task.titulo || 'Tarefa'), date: task.prazo, when: task.prazo === day ? 'vence hoje' : 'vence amanhã'});
  }
  for (const meeting of reunioes) {
    if (meeting.cancelada || normalize(meeting.situacao) === 'cancelada' || !validDate(meeting.data) || ![day, tomorrow].includes(meeting.data)) continue;
    if (meeting.data === day && /^\d{2}:\d{2}$/.test(meeting.horario || '') && meeting.horario <= time) continue;
    const guests = Array.isArray(meeting.convidados) ? meeting.convidados : Array.isArray(meeting.participantes) ? meeting.participantes : [];
    const names = [...(Array.isArray(meeting.membros) ? meeting.membros.map(member => member.nome) : []), ...guests].filter(Boolean);
    for (const name of new Set(names)) append(recipient(name), {type: 'Reunião', id: meeting.id, title: String(meeting.pauta || meeting.frequencia || 'Reunião'), date: meeting.data, time: String(meeting.horario || ''), when: meeting.data === day ? 'hoje' : 'amanhã'});
  }
  return {day, missingContacts, digests: [...groups].map(([email, items]) => ({email, items: [...items.values()]}))};
}
export function digestMessage(digest, day, from, appUrl) {
  const lines = ['Olá!', '', 'Seus lembretes do Normatic:', '', ...digest.items.map(item => `${item.type}: ${item.title}\n${item.when} — ${item.date.split('-').reverse().join('/')}${item.time ? ' às ' + item.time : ''}\n`)];
  if (appUrl) { const url = new URL(appUrl); if (url.protocol !== 'https:') throw Error('APP_URL deve usar HTTPS'); lines.push('Acesse: ' + url.href); }
  lines.push('', 'Para corrigir o destinatário, revise os cadastros de Responsáveis e da atividade no Normatic.');
  return {from, to: [digest.email], subject: `Normatic — tarefas e reuniões de ${day.split('-').reverse().join('/')}`, text: lines.join('\n')};
}
export const deliveryKey = (day, email) => createHash('sha256').update(`${day}:${email.toLowerCase()}`).digest('hex');
