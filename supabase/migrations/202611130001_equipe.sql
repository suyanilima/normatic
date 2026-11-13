begin;

-- Um projeto, uma equipe. Somente administradores do projeto gerenciam membros.
create table public.normatic_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'editor' check (role in ('admin','editor','viewer')),
  active boolean not null default true
);
alter table public.normatic_members enable row level security;
revoke all on public.normatic_members from anon, authenticated;
grant select on public.normatic_members to authenticated;
create policy normatic_own_membership on public.normatic_members for select to authenticated
  using (user_id = (select auth.uid()));

create function public.normatic_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.normatic_members where user_id = (select auth.uid()) and active
$$;
revoke all on function public.normatic_role() from public, anon;
grant execute on function public.normatic_role() to authenticated;

create table public.normatic_revision (
  singleton boolean primary key default true check (singleton),
  revision bigint not null default 0
);
insert into public.normatic_revision(singleton) values (true);
alter table public.normatic_revision enable row level security;
revoke all on public.normatic_revision from anon, authenticated;
grant select on public.normatic_revision to authenticated;
create policy normatic_revision_read on public.normatic_revision for select to authenticated
  using ((select public.normatic_role()) is not null);

-- Payloads individuais preservam todos os campos, inclusive histórico e texto das atas.
-- IDs legados são textuais; não renumerar registros durante a importação.
do $$
declare item text;
begin
  foreach item in array array['documentos','unidades','reunioes','atas','projetos','responsaveis','tarefas','compromissos'] loop
    execute format('create table public.normatic_%I (
      id text primary key check (id ~ ''^[A-Za-z0-9][A-Za-z0-9:_ .-]{0,99}$''),
      payload jsonb not null check (jsonb_typeof(payload) = ''object''),
      position integer not null default 0,
      updated_at timestamptz not null default now(),
      updated_by uuid references auth.users(id)
    )',item);
    execute format('alter table public.normatic_%I enable row level security',item);
    execute format('revoke all on public.normatic_%I from anon, authenticated',item);
    execute format('grant select on public.normatic_%I to authenticated',item);
    execute format('create policy normatic_team_read on public.normatic_%I for select to authenticated using ((select public.normatic_role()) is not null)',item);
  end loop;
end $$;

alter table public.normatic_tarefas add column projeto_id text
  generated always as (nullif(payload->>'projeto_id','')) stored
  references public.normatic_projetos(id) deferrable initially deferred;
create unique index normatic_responsaveis_nome on public.normatic_responsaveis ((payload->>'nome'));
create index normatic_reunioes_data on public.normatic_reunioes ((payload->>'data'));
create index normatic_compromissos_data on public.normatic_compromissos ((payload->>'data'));

create function public.normatic_snapshot() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare result jsonb := '{}'::jsonb; item text; rows jsonb; rev bigint; membership text;
begin
  membership := public.normatic_role();
  if membership is null then raise exception 'Acesso restrito aos membros autorizados da equipe.' using errcode='42501'; end if;
  select revision into rev from public.normatic_revision where singleton for share;
  foreach item in array array['documentos','unidades','reunioes','atas','projetos','responsaveis','tarefas','compromissos'] loop
    execute format('select coalesce(jsonb_agg(payload order by position,id),''[]''::jsonb) from public.normatic_%I',item) into rows;
    result := result || jsonb_build_object(item,rows);
  end loop;
  return jsonb_build_object('revision',rev,'role',membership,'collections',result);
end $$;
revoke all on function public.normatic_snapshot() from public, anon;
grant execute on function public.normatic_snapshot() to authenticated;

-- É a única entrada de escrita. RLS não oferece escrita direta aos clientes.
create function public.normatic_commit(expected_revision bigint, collections jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare item text; current_revision bigint; field text; count_all integer; count_ids integer;
begin
  if coalesce(public.normatic_role(),'') not in ('admin','editor') then
    raise exception 'Você não possui permissão para alterar os dados da equipe.' using errcode='42501';
  end if;
  select revision into current_revision from public.normatic_revision where singleton for update;
  if expected_revision is null or current_revision <> expected_revision then
    raise exception 'Os dados foram alterados por outra pessoa. Atualize antes de tentar novamente.' using errcode='40001';
  end if;
  if collections is null or jsonb_typeof(collections) <> 'object' then raise exception 'Conjunto de dados inválido.'; end if;
  foreach item in array array['documentos','unidades','reunioes','atas','projetos','responsaveis','tarefas','compromissos'] loop
    if not (collections ? item) or jsonb_typeof(collections->item) <> 'array' then raise exception 'Coleção ausente ou inválida: %',item; end if;
    field := case when item='unidades' then 'codigo' else 'id' end;
    if exists(select 1 from jsonb_array_elements(collections->item) e where jsonb_typeof(e)<>'object' or jsonb_typeof(e->field) is distinct from 'string' or coalesce(e->>field,'')='' or length(e->>field)>100) then
      raise exception 'Identificação inválida em %',item;
    end if;
    select count(*),count(distinct e->>field) into count_all,count_ids from jsonb_array_elements(collections->item) e;
    if count_all <> count_ids then raise exception 'Identificações duplicadas em %',item; end if;
  end loop;
  -- Não excluir projetos que ainda são referenciados pelo vínculo legado por nome.
  if exists (
    select 1 from public.normatic_projetos p
    where not exists(select 1 from jsonb_array_elements(collections->'projetos') e where e->>'id'=p.id)
      and exists(select 1 from jsonb_array_elements(collections->'tarefas') t
        where coalesce(t->>'projeto_id','')='' and t->>'projeto'=p.payload->>'nome')
  ) then raise exception 'Desvincule as tarefas antes de excluir o projeto.'; end if;

  -- As FKs são verificadas no final da transação; o lote nunca fica parcialmente salvo.
  foreach item in array array['tarefas','atas','reunioes','unidades','compromissos','responsaveis','projetos','documentos'] loop
    field := case when item='unidades' then 'codigo' else 'id' end;
    execute format('delete from public.normatic_%I where id not in (select e->>%L from jsonb_array_elements($1) e)',item,field) using collections->item;
  end loop;
  foreach item in array array['projetos','responsaveis','unidades','reunioes','documentos','compromissos','tarefas','atas'] loop
    field := case when item='unidades' then 'codigo' else 'id' end;
    execute format('insert into public.normatic_%I as stored(id,payload,position,updated_by)
      select e->>%L,e,(pos-1)::integer,auth.uid() from jsonb_array_elements($1) with ordinality as input(e,pos)
      on conflict(id) do update set payload=excluded.payload,position=excluded.position,updated_by=excluded.updated_by,updated_at=now()
      where stored.payload is distinct from excluded.payload or stored.position is distinct from excluded.position',item,field) using collections->item;
  end loop;
  update public.normatic_revision set revision=revision+1 where singleton;
  return public.normatic_snapshot();
end $$;
revoke all on function public.normatic_commit(bigint,jsonb) from public, anon;
grant execute on function public.normatic_commit(bigint,jsonb) to authenticated;
grant usage on schema public to authenticated;
commit;
