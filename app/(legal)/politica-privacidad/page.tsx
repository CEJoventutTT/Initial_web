import type { Metadata } from 'next'
import { getLang, getSeo } from '../../seo'
import PrivacyClient from '@/components/legal/PrivacyClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const { title, description } = getSeo('legal_privacy', lang)
  return { title, description, alternates: { canonical: 'https://cejoventut.com/politica-privacidad' } }
}

export default function Page() {
  return <PrivacyClient />
}
