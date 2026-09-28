import { NextResponse } from 'next/server'
import { getNewsPage } from '@/lib/news-store'
import type { Lang } from '@/lib/news'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const rawPage = params.get('page') ?? '0'
  const lang = params.get('lang') ?? 'es'
  if (!/^(0|[1-9]\d{0,3})$/.test(rawPage)) {
    return NextResponse.json({ error: 'Invalid page' }, { status: 400 })
  }
  if (!['es', 'ca', 'en'].includes(lang)) {
    return NextResponse.json({ error: 'Invalid language' }, { status: 400 })
  }
  const { items, hasMore, lang: effectiveLang } = await getNewsPage(Number(rawPage), lang as Lang)
  return NextResponse.json(
    { items: items.map((item) => ({ ...item, body: undefined })), hasMore, lang: effectiveLang },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}
