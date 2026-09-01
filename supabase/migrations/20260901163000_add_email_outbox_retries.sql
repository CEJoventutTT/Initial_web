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
    and (
      email_outbox.status = 'pending'
      or (email_outbox.status = 'failed' and (email_outbox.next_attempt_at is null or email_outbox.next_attempt_at <= now()))
    )
  returning email_outbox.id, email_outbox.status, email_outbox.idempotency_key,
    email_outbox.provider, email_outbox.provider_id, true;

  if found then return; end if;

  return query
  select e.id, e.status, e.idempotency_key, e.provider, e.provider_id, false
  from public.email_outbox e
  where e.idempotency_key = p_idempotency_key;
end;
$$;

create or replace function public.claim_retryable_email_outbox(p_limit integer default 10)
returns table(
  id uuid,
  status text,
  idempotency_key text,
  provider text,
  provider_id text,
  should_send boolean,
  flow text,
  notice jsonb,
  acknowledgement jsonb
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_limit < 1 or p_limit > 100 then raise exception 'Invalid email retry limit'; end if;

  return query
  with candidates as (
    select e.id
    from public.email_outbox e
    where e.status in ('pending', 'failed')
      and (e.next_attempt_at is null or e.next_attempt_at <= now())
    order by e.created_at
    limit p_limit
    for update skip locked
  ), claimed as (
    update public.email_outbox e
    set status = 'sending', attempts = attempts + 1, last_error = null, next_attempt_at = null
    from candidates c
    where e.id = c.id
    returning e.*
  )
  select c.id, c.status, c.idempotency_key, c.provider, c.provider_id, true,
    c.flow, c.notice, c.acknowledgement
  from claimed c;
end;
$$;

revoke all on function public.claim_retryable_email_outbox(integer) from public;
grant execute on function public.claim_retryable_email_outbox(integer) to service_role;
