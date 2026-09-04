// app/coach/sessions/[id]/qr/page.tsx
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import CopyButton from '@/components/CopyButton'
import QRCode from './qr-client'
import RotateQrButton from '@/components/coach/RotateQrButton'
import { requireSupabaseConfig } from '@/lib/supabase/env'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type CoachSessionQr = {
  id: number
  qr_key: string
  expires_at: string | null
  start_at: string
  end_at: string | null
  active: boolean
}

export default async function SessionQrPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  const { url, anonKey } = requireSupabaseConfig()
  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const { data, error } = await supabase
    .rpc('coach_session_qr', { p_session_id: Number(id) })
    .single()

  if (error || !data) {
    return (
      <main className="min-h-[60vh] bg-brand-dark bg-panel-glow p-6">
        <div className="mx-auto max-w-3xl rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-300 shadow-soft">
          No se pudo cargar la sesión
        </div>
      </main>
    )
  }

  const session = data as CoachSessionQr
  const now = Date.now()
  const start = new Date(session.start_at).getTime()
  const end = session.end_at ? new Date(session.end_at).getTime() : Number.POSITIVE_INFINITY

  let status: string
  if (now < start) status = 'No iniciada'
  else if (now > end) status = 'Finalizada'
  else status = session.active ? 'En curso' : 'Pausada'

  const siteBase = (
    process.env.NEXT_PUBLIC_SITE_URL || 'http://127.0.0.1:3000'
  ).replace(/\/$/, '')

  const attendUrl =
    now <= end
      ? `${siteBase}/attend?s=${encodeURIComponent(id)}&k=${encodeURIComponent(session.qr_key)}`
      : null

  return (
    <main className="min-h-[60vh] bg-brand-dark bg-panel-glow p-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <header className="rounded-xl border border-border/60 bg-muted/60 p-5 shadow-card backdrop-blur">
          <h1 className="text-2xl font-extrabold tracking-tight">QR de la sesión</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Escanea para registrar asistencia. El enlace incluye un token seguro.
          </p>
        </header>

        <section className="rounded-xl border border-border/60 bg-card/80 p-6 shadow-card backdrop-blur">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2 text-white/85">
              <p><span className="text-white/60">Inicio:</span> {new Date(session.start_at).toLocaleString()}</p>
              <p><span className="text-white/60">Fin:</span> {session.end_at ? new Date(session.end_at).toLocaleString() : 'Sin fecha'}</p>
              <p>
                <span className="text-white/60">Estado:</span>{' '}
                <span
                  className={
                    status === 'En curso'
                      ? 'text-emerald-400'
                      : status === 'No iniciada'
                      ? 'text-yellow-400'
                      : 'text-red-400'
                  }
                >
                  {status}
                </span>
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-4">
              {attendUrl ? (
                <>
                  <div className="rounded-lg bg-white p-4 shadow-soft"><QRCode value={attendUrl} /></div>
                  <div className="max-w-full overflow-x-auto rounded-md border border-white/10 bg-white/5 p-3 font-mono text-xs text-white/90">
                    {attendUrl}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={attendUrl}
                      className="rounded-md bg-accent/15 px-3 py-1 text-accent-foreground transition hover:bg-accent/25"
                      target="_blank"
                    >
                      Abrir enlace
                    </a>
                    <CopyButton text={attendUrl} />
                  </div>
                  <RotateQrButton sessionId={session.id} />
                </>
              ) : (
                <div className="w-full rounded-md border border-red-500/30 bg-red-500/10 p-4 text-center text-red-300">
                  La sesión ya ha finalizado. El QR ha caducado.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
