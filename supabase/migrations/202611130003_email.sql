begin;
-- Histórico de resumos diários; exclusivo do servidor, fora do snapshot da equipe.
create table public.normatic_email_deliveries (
  id text primary key check (id ~ '^[a-f0-9]{64}$'),
  recipient text not null,
  day date not null,
  message jsonb not null,
  attempts integer not null default 0,
  first_attempt timestamptz,
  lease uuid,
  lease_until timestamptz,
  provider_id text,
  last_error text,
  accepted_at timestamptz,
  unique(day,recipient)
);
alter table public.normatic_email_deliveries enable row level security;
revoke all on public.normatic_email_deliveries from public, anon, authenticated;
grant select,insert,update on public.normatic_email_deliveries to service_role;
grant select on public.normatic_tarefas, public.normatic_reunioes, public.normatic_responsaveis to service_role;

create function public.normatic_email_claim(p_key text,p_recipient text,p_message jsonb,p_day date)
returns table(lease uuid,message jsonb)
language plpgsql security invoker set search_path = '' as $$
begin
  insert into public.normatic_email_deliveries(id,recipient,day,message)
    values(p_key,p_recipient,p_day,p_message) on conflict do nothing;
  return query update public.normatic_email_deliveries as delivery
    set lease=gen_random_uuid(),lease_until=now()+interval '2 minutes',
        first_attempt=coalesce(delivery.first_attempt,now()),attempts=delivery.attempts+1
    where delivery.id=p_key and delivery.accepted_at is null and delivery.attempts<3
      and (delivery.lease_until is null or delivery.lease_until<now())
      and (delivery.first_attempt is null or delivery.first_attempt>now()-interval '20 hours')
    returning delivery.lease,delivery.message;
end $$;
create function public.normatic_email_finish(p_key text,p_lease uuid,p_provider_id text,p_error text)
returns void language sql security invoker set search_path = '' as $$
  update public.normatic_email_deliveries set provider_id=p_provider_id,last_error=p_error,
    accepted_at=case when p_provider_id is not null then now() else null end,
    lease_until=case when p_provider_id is null then now()+interval '2 minutes' else null end
  where id=p_key and lease=p_lease and accepted_at is null
$$;
revoke all on function public.normatic_email_claim(text,text,jsonb,date) from public,anon,authenticated;
revoke all on function public.normatic_email_finish(text,uuid,text,text) from public,anon,authenticated;
grant execute on function public.normatic_email_claim(text,text,jsonb,date) to service_role;
grant execute on function public.normatic_email_finish(text,uuid,text,text) to service_role;
commit;
