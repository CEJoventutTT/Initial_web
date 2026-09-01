import { NextResponse } from 'next/server'
import { retryPendingEmail } from '@/lib/email/submit'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ ok: false, error: 'Missing CRON_SECRET' }, { status: 500 })
  if (request.headers.get('authorization') !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    return NextResponse.json({ ok: true, ...(await retryPendingEmail()) })
  } catch (error) {
    console.error('[email-retry] failed', error)
    return NextResponse.json({ ok: false, error: 'Email retry failed' }, { status: 500 })
  }
}
