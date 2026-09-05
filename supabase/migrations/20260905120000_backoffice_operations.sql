-- Backoffice lifecycle, resumable onboarding and append-only operational history.
alter table public.profiles add column active boolean not null default true;
alter table public.membership_applications add column completed_at timestamptz;
alter table public.membership_applications add column linked_user_id uuid references public.profiles(user_id) on delete restrict;

create table public.backoffice_audit (
  id bigint generated always as identity primary key,
  entity text not null,
  entity_id text not null,
  actor_id uuid,
  action text not null,
  before_data jsonb,
  after_data jsonb,
  reason text,
  created_at timestamptz not null default now()
);
create index backoffice_audit_entity_idx on public.backoffice_audit(entity, entity_id, id desc);
alter table public.backoffice_audit enable row level security;
revoke all on public.backoffice_audit from anon, authenticated;
grant select on public.backoffice_audit to authenticated;
create policy audit_admin_read on public.backoffice_audit for select to authenticated using (public.is_admin());

create table public.account_invitations (
  id uuid primary key default extensions.gen_random_uuid(),
  email text not null unique check (email = lower(trim(email))),
  full_name text not null,
  role public.app_role not null check (role in ('student', 'coach', 'admin')),
  user_id uuid references public.profiles(user_id) on delete restrict,
  status text not null default 'pending' check (status in ('pending','sending','sent','failed','unknown')),
  attempts integer not null default 0,
  last_attempt_at timestamptz,
  sent_at timestamptz,
  last_error text,
  lease_token uuid,
  lease_until timestamptz,
  claimed_by uuid,
  created_at timestamptz not null default now()
);
alter table public.account_invitations enable row level security;
revoke all on public.account_invitations from anon, authenticated;
grant select on public.account_invitations to authenticated;
create policy invitations_admin_read on public.account_invitations for select to authenticated using (public.is_admin());

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.profiles where user_id = auth.uid() and role = 'admin' and active);
$$;
create or replace function public.is_program_coach(p_program_id bigint) returns boolean language sql stable security definer set search_path = '' as $$
 select public.is_admin() or (exists(select 1 from public.profiles where user_id = auth.uid() and role = 'coach' and active) and (
 exists(select 1 from public.programs where id = p_program_id and coach_id = auth.uid()) or
 exists(select 1 from public.coach_programs where program_id = p_program_id and coach_id = auth.uid())));
$$;
create or replace function public.is_program_member(p_program_id bigint) returns boolean language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.enrollments e join public.profiles p on p.user_id = e.user_id
 where e.user_id = auth.uid() and e.program_id = p_program_id and e.status = 'active' and p.active and p.role = 'student');
$$;

create or replace function public.capture_backoffice_audit() returns trigger language plpgsql security definer set search_path = '' as $$
declare v_old jsonb; v_new jsonb; v_id text;
begin
 if tg_op <> 'INSERT' then v_old := to_jsonb(old); end if;
 if tg_op <> 'DELETE' then v_new := to_jsonb(new); end if;
 if v_old is not distinct from v_new then return coalesce(new, old); end if;
 v_id := coalesce(v_new->>'id', v_old->>'id', v_new->>'user_id', v_old->>'user_id');
 v_old := v_old - 'lease_token' - 'lease_until' - 'qr_key';
 v_new := v_new - 'lease_token' - 'lease_until' - 'qr_key';
 insert into public.backoffice_audit(entity, entity_id, actor_id, action, before_data, after_data, reason)
 values(tg_table_name, v_id, coalesce(auth.uid(), (v_new->>'claimed_by')::uuid), tg_op, v_old, v_new, nullif(current_setting('app.audit_reason', true), ''));
 return coalesce(new, old);
end;
$$;

