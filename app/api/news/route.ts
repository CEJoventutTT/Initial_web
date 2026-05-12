import { NextResponse } from 'next/server'
import { getNews } from '@/lib/news-store'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const items = await getNews()
  return NextResponse.json(items)
}
