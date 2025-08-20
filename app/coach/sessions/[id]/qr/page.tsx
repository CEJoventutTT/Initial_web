// app/coach/sessions/[id]/qr/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QR from './qr-client'

export default async function SessionQRPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sid = Number(params.id)

  // Cargamos la sesión con qr_secret (RLS: sólo coach verá este campo)
  const { data: s } = await supabase
    .from('sessions')
    .select('id, program_id, starts_at, ends_at, qr_secret')
    .eq('id', sid)
    .single()
  if (!s) redirect('/coach/sessions')

  // Verificamos ownership (legacy o puente)
  const { data: allowed } = await supabase
    .from('programs')
    .select('id')
    .eq('id', s.program_id)
    .eq('coach_id', session.user.id)
    .maybeSingle()

  const { data: allowed2 } = await supabase
    .from('coach_programs')
    .select('id')
    .eq('program_id', s.program_id)
    .eq('coach_id', session.user.id)

  if (!allowed && !(allowed2 && allowed2.length)) redirect('/coach/sessions')

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''
  const attendUrl = `${site}/attend?s=${s.id}&k=${s.qr_secret}`

  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('es-ES', { weekday: 'short', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">QR de la sesión #{s.id}</h1>
      <p className="text-white/70">{fmt(s.starts_at)} — {fmt(s.ends_at)}</p>

      <div className="bg-white p-4 inline-block rounded">
        <QR value={attendUrl} />
      </div>

      <div className="space-x-3">
        <form action={async () => {
          'use server'
          await fetch(`${site}/api/coach/sessions/${sid}/qr/rotate`, { method: 'POST', cache: 'no-store' })
          // fuerza refresco SSR
        }}>
          <button className="bg-primary text-primary-foreground rounded px-4 py-2">Rotar código</button>
        </form>
        <a href="/coach/sessions" className="border border-white/20 rounded px-4 py-2 hover:bg-white/10">Volver</a>
      </div>

      <p className="text-sm text-white/60">
        Los alumnos deben **iniciar sesión** y escanear este QR durante la ventana de asistencia.
      </p>
    </div>
  )
}
