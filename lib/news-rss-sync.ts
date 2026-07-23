import 'server-only'

import Parser from 'rss-parser'
import { createClient } from '@supabase/supabase-js'
import {
  detectArticleLang,
  normalizeCategories,
  type NewsArticle,
} from '@/lib/news'
import { requireSupabaseAdminConfig } from '@/lib/supabase/env'

const DEFAULT_RSS_URL = 'https://medium.com/feed/@ce.joventut.tt'

type RssItem = {
  title?: string
  link?: string
  guid?: string
  isoDate?: string
  pubDate?: string
  content?: string
  categories?: string[]
  'content:encoded'?: string
}

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

type NewsArticleInsert = {
  id: string
  title: string
  excerpt: string
  date: string
  read_time: string
  image: string
  categories: NewsArticle['categories']
  external_url: string
  lang: NewsArticle['lang']
  published: boolean
}

function normalizeText(input = '') {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function stripHtml(input = '') {
  return input.replace(/<[^>]*>/g, ' ')
}

function extractMediumId(url = '') {
  const match = url.match(/-([a-f0-9]{12})(?:\?|$)/i)
  return match ? `https://medium.com/p/${match[1]}` : ''
}

function normalizedTitle(title = '') {
  return normalizeText(title).replace(/\s+/g, ' ').trim()
}

function articleExists(existing: NewsArticle[], candidate: NewsArticle) {
  const candidateId = candidate.id || extractMediumId(candidate.externalUrl)
  const candidateUrl = candidate.externalUrl.trim()
  const candidateTitle = normalizedTitle(candidate.title)

  return existing.some((article) => {
    const articleId = article.id || extractMediumId(article.externalUrl)
    const articleUrl = article.externalUrl.trim()
    const articleTitle = normalizedTitle(article.title)

    return (
      (candidateId && articleId === candidateId) ||
      (candidateUrl && articleUrl === candidateUrl) ||
      (candidateTitle && articleTitle === candidateTitle)
    )
  })
}

function buildExcerpt(input = '', maxLength = 150) {
  return stripHtml(input).replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

function estimateReadTime(input = '') {
  const wordCount = stripHtml(input).trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`
}

function toIsoDate(value?: string) {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
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

function toRow(article: NewsArticle): NewsArticleInsert {
  return {
    id: article.id,
    title: article.title,
    excerpt: article.excerpt,
    date: article.date,
    read_time: article.readTime,
    image: article.image,
    categories: article.categories,
    external_url: article.externalUrl,
    lang: article.lang,
    published: true,
  }
}

function getImageFromContent(content: string) {
  const imageMatch = content.match(/<img[^>]+src="([^">]+)"/i)
  return imageMatch ? imageMatch[1] : '/placeholder.jpg'
}

function buildCandidate(item: RssItem): NewsArticle | null {
  const content = item['content:encoded'] || item.content || ''
  const externalUrl = (item.link || '').trim()
  const title = (item.title || '').trim()

  if (!title || !externalUrl) return null

  return {
    id: extractMediumId(externalUrl) || item.guid || externalUrl,
    title,
    excerpt: buildExcerpt(content),
    date: toIsoDate(item.isoDate || item.pubDate),
    readTime: estimateReadTime(content),
    image: getImageFromContent(content),
    categories: normalizeCategories(item.categories || []) as NewsArticle['categories'],
    externalUrl,
    lang: detectArticleLang({
      title,
      content,
      categories: item.categories || [],
    }),
  }
}

export async function syncNewsFromRss(rssUrl = DEFAULT_RSS_URL) {
  const { url, serviceRoleKey } = requireSupabaseAdminConfig()
  const supabase = createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const parser = new Parser<Record<string, never>, RssItem>()
  const [feed, existingResult] = await Promise.all([
    parser.parseURL(rssUrl),
    supabase
      .from('news_articles')
      .select('id, title, excerpt, date, read_time, image, categories, external_url, lang')
      .eq('published', true)
      .order('date', { ascending: false }),
  ])

  if (existingResult.error) throw existingResult.error

  const existing = ((existingResult.data || []) as NewsArticleRow[]).map(fromRow)
  const additions: NewsArticle[] = []

  for (const item of feed.items) {
    const candidate = buildCandidate(item)
    if (!candidate) continue

    if (articleExists(existing, candidate) || articleExists(additions, candidate)) {
      continue
    }

    additions.push(candidate)
  }

  if (additions.length === 0) {
    return {
      ok: true,
      rssUrl,
      read: feed.items.length,
      created: 0,
      synced: 0,
    }
  }

  const { data, error } = await supabase
    .from('news_articles')
    .upsert(additions.map(toRow), { onConflict: 'id' })
    .select('id')

  if (error) throw error

  return {
    ok: true,
    rssUrl,
    read: feed.items.length,
    created: additions.length,
    synced: data?.length || 0,
  }
}
