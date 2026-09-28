import { NextResponse } from 'next/server'
import { getNewsPage, type NewsCursor } from '@/lib/news-store'
import type { Lang } from '@/lib/news'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const rawCursor = params.get('cursor')
  const lang = params.get('lang') ?? 'es'
  let cursor: NewsCursor | null = null
  if (rawCursor) {
    try {
      const decoded = JSON.parse(Buffer.from(rawCursor, 'base64url').toString('utf8')) as Record<string, unknown>
      if (
        typeof decoded.date !== 'string' || !Number.isFinite(Date.parse(decoded.date)) ||
        typeof decoded.id !== 'string' || decoded.id.length < 1 || decoded.id.length > 200
      ) throw new Error('Invalid cursor')
      cursor = { date: decoded.date, id: decoded.id }
    } catch {
      return NextResponse.json({ error: 'Invalid cursor' }, { status: 400 })
    }
  }
  if (!['es', 'ca', 'en'].includes(lang)) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
  }
  const { items, hasMore, nextCursor, lang: effectiveLang } = await getNewsPage(cursor, lang as Lang)
  return NextResponse.json(
    {
      items: items.map((item) => ({ ...item, body: undefined })),
      hasMore,
      nextCursor: nextCursor ? Buffer.from(JSON.stringify(nextCursor)).toString('base64url') : null,
      lang: effectiveLang,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
