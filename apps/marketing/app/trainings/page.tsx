import type { Metadata } from 'next'
import { getLang, getSeo } from '../seo'
import TrainingsClient from '@/components/trainings/TrainingsClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const { title, description } = getSeo('trainings', lang)
  return { title, description, alternates: { canonical: 'https://cejoventut.com/trainings' } }
}

export default function Page() {
  return <TrainingsClient />
}
