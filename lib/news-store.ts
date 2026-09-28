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
export async function getNewsPage(page: number, lang: Lang, pageSize = 24) {
  const from = page * pageSize
  const supabase = publicClient()
  const readPage = (language: Lang) => supabase
    .from('news_articles')
    .select(fields)
    .eq('published', true)
    .eq('lang', language)
    .order('date', { ascending: false })
    .order('id')
    .range(from, from + pageSize)
  let effectiveLang = lang
  let { data, error } = await readPage(lang)
  if (error) throw error
  if (page === 0 && !data?.length && lang !== 'es') {
    effectiveLang = 'es'
    ;({ data, error } = await readPage('es'))
    if (error) throw error
  }
  const rows = data ?? []
  return {
    items: rows.slice(0, pageSize).map((row) => editorialToArticle(row as EditorialArticle)),
    hasMore: rows.length > pageSize,
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
