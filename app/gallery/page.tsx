import type { Metadata } from 'next'
import { getLang, getSeo } from '../seo'
import GalleryClient from '@/components/gallery/GalleryClient'

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang()
  const { title, description } = getSeo('gallery', lang) // ← clave correcta
  return { title, description }
}

export default function Page() {
  return <GalleryClient />
}