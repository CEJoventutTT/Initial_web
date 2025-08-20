import { supabaseServer } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Navigation from '@/components/navigation'
import RotateQrButton from '@/components/coach/RotateQrButton'

export default async function CoachSessionsPage() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return <div className="min-h-screen bg-[#262425] text-white p-6">Debes iniciar sesión</div>
  }

  const { data: sessions } = await supabase
    .from('sessions')
    .select('id, program_id, starts_at, ends_at, qr_secret')
    .order('starts_at', { ascending: true })
    .limit(100)

  return (
    <div className="min-h-screen bg-[#262425] text-white">
      <Navigation />
      <main className="pt-16 px-4 sm:px-6 lg:px-8 pb-10 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Sesiones</h1>

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="min-w-full text-sm">
            <thead className="bg-white/5">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Programa</th>
                <th className="text-left px-4 py-3">Inicio</th>
                <th className="text-left px-4 py-3">Fin</th>
                <th className="text-left px-4 py-3">QR</th>
              </tr>
            </thead>
            <tbody>
              {(sessions ?? []).map((s) => {
                const hasQR = !!s.qr_secret && s.qr_secret !== 'null' && s.qr_secret !== 'undefined'
                return (
                  <tr key={s.id} className="border-t border-white/10">
                    <td className="px-4 py-3 font-mono">#{s.id}</td>
                    <td className="px-4 py-3">{s.program_id}</td>
                    <td className="px-4 py-3">{new Date(s.starts_at).toLocaleString('es-ES')}</td>
                    <td className="px-4 py-3">{s.ends_at ? new Date(s.ends_at).toLocaleString('es-ES') : '—'}</td>
                    <td className="px-4 py-3">
                      {hasQR ? (
                        <Link href={`/coach/sessions/${s.id}/qr`}>
                          <Button size="sm" className="bg-primary text-white hover:bg-primary/90">Mostrar QR</Button>
                        </Link>
                      ) : (
                        <RotateQrButton sessionId={s.id} />
                      )}
                    </td>
                  </tr>
                )
              })}
              {!sessions?.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-white/70">No hay sesiones.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
