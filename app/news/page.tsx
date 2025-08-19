'use client'

import Navigation from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'
import { useTranslation } from '@/lib/i18n'

export default function NewsPage() {
  const { t } = useTranslation()
  const tt = typeof t === 'function' ? t : ((k: string) => k)

  // Destacado
  const featuredArticle = {
    id: 'pingpong-demencia',
    title: 'El ping-pong: mucho más que un juego, un aliado contra la demencia',
    excerpt:
      'Publicado en Medium: cómo el tenis de mesa puede ser un aliado para la salud física y cognitiva, especialmente en personas mayores.',
    date: '2025-08-19',
    readTime: '5 min read',
    image: '/pareja-ancianos-jugando-al-ping-pong-patio-hotel_484921-8345.jpg',
    category: 'Salud',
    author: 'Club Esportiu Joventut TT',
    externalUrl:
      'https://medium.com/@ce.joventut.tt/el-ping-pong-mucho-más-que-un-juego-un-aliado-contra-la-demencia-ff085c58302c',
  }

  // Parrilla (ambos artículos en Salud)
  const articles: Array<{
    id: string
    title: string
    excerpt: string
    date: string
    readTime: string
    image: string
    category: string
    author: string
    externalUrl?: string
  }> = [
    {
      id: 'pingpong-demencia-grid',
      title: 'El ping-pong: mucho más que un juego, un aliado contra la demencia',
      excerpt:
        'Cómo el tenis de mesa puede ayudar a mantener el cerebro joven y activo, con evidencia científica reciente.',
      date: '2025-08-19',
      readTime: '5 min read',
      image: '/encyclopedia-02-00107-g003-550.jpg',
      category: 'Salud',
      author: 'Club Esportiu Joventut TT',
      externalUrl:
        'https://medium.com/@ce.joventut.tt/el-ping-pong-mucho-más-que-un-juego-un-aliado-contra-la-demencia-ff085c58302c',
    },
    {
      id: 'pingpong-infancia',
      title:
        'El ping-pong en la infancia y adolescencia: un camino hacia la salud física y mental',
      excerpt:
        'Impacto del tenis de mesa en el desarrollo físico, cognitivo y social de niños y adolescentes.',
      date: '2025-08-19',
      readTime: '5 min read',
      image: '/2.jpg', // pon una imagen existente en /public
      category: 'Salud',
      author: 'Club Esportiu Joventut TT',
      externalUrl:
        'https://medium.com/@ce.joventut.tt/el-ping-pong-en-la-infancia-y-adolescencia-un-aliado-para-crecer-con-cuerpo-y-mente-sanos-611ba01cd98a',
    },
  ]

  const categories = [
    tt('news.categories.all'),
    tt('news.categories.tournament'),
    tt('news.categories.facilityUpdate'),
    tt('news.categories.programLaunch'),
    tt('news.categories.memberSpotlight'),
    tt('news.categories.results'),
    tt('news.categories.announcement'),
    tt('news.categories.workshop'), // asegúrate de tener esta clave en i18n
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

        {/* Featured */}
        <section className="py-16 bg-white/5 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                    {new Date(featuredArticle.date).toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                    <Clock className="ml-4 mr-2 h-4 w-4" />
                    {featuredArticle.readTime}
                    <User className="ml-4 mr-2 h-4 w-4" />
                    {featuredArticle.author}
                  </div>

                  <h3 className="text-3xl font-black text-white mb-4">{featuredArticle.title}</h3>
                  <p className="text-white/90 text-lg mb-6 leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>

                  <Link
                    href={featuredArticle.externalUrl ?? `/news/${featuredArticle.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="bg-primary hover:opacity-90 text-primary-foreground">
                      {tt('news.readFullStory')}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
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
                {articles.map((article) => (
                  <Card key={article.id} className="bg-card/90 border border-border overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-6">
                      <div className="flex items-center text-sm text-white/70 mb-2">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(article.date).toLocaleDateString('es-ES')}
                        <Clock className="ml-4 mr-2 h-4 w-4" />
                        {article.readTime}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                      <p className="text-white/80 mb-4">{article.excerpt}</p>
                      <Link
                        href={article.externalUrl ?? `/news/${article.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button className="bg-primary text-primary-foreground hover:opacity-90">
                          {tt('news.readFullStory')}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
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
