// app/news-events/page.tsx
import type { Metadata } from 'next'
import { getLang, getSeo } from '../seo'
import NewsClient from '@/components/news/NewsClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const { title, description } = getSeo('news', lang)
  return {
    title,
    description,
    alternates: { canonical: 'https://cejoventut.com/news-events' },
  }
}

export default function Page() {
  return <NewsClient />
}
