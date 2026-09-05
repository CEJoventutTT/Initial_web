begin;
create extension if not exists pgtap with schema extensions;
set search_path = public, extensions;
select no_plan();
-- All test mutations are rolled back, including this isolation of preexisting admins.
update public.profiles set active = false where role = 'admin';
insert into auth.users(id, email, raw_user_meta_data) values
 ('31000000-0000-0000-0000-000000000001','bo-admin@test.local','{}'),
 ('31000000-0000-0000-0000-000000000002','bo-coach@test.local','{}'),
 ('31000000-0000-0000-0000-000000000003','bo-student@test.local','{}'),
 ('31000000-0000-0000-0000-000000000004','bo-other@test.local','{}');
insert into public.profiles(user_id, full_name, role) values
 ('31000000-0000-0000-0000-000000000001','BO Admin','admin'),
 ('31000000-0000-0000-0000-000000000002','BO Coach','coach'),
 ('31000000-0000-0000-0000-000000000003','BO Student','student'),
 ('31000000-0000-0000-0000-000000000004','BO Other','coach');
insert into public.programs(id,name,coach_id) values
 (310001,'BO active','31000000-0000-0000-0000-000000000002'),
 (310002,'BO other','31000000-0000-0000-0000-000000000004');
insert into public.membership_applications(id, request_key, full_name,birth_date,municipality,phone,email,referral_source,competition_interest,event_interest,status)
 values('32000000-0000-0000-0000-000000000001','backoffice-test-app','BO Student','2000-01-01','Test','123','bo-student@test.local','test','no','no','approved');
set local role authenticated;
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000001',true);
select throws_ok($$select public.admin_update_profile(auth.uid(),'BO Admin','student',true)$$,'P0001','Debe quedar al menos un administrador activo.','last admin cannot be demoted');
select throws_ok($$select public.admin_update_profile(auth.uid(),'BO Admin','admin',false)$$,'P0001','Debe quedar al menos un administrador activo.','last admin cannot be deactivated');
select lives_ok($$select public.admin_complete_application('32000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000003',310001)$$,'approval links and enrolls atomically');
select lives_ok($$select public.admin_complete_application('32000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000003',310001)$$,'repeating onboarding is safe');
select is((select count(*)::int from public.enrollments where program_id=310001),1,'only one enrollment');
select ok((select completed_at is not null from public.membership_applications where id='32000000-0000-0000-0000-000000000001'),'completion time stored');
select throws_ok($$select public.admin_complete_application('32000000-0000-0000-0000-000000000001','31000000-0000-0000-0000-000000000004',310001)$$,'P0001','La solicitud ya está vinculada a otra persona.','cannot relink to a different identity');
select lives_ok($$select public.admin_claim_invitation('bo-new@test.local','New student','student')$$,'invitation can be claimed');
select throws_ok($$select public.admin_claim_invitation('bo-new@test.local','New student','student')$$,'P0001','Esta invitación se está procesando. Espera antes de reintentar.','concurrent invitation claims are rejected');
select is((select count(*)::int from public.account_invitations where email='bo-new@test.local'),1,'one invitation per normalized email');
select throws_ok($$select public.admin_claim_invitation('bo-parent@test.local','Parent','parent')$$,'P0001','Revisa los datos de la invitación.','new parent accounts are blocked');
select throws_ok($$select public.admin_update_profile('31000000-0000-0000-0000-000000000003','Student','coach',true)$$,'P0001','Retira las matrículas activas y asignaciones antes de cambiar el rol.','role changes preserve enrollment consistency');
insert into public.attendance_sessions(id,program_id,start_at,end_at,expires_at) values
 (310010,310001,now()-interval '10 minutes',now()+interval '1 hour',now()+interval '1 hour'),
 (310011,310001,now()+interval '1 day',now()+interval '2 days',now()+interval '2 days');
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000002',true);
select lives_ok($$insert into public.attendance_logs(student_id, session_id, program_id, marked_by) values('31000000-0000-0000-0000-000000000003',310010,310001,auth.uid())$$,'assigned coach can mark attendance');
select is((select count(*)::int from public.coach_attendance_roster(310010) where present),1,'roster reports present state');
select throws_ok($$delete from public.attendance_sessions where id=310010$$,'P0001','La sesión tiene asistencia. Conserva su historial y cancélala si procede.','sessions with attendance cannot be deleted');
select throws_ok($$select public.correct_attendance(310010,'31000000-0000-0000-0000-000000000003','x')$$,'P0001','Indica el motivo de la corrección (5–500 caracteres).','correction requires a meaningful reason');
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000004',true);
select throws_ok($$select public.coach_attendance_roster(310010)$$,'P0001','No puedes consultar esta sesión.','unassigned coach cannot read roster');
select throws_ok($$select public.correct_attendance(310010,'31000000-0000-0000-0000-000000000003','Wrong person')$$,'P0001','No puedes gestionar esta sesión.','unassigned coach cannot correct attendance');
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000002',true);
select lives_ok($$select public.correct_attendance(310010,'31000000-0000-0000-0000-000000000003','Marked the wrong student')$$,'assigned coach can correct attendance');
select is((select count(*)::int from public.coach_attendance_roster(310010) where present),0,'roster updates after correction');
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000003',true);
select is((select count(*)::int from public.user_badges ub join public.badges b on b.id=ub.badge_id where b.code='first_attendance' and ub.user_id=auth.uid()),0,'first attendance badge removed after last attendance correction');
select is((select event_xp::int from public.xp_summary_for_user(auth.uid()) where event_type='attendance_present'),0,'attendance XP recalculated');
select is((select count(*)::int from public.backoffice_audit),0,'student cannot see operational history');
select throws_ok($$select public.admin_people_directory()$$,'P0001','No autorizado.','student cannot read the people directory');
select throws_ok($$select public.admin_email_status()$$,'P0001','No autorizado.','student cannot inspect email delivery records');
select throws_ok($$select public.admin_account_identity(null,'bo-admin@test.local')$$,'P0001','No autorizado.','student cannot enumerate accounts');
select set_config('request.jwt.claim.sub','31000000-0000-0000-0000-000000000001',true);
select ok(exists(select 1 from public.backoffice_audit where entity='attendance_logs' and action='DELETE' and reason='Marked the wrong student'),'correction reason is audited');
select ok(not exists(select 1 from public.backoffice_audit where before_data ? 'qr_key' or after_data ? 'qr_key' or after_data ? 'lease_token'),'audit never contains bearer credentials');
select lives_ok($$select public.admin_update_program(310001,'BO active','','31000000-0000-0000-0000-000000000002',false)$$,'program can be archived');
select is((select status::text from public.enrollments where program_id=310001),'inactive','archiving deactivates enrollments');
select is((select active from public.attendance_sessions where id=310011),false,'archiving cancels future sessions');
select throws_ok($$update public.enrollments set status='active' where program_id=310001$$,'P0001','El programa no está activo.','cannot enroll in archived program');
select lives_ok($$select public.admin_update_profile('31000000-0000-0000-0000-000000000003','BO Student','student',false)$$,'student can be deactivated with history');
select throws_ok($$select public.admin_update_profile('31000000-0000-0000-0000-000000000002','BO Coach','coach',false)$$,'P0001','Reasigna los programas antes de dar de baja a esta persona.','coach must be reassigned before deactivation');
select * from finish();
rollback;
