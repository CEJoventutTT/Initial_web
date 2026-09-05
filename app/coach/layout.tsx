import BackofficeNavigation from '@/components/backoffice/navigation'
// app/coach/layout.tsx
import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import { getMissingSupabaseEnv, hasSupabaseEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CoachLayout({
  children,
}: {
  children: ReactNode
}) {
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

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, active')
    .eq('user_id', user.id)
    .single()

  if (!profile?.active || !['coach', 'admin'].includes(profile.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white bg-hero-gradient-deep">
      <div className="border-b border-border/60 bg-brand-dark/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <h1 className="text-xl font-extrabold tracking-tight">
            Panel del Coach
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <BackofficeNavigation admin={profile.role === 'admin'} />
        {children}
      </div>
    </div>
  )
}
