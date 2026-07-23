// app/debug/session-client/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase/client'

export default function DebugSessionClient() {
  const supabase = supabaseBrowser()
  const [sessionJSON, setSessionJSON] = useState('cargando...')

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setSessionJSON(JSON.stringify(session, null, 2))
    })()
    return () => { mounted = false }
  }, [supabase])

  return (
    <pre className="p-6 whitespace-pre-wrap text-xs">
      {sessionJSON}
    </pre>
  )
}
