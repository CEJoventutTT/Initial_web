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
    return <div className="p-6 text-red-400">No se pudo cargar la sesión</div>
  }

  const now = Date.now()
  const start = new Date(data.start_at).getTime()
  const end = new Date(data.end_at).getTime()

  let status: string
  if (now < start) status = 'No iniciada'
  else if (now > end) status = 'Finalizada'
  else status = data.active ? 'En curso' : 'Pausada'

  // Base URL
  const siteEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')
  let siteBase = siteEnv
  if (!siteBase) {
    const h = await headers()
    const host = h.get('x-forwarded-host') || h.get('host') || ''
    const proto = (h.get('x-forwarded-proto') || 'https') + '://'
    siteBase = host ? `${proto}${host}` : ''
  }

  // URL con secreto (solo válida si la sesión no ha terminado)
  const attendUrl =
    now <= end
      ? `${siteBase}/attend?s=${encodeURIComponent(id)}&k=${encodeURIComponent(data.secret)}`
      : null

  const qrSrc =
    attendUrl &&
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      attendUrl
    )}`

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">QR de la sesión</h1>

      <div className="flex flex-col items-center gap-4 rounded border border-white/10 p-6">
        <div className="text-white/80">
          <p>
            <strong>Inicio:</strong> {new Date(data.start_at).toLocaleString()}
          </p>
          <p>
            <strong>Fin:</strong> {new Date(data.end_at).toLocaleString()}
          </p>
          <p>
            <strong>Estado:</strong>{' '}
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

        {attendUrl ? (
          <>
            <img
              src={qrSrc!}
              alt="Código QR"
              className="h-[300px] w-[300px] rounded bg-white p-2"
            />
            <div className="max-w-full overflow-x-auto rounded bg-white/5 p-3 font-mono text-sm">
              {attendUrl}
            </div>
            <div className="flex gap-2">
              <a
                href={attendUrl}
                className="rounded bg-white/10 px-3 py-1 hover:bg-white/20"
                target="_blank"
              >
                Abrir enlace
              </a>
              <CopyButton text={attendUrl} />
            </div>
          </>
        ) : (
          <div className="rounded bg-red-500/10 p-4 text-red-300">
            La sesión ya ha finalizado. El QR ha caducado.
          </div>
        )}
      </div>
    </main>
  )
}
