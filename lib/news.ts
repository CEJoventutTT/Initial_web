export type Lang = 'es' | 'en' | 'ca'
export type NewsCategory = 'all' | 'training' | 'championships' | 'events' | 'news'

export type NewsArticle = {
  id: string
  title: string
  excerpt: string
  date: string
  readTime: string
  image: string
  categories: Exclude<NewsCategory, 'all'>[]
  externalUrl: string
  lang: Lang
}

function normalizeText(input?: string | null) {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function slugify(input: string) {
  return normalizeText(input)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function getArticleIdSuffix(article: Pick<NewsArticle, 'id' | 'externalUrl'>) {
  const source = article.id || article.externalUrl
  const match = source.match(/([a-f0-9]{12})(?:\?|$)/i)
  return match ? match[1].toLowerCase() : ''
}

export function getArticleSlug(article: Pick<NewsArticle, 'id' | 'title' | 'externalUrl'>) {
  const base = slugify(article.title) || 'article'
  const suffix = getArticleIdSuffix(article)
  return suffix ? `${base}-${suffix}` : base
}

export function getArticleBySlug<T extends NewsArticle>(articles: T[], slug: string) {
  return articles.find((article) => getArticleSlug(article) === slug) || null
}

const CATEGORY_MAPPING: Record<string, string> = {
  // Training / Formación
  'training': 'training',
  'trainings': 'training',
  'formación': 'training',
  'formaciones': 'training',
  'formacio': 'training',
  'formació': 'training',
  'formacions': 'training',
  
  // Championships / Campeonatos
  'championship': 'championships',
  'championships': 'championships',
  'campeonato': 'championships',
  'campeonatos': 'championships',
  'campionat': 'championships',
  'campionats': 'championships',
  'campeonats': 'championships',
  'torneo': 'championships',
  'torneos': 'championships',
  'tournament': 'championships',
  'tournaments': 'championships',
  
  // Events / Eventos
  'event': 'events',
  'events': 'events',
  'evento': 'events',
  'eventos': 'events',
  'acontecimiento': 'events',
  'acontecimientos': 'events',
  'acte': 'events',
  'actes': 'events',
  'aconteciment': 'events',
  'esdeveniment': 'events',
  'esdeveniments': 'events',
  
  // News (default)
  'news': 'news',
  'new': 'news',
  'noticias': 'news',
  'noticies': 'news',
  'notícies': 'news',
  'noticia': 'news',
  'notícia': 'news',
}

function normalizeCategory(category: string): string {
  const normalized = (category || '').toLowerCase().trim()
  return CATEGORY_MAPPING[normalized] || 'news'
}

function normalizeCategories(categories?: string[] | null): string[] {
  const normalized = (categories || []).map(normalizeCategory)
  return Array.from(new Set(normalized))
}

function getPrimaryCategory(categories?: string[] | null): string {
  const normalized = normalizeCategories(categories)
  return normalized.find((category) => category !== 'news') || normalized[0] || 'news'
}

const LANGUAGE_TAGS: Record<Lang, string[]> = {
  es: ['es', 'esp', 'espanol', 'español', 'castellano', 'spanish', 'noticias', 'noticia', 'formacion', 'formación', 'campeonato', 'campeonatos', 'evento', 'eventos'],
  en: ['en', 'eng', 'english', 'ingles', 'inglés', 'news', 'training', 'trainings', 'championship', 'championships', 'event', 'events', 'tournament', 'tournaments'],
  ca: ['ca', 'cat', 'catalan', 'català', 'catala', 'noticies', 'notícies', 'noticia', 'notícia', 'formacio', 'formació', 'campionat', 'campionats', 'esdeveniment', 'esdeveniments'],
}

const LANGUAGE_HINTS: Record<Lang, RegExp[]> = {
  es: [
    /\b(el|la|los|las|un|una|para|con|desde|hasta|nuestro|nuestra|club|mayores|salud|deporte)\b/g,
    /[ñáéíóúü]/g,
  ],
  en: [
    /\b(the|and|for|with|from|new|course|health|table|tennis|seniors|childhood)\b/g,
  ],
  ca: [
    /\b(el|la|els|les|un|una|per|amb|dels|als|nostra|gent|gran|salut|esport)\b/g,
    /[àèòç]/g,
    /l·l/g,
  ],
}

function stripHtml(input?: string | null) {
  return (input || '').replace(/<[^>]*>/g, ' ')
}

function countMatches(text: string, pattern: RegExp) {
  const matches = text.match(pattern)
  return matches ? matches.length : 0
}

export function detectArticleLang(article: {
  title?: string | null
  content?: string | null
  categories?: string[] | null
}): Lang {
  const title = article.title || ''
  const categories = article.categories || []
  const content = stripHtml(article.content).slice(0, 1200)

  const normalizedCategories = categories.map(normalizeText)
  for (const [lang, tags] of Object.entries(LANGUAGE_TAGS) as [Lang, string[]][]) {
    if (normalizedCategories.some((category) => tags.includes(category))) {
      return lang
    }
  }

  const rawText = `${title} ${categories.join(' ')} ${content}`.toLowerCase()
  const normalizedText = normalizeText(rawText)
  const scores: Record<Lang, number> = { es: 0, en: 0, ca: 0 }

  for (const [lang, patterns] of Object.entries(LANGUAGE_HINTS) as [Lang, RegExp[]][]) {
    for (const pattern of patterns) {
      scores[lang] += countMatches(normalizedText, pattern)
    }
  }

  if (/[àèòç]|l·l/.test(rawText)) scores.ca += 3
  if (/[ñ]/.test(rawText)) scores.es += 3
  if (/[áéíóúüï]/.test(rawText)) scores.es += 1

  const ordered = (Object.entries(scores) as [Lang, number][])
    .sort((a, b) => b[1] - a[1])

  if (ordered[0][1] > ordered[1][1]) {
    return ordered[0][0]
  }

  if (/[àèòç]|l·l/.test(rawText)) return 'ca'
  if (/[ñáéíóúüï]/.test(rawText)) return 'es'
  return 'en'
}

export { getPrimaryCategory, normalizeCategories, normalizeCategory }
