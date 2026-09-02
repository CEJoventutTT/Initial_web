-- Keep email_outbox as historical data. New writes use a request plus one row
-- per deliverable message, so an acknowledgement retry never repeats notice.
create table public.email_requests (
  id uuid primary key default extensions.gen_random_uuid(),
  flow text not null check (flow in ('contact', 'join')),
  request_key text not null unique check (char_length(request_key) between 16 and 128),
  created_at timestamptz not null default now()
);

create table public.email_deliveries (
  id uuid primary key default extensions.gen_random_uuid(),
  request_id uuid not null references public.email_requests(id) on delete cascade,
  kind text not null check (kind in ('notice', 'acknowledgement')),
  template jsonb not null,
  idempotency_key text not null unique,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed', 'unknown')),
  attempts integer not null default 0 check (attempts >= 0),
  provider text,
  provider_id text,
  last_error text,
  next_attempt_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (request_id, kind)
);

create index email_deliveries_retry_idx
  on public.email_deliveries (status, next_attempt_at)
  where status in ('pending', 'failed');

alter table public.email_requests enable row level security;
alter table public.email_deliveries enable row level security;
revoke all on table public.email_requests, public.email_deliveries from anon, authenticated;

create trigger email_deliveries_touch_updated_at
before update on public.email_deliveries
for each row execute function public.touch_updated_at();

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
declare v_request_id uuid;
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
  on conflict (request_id, kind) do nothing;

  return query
  update public.email_deliveries d
  set status = 'sending', attempts = d.attempts + 1, last_error = null, next_attempt_at = null
  where d.request_id = v_request_id
    and (d.status = 'pending' or (d.status = 'failed' and (d.next_attempt_at is null or d.next_attempt_at <= now())))
  returning d.id, d.status, d.kind, d.idempotency_key, d.provider, d.provider_id, d.template, true;

  return query
  select d.id, d.status, d.kind, d.idempotency_key, d.provider, d.provider_id, d.template, false
  from public.email_deliveries d
  where d.request_id = v_request_id and d.status in ('sent', 'sending', 'unknown');
end;
$$;

create or replace function public.mark_email_delivery_sent(p_id uuid, p_provider text, p_provider_id text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  update public.email_deliveries
  set status = 'sent', provider = p_provider, provider_id = p_provider_id,
    sent_at = now(), last_error = null, next_attempt_at = null
  where id = p_id and status = 'sending';
  if not found then raise exception 'Email delivery cannot be marked as sent'; end if;
end;
$$;

create or replace function public.mark_email_delivery_failed(p_id uuid, p_error text)
returns void language plpgsql security definer set search_path = ''
as $$
begin
  update public.email_deliveries
  set status = 'failed', last_error = left(p_error, 500), next_attempt_at = now() + interval '5 minutes'
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
    where d.status in ('pending', 'failed') and (d.next_attempt_at is null or d.next_attempt_at <= now())
    order by d.created_at limit p_limit for update skip locked
  ), claimed as (
    update public.email_deliveries d
    set status = 'sending', attempts = d.attempts + 1, last_error = null, next_attempt_at = null
    from candidates c where d.id = c.id returning d.*
  )
  select d.id, d.status, d.kind, d.idempotency_key, d.provider, d.provider_id, d.template, true, r.flow
  from claimed d join public.email_requests r on r.id = d.request_id;
end;
$$;

revoke all on function public.claim_email_deliveries(text, text, jsonb, jsonb), public.mark_email_delivery_sent(uuid, text, text), public.mark_email_delivery_failed(uuid, text), public.claim_retryable_email_deliveries(integer) from public;
grant execute on function public.claim_email_deliveries(text, text, jsonb, jsonb), public.mark_email_delivery_sent(uuid, text, text), public.mark_email_delivery_failed(uuid, text), public.claim_retryable_email_deliveries(integer) to service_role;
