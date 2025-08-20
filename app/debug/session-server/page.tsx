// app/debug/session-server/page.tsx
import { supabaseServer } from '@/lib/supabase/server'

export default async function DebugSessionServer() {
  const supabase = supabaseServer()
  const { data: { session }, error } = await supabase.auth.getSession()

  return (
    <div className="p-6 space-y-3 text-sm">
      <div><b>error:</b> {error ? error.message : 'null'}</div>
      <div><b>user:</b> {session?.user?.id || 'null'}</div>
      <div><b>email:</b> {session?.user?.email || 'null'}</div>
      <div><b>exp:</b> {String(session?.expires_at || 'null')}</div>
      <pre className="text-xs whitespace-pre-wrap bg-white/5 p-3 rounded">
        {JSON.stringify(session, null, 2)}
      </pre>
    </div>
  )
}
