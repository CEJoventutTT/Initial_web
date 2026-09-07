import type { ReactNode } from 'react'
import Image from 'next/image'
import { type NewsArticle } from '@/lib/news'
import { safeWebUrl } from '@/lib/news/editorial'

// Deliberately limited Markdown: no HTML, scripts, embedded images or raw attributes.
function inline(text: string): ReactNode[] {
  return text
    .split(/(\*\*[^*]+\*\*|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g)
    .map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**'))
        return <strong key={i}>{part.slice(2, -2)}</strong>
      const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (link && safeWebUrl(link[2]))
        return (
          <a
            key={i}
            className="underline text-primary"
            href={link[2]}
            rel="noopener noreferrer"
            target="_blank"
          >
            {link[1]}
          </a>
        )
      return part
    })
}
export function NewsBody({ body }: { body: string }) {
  return (
    <div className="space-y-5 leading-8 break-words">
      {body.split(/\n\s*\n/).map((block, i) => {
        if (block.startsWith('## '))
          return (
            <h2 className="text-2xl font-bold" key={i}>
              {inline(block.slice(3))}
            </h2>
          )
        if (block.split('\n').every((line) => line.startsWith('- ')))
          return (
            <ul className="list-disc pl-6" key={i}>
              {block.split('\n').map((line, j) => (
                <li key={j}>{inline(line.slice(2))}</li>
              ))}
            </ul>
          )
        return (
          <p className="whitespace-pre-wrap" key={i}>
            {inline(block)}
          </p>
        )
      })}
    </div>
  )
}
export default function ArticleContent({ article }: { article: NewsArticle }) {
  const source = safeWebUrl(article.externalUrl)
    ? new URL(article.externalUrl).hostname
    : ''
  const labels = {
    es: ['Fuente original', 'Leer noticia completa'],
    ca: ['Font original', 'Llegir notícia completa'],
    en: ['Original source', 'Read full article'],
  }[article.lang]
  return (
    <article lang={article.lang} className="mx-auto max-w-4xl space-y-8 py-8">
      <header className="space-y-4">
        <p className="text-sm text-white/65">
          {new Date(article.date).toLocaleDateString(article.lang, {
            timeZone: 'Europe/Madrid',
          })}{' '}
          · {article.readTime}
        </p>
        <h1 className="text-4xl font-bold leading-tight break-words">
          {article.title}
        </h1>
      </header>
      <div className="relative h-64 overflow-hidden rounded-lg md:h-96">
        <Image
          src={article.image || '/placeholder.svg'}
          alt={article.imageAlt || article.title}
          fill
          sizes="(max-width: 900px) 100vw, 900px"
          unoptimized
          className="object-cover"
        />
      </div>
      <p className="text-xl leading-8 text-white/85">{article.excerpt}</p>
      {article.kind === 'internal' ? (
        <NewsBody body={article.body || ''} />
      ) : (
        source && (
          <div className="space-y-4">
            <p className="text-sm text-white/60">
              {labels[0]}: {source}
            </p>
            <a
              className="bo-link"
              href={article.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {labels[1]} →
            </a>
          </div>
        )
      )}
    </article>
  )
}
