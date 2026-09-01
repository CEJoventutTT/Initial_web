create table public.email_outbox (
  id uuid primary key default extensions.gen_random_uuid(),
  flow text not null check (flow in ('contact', 'join')),
  idempotency_key text not null unique,
  notice jsonb not null,
  acknowledgement jsonb not null,
  status text not null default 'pending' check (status in ('pending', 'sending', 'sent', 'failed')),
  attempts integer not null default 0 check (attempts >= 0),
  provider text,
  provider_id text,
  last_error text,
  next_attempt_at timestamptz,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index email_outbox_retry_idx
  on public.email_outbox (status, next_attempt_at)
  where status in ('pending', 'failed');

alter table public.email_outbox enable row level security;
revoke all on table public.email_outbox from anon, authenticated;

create trigger email_outbox_touch_updated_at
before update on public.email_outbox
for each row execute function public.touch_updated_at();

create or replace function public.claim_email_outbox(
  p_flow text,
  p_idempotency_key text,
  p_notice jsonb,
  p_acknowledgement jsonb
)
returns table(
  id uuid,
  status text,
  idempotency_key text,
  provider text,
  provider_id text,
  should_send boolean
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_flow not in ('contact', 'join') or p_idempotency_key = '' then
    raise exception 'Invalid email outbox arguments';
  end if;

  insert into public.email_outbox (flow, idempotency_key, notice, acknowledgement)
  values (p_flow, p_idempotency_key, p_notice, p_acknowledgement)
  on conflict (idempotency_key) do nothing;

  return query
  update public.email_outbox
  set status = 'sending', attempts = attempts + 1, last_error = null, next_attempt_at = null
  where email_outbox.idempotency_key = p_idempotency_key
    and email_outbox.status in ('pending', 'failed')
  returning email_outbox.id, email_outbox.status, email_outbox.idempotency_key,
    email_outbox.provider, email_outbox.provider_id, true;

  if found then return; end if;

  return query
  select e.id, e.status, e.idempotency_key, e.provider, e.provider_id, false
  from public.email_outbox e
  where e.idempotency_key = p_idempotency_key;
end;
$$;

create or replace function public.mark_email_outbox_sent(
  p_id uuid,
  p_provider text,
  p_provider_id text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.email_outbox
  set status = 'sent', provider = p_provider, provider_id = p_provider_id,
    sent_at = now(), last_error = null, next_attempt_at = null
  where id = p_id and status = 'sending';
  if not found then raise exception 'Email outbox entry cannot be marked as sent'; end if;
end;
$$;

create or replace function public.mark_email_outbox_failed(p_id uuid, p_error text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.email_outbox
  set status = 'failed', last_error = left(p_error, 500),
    next_attempt_at = now() + interval '5 minutes'
  where id = p_id and status = 'sending';
end;
$$;

revoke all on function public.claim_email_outbox(text, text, jsonb, jsonb) from public;
revoke all on function public.mark_email_outbox_sent(uuid, text, text) from public;
revoke all on function public.mark_email_outbox_failed(uuid, text) from public;
grant execute on function public.claim_email_outbox(text, text, jsonb, jsonb) to service_role;
grant execute on function public.mark_email_outbox_sent(uuid, text, text) to service_role;
grant execute on function public.mark_email_outbox_failed(uuid, text) to service_role;