create trigger applications_audit after update on public.membership_applications for each row execute function public.capture_backoffice_audit();
create trigger profiles_audit after insert or update on public.profiles for each row execute function public.capture_backoffice_audit();
create trigger programs_audit after insert or update on public.programs for each row execute function public.capture_backoffice_audit();
create trigger enrollments_audit after insert or update or delete on public.enrollments for each row execute function public.capture_backoffice_audit();
create trigger coaches_audit after insert or update or delete on public.coach_programs for each row execute function public.capture_backoffice_audit();
create trigger sessions_audit after insert or update or delete on public.attendance_sessions for each row execute function public.capture_backoffice_audit();
create trigger attendance_audit after insert or update or delete on public.attendance_logs for each row execute function public.capture_backoffice_audit();
create trigger invitations_audit after insert or update on public.account_invitations for each row execute function public.capture_backoffice_audit();
-- Session QR keys are bearer credentials: redact them from audit records.
create or replace function public.admin_update_profile(p_user uuid, p_name text, p_role public.app_role, p_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
declare v_old public.profiles%rowtype;
begin
 -- Serialize administrative role changes to protect the last administrator.
 lock table public.profiles in share row exclusive mode;
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 select * into v_old from public.profiles where user_id = p_user for update;
 if not found then raise exception 'Persona no encontrada.'; end if;
 if length(trim(p_name)) not between 1 and 120 then raise exception 'El nombre es obligatorio (máximo 120 caracteres).'; end if;
 if p_role = 'parent' and v_old.role <> 'parent' then raise exception 'El alta de tutores aún no está disponible.'; end if;
 if v_old.role = 'admin' and v_old.active and (p_role <> 'admin' or not p_active) and
   not exists(select 1 from public.profiles where role = 'admin' and active and user_id <> p_user) then
   raise exception 'Debe quedar al menos un administrador activo.';
 end if;
 if p_role <> v_old.role and (
   exists(select 1 from public.enrollments where user_id = p_user and status = 'active') or
   exists(select 1 from public.programs where coach_id = p_user) or
   exists(select 1 from public.coach_programs where coach_id = p_user)) then
   raise exception 'Retira las matrículas activas y asignaciones antes de cambiar el rol.';
 end if;
 if not p_active and (exists(select 1 from public.programs where coach_id = p_user) or exists(select 1 from public.coach_programs where coach_id = p_user)) then
   raise exception 'Reasigna los programas antes de dar de baja a esta persona.';
 end if;
 update public.profiles set full_name = trim(p_name), role = p_role, active = p_active where user_id = p_user;
 if not p_active then update public.enrollments set status = 'inactive' where user_id = p_user and status = 'active'; end if;
end;
$$;

create or replace function public.validate_active_enrollment() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if new.status = 'active' then
   perform 1 from public.programs where id = new.program_id and active for share;
   if not found then raise exception 'El programa no está activo.'; end if;
   perform 1 from public.profiles where user_id = new.user_id and active and role = 'student' for share;
   if not found then raise exception 'El alumno no está activo.'; end if;
 end if;
 return new;
end;
$$;
create trigger enrollment_active_check before insert or update on public.enrollments for each row execute function public.validate_active_enrollment();

create or replace function public.admin_update_program(p_id bigint, p_name text, p_description text, p_coach uuid, p_active boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 if length(trim(p_name)) not between 1 and 120 or length(p_description) > 2000 then raise exception 'Revisa el nombre y la descripción.'; end if;
 if p_coach is not null and not exists(select 1 from public.profiles where user_id = p_coach and active and role in ('coach','admin')) then raise exception 'El responsable no está activo.'; end if;
 perform 1 from public.programs where id = p_id for update;
 if not found then raise exception 'Programa no encontrado.'; end if;
 update public.programs set name = trim(p_name), description = p_description, coach_id = p_coach, active = p_active where id = p_id;
 if not p_active then
   update public.enrollments set status = 'inactive' where program_id = p_id and status = 'active';
   update public.attendance_sessions set active = false where program_id = p_id and start_at >= now();
 end if;
end;
$$;

create or replace function public.admin_complete_application(p_application uuid, p_user uuid, p_program bigint default null)
returns void language plpgsql security definer set search_path = '' as $$
declare v_app public.membership_applications%rowtype;
begin
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 select * into v_app from public.membership_applications where id = p_application for update;
 if not found then raise exception 'Solicitud no encontrada.'; end if;
 if v_app.status <> 'approved' then raise exception 'Aprueba la solicitud antes de vincular o matricular.'; end if;
 if v_app.linked_user_id is not null and v_app.linked_user_id <> p_user then raise exception 'La solicitud ya está vinculada a otra persona.'; end if;
 if not exists(select 1 from public.profiles where user_id = p_user and active and role = 'student') then raise exception 'Selecciona un alumno activo.'; end if;
 update public.membership_applications set linked_user_id = p_user, reviewed_by = auth.uid(), reviewed_at = now() where id = p_application;
 if p_program is not null then
   insert into public.enrollments(user_id, program_id) values(p_user, p_program)
   on conflict(user_id, program_id) do update set status = 'active';
   update public.membership_applications set completed_at = coalesce(completed_at, now()) where id = p_application;
 end if;
end;
$$;
-- Only administrators may inspect Auth identity metadata; no tokens or hashes are returned.
create or replace function public.admin_account_identity(p_user uuid default null, p_email text default null)
returns table(user_id uuid, email text, last_sign_in_at timestamptz, invitation_id text)
language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 return query select u.id, u.email::text, u.last_sign_in_at, u.raw_app_meta_data->>'backoffice_invitation_id'
 from auth.users u where (p_user is not null and u.id = p_user) or (p_email is not null and lower(u.email) = lower(trim(p_email))) limit 2;
end;
$$;

create or replace function public.admin_claim_invitation(p_email text, p_name text, p_role public.app_role, p_resend boolean default false)
returns public.account_invitations language plpgsql security definer set search_path = '' as $$
declare v_row public.account_invitations%rowtype;
begin
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 if p_role not in ('student','coach','admin') or length(trim(p_name)) not between 1 and 120 or length(p_email) > 254 or p_email not like '%@%.%' then raise exception 'Revisa los datos de la invitación.'; end if;
 insert into public.account_invitations(email, full_name, role, claimed_by) values(lower(trim(p_email)), trim(p_name), p_role, auth.uid()) on conflict(email) do nothing;
 select * into v_row from public.account_invitations where email = lower(trim(p_email)) for update;
 if v_row.role <> p_role then raise exception 'Ya existe una invitación con otro rol. Abre la ficha de la persona.'; end if;
 if v_row.lease_until > now() then raise exception 'Esta invitación se está procesando. Espera antes de reintentar.'; end if;
 if v_row.last_attempt_at > now() - interval '1 minute' then raise exception 'Espera un minuto antes de reenviar la invitación.'; end if;
 if v_row.status = 'sent' and not p_resend then return v_row; end if;
 update public.account_invitations set status = 'sending', attempts = attempts + 1, last_attempt_at = now(), last_error = null,
 lease_token = extensions.gen_random_uuid(), lease_until = now() + interval '2 minutes', claimed_by = auth.uid()
 where id = v_row.id returning * into v_row;
 return v_row;
end;
$$;

-- Safe corrections use a dedicated RPC. A session with history cannot be deleted.
create or replace function public.correct_attendance(p_session bigint, p_student uuid, p_reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare v_program bigint;
begin
 select program_id into v_program from public.attendance_sessions where id = p_session for update;
 if not found or not public.is_program_coach(v_program) then raise exception 'No puedes gestionar esta sesión.'; end if;
 if length(trim(p_reason)) not between 5 and 500 then raise exception 'Indica el motivo de la corrección (5–500 caracteres).'; end if;
 perform set_config('app.audit_reason', trim(p_reason), true);
 delete from public.attendance_logs where session_id = p_session and student_id = p_student;
end;
$$;
create or replace function public.protect_attendance_history() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if tg_table_name = 'attendance_sessions' then
   if tg_op = 'DELETE' or (tg_op = 'UPDATE' and new.program_id is distinct from old.program_id) then
     if exists(select 1 from public.attendance_logs where session_id = old.id) then raise exception 'La sesión tiene asistencia. Conserva su historial y cancélala si procede.'; end if;
   end if;
 else
   if tg_op = 'UPDATE' then raise exception 'Corrige la asistencia y vuelve a marcarla para conservar el historial.'; end if;
   if coalesce(current_setting('app.audit_reason', true), '') = '' then raise exception 'La corrección de asistencia requiere un motivo.'; end if;
 end if;
 return coalesce(new, old);
end;
$$;
create trigger session_history_guard before update of program_id or delete on public.attendance_sessions for each row execute function public.protect_attendance_history();
create trigger attendance_history_guard before update or delete on public.attendance_logs for each row execute function public.protect_attendance_history();
create or replace function public.refresh_corrected_attendance() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 perform public.refresh_quest_progress(old.student_id);
 if not exists(select 1 from public.attendance_logs where student_id = old.student_id) then
   delete from public.user_badges where user_id = old.student_id and badge_id in (select id from public.badges where code = 'first_attendance');
 end if;
 return old;
end;
$$;
create trigger attendance_correction_rewards after delete on public.attendance_logs for each row execute function public.refresh_corrected_attendance();

-- Operational email view deliberately excludes message contents and raw provider errors.
create or replace function public.admin_email_status()
returns table(id uuid, flow text, kind text, status text, attempts integer, next_attempt_at timestamptz, sent_at timestamptz, created_at timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 return query select d.id, r.flow, d.kind, d.status, d.attempts, d.next_attempt_at, d.sent_at, d.created_at from public.email_deliveries d join public.email_requests r on r.id = d.request_id;
end;
$$;

revoke all on function public.admin_update_profile(uuid,text,public.app_role,boolean), public.admin_update_program(bigint,text,text,uuid,boolean), public.admin_complete_application(uuid,uuid,bigint), public.admin_account_identity(uuid,text), public.admin_claim_invitation(text,text,public.app_role,boolean), public.correct_attendance(bigint,uuid,text), public.admin_email_status() from public, anon;
grant execute on function public.admin_update_profile(uuid,text,public.app_role,boolean), public.admin_update_program(bigint,text,text,uuid,boolean), public.admin_complete_application(uuid,uuid,bigint), public.admin_account_identity(uuid,text), public.admin_claim_invitation(text,text,public.app_role,boolean), public.correct_attendance(bigint,uuid,text), public.admin_email_status() to authenticated;

create or replace function public.coach_attendance_roster(p_session bigint)
returns table(student_id uuid, full_name text, present boolean, checked_at timestamptz, enrolled boolean)
language plpgsql security definer set search_path = '' as $$
declare v_program bigint;
begin
 select program_id into v_program from public.attendance_sessions where id = p_session;
 if not found or not public.is_program_coach(v_program) then raise exception 'No puedes consultar esta sesión.'; end if;
 return query
 with students as (
   select e.user_id from public.enrollments e where e.program_id = v_program and e.status = 'active'
   union select a.student_id from public.attendance_logs a where a.session_id = p_session
 )
 select p.user_id, p.full_name, a.id is not null, a.checked_at,
   exists(select 1 from public.enrollments e where e.user_id = p.user_id and e.program_id = v_program and e.status = 'active') and p.active
 from students s join public.profiles p on p.user_id = s.user_id
 left join public.attendance_logs a on a.student_id = p.user_id and a.session_id = p_session;
end;
$$;
revoke all on function public.coach_attendance_roster(bigint) from public, anon;
grant execute on function public.coach_attendance_roster(bigint) to authenticated;

create or replace function public.validate_attendance_insert() returns trigger language plpgsql security definer set search_path = '' as $$
begin
 if not exists(select 1 from public.attendance_sessions s join public.programs p on p.id = s.program_id
 where s.id = new.session_id and s.program_id = new.program_id and s.active and p.active) then raise exception 'La sesión o el programa no están activos.'; end if;
 if not exists(select 1 from public.enrollments e join public.profiles p on p.user_id = e.user_id
 where e.user_id = new.student_id and e.program_id = new.program_id and e.status = 'active' and p.active and p.role = 'student') then raise exception 'El alumno no tiene una matrícula activa.'; end if;
 return new;
end;
$$;
create trigger attendance_validate before insert on public.attendance_logs for each row execute function public.validate_attendance_insert();
create or replace function public.admin_invitation_status()
returns table(id uuid, email text, full_name text, user_id uuid, role public.app_role, status text, attempts integer, last_attempt_at timestamptz, last_sign_in_at timestamptz, last_error text, lease_until timestamptz)
language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 return query select i.id, i.email, i.full_name, i.user_id, i.role, i.status, i.attempts, i.last_attempt_at, u.last_sign_in_at, i.last_error, i.lease_until
 from public.account_invitations i left join auth.users u on u.id = i.user_id;
end;
$$;
create or replace function public.admin_attendance_summary(p_from timestamptz, p_to timestamptz)
returns table(program_id bigint, program_name text, attendance_count bigint)
language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 return query select p.id, p.name, count(a.id) from public.programs p
 join public.attendance_sessions s on s.program_id = p.id
 join public.attendance_logs a on a.session_id = s.id
 where s.start_at >= p_from and s.start_at < p_to group by p.id, p.name;
end;
$$;
revoke all on function public.admin_invitation_status(), public.admin_attendance_summary(timestamptz,timestamptz) from public, anon;
grant execute on function public.admin_invitation_status(), public.admin_attendance_summary(timestamptz,timestamptz) to authenticated;
-- Server-side account provisioning needs explicit privileges on reconstructed schemas.
grant select, insert, update on public.profiles, public.account_invitations to service_role;
create or replace function public.backoffice_sessions(p_coach uuid default null)
returns table(id bigint, program_id bigint, start_at timestamptz, end_at timestamptz, active boolean, programs jsonb)
language plpgsql security invoker set search_path = '' as $$
begin
 if p_coach is not null and p_coach <> auth.uid() and not public.is_admin() then raise exception 'No autorizado.'; end if;
 return query select s.id, s.program_id, s.start_at, s.end_at, s.active, jsonb_build_object('name',p.name)
 from public.attendance_sessions s join public.programs p on p.id=s.program_id
 where public.is_program_coach(p.id) and (p_coach is null or p.coach_id=p_coach or exists(select 1 from public.coach_programs cp where cp.program_id=p.id and cp.coach_id=p_coach));
end;
$$;
create or replace function public.backoffice_program_options()
returns table(id bigint, name text)
language sql security invoker set search_path = '' as $$
 select p.id,p.name from public.programs p where p.active and public.is_program_coach(p.id);
$$;
revoke all on function public.backoffice_sessions(uuid), public.backoffice_program_options() from public, anon;
grant execute on function public.backoffice_sessions(uuid), public.backoffice_program_options() to authenticated;
create or replace function public.admin_person_programs(p_user uuid)
returns table(id bigint, name text, active boolean, responsible boolean)
language plpgsql security invoker set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 return query select p.id,p.name,p.active,p.coach_id=p_user
 from public.programs p where p.coach_id=p_user or exists(select 1 from public.coach_programs cp where cp.program_id=p.id and cp.coach_id=p_user);
end;
$$;
create or replace function public.is_active_user() returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.profiles p where p.user_id=auth.uid() and p.active);
$$;
drop policy training_logs_own on public.training_logs;
create policy training_logs_own on public.training_logs for all to authenticated
using ((user_id=auth.uid() and public.is_active_user()) or public.is_admin())
with check ((user_id=auth.uid() and public.is_active_user()) or public.is_admin());
revoke all on function public.admin_person_programs(uuid), public.is_active_user() from public, anon;
grant execute on function public.admin_person_programs(uuid), public.is_active_user() to authenticated;
create or replace function public.admin_people_directory()
returns table(user_id uuid, full_name text, role public.app_role, active boolean, email text)
language plpgsql security definer set search_path = '' as $$
begin
 if not public.is_admin() then raise exception 'No autorizado.'; end if;
 return query select p.user_id, p.full_name, p.role, p.active, u.email::text from public.profiles p join auth.users u on u.id=p.user_id;
end;
$$;
revoke all on function public.admin_people_directory() from public, anon;
grant execute on function public.admin_people_directory() to authenticated;
