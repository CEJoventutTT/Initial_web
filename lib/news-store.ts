import 'server-only'

import { createClient } from '@supabase/supabase-js'
import type { NewsArticle } from '@/lib/news'
import { getRedis } from '@/lib/redis'
import { requireSupabaseConfig } from '@/lib/supabase/env'

const NEWS_CACHE_KEY = 'news:published:v1'
const NEWS_CACHE_TTL_SECONDS = 300

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
  const redis = getRedis()
  if (redis) {
    try {
      const cachedNews = await redis.get<NewsArticle[]>(NEWS_CACHE_KEY)
      if (cachedNews) return cachedNews
    } catch (error) {
      console.error('[news] Redis cache read failed:', error)
    }
  }

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
  const news = ((data || []) as NewsArticleRow[]).map(fromRow)

  if (redis) {
    try {
      await redis.set(NEWS_CACHE_KEY, news, { ex: NEWS_CACHE_TTL_SECONDS })
    } catch (error) {
      console.error('[news] Redis cache write failed:', error)
    }
  }

  return news
}

export async function invalidateNewsCache() {
  const redis = getRedis()
  if (!redis) return

  try {
    await redis.del(NEWS_CACHE_KEY)
  } catch (error) {
    console.error('[news] Redis cache invalidation failed:', error)
  }
}
