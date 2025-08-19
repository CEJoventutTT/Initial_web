import { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createServerComponentClient({ cookies })

  // 1) Recupera sesión activa
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session?.user) {
    redirect('/login')
  }

  // 2) Busca el perfil en la tabla `profiles`
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  if (error || profile?.role !== 'admin') {
    redirect('/')
  }

  // 3) Renderiza el contenido protegido
  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="max-w-5xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold mb-6">Panel de administración</h1>
        {children}
      </div>
    </div>
  )
}
