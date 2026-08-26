// app/api/admin/user/route.ts
import { NextResponse } from 'next/server'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseServiceRoleKey } from '@/lib/supabase/env'

type Role = 'student' | 'coach' | 'admin' | 'parent'

const requestWindow = new Map<string, { startedAt: number; count: number }>()
const WINDOW_MS = 60_000
const MAX_REQUESTS_PER_WINDOW = 10
const MAX_TRACKED_CLIENTS = 10_000

// helper: comprueba header x-admin-key
function hasAdminKey(req: Request) {
  const headerKey = req.headers.get('x-admin-key')
  return !!process.env.ADMIN_API_KEY && headerKey === process.env.ADMIN_API_KEY
}

function isRateLimited(req: Request) {
  const now = Date.now()
  for (const [ip, window] of requestWindow) {
    if (now - window.startedAt >= WINDOW_MS) requestWindow.delete(ip)
  }

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const current = requestWindow.get(ip)
  if (!current) {
    if (requestWindow.size >= MAX_TRACKED_CLIENTS) return true
    requestWindow.set(ip, { startedAt: now, count: 1 })
    return false
  }
  current.count += 1
  return current.count > MAX_REQUESTS_PER_WINDOW
}

async function deleteUserAfterProfileFailure(
  supabaseAdmin: SupabaseClient,
  userId: string,
) {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
    if (!error) return true

    if (attempt < 3) {
      await new Promise((resolve) => setTimeout(resolve, 100 * attempt))
    } else {
      console.error('[admin/users] failed to rollback Auth user', {
        userId,
        error: error.message,
      })
    }
  }

  return false
}

export async function POST(req: Request) {
  if (!hasAdminKey(req)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }
  if (isRateLimited(req)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const url = getSupabaseUrl()
  const serviceKey = getSupabaseServiceRoleKey()
  if (!url || !serviceKey) {
    return NextResponse.json({ error: 'server_misconfigured' }, { status: 500 })
  }

  const supabaseAdmin = createClient(
    url,
    serviceKey
  )

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
    const rolledBack = await deleteUserAfterProfileFailure(supabaseAdmin, data.user.id)
    if (!rolledBack) {
      return NextResponse.json({ error: 'profile_creation_rollback_failed' }, { status: 500 })
    }
    return NextResponse.json({ error: 'profile_creation_failed' }, { status: 500 })
  }

  // 3) (Opcional) Genera link de recuperación (set password)
  await supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email })

  return NextResponse.json({ ok: true })
}
