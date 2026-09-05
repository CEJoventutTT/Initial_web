import { execFileSync, spawn } from 'node:child_process'
import { createClient } from '@supabase/supabase-js'

const status = JSON.parse(
  execFileSync('supabase', ['status', '-o', 'json'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'ignore'],
  }),
)
if (!['127.0.0.1', 'localhost'].includes(new URL(status.API_URL).hostname))
  throw new Error('Local Supabase is required')
const admin = createClient(status.API_URL, status.SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})
const password = 'Backoffice-Local-Only!2026'
const accounts = [
  ['admin', 'bo-admin@example.test', 'BO Administración'],
  ['coach', 'bo-coach@example.test', 'BO Entrenador'],
  ['student', 'bo-student@example.test', 'BO Alumno'],
]
const users = (await admin.auth.admin.listUsers({ perPage: 1000 })).data.users
const ids = {}
for (const [role, email, name] of accounts) {
  let user = users.find((value) => value.email === email)
  if (!user) {
    const result = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (result.error) throw result.error
    user = result.data.user
  }
  const reset = await admin.auth.admin.updateUserById(user.id, { password })
  if (reset.error) throw reset.error
  const result = await admin
    .from('profiles')
    .upsert({ user_id: user.id, full_name: name, role, active: true })
  if (result.error) throw result.error
  ids[role] = user.id
}
const sql = `
insert into public.programs(id,name,coach_id,active) values(910001,'BO Entrenamiento local','${ids.coach}',true)
on conflict(id) do update set active=true,coach_id=excluded.coach_id;
insert into public.enrollments(user_id,program_id,status) values('${ids.student}',910001,'active') on conflict(user_id,program_id) do update set status='active';
insert into public.attendance_sessions(id,program_id,start_at,end_at,expires_at,active) values(910001,910001,now()-interval '10 minutes',now()+interval '2 hours',now()+interval '2 hours',true)
on conflict(id) do update set start_at=excluded.start_at,end_at=excluded.end_at,expires_at=excluded.expires_at,active=true;
insert into auth.users(id,email,raw_user_meta_data)
select ('92000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid, 'bo-fixture-'||n||'@example.test','{}'::jsonb from generate_series(1,520) n on conflict(id) do nothing;
insert into public.profiles(user_id,full_name,role)
select ('92000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid, 'BO Fixture '||lpad(n::text,4,'0'), 'student' from generate_series(1,520) n on conflict(user_id) do nothing;
insert into public.membership_applications(id,request_key,full_name,birth_date,municipality,phone,email,referral_source,competition_interest,event_interest)
select ('93000000-0000-0000-0000-'||lpad(n::text,12,'0'))::uuid, 'bo-fixture-application-'||n, 'BO Solicitud '||lpad(n::text,3,'0'), '2000-01-01','Pruebas','123456789','bo-app-'||n||'@example.test','test','no','no' from generate_series(1,61) n on conflict(id) do nothing;
`
execFileSync(
  'docker',
  [
    'exec',
    '-i',
    'supabase_db_Initial_web',
    'psql',
    '-U',
    'postgres',
    '-v',
    'ON_ERROR_STOP=1',
  ],
  { input: sql, stdio: ['pipe', 'ignore', 'inherit'] },
)
const env = {
  ...process.env,
  E2E_TEST_ENV: '1',
  E2E_BACKOFFICE_LOCAL: '1',
  E2E_PORT: '3200',
  E2E_BASE_URL: '',
  BACKOFFICE_TEST_BUILD_DIR: 'tmp/backoffice-next',
  CEJTT_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_CEJTT_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_SUPABASE_URL: status.API_URL,
  NEXT_PUBLIC_CEJTT_SUPABASE_ANON_KEY: status.ANON_KEY,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
  CEJTT_SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
  SUPABASE_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE_URL: 'http://127.0.0.1:3200',
  ADMIN: accounts[0][1],
  ADMIN2: accounts[0][1],
  ADMIN_PASS: password,
  ADMIN_PASS2: password,
  COACH: accounts[1][1],
  COACH2: accounts[1][1],
  COACH_PASS: password,
  COACH_PASS2: password,
  STUDENT: accounts[2][1],
  STUDENT_PASS: password,
}
const serve = process.argv.includes('--serve')
const child = spawn(
  'npx',
  serve
    ? ['next', 'dev', '--hostname', '127.0.0.1', '--port', '3200']
    : ['playwright', 'test', ...process.argv.slice(2)],
  { env, stdio: 'inherit' },
)
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => child.kill(signal))
child.on('exit', (code) => {
  process.exitCode = code ?? 1
})
