// app/coach/sessions/[id]/qr/page.tsx
import { supabaseServer } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import QR from './qr-client'
import RotateQrButton from '@/components/coach/RotateQrButton'

export default async function SessionQRPage({ params }: { params: { id: string } }) {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const sid = Number(params.id)
  if (!Number.isFinite(sid)) redirect('/coach/sessions')

  const { data: s } = await supabase
    .from('sessions')
    .select('id, program_id, starts_at, ends_at, qr_secret')
    .eq('id', sid)
    .single()
  if (!s) redirect('/coach/sessions')

  // permisos (igual que ya tenías) …

  // 🔐 Base URL robusta: env var > headers > localhost
  const h = headers()
  const proto = h.get('x-forwarded-proto') ?? 'http'
  const host  = h.get('x-forwarded-host') ?? h.get('host') ?? 'localhost:3000'
  const base  = (process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')) || `${proto}://${host}`

  const attendUrl = `${base}/attend?s=${s.id}&k=${encodeURIComponent(String(s.qr_secret ?? ''))}`

  // render (igual) …
  return (
    <div className="space-y-6 max-w-3xl">
      {/* … */}
      <div className="bg-white p-4 inline-block rounded">
        <QR value={attendUrl} />
      </div>
      <div className="text-xs text-white/60 break-all">{attendUrl}</div>
      <div className="space-x-3">
        <RotateQrButton sessionId={s.id} size="md" />
        <a href="/coach/sessions" className="border border-white/20 rounded px-4 py-2 hover:bg-white/10">Volver</a>
      </div>
    </div>
  )
}
