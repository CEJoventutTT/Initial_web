/// <reference types="jest" />
import { validateNews, safeWebUrl, safeImageUrl } from '@/lib/news/editorial'
import { getArticleSlug } from '@/lib/news'
function form(overrides: Record<string, string> = {}) {
  const data = new FormData()
  for (const [key, value] of Object.entries({
    title: 'Noticia',
    excerpt: 'Resumen',
    kind: 'internal',
    body: 'Contenido',
    status: 'published',
    lang: 'ca',
    date: '2026-09-06T12:00',
    categories: 'news',
    ...overrides,
  }))
    data.set(key, value)
  return data
}
it('requires publishable content but permits incomplete drafts', () => {
  expect(validateNews(form({ body: '' })).errors.body).toBeTruthy()
  expect(
    validateNews(form({ body: '', excerpt: '', status: 'draft' })).errors,
  ).toEqual({})
  expect(
    validateNews(form({ kind: 'external', external_url: '' })).errors
      .external_url,
  ).toBeTruthy()
})
it('rejects unsafe links and images', () => {
  for (const value of [
    'javascript:alert(1)',
    'data:text/html,x',
    'https://user:pass@example.org',
  ])
    expect(safeWebUrl(value)).toBe(false)
  expect(safeImageUrl('//example.org/x')).toBe(false)
  expect(
    validateNews(form({ image: 'javascript:alert(1)' })).errors.image,
  ).toBeTruthy()
})
it('validates categories, language and ambiguous club times', () => {
  expect(
    validateNews(form({ categories: 'all' })).errors.categories,
  ).toBeTruthy()
  expect(validateNews(form({ lang: 'fr' })).errors.lang).toBeTruthy()
  expect(validateNews(form({ date: '2026-10-25T02:30' })).errors.date).toMatch(
    /dos veces/,
  )
})
it('preserves a persisted slug after title changes and supports legacy slugs', () => {
  expect(
    getArticleSlug({
      id: '1',
      title: 'Nuevo título',
      externalUrl: '',
      slug: 'original',
    }),
  ).toBe('original')
  expect(
    getArticleSlug({
      id: 'https://medium.com/p/abcdef123456',
      title: 'Formació i salut',
      externalUrl: '',
    }),
  ).toBe('formacio-i-salut-abcdef123456')
})
