begin;
-- Também protege as RPCs SECURITY DEFINER: todas verificam normatic_role().
-- RLS das tabelas usa a mesma função, bloqueando leitura direta com senha apenas.
create or replace function public.normatic_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.normatic_members
  where user_id = (select auth.uid()) and active
    and coalesce((select auth.jwt())->>'aal','') = 'aal2'
$$;
revoke all on function public.normatic_role() from public, anon;
grant execute on function public.normatic_role() to authenticated;
commit;
