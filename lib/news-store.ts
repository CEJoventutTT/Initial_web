import 'server-only'

import { readFile } from 'node:fs/promises'
import path from 'node:path'
import type { NewsArticle } from '@/lib/news'

const newsPath = path.join(process.cwd(), 'data', 'news.json')

export async function getNews(): Promise<NewsArticle[]> {
  const raw = await readFile(newsPath, 'utf8')
  const items = JSON.parse(raw) as NewsArticle[]

  return items.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
}
