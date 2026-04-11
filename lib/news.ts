type Lang = 'es' | 'en' | 'ca'

const LANGUAGE_TAGS: Record<Lang, string[]> = {
  es: ['es', 'esp', 'espanol', 'español', 'castellano', 'spanish'],
  en: ['en', 'eng', 'english', 'ingles', 'inglés'],
  ca: ['ca', 'cat', 'catalan', 'català', 'catala', 'català'],
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

function normalizeText(input?: string | null) {
  return (input || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
