import {
  articleExists,
  buildExcerpt,
  estimateReadTime,
  extractMediumId,
  loadNews,
  normalizeCategories,
  parseArgs,
  parseCsvFile,
  resolveRepoPath,
  saveNews,
  toIsoDate,
} from './news-sync-utils.mjs'

function pickLocalizedFields(row) {
  for (const lang of ['es', 'ca', 'en']) {
    const title = (row[`title_${lang}`] || '').trim()
    if (!title) continue

    return {
      lang,
      title,
      excerpt: (row[`excerpt_${lang}`] || '').trim(),
      content: (row[`content_${lang}`] || '').trim(),
    }
  }

  return null
}

function parseCategories(raw) {
  try {
    const parsed = JSON.parse(raw || '[]')
    return Array.isArray(parsed) ? normalizeCategories(parsed) : ['news']
  } catch {
    return ['news']
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const csvPath = resolveRepoPath(options.csv || 'tmp/posts_rows.csv')
  const newsPath = resolveRepoPath(options.output || 'data/news.json')
  const author = options.author || 'CE Joventut Tenis Taula'
  const dryRun = options['dry-run'] === 'true'

  const [rows, existing] = await Promise.all([
    parseCsvFile(csvPath),
    loadNews(newsPath),
  ])

  const publishedRows = rows.filter(
    (row) => row.source_author === author && row.status === 'published'
  )

  const additions = []
  for (const row of publishedRows) {
    const localized = pickLocalizedFields(row)
    if (!localized) continue

    const externalUrl = (row.source_url || '').trim()
    const candidate = {
      id: extractMediumId(externalUrl) || row.id,
      title: localized.title,
      excerpt: buildExcerpt(localized.excerpt || localized.content),
      date: toIsoDate(row.published_at),
      readTime: estimateReadTime(localized.content || localized.excerpt),
      image: (row.featured_image || '/placeholder.jpg').trim(),
      categories: parseCategories(row.categories),
      externalUrl,
      lang: localized.lang,
    }

    if (articleExists(existing, candidate) || articleExists(additions, candidate)) {
      continue
    }

    additions.push(candidate)
  }

  if (dryRun) {
    console.log(`[dry-run] ${additions.length} news items ready to import from CSV`)
    additions.forEach((item) => {
      console.log(`- ${item.date.slice(0, 10)} [${item.lang}] ${item.title}`)
    })
    return
  }

  await saveNews([...existing, ...additions], newsPath)

  console.log(`Imported ${additions.length} news items from CSV into ${newsPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
