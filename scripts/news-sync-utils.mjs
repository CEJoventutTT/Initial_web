import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '..')

const CATEGORY_MAPPING = {
  training: 'training',
  trainings: 'training',
  'formación': 'training',
  formaciones: 'training',
  formacio: 'training',
  'formació': 'training',
  formacions: 'training',
  championship: 'championships',
  championships: 'championships',
  campeonato: 'championships',
  campeonatos: 'championships',
  campionat: 'championships',
  campionats: 'championships',
  campeonats: 'championships',
  torneo: 'championships',
  torneos: 'championships',
  tournament: 'championships',
  tournaments: 'championships',
  event: 'events',
  events: 'events',
  evento: 'events',
  eventos: 'events',
  acontecimiento: 'events',
  acontecimientos: 'events',
  acte: 'events',
  actes: 'events',
  aconteciment: 'events',
  esdeveniment: 'events',
  esdeveniments: 'events',
  news: 'news',
  new: 'news',
  noticias: 'news',
  noticies: 'news',
  'notícies': 'news',
  noticia: 'news',
  'notícia': 'news',
}

const LANGUAGE_TAGS = {
  es: ['es', 'esp', 'espanol', 'español', 'castellano', 'spanish', 'noticias', 'noticia', 'formacion', 'formación', 'campeonato', 'campeonatos', 'evento', 'eventos'],
  en: ['en', 'eng', 'english', 'ingles', 'inglés', 'news', 'training', 'trainings', 'championship', 'championships', 'event', 'events', 'tournament', 'tournaments'],
  ca: ['ca', 'cat', 'catalan', 'català', 'catala', 'noticies', 'notícies', 'noticia', 'notícia', 'formacio', 'formació', 'campionat', 'campionats', 'esdeveniment', 'esdeveniments'],
}

const LANGUAGE_HINTS = {
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

export function resolveRepoPath(...parts) {
  return path.join(repoRoot, ...parts)
}

export async function loadNews(filePath = resolveRepoPath('data', 'news.json')) {
  const raw = await fs.readFile(filePath, 'utf8')
  return JSON.parse(raw)
}

export async function saveNews(news, filePath = resolveRepoPath('data', 'news.json')) {
  const sorted = [...news].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )
  await fs.writeFile(filePath, `${JSON.stringify(sorted, null, 2)}\n`, 'utf8')
}

export function normalizeCategory(category = '') {
  const normalized = category.toLowerCase().trim()
  return CATEGORY_MAPPING[normalized] || 'news'
}

export function normalizeCategories(categories = []) {
  return [...new Set(categories.map((category) => normalizeCategory(category)))]
}

export function normalizeText(input = '') {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

export function stripHtml(input = '') {
  return input.replace(/<[^>]*>/g, ' ')
}

function countMatches(text, pattern) {
  const matches = text.match(pattern)
  return matches ? matches.length : 0
}

export function detectArticleLang(article) {
  const title = article.title || ''
  const categories = article.categories || []
  const content = stripHtml(article.content || '').slice(0, 1200)

  const normalizedCategories = categories.map(normalizeText)
  for (const [lang, tags] of Object.entries(LANGUAGE_TAGS)) {
    if (normalizedCategories.some((category) => tags.includes(category))) {
      return lang
    }
  }

  const rawText = `${title} ${categories.join(' ')} ${content}`.toLowerCase()
  const normalized = normalizeText(rawText)
  const scores = { es: 0, en: 0, ca: 0 }

  for (const [lang, patterns] of Object.entries(LANGUAGE_HINTS)) {
    for (const pattern of patterns) {
      scores[lang] += countMatches(normalized, pattern)
    }
  }

  if (/[àèòç]|l·l/.test(rawText)) scores.ca += 3
  if (/[ñ]/.test(rawText)) scores.es += 3
  if (/[áéíóúüï]/.test(rawText)) scores.es += 1

  const ordered = Object.entries(scores).sort((a, b) => b[1] - a[1])
  if (ordered[0][1] > ordered[1][1]) return ordered[0][0]
  if (/[àèòç]|l·l/.test(rawText)) return 'ca'
  if (/[ñáéíóúüï]/.test(rawText)) return 'es'
  return 'en'
}

export function extractMediumId(url = '') {
  const match = url.match(/-([a-f0-9]{12})(?:\?|$)/i)
  return match ? `https://medium.com/p/${match[1]}` : ''
}

export function normalizedTitle(title = '') {
  return normalizeText(title).replace(/\s+/g, ' ').trim()
}

export function articleExists(existing, candidate) {
  const candidateId = candidate.id || extractMediumId(candidate.externalUrl)
  const candidateUrl = (candidate.externalUrl || '').trim()
  const candidateTitle = normalizedTitle(candidate.title)

  return existing.some((article) => {
    const articleId = article.id || extractMediumId(article.externalUrl)
    const articleUrl = (article.externalUrl || '').trim()
    const articleTitle = normalizedTitle(article.title)

    return (
      (candidateId && articleId === candidateId) ||
      (candidateUrl && articleUrl === candidateUrl) ||
      (candidateTitle && articleTitle === candidateTitle)
    )
  })
}

export function buildExcerpt(input = '', maxLength = 150) {
  return stripHtml(input).replace(/\s+/g, ' ').trim().slice(0, maxLength)
}

export function estimateReadTime(input = '') {
  const wordCount = stripHtml(input).trim().split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`
}

export function toIsoDate(value) {
  if (!value) return new Date().toISOString()
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString()
}

export function parseArgs(argv) {
  const options = {}
  for (const arg of argv) {
    if (!arg.startsWith('--')) continue
    const [key, rawValue] = arg.slice(2).split('=')
    options[key] = rawValue ?? 'true'
  }
  return options
}

export async function parseCsvFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')
  const rows = []
  let field = ''
  let row = []
  let inQuotes = false

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i]
    const next = raw[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"'
        i += 1
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1
      row.push(field)
      field = ''
      if (row.some((value) => value.length > 0)) rows.push(row)
      row = []
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...dataRows] = rows
  return dataRows.map((values) =>
    Object.fromEntries(header.map((key, index) => [key, values[index] ?? '']))
  )
}
