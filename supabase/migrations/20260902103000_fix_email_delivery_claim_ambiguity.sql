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
  on conflict on constraint email_deliveries_request_id_kind_key do nothing;

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
