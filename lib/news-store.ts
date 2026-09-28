import 'server-only'
import { createClient } from '@supabase/supabase-js'
import { requireSupabaseConfig } from '@/lib/supabase/env'
import { editorialToArticle, type EditorialArticle } from '@/lib/news/editorial'
import { cache } from 'react'
import type { Lang } from '@/lib/news'

function publicClient() {
  const { url, anonKey } = requireSupabaseConfig()
  return createClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  })
}
const fields =
  'id,title,excerpt,date,read_time,image,image_alt,categories,external_url,lang,slug,kind,updated_at'
// Always read current visibility. Redis must never resurrect withdrawn content.
export async function getNews() {
  const supabase = publicClient()
  const articles = []
  for (let from = 0; ; from += 500) {
    const { data, error } = await supabase
      .from('news_articles')
      .select(fields)
      .eq('published', true)
      .order('date', { ascending: false })
      .order('id')
      .range(from, from + 499)
    if (error) throw error
    articles.push(
      ...(data || []).map((row) => editorialToArticle(row as EditorialArticle)),
    )
    if (!data || data.length < 500) return articles
  }
}
export type NewsCursor = { date: string; id: string }

export async function getNewsPage(cursor: NewsCursor | null, lang: Lang, pageSize = 24) {
  const supabase = publicClient()
  const readPage = (language: Lang) => {
    const base = supabase
      .from('news_articles')
      .select(fields)
      .eq('published', true)
      .eq('lang', language)
    const filtered = cursor
      ? base.or(`date.lt.${cursor.date},and(date.eq.${cursor.date},id.gt.${cursor.id})`)
      : base
    return filtered.order('date', { ascending: false }).order('id').limit(pageSize + 1)
  }
  let effectiveLang = lang
  let { data, error } = await readPage(lang)
  if (error) throw error
  if (!cursor && !data?.length && lang !== 'es') {
    effectiveLang = 'es'
    ;({ data, error } = await readPage('es'))
    if (error) throw error
  }
  const rows = data ?? []
  const pageRows = rows.slice(0, pageSize)
  return {
    items: pageRows.map((row) => editorialToArticle(row as EditorialArticle)),
    hasMore: rows.length > pageSize,
    nextCursor: rows.length > pageSize && pageRows.length
      ? { date: String((pageRows[pageRows.length - 1] as EditorialArticle).date), id: String((pageRows[pageRows.length - 1] as EditorialArticle).id) }
      : null,
    lang: effectiveLang,
  }
}
export const getPublishedArticle = cache(async (slug: string) => {
  const { data, error } = await publicClient()
    .from('news_articles')
    .select(`${fields},body`)
    .eq('published', true)
    .eq('slug', slug)
    .maybeSingle()
  if (error) throw error
  return data ? editorialToArticle(data as EditorialArticle) : null
})
