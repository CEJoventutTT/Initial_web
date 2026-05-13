import { NextResponse } from 'next/server'
import { syncNewsFromRss } from '@/lib/news-rss-sync'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const runtime = 'nodejs'

export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      { ok: false, error: 'Missing CRON_SECRET' },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const result = await syncNewsFromRss()
    return NextResponse.json(result)
  } catch (error) {
    console.error('News RSS cron sync failed', error)
    return NextResponse.json(
      { ok: false, error: 'News RSS cron sync failed' },
      { status: 500 }
    )
  }
}
