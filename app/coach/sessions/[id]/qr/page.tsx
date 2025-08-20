// app/coach/sessions/[id]/qr/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QR from './qr-client' // usa react-qr-code bajo el capó
import RotateQrButton from '@/components/coach/RotateQrButton'

export default async function SessionQRPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sid = Number(params.id)
  if (!Number.isFinite(sid)) redirect('/coach/sessions')

  // 1) Cargamos la sesión (incluye qr_secret)
  const { data: s } = await supabase
    .from('sessions')
    .select('id, program_id, starts_at, ends_at, qr_secret')
    .eq('id', sid)
    .single()
  if (!s) redirect('/coach/sessions')

  // 2) Verificamos ownership del coach (legacy o puente)
  const { data: allowed } = await supabase
    .from('programs')
    .select('id')
    .eq('id', s.program_id)
    .eq('coach_id', session.user.id)
    .maybeSingle()

  let hasAccess = !!allowed
  if (!hasAccess) {
    const { data: allowed2 } = await supabase
      .from('coach_programs')
      .select('id')
      .eq('program_id', s.program_id)
      .eq('coach_id', session.user.id)
      .limit(1)
    hasAccess = !!(allowed2 && allowed2.length)
  }
  if (!hasAccess) redirect('/coach/sessions')

  // 3) Construimos URL del attend con session_id + key (uuid)
  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })

  // Si no hay qr_secret aún → mostrar botón para generarlo
  if (!s.qr_secret) {
    return (
      <div className="space-y-6 max-w-3xl">
        <h1 className="text-2xl font-bold">QR de la sesión #{s.id}</h1>
        <p className="text-white/70">
          {fmt(s.starts_at)} {s.ends_at ? <>— {fmt(s.ends_at)}</> : null}
        </p>

        <p className="text-amber-400">
          Esta sesión todavía no tiene <code>qr_secret</code>. Genera uno para poder mostrar el QR.
        </p>

        <div className="space-x-3">
          <RotateQrButton sessionId={s.id} size="md" />
          <a
            href="/coach/sessions"
            className="border border-white/20 rounded px-4 py-2 hover:bg-white/10 inline-block"
          >
            Volver
          </a>
        </div>
      </div>
    )
  }

  const attendUrl = `${site}/attend?s=${s.id}&k=${encodeURIComponent(String(s.qr_secret))}`

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">QR de la sesión #{s.id}</h1>
      <p className="text-white/70">
        {fmt(s.starts_at)} {s.ends_at ? <>— {fmt(s.ends_at)}</> : null}
      </p>

      <div className="bg-white p-4 inline-block rounded">
        <QR value={attendUrl} />
      </div>

      <div className="space-x-3">
        {/* Rotar (regenerar) el secreto si se filtra el QR */}
        <RotateQrButton sessionId={s.id} size="md" />
        <a
          href="/coach/sessions"
          className="border border-white/20 rounded px-4 py-2 hover:bg-white/10"
        >
          Volver
        </a>
      </div>

      <p className="text-sm text-white/60">
        Comparte este QR con tus alumnos. Al escanearlo, abrirá{' '}
        <code>/attend?s={s.id}&amp;k=…</code> y registrará asistencia (y XP) para
        la sesión.
      </p>
    </div>
  )
}
