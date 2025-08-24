// app/coach/sessions/page.tsx
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CoachSessionsPage() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options, expires: new Date(0) })
        },
      },
    }
  )

  const { data: auth, error: authErr } = await supabase.auth.getUser()
  if (authErr || !auth?.user) {
    redirect('/login?next=/coach/sessions')
  }

  const { data: sessions, error } = await supabase
    .from('attendance_sessions')
    .select('id, program_id, qr_key, active, start_at, end_at, expires_at, created_at')
    .order('id', { ascending: false })
    .limit(100)

  if (error) return <div className="p-6 text-red-400">Error: {error.message}</div>

  return (
    <div className="min-h-screen bg-[#262425] text-white">
      {/* ...tu tabla como ya la tenías... */}
    </div>
  )
}
