/// <reference types="jest" />
import { createClient } from '@supabase/supabase-js'
import { getNews, getPublishedArticle } from '@/lib/news-store'
jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }))
jest.mock('@/lib/supabase/env', () => ({
  requireSupabaseConfig: () => ({
    url: 'https://supabase.example',
    anonKey: 'anon',
  }),
}))
const row = {
  id: '1',
  title: 'Noticia',
  excerpt: 'Resumen',
  date: '2026-09-06',
  read_time: '1 min',
  image: '/placeholder.svg',
  image_alt: '',
  categories: ['news'],
  external_url: null,
  lang: 'es',
  slug: 'noticia-1',
  kind: 'internal',
  body: 'Contenido',
  updated_at: '2026-09-06',
}
function client(pages: unknown[][], error: unknown = null) {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    maybeSingle: jest.fn(),
  }
  for (const name of ['select', 'eq', 'order'] as const)
    query[name].mockReturnValue(query)
  for (const data of pages) query.range.mockResolvedValueOnce({ data, error })
  query.maybeSingle.mockResolvedValue({ data: pages[0]?.[0] || null, error })
  jest
    .mocked(createClient)
    .mockReturnValue({ from: jest.fn().mockReturnValue(query) } as never)
  return query
}
afterEach(() => jest.clearAllMocks())
it('reads fresh visibility on every call, including after a withdrawal', async () => {
  const query = client([[row], []])
  expect(await getNews()).toEqual([
    expect.objectContaining({
      slug: 'noticia-1',
      body: 'Contenido',
      externalUrl: '',
    }),
  ])
  expect(await getNews()).toEqual([])
  expect(query.eq).toHaveBeenCalledWith('published', true)
})
it('loads all pages beyond the API default row limit', async () => {
  const query = client([Array.from({ length: 500 }, () => row), [row]])
  expect(await getNews()).toHaveLength(501)
  expect(query.range).toHaveBeenLastCalledWith(500, 999)
})
it('fails closed when the database cannot verify publication', async () => {
  client([[]], new Error('database unavailable'))
  await expect(getNews()).rejects.toThrow('database unavailable')
})
it('queries a published detail by its stable slug', async () => {
  const query = client([[row]])
  expect(await getPublishedArticle('noticia-1')).toEqual(
    expect.objectContaining({ kind: 'internal' }),
  )
  expect(query.eq).toHaveBeenCalledWith('slug', 'noticia-1')
  expect(query.eq).toHaveBeenCalledWith('published', true)
})
it('returns null for a withdrawn or missing detail', async () => {
  client([[]])
  expect(await getPublishedArticle('missing')).toBeNull()
})
