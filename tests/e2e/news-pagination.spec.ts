import { expect, test } from '@playwright/test'

function article(id: string, title: string) {
  return {
    id, title, excerpt: 'Resumen de prueba', date: '2026-09-28T12:00:00Z',
    readTime: '1 min', image: '/placeholder.svg', imageAlt: title,
    categories: ['news'], externalUrl: '', lang: 'ca', slug: id, kind: 'internal',
  }
}

test('news loads the selected language and retries the same page after a failure', async ({ page }) => {
  const baseUrl = process.env.E2E_BASE_URL || `http://127.0.0.1:${process.env.E2E_PORT || '3100'}`
  await page.context().addCookies([{ name: 'lang', value: 'ca', url: baseUrl }])
  const requested: string[] = []
  let secondPageAttempts = 0
  await page.route('**/api/news?*', async (route) => {
    const url = new URL(route.request().url())
    requested.push(`${url.searchParams.get('lang')}:${url.searchParams.get('cursor') ?? 'first'}`)
    if (url.searchParams.has('cursor')) {
      secondPageAttempts += 1
      if (secondPageAttempts === 1) {
        await route.fulfill({ status: 503, body: '{}' })
        return
      }
        await route.fulfill({ json: { items: [article('ca-two', 'Segona notícia')], hasMore: false, nextCursor: null, lang: 'ca' } })
      return
    }
    await route.fulfill({ json: { items: [article('ca-one', 'Primera notícia')], hasMore: true, nextCursor: 'eyJkYXRlIjoiMjAyNi0wOS0yOFQxMjowMDowMFoiLCJpZCI6ImNhLW9uZSJ9', lang: 'ca' } })
  })

  await page.goto('/news')
  await expect(page.getByRole('heading', { name: 'Primera notícia' })).toBeVisible()
  await page.getByRole('button', { name: 'Carregar més' }).click()
  await expect(page.getByRole('button', { name: 'Torna-ho a provar' })).toBeVisible()
  await page.getByRole('button', { name: 'Torna-ho a provar' }).click()
  await expect(page.getByRole('heading', { name: 'Segona notícia' })).toBeVisible()
  expect(requested).toContain('ca:first')
  expect(requested.slice(-2)[0]).toMatch(/^ca:eyJ/)
  expect(requested.slice(-2)[1]).toBe(requested.slice(-2)[0])
})
