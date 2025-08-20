import { supabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import QR from './qr-client' // mismo componente que usas para dibujar el QR

export default async function ProgramQRPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const pid = Number(params.id)
  if (!Number.isFinite(pid)) redirect('/coach/programs')

  const { data: prog } = await supabase
    .from('programs')
    .select('id, name, qr_secret')
    .eq('id', pid)
    .single()
  if (!prog) redirect('/coach/programs')

  // (opcional) verifica que este coach tiene acceso a este programa

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') || ''
  const attendUrl = `${site}/attend?k=${encodeURIComponent(String(prog.qr_secret))}`

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-bold">QR universal — {prog.name ?? `programa #${prog.id}`}</h1>

      <div className="bg-white p-4 inline-block rounded">
        <QR value={attendUrl} />
      </div>

      <div className="space-x-3">
        <form action={async () => {
          'use server'
          await fetch(`${site}/api/coach/programs/${pid}/qr/rotate`, { method: 'POST', cache: 'no-store' })
        }}>
          <button className="bg-primary text-primary-foreground rounded px-4 py-2">Rotar código</button>
        </form>
        <a href="/coach/programs" className="border border-white/20 rounded px-4 py-2 hover:bg-white/10">Volver</a>
      </div>

      <p className="text-sm text-white/60">
        Este QR funciona para <b>todas</b> las sesiones del programa. El check‑in se aplica a la sesión que esté
        activa según la ventana de tiempo configurada.
      </p>
    </div>
  )
}
