-- Keep program assignments consistent even when data is written outside the UI.
create or replace function public.assert_program_coach_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.coach_id is not null and not exists (
    select 1
    from public.profiles
    where user_id = new.coach_id
      and role in ('coach', 'admin')
  ) then
    raise exception 'program coach must have coach or admin role' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists programs_require_coach_role on public.programs;
create trigger programs_require_coach_role
before insert or update of coach_id on public.programs
for each row execute function public.assert_program_coach_role();

create or replace function public.assert_coach_program_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where user_id = new.coach_id
      and role in ('coach', 'admin')
  ) then
    raise exception 'assigned program coach must have coach or admin role' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists coach_programs_require_coach_role on public.coach_programs;
create trigger coach_programs_require_coach_role
before insert or update of coach_id on public.coach_programs
for each row execute function public.assert_coach_program_role();

create or replace function public.assert_enrollment_student_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where user_id = new.user_id
      and role = 'student'
  ) then
    raise exception 'enrollment user must have student role' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists enrollments_require_student_role on public.enrollments;
create trigger enrollments_require_student_role
before insert or update of user_id on public.enrollments
for each row execute function public.assert_enrollment_student_role();
