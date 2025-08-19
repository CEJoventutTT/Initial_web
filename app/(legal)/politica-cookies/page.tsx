import type { Metadata } from 'next'
import { getLang, getSeo } from '../../seo'
import CookiesClient from '@/components/legal/CookiesClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const { title, description } = getSeo('legal_cookies', lang)
  return { title, description, alternates: { canonical: 'https://cejoventut.com/politica-cookies' } }
}

export default function Page() {
  return <CookiesClient />
}
