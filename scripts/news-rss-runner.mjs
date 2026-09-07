import Parser from 'rss-parser'
import {
  buildExcerpt,
  detectArticleLang,
  estimateReadTime,
  extractMediumId,
  normalizeCategories,
  toIsoDate,
} from './news-sync-utils.mjs'

export const DEFAULT_RSS_URL = 'https://medium.com/feed/@ce.joventut.tt'
export function rssCandidates(items) {
  return items.flatMap((item) => {
    const content = item['content:encoded'] || item.content || ''
    const external_url = (item.link || '').trim(),
      title = (item.title || '').trim()
    let url
    try {
      url = new URL(external_url)
    } catch {
      return []
    }
    if (
      !title ||
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return []
    const categories = normalizeCategories(item.categories || [])
    const rawImage = content.match(/<img[^>]+src="([^">]+)"/i)?.[1] || ''
    let image = '/placeholder.svg'
    try {
      const parsed = new URL(rawImage)
      if (
        ['http:', 'https:'].includes(parsed.protocol) &&
        !parsed.username &&
        !parsed.password
      )
        image = rawImage
    } catch {}
    return [
      {
        id: extractMediumId(external_url) || item.guid || external_url,
        title,
        external_url,
        excerpt: buildExcerpt(content),
        date: toIsoDate(item.isoDate || item.pubDate),
        read_time: estimateReadTime(content),
        image,
        categories: categories.length ? categories : ['news'],
        lang: detectArticleLang({
          title,
          content,
          categories: item.categories || [],
        }),
      },
    ]
  })
}
/** @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {{actor?: string|null, rssUrl?: string, dryRun?: boolean, items?: Array<Record<string, any>>}} options
 */
export async function runRssSync(
  supabase,
  { actor = null, rssUrl = DEFAULT_RSS_URL, dryRun = false, items } = {},
) {
  if (dryRun) {
    const feed =
      items || (await new Parser({ timeout: 30000 }).parseURL(rssUrl)).items
    return { ok: true, read: feed.length, candidates: rssCandidates(feed) }
  }
  const claim = await supabase.rpc('claim_news_sync', { p_actor: actor })
  if (claim.error) throw claim.error
  const id = claim.data
  try {
    const feed =
      items || (await new Parser({ timeout: 30000 }).parseURL(rssUrl)).items
    const candidates = rssCandidates(feed)
    const result = await supabase.rpc('import_news', {
      p_articles: candidates,
      p_source: 'rss',
    })
    if (result.error) throw result.error
    const created = result.data || 0
    const finished = await supabase
      .from('news_sync_runs')
      .update({
        status: 'success',
        finished_at: new Date().toISOString(),
        read_count: feed.length,
        created_count: created,
        skipped_count: feed.length - created,
      })
      .eq('id', id)
      .eq('status', 'running')
    if (finished.error) throw finished.error
    return {
      ok: true,
      read: feed.length,
      created,
      synced: created,
      skipped: feed.length - created,
    }
  } catch (error) {
    const finished = await supabase
      .from('news_sync_runs')
      .update({
        status: 'failed',
        finished_at: new Date().toISOString(),
        error:
          'No se pudo completar la importación. Revisa la fuente y vuelve a intentarlo.',
      })
      .eq('id', id)
      .eq('status', 'running')
    if (finished.error) console.error('[news-sync] Could not record failure')
    throw error
  }
}
