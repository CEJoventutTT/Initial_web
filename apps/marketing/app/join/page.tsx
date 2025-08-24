// app/become-member/page.tsx
import type { Metadata } from 'next'
import { getLang, getSeo } from '../seo'
import JoinClient from '@/components/join/JoinClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const { title, description } = getSeo('join', lang)
  return { title, description }
}

export default function Page() {
  return <JoinClient />
}
