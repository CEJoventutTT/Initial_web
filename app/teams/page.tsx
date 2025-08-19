import type { Metadata } from 'next'
import { getLang, getSeo } from '../seo'
import TeamsClient from '@/components/teams/TeamsClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const { title, description } = getSeo('competition', lang)
  return { title, description, alternates: { canonical: 'https://cejoventut.com/teams' } }
}

export default function Page() {
  return <TeamsClient />
}
