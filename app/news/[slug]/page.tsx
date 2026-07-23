import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getLang } from '@/app/seo'
import { getArticleBySlug, getPrimaryCategory } from '@/lib/news'
import { getNews } from '@/lib/news-store'

const COPY = {
  es: {
    backToNews: 'Volver a Noticias',
    notFoundTitle: 'Artículo no encontrado',
    notFoundSubtitle: 'El artículo que buscas no existe o todavía no está disponible.',
    readFullStory: 'Leer Historia Completa',
    relatedSource: 'Publicada originalmente en Medium',
  },
  en: {
    backToNews: 'Back to News',
    notFoundTitle: 'Article Not Found',
    notFoundSubtitle: 'The article you’re looking for doesn’t exist or isn’t available yet.',
    readFullStory: 'Read Full Story',
    relatedSource: 'Originally published on Medium',
  },
  ca: {
    backToNews: 'Tornar a Notícies',
    notFoundTitle: 'Article no trobat',
    notFoundSubtitle: 'L’article que busques no existeix o encara no està disponible.',
    readFullStory: 'Llegir Història Completa',
    relatedSource: 'Publicada originalment a Medium',
  },
} as const

function formatDate(dateStr: string, lang: 'es' | 'en' | 'ca') {
  const locale = lang === 'en' ? 'en-GB' : lang
  return new Date(dateStr).toLocaleDateString(locale)
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const [{ slug }, news] = await Promise.all([params, getNews()])
  const article = getArticleBySlug(news, slug)

  if (!article) {
    return {
      title: 'Article Not Found | Club Esportiu Joventut TT',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: `${article.title} | Club Esportiu Joventut TT`,
    description: article.excerpt,
    alternates: { canonical: `https://cejoventut.com/news/${slug}` },
  }
}

export default async function ArticlePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const [{ slug }, lang, news] = await Promise.all([params, getLang(), getNews()])
  const article = getArticleBySlug(news, slug)
  const copy = COPY[lang]

  if (!article) {
    return (
      <div className="min-h-screen bg-brand-dark text-white">
        <Navigation />
        <div className="pt-16 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-black text-white mb-4">{copy.notFoundTitle}</h1>
            <p className="text-white/80 mb-8">{copy.notFoundSubtitle}</p>
            <Link href="/news">
              <Button className="bg-primary hover:opacity-90 text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {copy.backToNews}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const primaryCategory = getPrimaryCategory(article.categories)

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />
      <div className="pt-16">
        <section className="py-12 bg-white/5 border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/news">
              <Button variant="ghost" className="text-brand-teal hover:text-brand-teal/80 mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {copy.backToNews}
              </Button>
            </Link>

            <div className="mb-6">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                {primaryCategory}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/70 mb-8">
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{formatDate(article.date, lang)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="py-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative w-full h-64 md:h-96 rounded-lg shadow-2xl border border-white/10 overflow-hidden">
              <Image
                src={article.image || '/placeholder.svg'}
                alt={article.title}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-16 bg-brand-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="bg-white/5 border border-white/10">
              <CardContent className="p-8 space-y-6">
                <p className="text-lg leading-8 text-white/85">{article.excerpt}</p>
                <p className="text-sm text-white/60">{copy.relatedSource}</p>
                <Link href={article.externalUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-primary hover:opacity-90 text-primary-foreground">
                    {copy.readFullStory}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  )
}
