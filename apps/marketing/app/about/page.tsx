import type { Metadata } from 'next'
import { getLang, getSeo } from '../seo'
import AboutClient from '@/components/about/AboutClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const { title, description } = getSeo('who', lang)
  return { title, description, alternates: { canonical: 'https://cejoventut.com/about' } }
}

export default function Page() {
  return <AboutClient />
}
