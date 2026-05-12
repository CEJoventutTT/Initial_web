import { NextResponse } from 'next/server'
import news from '@/data/news.json'
import type { NewsArticle } from '@/lib/news'

export async function GET() {
  const items = [...(news as NewsArticle[])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return NextResponse.json(items)
}
