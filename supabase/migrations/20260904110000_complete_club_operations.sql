-- Operational club workflow: public applications, safer attendance and basic rewards.

create type public.application_status as enum ('new', 'contacted', 'approved', 'rejected', 'archived');

create table public.membership_applications (
  id uuid primary key default extensions.gen_random_uuid(),
  request_key text not null unique,
  full_name text not null,
  birth_date date not null,
  municipality text not null,
  phone text not null,
  email text not null,
  referral_source text not null,
  competition_interest text not null check (competition_interest in ('yes', 'no', 'later')),
  event_interest text not null check (event_interest in ('yes', 'no')),
  privacy_accepted_at timestamptz not null default now(),
  status public.application_status not null default 'new',
  internal_notes text,
  reviewed_by uuid references public.profiles(user_id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index membership_applications_status_created_idx
  on public.membership_applications (status, created_at desc);

create trigger membership_applications_touch_updated_at
before update on public.membership_applications
for each row execute function public.touch_updated_at();

alter table public.membership_applications enable row level security;
create policy membership_applications_admin on public.membership_applications
for all to authenticated
using (public.is_admin()) with check (public.is_admin());
revoke all on public.membership_applications from anon, authenticated;
grant select, update on public.membership_applications to authenticated;

-- Students must use check_in_attendance, which validates the QR, the time window
-- and the active enrolment. The remaining coach policy keeps manual marking possible.
drop policy if exists attendance_insert_self on public.attendance_logs;

create or replace function public.assign_active_quests_to_student()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role = 'student' then
    insert into public.user_quests (user_id, quest_id)
    select new.user_id, q.id from public.quests q where q.active
    on conflict (user_id, quest_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger profiles_assign_active_quests
after insert or update of role on public.profiles
for each row execute function public.assign_active_quests_to_student();

insert into public.user_quests (user_id, quest_id)
select p.user_id, q.id
from public.profiles p cross join public.quests q
where p.role = 'student' and q.active
on conflict (user_id, quest_id) do nothing;

create or replace function public.refresh_quest_progress(p_user uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.user_quests uq
  set progress = coalesce((
        select jsonb_object_agg(step->>'metric', case step->>'metric'
          when 'training_log' then (select count(*) from public.training_logs where user_id = p_user)
          when 'attendance_present' then (select count(*) from public.attendance_logs where student_id = p_user)
          else 0
        end)
        from jsonb_array_elements(q.steps) step
      ), '{}'::jsonb),
      status = case when exists (
        select 1 from jsonb_array_elements(q.steps) step
        where coalesce((case step->>'metric'
          when 'training_log' then (select count(*) from public.training_logs where user_id = p_user)
          when 'attendance_present' then (select count(*) from public.attendance_logs where student_id = p_user)
          else 0 end), 0) < coalesce((step->>'target')::integer, 1)
      ) then 'active'::public.quest_status else 'completed'::public.quest_status end,
      completed_at = case when not exists (
        select 1 from jsonb_array_elements(q.steps) step
        where coalesce((case step->>'metric'
          when 'training_log' then (select count(*) from public.training_logs where user_id = p_user)
          when 'attendance_present' then (select count(*) from public.attendance_logs where student_id = p_user)
          else 0 end), 0) < coalesce((step->>'target')::integer, 1)
      ) then coalesce(uq.completed_at, now()) else null end
  from public.quests q
  where uq.user_id = p_user and uq.quest_id = q.id and uq.status <> 'expired';
end;
$$;

create or replace function public.apply_student_activity_rewards()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
  v_badge_code text;
begin
  if tg_table_name = 'training_logs' then
    v_user := new.user_id;
    v_badge_code := 'first_training';
  else
    v_user := new.student_id;
    v_badge_code := 'first_attendance';
  end if;
  insert into public.user_badges (user_id, badge_id)
  select v_user, b.id from public.badges b where b.code = v_badge_code
  on conflict (user_id, badge_id) do nothing;
  perform public.refresh_quest_progress(v_user);
  return new;
end;
$$;

create trigger training_logs_apply_rewards
after insert on public.training_logs
for each row execute function public.apply_student_activity_rewards();

create trigger attendance_logs_apply_rewards
after insert on public.attendance_logs
for each row execute function public.apply_student_activity_rewards();

grant execute on function public.refresh_quest_progress(uuid) to authenticated;
