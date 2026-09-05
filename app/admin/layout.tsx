import BackofficeNavigation from '@/components/backoffice/navigation'
import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { authenticatedSupabase, hasRole } from '@/lib/supabase/request-auth'

export default async function AdminLayout({
  children,
}: {
  children: ReactNode
}) {
  const { supabase, user } = await authenticatedSupabase()
  if (!user) redirect('/login?next=/admin/user')

  if (!(await hasRole(supabase, user.id, ['admin']))) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="mb-6 text-3xl font-bold">Panel de administración</h1>
        <BackofficeNavigation admin />
        {children}
      </div>
    </div>
  )
}
