create table public.join_rate_limits (
  client_key text primary key,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count > 0),
  updated_at timestamptz not null default now()
);

create index join_rate_limits_window_started_at_idx
  on public.join_rate_limits (window_started_at);

alter table public.join_rate_limits enable row level security;

create or replace function public.consume_join_rate_limit(
  p_client_key text,
  p_max_requests integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  window_start timestamptz := to_timestamp(
    floor(extract(epoch from clock_timestamp()) / p_window_seconds) * p_window_seconds
  );
begin
  if p_client_key = '' or p_max_requests < 1 or p_window_seconds < 1 then
    raise exception 'Invalid rate limit arguments';
  end if;

  insert into public.join_rate_limits as limits (
    client_key,
    window_started_at,
    request_count,
    updated_at
  ) values (
    p_client_key,
    window_start,
    1,
    now()
  )
  on conflict (client_key) do update
  set
    window_started_at = excluded.window_started_at,
    request_count = case
      when limits.window_started_at < excluded.window_started_at then 1
      else limits.request_count + 1
    end,
    updated_at = now()
  where limits.window_started_at < excluded.window_started_at
    or limits.request_count < p_max_requests;

  return found;
end;
$$;

revoke all on table public.join_rate_limits from anon, authenticated;
revoke all on function public.consume_join_rate_limit(text, integer, integer) from public;
grant execute on function public.consume_join_rate_limit(text, integer, integer) to service_role;
