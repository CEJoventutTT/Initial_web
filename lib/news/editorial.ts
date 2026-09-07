import type { NewsArticle } from '../news'
import { clubLocalToISO } from '../backoffice/time'

export const newsStatuses = {
  draft: 'Borrador',
  published: 'Publicada',
  archived: 'Archivada',
} as const
export const newsSources: Record<string, string> = {
  manual: 'Manual',
  rss: 'RSS',
  csv: 'CSV',
  legacy: 'Anterior',
}
export const newsCategories = {
  training: 'Formación',
  championships: 'Campeonatos',
  events: 'Eventos',
  news: 'Noticias',
} as const
export type EditorialArticle = {
  id: string
  admin_id: string
  title: string
  excerpt: string
  date: string
  read_time: string
  image: string
  image_alt: string
  categories: NewsArticle['categories']
  external_url: string | null
  lang: NewsArticle['lang']
  status: keyof typeof newsStatuses
  kind: 'external' | 'internal'
  source: string
  slug: string
  body: string
  version: number
  updated_at: string
}
export function safeWebUrl(value: string) {
  try {
    const url = new URL(value)
    return (
      ['https:', 'http:'].includes(url.protocol) &&
      !url.username &&
      !url.password
    )
  } catch {
    return false
  }
}
export function safeImageUrl(value: string) {
  return /^\/(?!\/)[a-zA-Z0-9/_ .-]+$/.test(value) || safeWebUrl(value)
}
export function validateNews(data: FormData) {
  const errors: Record<string, string> = {}
  const text = (name: string, max: number) => {
    const value = String(data.get(name) ?? '').trim()
    if (value.length > max) errors[name] = `Máximo ${max} caracteres.`
    return value
  }
  const title = text('title', 250),
    excerpt = text('excerpt', 1000),
    body = text('body', 100000)
  const kind = text('kind', 20),
    lang = text('lang', 2),
    status = text('status', 20)
  const external_url = text('external_url', 2000),
    image = text('image', 2000) || '/placeholder.svg'
  const image_alt = text('image_alt', 300),
    read_time =
      text('read_time', 50) ||
      `${Math.max(1, Math.ceil((body || excerpt).split(/\s+/).length / 200))} min`
  const categories = [...new Set(data.getAll('categories').map(String))]
  if (!title) errors.title = 'Escribe un título.'
  if (!['external', 'internal'].includes(kind))
    errors.kind = 'Selecciona un tipo válido.'
  if (!['es', 'ca', 'en'].includes(lang)) errors.lang = 'Selecciona un idioma.'
  if (!Object.hasOwn(newsStatuses, status)) errors.status = 'Estado inválido.'
  if (
    !categories.length ||
    categories.some((c) => !Object.hasOwn(newsCategories, c))
  )
    errors.categories = 'Selecciona al menos una categoría válida.'
  if (kind === 'external' && external_url && !safeWebUrl(external_url))
    errors.external_url = 'Usa una URL HTTP o HTTPS sin credenciales.'
  if (!safeImageUrl(image))
    errors.image = 'Usa una ruta local o una URL HTTP o HTTPS.'
  if (status === 'published') {
    if (!excerpt) errors.excerpt = 'Escribe un resumen antes de publicar.'
    if (kind === 'internal' && !body)
      errors.body = 'Escribe el contenido antes de publicar.'
    if (kind === 'external' && !external_url)
      errors.external_url = 'Indica el enlace a la noticia.'
  }
  let date = ''
  try {
    date = clubLocalToISO(String(data.get('date') ?? ''))
  } catch (error) {
    errors.date = (error as Error).message
  }
  return {
    errors,
    value: {
      title,
      excerpt,
      body: kind === 'internal' ? body : '',
      kind,
      lang,
      status,
      external_url: kind === 'external' ? external_url : null,
      image,
      image_alt,
      read_time,
      categories,
      date,
    },
  }
}
export function editorialToArticle(row: EditorialArticle): NewsArticle {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    date: row.date,
    readTime: row.read_time,
    image: row.image,
    imageAlt: row.image_alt,
    categories: row.categories,
    externalUrl: row.external_url || '',
    lang: row.lang,
    slug: row.slug,
    kind: row.kind,
    body: row.body,
    updatedAt: row.updated_at,
  }
}
