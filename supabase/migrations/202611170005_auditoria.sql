begin;

create table if not exists public.normatic_audit_events (
  id bigint generated always as identity primary key,
  occurred_at timestamptz not null default now(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('Acesso','Criação','Edição','Exclusão')),
  collection_name text not null,
  record_id text,
  record_label text
);
alter table public.normatic_audit_events enable row level security;
revoke all on public.normatic_audit_events from anon, authenticated;

create or replace function public.normatic_audit_change() returns trigger language plpgsql security definer set search_path = '' as $$
declare registro jsonb; identificador text; rotulo text;
begin
  -- Ignora atualizações que alteram somente posição/metadados sem mudar o conteúdo.
  if tg_op = 'UPDATE' and old.payload is not distinct from new.payload then return new; end if;
  registro:=case when tg_op='DELETE' then old.payload else new.payload end;
  identificador:=case when tg_op='DELETE' then old.id else new.id end;
  rotulo:=coalesce(registro->>'nome',registro->>'titulo',registro->>'pauta',registro->>'codigo',identificador);
  insert into public.normatic_audit_events(actor_id,action,collection_name,record_id,record_label)
  values(auth.uid(),case tg_op when 'INSERT' then 'Criação' when 'UPDATE' then 'Edição' else 'Exclusão' end,replace(tg_table_name,'normatic_',''),identificador,left(rotulo,250));
  if tg_op='DELETE' then return old; end if;
  return new;
end $$;
do $$ declare item text; begin
  foreach item in array array['documentos','unidades','reunioes','atas','projetos','responsaveis','tarefas','compromissos'] loop
    execute format('drop trigger if exists normatic_audit_change on public.normatic_%I',item);
    execute format('create trigger normatic_audit_change after insert or update or delete on public.normatic_%I for each row execute function public.normatic_audit_change()',item);
  end loop;
end $$;
create or replace function public.normatic_register_access() returns void language plpgsql security definer set search_path = '' as $$
begin
  if public.normatic_role() is null then raise exception 'Acesso restrito aos membros autorizados.' using errcode='42501'; end if;
  if not exists(select 1 from public.normatic_audit_events where actor_id=auth.uid() and action='Acesso' and occurred_at>now()-interval '30 minutes') then
    insert into public.normatic_audit_events(actor_id,action,collection_name,record_label) values(auth.uid(),'Acesso','Sistema','Login efetuado');
  end if;
end $$;
create or replace function public.normatic_audit_log(limit_rows integer default 200) returns table(occurred_at timestamptz,actor_email text,action text,collection_name text,record_id text,record_label text)
language sql stable security definer set search_path = '' as $$
  select e.occurred_at,u.email,e.action,e.collection_name,e.record_id,e.record_label from public.normatic_audit_events e left join auth.users u on u.id=e.actor_id where public.normatic_role()='admin' order by e.occurred_at desc limit least(greatest(coalesce(limit_rows,200),1),500)
$$;
revoke all on function public.normatic_register_access() from public,anon;
revoke all on function public.normatic_audit_log(integer) from public,anon;
grant execute on function public.normatic_register_access() to authenticated;
grant execute on function public.normatic_audit_log(integer) to authenticated;
commit;
