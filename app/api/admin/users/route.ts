// app/api/admin/user/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // SOLO en servidor
)

type Role = 'student' | 'coach' | 'admin' | 'parent'

// helper: comprueba header x-admin-key
function hasAdminKey(req: Request) {
  const headerKey = req.headers.get('x-admin-key')
  return !!process.env.ADMIN_API_KEY && headerKey === process.env.ADMIN_API_KEY
}

export async function POST(req: Request) {
  if (!hasAdminKey(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  const body = (await req.json()) as {
    email?: string
    fullName?: string
    role?: Role
  }

  const email = (body.email ?? '').trim().toLowerCase()
  const fullName = (body.fullName ?? '').trim() || null
  const role = body.role

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'invalid email' }, { status: 400 })
  }
  if (!role || !['student', 'coach', 'admin', 'parent'].includes(role)) {
    return NextResponse.json({ error: 'invalid role' }, { status: 400 })
  }

  // 1) Crea usuario en Supabase Auth
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    email_confirm: false,
    user_metadata: { fullName, role },
  })
  if (error || !data?.user) {
    return NextResponse.json({ error: error?.message ?? 'createUser failed' }, { status: 400 })
  }

  // 2) Inserta perfil
  const { error: pErr } = await supabaseAdmin.from('profiles').insert({
    user_id: data.user.id,
    role,
    full_name: fullName,
    locale: 'es',
  })
  if (pErr) {
    return NextResponse.json({ error: pErr.message }, { status: 400 })
  }

  // 3) (Opcional) Genera link de recuperación (set password)
  await supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email })

  return NextResponse.json({ ok: true })
}
