// app/api/coach/attendance/checkin/route.ts
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

function supa() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) { return cookieStore.get(name)?.value },
        set() {}, remove() {},
      },
    }
  )
}

async function run(qrKey: string) {
  const supabase = supa()

  const { data: auth, error: authErr } = await supabase.auth.getUser()
  if (authErr || !auth?.user) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }
  const studentId = auth.user.id

  const { data: log, error } = await supabase.rpc('checkin_by_key', {
    p_qr_key: qrKey,
    p_student_id: studentId,
    p_points: 15,
    p_reason: 'training attendance',
  })

  if (error) {
    const m = (error.message || '').toLowerCase()
    if (m.includes('session_not_found') || m.includes('inactive')) {
      return NextResponse.json({ ok: false, status: 'inactive' }, { status: 400 })
    }
    return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
  }

  // ¿nuevo o repetido? Si hay un ledger con source_id = log.id → fue nuevo
  const { data: xp } = await supabase
    .from('points_ledger')
    .select('id')
    .eq('source_type', 'attendance')
    .eq('source_id', log.id)
    .eq('student_id', studentId)
    .limit(1)

  const status = xp && xp.length > 0 ? 'new' : 'repeat'
  return NextResponse.json({ ok: true, status, attendance: log })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const k = body?.k || body?.key
  if (!k) return NextResponse.json({ ok: false, error: 'missing key' }, { status: 400 })
  return run(String(k))
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const k = url.searchParams.get('k') || url.searchParams.get('key')
  if (!k) return NextResponse.json({ ok: false, error: 'missing key' }, { status: 400 })
  return run(k)
}
