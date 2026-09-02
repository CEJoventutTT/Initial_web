import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import { sendPasswordRecoveryEmail } from '@/lib/email/password-recovery'
import { consumeRateLimit } from '@/lib/rate-limit'
import { requireSupabaseAdminConfig } from '@/lib/supabase/env'
import { createClient } from '@supabase/supabase-js'

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254) })
const SITE_URL = 'https://cejoventut.com'
const WINDOW_SECONDS = 60 * 60
const IP_LIMIT = 5
const EMAIL_LIMIT = 3

function clientIp(request: Request) {
  return request.headers.get('x-vercel-forwarded-for')
    || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
}

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex')
}

function okResponse() {
  return NextResponse.json({ ok: true })
}

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json())
    const requestId = request.headers.get('idempotency-key') || randomUUID()
    const [ipRate, emailRate] = await Promise.all([
      consumeRateLimit(`rate-limit:password-reset:ip:${hash(clientIp(request))}`, IP_LIMIT, WINDOW_SECONDS, requestId),
      consumeRateLimit(`rate-limit:password-reset:email:${hash(body.email)}`, EMAIL_LIMIT, WINDOW_SECONDS, requestId),
    ])
    if (ipRate.limited || emailRate.limited) return NextResponse.json({ ok: false, error: 'Too many requests' }, { status: 429 })

    const { url, serviceRoleKey } = requireSupabaseAdminConfig()
    const admin = createClient(url, serviceRoleKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data, error } = await admin.auth.admin.generateLink({ type: 'recovery', email: body.email })

    // Never reveal whether an address has an account.
    if (error || !data.properties.hashed_token) {
      if (error && error.status !== 404) console.error('[password-recovery] unable to generate recovery link', error.message)
      return okResponse()
    }

    const resetUrl = new URL('/auth/callback', SITE_URL)
    resetUrl.searchParams.set('token_hash', data.properties.hashed_token)
    resetUrl.searchParams.set('type', 'recovery')
    try {
      await sendPasswordRecoveryEmail({
        to: body.email,
        resetUrl: resetUrl.toString(),
        idempotencyKey: `password-recovery:${data.properties.hashed_token}`,
      })
    } catch (deliveryError) {
      // Returning a delivery-specific error only when generateLink succeeds
      // would let callers discover which addresses have an account.
      console.error('[password-recovery] email delivery failed', deliveryError)
    }

    return okResponse()
  } catch (error) {
    if (error instanceof z.ZodError || error instanceof SyntaxError) {
      return NextResponse.json({ ok: false, error: 'Invalid request data' }, { status: 400 })
    }
    console.error('[password-recovery] request failed', error)
    return NextResponse.json({ ok: false, error: 'Unable to process request' }, { status: 500 })
  }
}
