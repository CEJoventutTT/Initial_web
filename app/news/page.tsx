'use client'

import Navigation from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export default function NewsPage() {
  const { t } = useTranslation()
  const tt = typeof t === 'function' ? t : ((k: string, v?: any) => k)

  // Estructura preparada para CMS futuro (ahora vacía)
  const featuredArticle: null | {
    id: string
    title: string
    excerpt: string
    date: string
    readTime: string
    image: string
    category: string
    author: string
    featured?: boolean
  } = null

  const articles: Array<{
    id: string
    title: string
    excerpt: string
    date: string
    readTime: string
    image: string
    category: string
    author: string
  }> = []

  const categories = [
    tt('news.categories.all'),
    tt('news.categories.tournament'),
    tt('news.categories.facilityUpdate'),
    tt('news.categories.programLaunch'),
    tt('news.categories.memberSpotlight'),
    tt('news.categories.results'),
    tt('news.categories.workshop'),
    tt('news.categories.announcement'),
  ]

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-20 bg-hero-gradient text-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-4">{tt('news.title')}</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-thin">
              {tt('news.description')}
            </p>
          </div>
        </section>

        {/* Featured or Empty */}
        <section className="py-16 bg-white/5 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {featuredArticle ? (
              <>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-black text-white">{tt('news.featuredStory')}</h2>
                </div>

                <Card className="bg-brand-dark border border-white/10 overflow-hidden">
                  <div className="grid lg:grid-cols-2 gap-0">
                    <div className="relative h-64 lg:h-auto">
                      <img
                        src={featuredArticle.image || '/placeholder.svg'}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                          {featuredArticle.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-8 lg:p-12">
                      <div className="flex items-center text-sm text-white/70 mb-4">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(featuredArticle.date).toLocaleDateString()}
                        <Clock className="ml-4 mr-2 h-4 w-4" />
                        {featuredArticle.readTime}
                        <User className="ml-4 mr-2 h-4 w-4" />
                        {featuredArticle.author}
                      </div>

                      <h3 className="text-3xl font-black text-white mb-4">{featuredArticle.title}</h3>
                      <p className="text-white/90 text-lg mb-6 leading-relaxed">
                        {featuredArticle.excerpt}
                      </p>

                      <Link href={`/news/${featuredArticle.id}`}>
                        <Button className="bg-primary hover:opacity-90 text-primary-foreground">
                          {tt('news.readFullStory')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </>
            ) : (
              <Card className="bg-brand-dark border border-white/10">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{tt('news.emptyTitle')}</CardTitle>
                  <CardDescription className="text-white/80">
                    {tt('news.emptySubtitle')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center text-white/70">
                  {tt('comingSoon', { section: tt('news.title') })}
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Category Filter (visual) */}
        <section className="py-8 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === categories[0] ? 'default' : 'outline'}
                  size="sm"
                  className={
                    category === categories[0]
                      ? 'bg-primary text-primary-foreground hover:opacity-90'
                      : 'border-white/20 text-white/85 hover:bg-white/10'
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {articles.length === 0 ? (
              <Card className="bg-white/5 border border-white/10 max-w-3xl mx-auto">
                <CardContent className="p-8 text-center text-white/80">
                  {tt('news.emptySubtitle')}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* map de artículos aquí cuando tengas datos */}
              </div>
            )}
          </div>
        </section>

        {/* Load More */}
        <section className="py-8 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Button className="border border-white/20 bg-white/5 text-white hover:bg-primary hover:text-primary-foreground">
              {tt('news.loadMore')}
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
