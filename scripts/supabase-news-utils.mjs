import fs from 'node:fs'
import { createClient } from '@supabase/supabase-js'

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  const env = {}
  for (const line of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/)
    if (!match) continue

    let value = match[2].trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    env[match[1]] = value
  }
  return env
}

export function loadSupabaseEnv() {
  return {
    ...parseEnvFile('.env'),
    ...parseEnvFile('.env.local'),
    ...process.env,
  }
}

export function getSupabaseAdminClient() {
  const env = loadSupabaseEnv()
  const url =
    env.CEJTT_SUPABASE_URL ||
    env.NEXT_PUBLIC_CEJTT_SUPABASE_URL ||
    env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey =
    env.CEJTT_SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Missing CEJTT_SUPABASE_URL or CEJTT_SUPABASE_SERVICE_ROLE_KEY')
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

export function fromNewsRow(row) {
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

export function toNewsRow(article) {
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
    published: article.published ?? true,
  }
}

export async function loadNewsFromSupabase(supabase) {
  const { data, error } = await supabase
    .from('news_articles')
    .select('id, title, excerpt, date, read_time, image, categories, external_url, lang')
    .eq('published', true)
    .order('date', { ascending: false })

  if (error) throw error
  return (data || []).map(fromNewsRow)
}

export async function upsertNewsToSupabase(supabase, articles) {
  if (articles.length === 0) return []

  const { data, error } = await supabase
    .from('news_articles')
    .upsert(articles.map(toNewsRow), { onConflict: 'id' })
    .select('id')

  if (error) throw error
  return data || []
}
