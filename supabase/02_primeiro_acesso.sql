-- Primeiro crie a conta em Authentication > Users > Add user.
-- Substitua apenas o e-mail abaixo pelo da conta já criada. Nunca coloque senhas aqui.
do $$
declare account uuid;
begin
  select id into account from auth.users where lower(email)=lower('SEU_EMAIL_AQUI');
  if account is null then raise exception 'Crie primeiro a conta no painel Authentication e informe seu e-mail neste SQL.'; end if;
  insert into public.normatic_members(user_id,role,active) values(account,'admin',true)
    on conflict(user_id) do update set role=excluded.role,active=true;
end $$;
-- Para colegas já cadastrados no Authentication, use a consulta abaixo após editar o e-mail:
-- insert into public.normatic_members(user_id,role,active)
-- select id,'editor',true from auth.users where lower(email)=lower('EMAIL_DO_COLEGA')
-- on conflict(user_id) do update set role=excluded.role,active=true;
-- Troque 'editor' por 'viewer' para somente leitura.
