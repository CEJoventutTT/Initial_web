// app/coach/layout.tsx
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { getMissingSupabaseEnv, hasSupabaseEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CoachLayout({ children }: { children: ReactNode }) {
  if (!hasSupabaseEnv()) {
    return (
      <div className="min-h-screen bg-brand-dark text-white bg-hero-gradient-deep">
        <div className="mx-auto max-w-3xl px-4 py-12">
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-6">
            <h1 className="text-2xl font-bold">Configuracion pendiente</h1>
            <p className="mt-2 text-white/80">
              El panel del coach necesita variables de entorno de Supabase.
            </p>
            <p className="mt-3 text-sm text-white/70">
              Faltan: {getMissingSupabaseEnv().join(', ')}
            </p>
          </div>
        </div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-brand-dark text-white bg-hero-gradient-deep">
      <div className="border-b border-border/60 bg-brand-dark/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-extrabold tracking-tight">
            Panel del Coach
          </h1>
          <nav className="flex gap-2">
            <a
              href="/coach/sessions"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground shadow-brand transition hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Crear/gestionar sesiones
            </a>
            <a
              href="/coach/attendance"
              className="rounded-md border border-white/20 bg-white/5 px-4 py-2 text-white/90 transition hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-accent"
            >
              Marcar asistencia manual
            </a>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  )
}
