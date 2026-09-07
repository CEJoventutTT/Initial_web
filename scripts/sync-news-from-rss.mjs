import { getSupabaseAdminClient } from './supabase-news-utils.mjs'
import { parseArgs } from './news-sync-utils.mjs'
import { runRssSync, DEFAULT_RSS_URL } from './news-rss-runner.mjs'
const options = parseArgs(process.argv.slice(2))
runRssSync(getSupabaseAdminClient(), {
  rssUrl: options.url || DEFAULT_RSS_URL,
  dryRun: options['dry-run'] === 'true',
})
  .then((result) => console.log(JSON.stringify(result, null, 2)))
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
