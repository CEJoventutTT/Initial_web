import {
  getSupabaseAdminClient,
  upsertNewsToSupabase,
} from './supabase-news-utils.mjs'
import {
  loadNews,
  parseArgs,
  resolveRepoPath,
} from './news-sync-utils.mjs'

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const newsPath = resolveRepoPath(options.input || 'data/news.json')
  const dryRun = options['dry-run'] === 'true'
  const articles = await loadNews(newsPath)

  if (dryRun) {
    console.log(`[dry-run] ${articles.length} news items ready to seed into Supabase`)
    articles.forEach((item) => {
      console.log(`- ${item.date.slice(0, 10)} [${item.lang}] ${item.title}`)
    })
    return
  }

  const supabase = getSupabaseAdminClient()
  const rows = await upsertNewsToSupabase(supabase, articles)
  console.log(`Seeded ${rows.length} news items into Supabase from ${newsPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
