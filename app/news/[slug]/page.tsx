'use client'

import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, ArrowLeft, Share2, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

// Simulación de fetch por slug (ahora vacío)
const getArticleBySlug = (slug: string) => {
  const articles: Record<string, never> = {}
  return (articles as any)[slug] || null
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const { t } = useTranslation()
  const tt = typeof t === 'function' ? t : ((k: string, v?: any) => k)

  const article = getArticleBySlug(params.slug)

  if (!article) {
    return (
      <div className="min-h-screen bg-brand-dark text-white">
        <Navigation />
        <div className="pt-16 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-black text-white mb-4">{tt('news.notFoundTitle')}</h1>
            <p className="text-white/80 mb-8">{tt('news.notFoundSubtitle')}</p>
            <Link href="/news">
              <Button className="bg-primary hover:opacity-90 text-primary-foreground">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {tt('news.backToNews')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />
      <div className="pt-16">
        {/* Encabezado del artículo */}
        <section className="py-12 bg-white/5 border-b border-white/10">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/news">
              <Button variant="ghost" className="text-brand-teal hover:text-brand-teal/80 mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                {tt('news.backToNews')}
              </Button>
            </Link>

            <div className="mb-6">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                {article.category}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
              {article.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-white/70 mb-8">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{new Date(article.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="border-white/20 text-white/85 hover:bg-white/10">
                <Heart className="mr-2 h-4 w-4" />
                {tt('news.like')}
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white/85 hover:bg-white/10">
                <Share2 className="mr-2 h-4 w-4" />
                {tt('news.share')}
              </Button>
              <Button variant="outline" size="sm" className="border-white/20 text-white/85 hover:bg-white/10">
                <MessageCircle className="mr-2 h-4 w-4" />
                {tt('news.comment')}
              </Button>
            </div>
          </div>
        </section>

        {/* Imagen destacada */}
        {article.image && (
          <section className="py-0">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <img
                src={article.image || '/placeholder.svg'}
                alt={article.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg shadow-2xl border border-white/10"
              />
            </div>
          </section>
        )}

        {/* Contenido */}
        <section className="py-16 bg-brand-dark">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-white/85">
              {/* Cuando tengas HTML del CMS, usa dangerouslySetInnerHTML */}
              {tt('news.emptySubtitle')}
            </div>

            {/* Volver */}
            <div className="mt-12">
              <Link href="/news">
                <Button className="bg-primary hover:opacity-90 text-primary-foreground">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {tt('news.backToNews')}
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
