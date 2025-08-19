import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// GET: lista sesiones de los programas de este coach
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // programas del coach
  const { data: programs, error: progErr } = await supabase
    .from('programs')
    .select('id, name')
    .eq('coach_id', session.user.id)
  if (progErr) return NextResponse.json({ error: progErr.message }, { status: 400 })

  const programIds = (programs ?? []).map(p => p.id)
  let sessions: any[] = []
  if (programIds.length) {
    const { data, error } = await supabase
      .from('sessions')
      .select('id, program_id, starts_at, ends_at')
      .in('program_id', programIds)
      .order('starts_at', { ascending: true })
      .limit(100)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    sessions = data ?? []
  }

  return NextResponse.json({ programs: programs ?? [], sessions })
}

// POST: crear sesión (sólo si el coach es dueño del programa)
export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { program_id, starts_at, ends_at } = await req.json()

  // Verifica ownership del programa
  const { data: prog } = await supabase
    .from('programs')
    .select('id')
    .eq('id', program_id)
    .eq('coach_id', session.user.id)
    .single()
  if (!prog) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const { error } = await supabase
    .from('sessions')
    .insert({ program_id, starts_at, ends_at })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
