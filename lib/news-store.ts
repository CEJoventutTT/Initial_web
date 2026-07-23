import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { NewsArticle } from '@/lib/news'
import { requireSupabaseConfig } from '@/lib/supabase/env'

type NewsArticleRow = {
  id: string
  title: string
  excerpt: string
  date: string
  read_time: string
  image: string
  categories: NewsArticle['categories']
  external_url: string
  lang: NewsArticle['lang']
}

function fromRow(row: NewsArticleRow): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    date: row.date,
    readTime: row.read_time,
    image: row.image,
    categories: row.categories,
    externalUrl: row.external_url,
    lang: row.lang,
  }
}

export async function getNews(): Promise<NewsArticle[]> {
  const { url, anonKey } = requireSupabaseConfig()
  const supabase = createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const { data, error } = await supabase
    .from('news_articles')
    .select('id, title, excerpt, date, read_time, image, categories, external_url, lang')
    .eq('published', true)
    .order('date', { ascending: false })

  if (error) throw error
  return ((data || []) as NewsArticleRow[]).map(fromRow)
}
