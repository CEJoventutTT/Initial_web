import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('user_id', session.user.id)
    .single()

  // Aquí puedes hacer switch por rol para renderizar panel de student/coach/admin
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Hola {profile?.full_name ?? 'Jugador/a'}</h1>
      <p className="text-white/70">Rol: {profile?.role}</p>
      {/* TODO: widgets de XP, racha, próximas sesiones, etc. */}
    </div>
  )
}
