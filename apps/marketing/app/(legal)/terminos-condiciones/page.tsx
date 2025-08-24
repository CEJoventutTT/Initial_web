import type { Metadata } from 'next'
import { getLang, getSeo } from '../../seo'
import TermsClient from '@/components/legal/TermsClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const { title, description } = getSeo('legal_terms', lang)
  return { title, description, alternates: { canonical: 'https://cejoventut.com/terminos-condiciones' } }
}

export default function Page() {
  return <TermsClient />
}
