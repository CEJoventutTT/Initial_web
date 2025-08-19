import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // Opcional: verificar que quien llama es coach del programa
  const { session_id, user_id, status } = await req.json()

  const { error } = await supabase.from('attendance').insert({
    session_id,
    user_id,
    status // 'present' | 'absent' | 'late'
  })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
