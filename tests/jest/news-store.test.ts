/// <reference types="jest" />

import { createClient } from '@supabase/supabase-js'
import { getNews } from '@/lib/news-store'
import { getRedis } from '@/lib/redis'

jest.mock('@supabase/supabase-js', () => ({ createClient: jest.fn() }))
jest.mock('@/lib/redis', () => ({ getRedis: jest.fn() }))
jest.mock('@/lib/supabase/env', () => ({
  requireSupabaseConfig: () => ({ url: 'https://supabase.example', anonKey: 'anon-key' }),
}))

const article = {
  id: 'article-1',
  title: 'Noticia de prueba',
  excerpt: 'Resumen',
  date: '2026-01-01T00:00:00.000Z',
  readTime: '1 min read',
  image: '/image.jpg',
  categories: ['news'],
  externalUrl: 'https://example.test/article-1',
  lang: 'es',
} as const

describe('getNews Redis cache', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns cached news without querying Supabase', async () => {
    const get = jest.fn().mockResolvedValue([article])
    jest.mocked(getRedis).mockReturnValue({ get } as never)

    await expect(getNews()).resolves.toEqual([article])
    expect(createClient).not.toHaveBeenCalled()
  })

  it('uses Supabase and populates Redis after a cache miss', async () => {
    const get = jest.fn().mockResolvedValue(null)
    const set = jest.fn().mockResolvedValue('OK')
    const order = jest.fn().mockResolvedValue({
      data: [{
        id: article.id,
        title: article.title,
        excerpt: article.excerpt,
        date: article.date,
        read_time: article.readTime,
        image: article.image,
        categories: article.categories,
        external_url: article.externalUrl,
        lang: article.lang,
      }],
      error: null,
    })
    const eq = jest.fn().mockReturnValue({ order })
    const select = jest.fn().mockReturnValue({ eq })
    jest.mocked(getRedis).mockReturnValue({ get, set } as never)
    jest.mocked(createClient).mockReturnValue({ from: jest.fn().mockReturnValue({ select }) } as never)

    await expect(getNews()).resolves.toEqual([article])
    expect(set).toHaveBeenCalledWith('news:published:v1', [article], { ex: 300 })
  })

  it('falls back to Supabase when Redis is unavailable', async () => {
    const order = jest.fn().mockResolvedValue({ data: [], error: null })
    const eq = jest.fn().mockReturnValue({ order })
    const select = jest.fn().mockReturnValue({ eq })
    jest.mocked(getRedis).mockReturnValue(null)
    jest.mocked(createClient).mockReturnValue({ from: jest.fn().mockReturnValue({ select }) } as never)

    await expect(getNews()).resolves.toEqual([])
    expect(createClient).toHaveBeenCalled()
  })
})
