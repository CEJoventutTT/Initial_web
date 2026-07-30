begin;

create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;

select plan(14);

select has_table('public', 'profiles', 'profiles exists');
select has_table('public', 'attendance_sessions', 'attendance_sessions exists');
select has_table('public', 'attendance_logs', 'attendance_logs exists');
select has_function('public', 'check_in_attendance', array['bigint', 'text'], 'check-in RPC exists');
select has_function('public', 'coach_session_qr', array['bigint'], 'coach QR RPC exists');

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) values
  (
    '10000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'student@test.local',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'coach@test.local',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );

insert into public.profiles (user_id, full_name, role)
values
  ('10000000-0000-0000-0000-000000000001', 'Student', 'student'),
  ('20000000-0000-0000-0000-000000000002', 'Coach', 'coach');

insert into public.programs (id, name, coach_id)
values (1001, 'Test program', '20000000-0000-0000-0000-000000000002');

insert into public.enrollments (user_id, program_id, status)
values ('10000000-0000-0000-0000-000000000001', 1001, 'active');

insert into public.attendance_sessions (
  id,
  program_id,
  start_at,
  end_at,
  expires_at,
  qr_key,
  active
) values (
  2001,
  1001,
  now() - interval '5 minutes',
  now() + interval '30 minutes',
  now() + interval '10 minutes',
  'valid-test-key',
  true
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '10000000-0000-0000-0000-000000000001',
  true
);

select ok(public.is_program_member(1001), 'student is an active member');
select ok(not public.is_program_coach(1001), 'student is not a coach');

select throws_ok(
  $$update public.profiles set role = 'admin' where user_id = auth.uid()$$,
  '42501',
  'permission denied for table profiles',
  'student cannot elevate their role'
);

select lives_ok(
  $$update public.profiles set full_name = 'Updated student' where user_id = auth.uid()$$,
  'student can update their allowed profile fields'
);

select throws_ok(
  $$select qr_key from public.attendance_sessions where id = 2001$$,
  '42501',
  'permission denied for table attendance_sessions',
  'student cannot read QR secrets'
);

select is(
  public.check_in_attendance(2001, 'wrong-key') ->> 'error',
  'invalid_key',
  'invalid QR key is rejected'
);

select is(
  public.check_in_attendance(2001, 'valid-test-key') ->> 'ok',
  'true',
  'valid QR key records attendance'
);

select is(
  public.check_in_attendance(2001, 'valid-test-key') ->> 'duplicate',
  'true',
  'duplicate check-in is idempotent'
);

select is(
  (select count(*)::text from public.attendance_logs where session_id = 2001),
  '1',
  'only one attendance row is stored'
);

select * from finish();
rollback;
