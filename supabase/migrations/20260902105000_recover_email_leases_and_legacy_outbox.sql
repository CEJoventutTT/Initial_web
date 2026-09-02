alter table public.email_deliveries add column claimed_at timestamptz;

-- Preserve retryable work created before the per-delivery outbox existed.
insert into public.email_requests (flow, request_key, created_at)
select e.flow, 'legacy-' || e.id::text, e.created_at
from public.email_outbox e
where e.status in ('pending', 'sending', 'failed')
on conflict (request_key) do nothing;

insert into public.email_deliveries (
  request_id, kind, template, idempotency_key, status, last_error, created_at, updated_at
)
select r.id, source.kind, source.template, 'legacy-' || e.id::text || ':' || source.kind,
  'pending', coalesce(e.last_error, 'Migrated from legacy email_outbox'), e.created_at, e.updated_at
from public.email_outbox e
join public.email_requests r on r.request_key = 'legacy-' || e.id::text
cross join lateral (
  values ('notice'::text, e.notice), ('acknowledgement'::text, e.acknowledgement)
) as source(kind, template)
where e.status in ('pending', 'sending', 'failed')
on conflict (request_id, kind) do nothing;

create or replace function public.claim_email_deliveries(
  p_flow text,
  p_request_key text,
  p_notice jsonb,
  p_acknowledgement jsonb
)
returns table(
  id uuid, status text, kind text, idempotency_key text,
  provider text, provider_id text, template jsonb, should_send boolean
)
language plpgsql security definer set search_path = ''
as $$
declare
  v_request_id uuid;
  v_claimed_count integer;
begin
  if p_flow not in ('contact', 'join') or char_length(p_request_key) not between 16 and 128 then
    raise exception 'Invalid email delivery arguments';
  end if;

  insert into public.email_requests (flow, request_key) values (p_flow, p_request_key)
  on conflict (request_key) do update set request_key = excluded.request_key
  returning email_requests.id into v_request_id;

  insert into public.email_deliveries (request_id, kind, template, idempotency_key)
  values
    (v_request_id, 'notice', p_notice, p_request_key || ':notice'),
    (v_request_id, 'acknowledgement', p_acknowledgement, p_request_key || ':acknowledgement')
  on conflict on constraint email_deliveries_request_id_kind_key do nothing;

  return query
  update public.email_deliveries d
  set status = 'sending', attempts = d.attempts + 1,
    last_error = case when d.status = 'sending' then 'Delivery lease expired before its status was recorded' else null end,
    next_attempt_at = null, claimed_at = now()
  where d.request_id = v_request_id
    and (
      d.status = 'pending'
      or (d.status = 'failed' and (d.next_attempt_at is null or d.next_attempt_at <= now()))
      or (d.status = 'sending' and d.claimed_at <= now() - interval '15 minutes')
    )
  returning d.id, d.status, d.kind, d.idempotency_key, d.provider, d.provider_id, d.template, true;
  get diagnostics v_claimed_count = row_count;
  if v_claimed_count > 0 then return; end if;

  return query
  select d.id, d.status, d.kind, d.idempotency_key, d.provider, d.provider_id, d.template, false
  from public.email_deliveries d
  where d.request_id = v_request_id;
end;
$$;

create or replace function public.mark_email_delivery_sent(p_id uuid, p_provider text, p_provider_id text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  update public.email_deliveries
  set status = 'sent', provider = p_provider, provider_id = p_provider_id,
    sent_at = now(), last_error = null, next_attempt_at = null, claimed_at = null
  where id = p_id and status = 'sending';
  if not found then raise exception 'Email delivery cannot be marked as sent'; end if;
end;
$$;

create or replace function public.mark_email_delivery_failed(p_id uuid, p_error text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  update public.email_deliveries
  set status = 'failed', last_error = left(p_error, 500),
    next_attempt_at = now() + interval '5 minutes', claimed_at = null
  where id = p_id and status = 'sending';
end;
$$;

create or replace function public.claim_retryable_email_deliveries(p_limit integer default 10)
returns table(
  id uuid, status text, kind text, idempotency_key text,
  provider text, provider_id text, template jsonb, should_send boolean, flow text
)
language plpgsql security definer set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 100 then raise exception 'Invalid email retry limit'; end if;
  return query
  with candidates as (
    select d.id from public.email_deliveries d
    where d.status = 'pending'
      or (d.status = 'failed' and (d.next_attempt_at is null or d.next_attempt_at <= now()))
      or (d.status = 'sending' and d.claimed_at <= now() - interval '15 minutes')
    order by d.created_at limit p_limit for update skip locked
  ), claimed as (
    update public.email_deliveries d
    set status = 'sending', attempts = d.attempts + 1,
      last_error = case when d.status = 'sending' then 'Delivery lease expired before its status was recorded' else null end,
      next_attempt_at = null, claimed_at = now()
    from candidates c where d.id = c.id returning d.*
  )
  select d.id, d.status, d.kind, d.idempotency_key, d.provider, d.provider_id, d.template, true, r.flow
  from claimed d join public.email_requests r on r.id = d.request_id;
end;
$$;
