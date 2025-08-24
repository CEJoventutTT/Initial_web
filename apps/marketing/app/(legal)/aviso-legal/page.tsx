import type { Metadata } from 'next'
import { getLang, getSeo } from '../../seo'
import AvisoClient from '@/components/legal/AvisoClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const { title, description } = getSeo('legal_aviso', lang)
  return { title, description, alternates: { canonical: 'https://cejoventut.com/aviso-legal' } }
}

export default function Page() {
  return <AvisoClient />
}
