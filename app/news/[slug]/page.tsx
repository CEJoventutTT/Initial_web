import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Navigation from '@/components/navigation'
import ArticleContent from '@/components/news/article-content'
import { getPublishedArticle } from '@/lib/news-store'

export const dynamic = 'force-dynamic'
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const article = await getPublishedArticle((await params).slug)
  if (!article)
    return {
      title: 'Noticia no encontrada',
      robots: { index: false, follow: false },
    }
  return {
    title: `${article.title} | Club Esportiu Joventut TT`,
    description: article.excerpt,
    alternates: { canonical: `https://cejoventut.com/news/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
    },
  }
}
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const article = await getPublishedArticle((await params).slug)
  if (!article) notFound()
  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />
      <main className="px-6 pt-24 pb-16">
        <div className="mx-auto max-w-4xl">
          <Link className="bo-link" href="/news">
            ←{' '}
            {
              {
                es: 'Volver a noticias',
                ca: 'Tornar a notícies',
                en: 'Back to news',
              }[article.lang]
            }
          </Link>
        </div>
        <ArticleContent article={article} />
      </main>
    </div>
  )
}
