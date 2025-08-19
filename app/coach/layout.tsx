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
        {children}
      </div>
    </div>
  )
}
