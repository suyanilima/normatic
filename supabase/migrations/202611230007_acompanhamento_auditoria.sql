begin;

-- Tabela para Acompanhamento de Recomendações de Auditoria (SEAPTIC - COAUDI e novas auditorias).
create table if not exists public.normatic_auditorias (
  id text primary key check (id ~ '^[A-Za-z0-9][A-Za-z0-9:_ .-]{0,99}$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object'),
  position integer not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.normatic_auditorias enable row level security;
revoke all on public.normatic_auditorias from anon, authenticated;
grant select on public.normatic_auditorias to authenticated;

drop policy if exists normatic_team_read on public.normatic_auditorias;
create policy normatic_team_read on public.normatic_auditorias for select to authenticated
  using ((select public.normatic_role()) is not null);

-- Aplica a exigência de MFA (AAL2) caso a função/política já esteja em uso no projeto.
drop policy if exists normatic_enforce_mfa on public.normatic_auditorias;
create policy normatic_enforce_mfa on public.normatic_auditorias as restrictive for all to authenticated
  using ((select auth.jwt()->>'aal') = 'aal2');

-- Registra alterações na trilha de auditoria do sistema, caso a migração 005 já tenha sido aplicada.
do $$
begin
  if to_regprocedure('public.normatic_audit_change()') is not null then
    execute 'drop trigger if exists normatic_audit_change on public.normatic_auditorias';
    execute 'create trigger normatic_audit_change after insert or update or delete on public.normatic_auditorias for each row execute function public.normatic_audit_change()';
  end if;
end $$;

create or replace function public.normatic_auditorias_list() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare rows jsonb;
begin
  if public.normatic_role() is null then
    raise exception 'Acesso restrito aos membros autorizados da equipe.' using errcode = '42501';
  end if;
  select coalesce(jsonb_agg(payload order by position, id), '[]'::jsonb) into rows from public.normatic_auditorias;
  return rows;
end $$;

create or replace function public.normatic_auditorias_save(items jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare count_all integer; count_ids integer; stored_rows jsonb;
begin
  if coalesce(public.normatic_role(), '') not in ('admin', 'editor') then
    raise exception 'Você não possui permissão para alterar os dados da equipe.' using errcode = '42501';
  end if;
  if items is null or jsonb_typeof(items) <> 'array' then
    raise exception 'Lista de auditorias inválida.';
  end if;
  if exists (
    select 1 from jsonb_array_elements(items) e
    where jsonb_typeof(e) <> 'object'
       or jsonb_typeof(e->'id') is distinct from 'string'
       or coalesce(e->>'id', '') = ''
       or length(e->>'id') > 100
  ) then
    raise exception 'Identificação inválida em auditorias.';
  end if;
  select count(*), count(distinct e->>'id') into count_all, count_ids from jsonb_array_elements(items) e;
  if count_all <> count_ids then
    raise exception 'Identificações duplicadas em auditorias.';
  end if;

  delete from public.normatic_auditorias
  where id not in (select e->>'id' from jsonb_array_elements(items) e);

  insert into public.normatic_auditorias as stored (id, payload, position, updated_by)
  select e->>'id', e, (pos - 1)::integer, auth.uid()
  from jsonb_array_elements(items) with ordinality as input(e, pos)
  on conflict (id) do update
    set payload = excluded.payload,
        position = excluded.position,
        updated_by = excluded.updated_by,
        updated_at = now()
    where stored.payload is distinct from excluded.payload
       or stored.position is distinct from excluded.position;

  select coalesce(jsonb_agg(payload order by position, id), '[]'::jsonb) into stored_rows from public.normatic_auditorias;
  return stored_rows;
end $$;

revoke all on function public.normatic_auditorias_list() from public, anon;
revoke all on function public.normatic_auditorias_save(jsonb) from public, anon;
grant execute on function public.normatic_auditorias_list() to authenticated;
grant execute on function public.normatic_auditorias_save(jsonb) to authenticated;

commit;
