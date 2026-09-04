'use client'

import { useActionState, type ReactNode } from 'react'
import { useFormStatus } from 'react-dom'
import { assignCoach, createProgram, createUserAdmin, enrollStudent, reviewApplication } from './actions'

type Profile = { user_id: string; full_name: string | null; role: string }
type Program = { id: number; name: string; active: boolean; coach_id: string | null }
type Application = { id: string; full_name: string; email: string; phone: string; municipality: string; birth_date: string; competition_interest: string; event_interest: string; status: string; internal_notes: string | null; created_at: string }
const initialState = { ok: false, error: null as string | null, message: null as string | null, recoveryUrl: null as string | null }

const controlClass = 'mt-1.5 w-full rounded-lg border border-white/20 bg-white px-3 py-2.5 text-zinc-950 shadow-sm outline-none transition placeholder:text-zinc-400 focus:border-brand-green focus:ring-2 focus:ring-brand-green/40'

function SubmitButton({ children, className = '' }: { children: ReactNode; className?: string }) {
  const { pending } = useFormStatus()
  return <button type="submit" disabled={pending} className={`rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-brand-green focus:ring-offset-2 focus:ring-offset-brand-dark disabled:cursor-not-allowed disabled:opacity-60 ${className}`}>{pending ? 'Guardando…' : children}</button>
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return <div><label htmlFor={htmlFor} className="text-sm font-medium text-white/90">{label}</label>{children}</div>
}

