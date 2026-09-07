import { test } from 'node:test'
import assert from 'node:assert/strict'
import { rssCandidates, runRssSync } from '../scripts/news-rss-runner.mjs'
import { articleExists } from '../scripts/news-sync-utils.mjs'
test('RSS candidates reject unsafe URLs, provide categories and keep equal titles with distinct sources', () => {
  const items = rssCandidates([
    {
      title: 'Noticia',
      link: 'https://example.test/one',
      'content:encoded': '<p>Texto</p><img src="javascript:alert(1)">',
    },
    { title: 'Noticia', link: 'https://example.test/two' },
    { title: 'Unsafe', link: 'javascript:alert(1)' },
  ])
  assert.equal(items.length, 2)
  assert.equal(items[0].image, '/placeholder.svg')
  assert.deepEqual(items[0].categories, ['news'])
  assert.equal(
    articleExists(
      [{ id: 'one', title: 'Same', externalUrl: 'https://example.test/one' }],
      { id: 'two', title: 'Same', externalUrl: 'https://example.test/two' },
    ),
    false,
  )
})
test('RSS failure is recorded and a duplicate lease aborts before importing', async () => {
  const updates: unknown[] = []
  const supabase = {
    rpc: async (name: string) =>
      name === 'claim_news_sync'
        ? { data: 'run-1' }
        : { error: new Error('import failed') },
    from: () => ({
      update: (value: unknown) => {
        updates.push(value)
        return { eq: () => ({ eq: async () => ({ error: null }) }) }
      },
    }),
  }
  await assert.rejects(
    runRssSync(supabase as never, {
      items: [{ title: 'News', link: 'https://example.test/news' }],
    }),
    /import failed/,
  )
  assert.equal((updates[0] as { status: string }).status, 'failed')
  const blocked = { rpc: async () => ({ error: new Error('already running') }) }
  await assert.rejects(
    runRssSync(blocked as never, { items: [] }),
    /already running/,
  )
})
