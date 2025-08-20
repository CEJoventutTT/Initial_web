// app/coach/sessions/[id]/qr/page.tsx
import { cookies, headers } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import CopyButton from '@/components/CopyButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function SessionQrPage({ params }: { params: { id: string } }) {
  const id = params.id
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => cookieStore.get(name)?.value } }
  )

  const { data, error } = await supabase
    .from('attendance_sessions')
    .select('id, secret, start_at, end_at, active')
    .eq('id', id)
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

  const now = Date.now()
  const start = new Date(data.start_at).getTime()
  const end = new Date(data.end_at).getTime()

  let status: string
  if (now < start) status = 'No iniciada'
  else if (now > end) status = 'Finalizada'
  else status = data.active ? 'En curso' : 'Pausada'

  const siteEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  let siteBase = siteEnv
  if (!siteBase) {
    const h = await headers()
    const host = h.get('x-forwarded-host') || h.get('host') || ''
    const proto = (h.get('x-forwarded-proto') || 'https') + '://'
    siteBase = host ? `${proto}${host}` : ''
  }

  const attendUrl =
    now <= end
      ? `${siteBase}/attend?s=${encodeURIComponent(id)}&k=${encodeURIComponent(data.secret)}`
      : null

  const qrSrc =
    attendUrl &&
    `https://api.qrserver.com/v1/create-qr-code/?size=360x360&data=${encodeURIComponent(
      attendUrl
    )}`

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
              <p><span className="text-white/60">Inicio:</span> {new Date(data.start_at).toLocaleString()}</p>
              <p><span className="text-white/60">Fin:</span> {new Date(data.end_at).toLocaleString()}</p>
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
                  <img
                    src={qrSrc!}
                    alt="Código QR"
                    className="h-[300px] w-[300px] rounded-lg bg-white p-2 shadow-soft"
                  />
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