function ActionFeedback({ state }: { state: Pick<typeof initialState, 'error' | 'message'> }) {
  return <>
    {state.error && <p className="mt-4 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100" role="alert">{state.error}</p>}
    {state.message && <p className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100" role="status">{state.message}</p>}
  </>
}

export default function AdminClient({ applications, profiles, programs }: { applications: Application[]; profiles: Profile[]; programs: Program[] }) {
  const [state, formAction] = useActionState(createUserAdmin, initialState)
  const [reviewState, reviewAction] = useActionState(reviewApplication, initialState)
  const [programState, programAction] = useActionState(createProgram, initialState)
  const [coachState, coachAction] = useActionState(assignCoach, initialState)
  const [enrollmentState, enrollmentAction] = useActionState(enrollStudent, initialState)
  const coaches = profiles.filter((profile) => profile.role === 'coach' || profile.role === 'admin')
  const students = profiles.filter((profile) => profile.role === 'student')
  const hasPrograms = programs.length > 0
  const hasCoaches = coaches.length > 0

  return <div className="space-y-8">
    <section className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 shadow-xl shadow-black/10 sm:p-7">
      <div className="mb-6"><h2 className="text-xl font-bold">Crear cuenta</h2><p className="mt-1 text-sm text-white/65">Envía una invitación y asigna el rol inicial de la persona.</p></div>
      <form action={formAction} className="grid gap-4 sm:grid-cols-2">
        <Field label="Correo electrónico" htmlFor="create-email"><input id="create-email" name="email" type="email" required autoComplete="email" placeholder="usuario@dominio.com" className={controlClass} /></Field>
        <Field label="Nombre completo" htmlFor="create-full-name"><input id="create-full-name" name="fullName" autoComplete="name" placeholder="Nombre y apellidos" className={controlClass} /></Field>
        <Field label="Rol" htmlFor="create-role"><select id="create-role" name="role" defaultValue="student" className={controlClass}><option value="student">Alumno/a</option><option value="coach">Entrenador/a</option><option value="admin">Administración</option><option value="parent">Tutor/a</option></select></Field>
        <div className="flex items-end"><SubmitButton>Crear e invitar</SubmitButton></div>
      </form>
      <ActionFeedback state={state} />
      {state.recoveryUrl && <div className="mt-4 rounded-lg border border-amber-400/40 bg-amber-300/10 p-3 text-sm text-amber-50"><p className="font-semibold">Enlace de un solo uso</p><p className="mt-1 break-all select-all text-amber-100">{state.recoveryUrl}</p></div>}
    </section>

    <section className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 shadow-xl shadow-black/10 sm:p-7">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2"><div><h2 className="text-xl font-bold">Solicitudes de alta</h2><p className="mt-1 text-sm text-white/65">{applications.length} solicitud{applications.length === 1 ? '' : 'es'} reciente{applications.length === 1 ? '' : 's'}.</p></div></div>
      <ActionFeedback state={reviewState} />
      {applications.length === 0 ? <p className="rounded-lg border border-dashed border-white/20 p-5 text-sm text-white/65">No hay solicitudes todavía.</p> : <div className="space-y-4">{applications.map((application) => <form action={reviewAction} key={application.id} className="grid gap-4 rounded-xl border border-white/10 bg-black/10 p-4 lg:grid-cols-[minmax(0,1.4fr)_180px_minmax(220px,1fr)]"><input type="hidden" name="application_id" value={application.id} /><div><h3 className="font-semibold text-white">{application.full_name}</h3><p className="mt-1 text-sm text-white/70">{application.email} · {application.phone}</p><p className="mt-1 text-sm text-white/55">{application.municipality} · nacimiento {application.birth_date} · competición: {application.competition_interest === 'yes' ? 'sí' : application.competition_interest === 'no' ? 'no' : 'más adelante'}</p></div><Field label="Estado" htmlFor={`application-status-${application.id}`}><select id={`application-status-${application.id}`} name="status" defaultValue={application.status} className={controlClass}><option value="new">Nueva</option><option value="contacted">Contactada</option><option value="approved">Aprobada</option><option value="rejected">Rechazada</option><option value="archived">Archivada</option></select></Field><Field label="Notas internas" htmlFor={`application-notes-${application.id}`}><textarea id={`application-notes-${application.id}`} name="internal_notes" defaultValue={application.internal_notes ?? ''} placeholder="Seguimiento, llamada, documentación…" className={`${controlClass} min-h-24 resize-y`} /></Field><div className="lg:col-span-3"><SubmitButton>Guardar revisión</SubmitButton></div></form>)}</div>}
    </section>

    <section className="rounded-2xl border border-white/15 bg-white/[0.04] p-5 shadow-xl shadow-black/10 sm:p-7">
      <div className="mb-6"><h2 className="text-xl font-bold">Estructura deportiva</h2><p className="mt-1 text-sm text-white/65">Configura programas, responsables y matrículas.</p></div>
      <div className="grid gap-6 xl:grid-cols-3">
        <form action={programAction} className="rounded-xl border border-white/10 bg-black/10 p-4"><h3 className="font-semibold">Nuevo programa</h3><div className="mt-4 space-y-4"><Field label="Nombre" htmlFor="program-name"><input id="program-name" name="name" required placeholder="Iniciación, competición…" className={controlClass} /></Field><Field label="Descripción" htmlFor="program-description"><textarea id="program-description" name="description" placeholder="Horario, nivel o grupos" className={`${controlClass} min-h-24 resize-y`} /></Field><Field label="Responsable inicial" htmlFor="program-coach"><select id="program-coach" name="coach_id" className={controlClass}><option value="">Sin responsable</option>{coaches.map((coach) => <option key={coach.user_id} value={coach.user_id}>{coach.full_name || coach.user_id}</option>)}</select></Field><SubmitButton>Crear programa</SubmitButton></div><ActionFeedback state={programState} /></form>
        <form action={coachAction} className="rounded-xl border border-white/10 bg-black/10 p-4"><h3 className="font-semibold">Asignar entrenador</h3><div className="mt-4 space-y-4"><Field label="Programa" htmlFor="assign-program"><select id="assign-program" name="program_id" required disabled={!hasPrograms} className={controlClass}>{hasPrograms ? programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>) : <option>No hay programas</option>}</select></Field><Field label="Entrenador/a" htmlFor="assign-coach"><select id="assign-coach" name="coach_id" required disabled={!hasCoaches} className={controlClass}>{hasCoaches ? coaches.map((coach) => <option key={coach.user_id} value={coach.user_id}>{coach.full_name || coach.user_id}</option>) : <option>No hay entrenadores</option>}</select></Field><SubmitButton className="mt-2" >Asignar entrenador</SubmitButton></div><ActionFeedback state={coachState} /></form>
        <form action={enrollmentAction} className="rounded-xl border border-white/10 bg-black/10 p-4"><h3 className="font-semibold">Matricular alumno/a</h3><div className="mt-4 space-y-4"><Field label="Programa" htmlFor="enroll-program"><select id="enroll-program" name="program_id" required disabled={!hasPrograms} className={controlClass}>{hasPrograms ? programs.map((program) => <option key={program.id} value={program.id}>{program.name}</option>) : <option>No hay programas</option>}</select></Field><Field label="Alumno/a" htmlFor="enroll-student"><select id="enroll-student" name="user_id" required disabled={students.length === 0} className={controlClass}>{students.length > 0 ? students.map((student) => <option key={student.user_id} value={student.user_id}>{student.full_name || student.user_id}</option>) : <option>No hay alumnos</option>}</select></Field><SubmitButton className="mt-2">Matricular</SubmitButton></div><ActionFeedback state={enrollmentState} /></form>
      </div>
    </section>
  </div>
}
