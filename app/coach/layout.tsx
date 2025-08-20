// app/coach/layout.tsx
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'

export default async function CoachLayout({ children }: { children: ReactNode }) {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  if (!profile || !['coach', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-black mb-6">Panel del Coach</h1>

        {/* Accesos rápidos dentro del layout */}
        <div className="mb-6 flex gap-3">
          <a
            href="/coach/sessions"
            className="bg-primary text-primary-foreground rounded px-4 py-2"
          >
            Crear/gestionar sesiones
          </a>
          <a
            href="/coach/attendance"
            className="border border-white/20 rounded px-4 py-2 hover:bg-white/10"
          >
            Marcar asistencia manual
          </a>
        </div>

        {children}
      </div>
    </div>
  )
}
