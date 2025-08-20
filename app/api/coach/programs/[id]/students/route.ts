// app/api/coach/programs/[id]/students/route.ts
import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const programId = Number(params.id)

  // RLS: verás sólo si eres coach del programa
  const { data, error } = await supabase
    .from('enrollments')
    .select('user_id, program_id, profiles:profiles!inner(user_id, full_name)')
    .eq('program_id', programId)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ students: data ?? [] })
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const programId = Number(params.id)
  const { user_id } = await req.json()

  const { error } = await supabase
    .from('enrollments')
    .insert({ program_id: programId, user_id })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const supabase = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const programId = Number(params.id)
  const { user_id } = await req.json()

  const { error } = await supabase
    .from('enrollments')
    .delete()
    .eq('program_id', programId)
    .eq('user_id', user_id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true })
}
