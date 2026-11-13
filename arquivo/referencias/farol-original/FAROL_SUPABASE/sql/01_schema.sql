-- FAROL: executar no SQL Editor do Supabase. Projeto dedicado recomendado.
create extension if not exists pgcrypto;
create table if not exists public.projetos (id text primary key default gen_random_uuid()::text, nome text not null, objetivo text, status text default 'Ativo', responsavel text, prazo text, prioridade text default 'Média');
create table if not exists public.responsaveis (id text primary key default gen_random_uuid()::text, nome text not null, email text, ativo text default 'Sim');
create table if not exists public.tarefas (id text primary key default gen_random_uuid()::text, titulo text not null, projeto_id text references public.projetos(id), responsavel text, prioridade text default 'Média', status text default 'A fazer', prazo text, observacoes text, lembrete_minutos text, calendar_event_id text, enviar_convite text default 'Não');
create table if not exists public.agenda (id text primary key default gen_random_uuid()::text, titulo text not null, data text, hora text, hora_fim text, tipo text, responsavel text, observacoes text, lembrete_minutos text, calendar_event_id text, enviar_convite text default 'Não');
-- Acesso exclusivo a contas autenticadas e previamente autorizadas.
create table if not exists public.usuarios_autorizados (email text primary key);
alter table public.usuarios_autorizados enable row level security;
-- Não criar policy de leitura desta tabela: funções SECURITY DEFINER consultam a lista.
create or replace function public.farol_autorizado() returns boolean language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.usuarios_autorizados where lower(email)=lower(coalesce((select auth.jwt())->>'email','')))
$$;
revoke all on function public.farol_autorizado() from public;
grant execute on function public.farol_autorizado() to authenticated;
alter table public.projetos enable row level security;
drop policy if exists farol_equipe on public.projetos;
create policy farol_equipe on public.projetos for all to authenticated using (public.farol_autorizado()) with check (public.farol_autorizado());
alter table public.tarefas enable row level security;
drop policy if exists farol_equipe on public.tarefas;
create policy farol_equipe on public.tarefas for all to authenticated using (public.farol_autorizado()) with check (public.farol_autorizado());
alter table public.agenda enable row level security;
drop policy if exists farol_equipe on public.agenda;
create policy farol_equipe on public.agenda for all to authenticated using (public.farol_autorizado()) with check (public.farol_autorizado());
alter table public.responsaveis enable row level security;
drop policy if exists farol_equipe on public.responsaveis;
create policy farol_equipe on public.responsaveis for all to authenticated using (public.farol_autorizado()) with check (public.farol_autorizado());
-- SUBSTITUA pelo e-mail real de quem terá acesso, antes do primeiro login:
-- insert into public.usuarios_autorizados(email) values ('supervisora@exemplo.gov.br'),('voce@exemplo.com') on conflict do nothing;
-- Habilite Realtime nas quatro tabelas pelo painel Database > Publications > supabase_realtime.
