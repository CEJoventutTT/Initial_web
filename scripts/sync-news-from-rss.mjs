import Parser from 'rss-parser'
import {
  articleExists,
  buildExcerpt,
  detectArticleLang,
  estimateReadTime,
  extractMediumId,
  loadNews,
  normalizeCategories,
  parseArgs,
  resolveRepoPath,
  saveNews,
  toIsoDate,
} from './news-sync-utils.mjs'

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const newsPath = resolveRepoPath(options.output || 'data/news.json')
  const rssUrl = options.url || 'https://medium.com/feed/@ce.joventut.tt'
  const dryRun = options['dry-run'] === 'true'

  const parser = new Parser()
  const [feed, existing] = await Promise.all([
    parser.parseURL(rssUrl),
    loadNews(newsPath),
  ])

  const additions = []
  for (const item of feed.items) {
    const content = item['content:encoded'] || item.content || ''
    const imageMatch = content.match(/<img[^>]+src="([^">]+)"/i)
    const externalUrl = (item.link || '').trim()
    const candidate = {
      id: extractMediumId(externalUrl) || item.guid || externalUrl,
      title: (item.title || '').trim(),
      excerpt: buildExcerpt(content),
      date: toIsoDate(item.isoDate || item.pubDate),
      readTime: estimateReadTime(content),
      image: imageMatch ? imageMatch[1] : '/placeholder.jpg',
      categories: normalizeCategories(item.categories || []),
      externalUrl,
      lang: detectArticleLang({
        title: item.title,
        content,
        categories: item.categories || [],
      }),
    }

    if (!candidate.title || !candidate.externalUrl) continue
    if (articleExists(existing, candidate) || articleExists(additions, candidate)) {
      continue
    }

    additions.push(candidate)
  }

  if (dryRun) {
    console.log(`[dry-run] ${additions.length} news items ready to sync from RSS`)
    additions.forEach((item) => {
      console.log(`- ${item.date.slice(0, 10)} [${item.lang}] ${item.title}`)
    })
    return
  }

  await saveNews([...existing, ...additions], newsPath)

  console.log(`Synced ${additions.length} news items from RSS into ${newsPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
