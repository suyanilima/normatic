begin;

-- Grava somente a coleção alterada. A revisão ainda protege contra edições simultâneas.
create or replace function public.normatic_commit_collection(expected_revision bigint, collection_name text, collection jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare current_revision bigint; field text; count_all integer; count_ids integer; stored_rows jsonb;
begin
  if coalesce(public.normatic_role(),'') not in ('admin','editor') then
    raise exception 'Você não possui permissão para alterar os dados da equipe.' using errcode='42501';
  end if;
  if collection_name not in ('documentos','unidades','reunioes','atas','projetos','responsaveis','tarefas','compromissos') then raise exception 'Coleção inválida.'; end if;
  if collection is null or jsonb_typeof(collection) <> 'array' then raise exception 'Coleção inválida.'; end if;
  select revision into current_revision from public.normatic_revision where singleton for update;
  if expected_revision is null or current_revision <> expected_revision then raise exception 'Os dados foram alterados por outra pessoa. Atualize antes de tentar novamente.' using errcode='40001'; end if;
  field := case when collection_name='unidades' then 'codigo' else 'id' end;
  if exists(select 1 from jsonb_array_elements(collection) e where jsonb_typeof(e)<>'object' or jsonb_typeof(e->field) is distinct from 'string' or coalesce(e->>field,'')='' or length(e->>field)>100) then raise exception 'Identificação inválida em %',collection_name; end if;
  select count(*),count(distinct e->>field) into count_all,count_ids from jsonb_array_elements(collection) e;
  if count_all <> count_ids then raise exception 'Identificações duplicadas em %',collection_name; end if;
  if collection_name='projetos' and exists (
    select 1 from public.normatic_projetos p where not exists(select 1 from jsonb_array_elements(collection) e where e->>'id'=p.id)
    and exists(select 1 from public.normatic_tarefas t where coalesce(t.payload->>'projeto_id','')='' and t.payload->>'projeto'=p.payload->>'nome')
  ) then raise exception 'Desvincule as tarefas antes de excluir o projeto.'; end if;
  execute format('delete from public.normatic_%I where id not in (select e->>%L from jsonb_array_elements($1) e)',collection_name,field) using collection;
  execute format('insert into public.normatic_%I as stored(id,payload,position,updated_by) select e->>%L,e,(pos-1)::integer,auth.uid() from jsonb_array_elements($1) with ordinality as input(e,pos) on conflict(id) do update set payload=excluded.payload,position=excluded.position,updated_by=excluded.updated_by,updated_at=now() where stored.payload is distinct from excluded.payload or stored.position is distinct from excluded.position',collection_name,field) using collection;
  update public.normatic_revision set revision=revision+1 where singleton;
  execute format('select coalesce(jsonb_agg(payload order by position,id),''[]''::jsonb) from public.normatic_%I',collection_name) into stored_rows;
  return jsonb_build_object('revision',current_revision+1,'collection',stored_rows);
end $$;
revoke all on function public.normatic_commit_collection(bigint,text,jsonb) from public, anon;
grant execute on function public.normatic_commit_collection(bigint,text,jsonb) to authenticated;
commit;
