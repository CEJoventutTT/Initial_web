import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { session_id, user_id, status } = await req.json()

  // Verifica que la sesión pertenezca a un programa del coach
  const { data: s } = await supabase
    .from('sessions')
    .select('program_id')
    .eq('id', session_id)
    .single()
  if (!s) return NextResponse.json({ error: 'session_not_found' }, { status: 404 })

  const { data: prog } = await supabase
    .from('programs')
    .select('id')
    .eq('id', s.program_id)
    .eq('coach_id', session.user.id)
    .single()
  if (!prog) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('attendance')
     .upsert({ session_id, user_id, status }, { onConflict: 'session_id,user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
