'use client'

import Navigation from '@/components/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@/lib/i18n'

type Lang = 'es' | 'en' | 'ca'
type CategoryId = 'all' | 'health' | 'training'

type Article = {
  id: string
  title: string
  excerpt: string
  date: string
  readTime: string
  image: string
  categories: CategoryId[]
  externalUrl: string
  lang: Lang
}

function normalizeLang(input?: string | null): Lang {
  const v = (input || 'es').slice(0, 2).toLowerCase()
  return v === 'es' || v === 'en' || v === 'ca' ? (v as Lang) : 'es'
}

export default function NewsPage() {
  const { t, lang: hookLang } = useTranslation() as unknown as {
    t: (k: string) => string
    lang?: string
  }
  const tt = (k: string) => (typeof t === 'function' ? t(k) : k)

  // idioma reactivo: del hook + escucha cambios en <html lang>
  const [lang, setLang] = useState<Lang>(normalizeLang(hookLang))
  useEffect(() => {
    setLang(normalizeLang(hookLang))
  }, [hookLang])

  useEffect(() => {
    if (typeof document === 'undefined') return
    const el = document.documentElement
    const update = () => setLang(normalizeLang(el.getAttribute('lang')))
    update()
    const mo = new MutationObserver(update)
    mo.observe(el, { attributes: true, attributeFilter: ['lang'] })
    return () => mo.disconnect()
  }, [])

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  // --- SOLO ESTOS 4 ARTÍCULOS ---
  const allArticles: Article[] = [
    {
      id: 'pingpong-infancia-ca',
      title: "El ping-pong en la infància i l'adolescència: un camí cap a la salut física i mental",
      excerpt: 'Impacte del tennis de taula en el desenvolupament físic, cognitiu i social dels joves.',
      date: '2025-08-19',
      readTime: '5 min read',
      image: '/2.jpg',
      categories: ['health'],
      externalUrl:
        'https://medium.com/@ce.joventut.tt/el-ping-pong-en-la-infància-i-ladolescència-un-camí-cap-a-la-salut-física-i-mental-f756c586d32c',
      lang: 'ca',
    },
    {
      id: 'pingpong-infancia-es',
      title: 'El ping-pong en la infancia y adolescencia: un camino hacia la salud física y mental',
      excerpt: 'Impacto del tenis de mesa en el desarrollo físico, cognitivo y social de niños y adolescentes.',
      date: '2025-08-19',
      readTime: '5 min read',
      image: '/2.jpg',
      categories: ['health'],
      externalUrl:
        'https://medium.com/@ce.joventut.tt/el-ping-pong-en-la-infancia-y-adolescencia-un-aliado-para-crecer-con-cuerpo-y-mente-sanos-611ba01cd98a',
      lang: 'es',
    },
    {
      id: 'pingpong-demencia-es',
      title: 'El ping-pong: mucho más que un juego, un aliado contra la demencia',
      excerpt: 'Cómo el tenis de mesa puede ayudar a mantener el cerebro joven y activo.',
      date: '2025-08-19',
      readTime: '5 min read',
      image: '/encyclopedia-02-00107-g003-550.jpg',
      categories: ['health'],
      externalUrl:
        'https://medium.com/@ce.joventut.tt/el-ping-pong-mucho-más-que-un-juego-un-aliado-contra-la-demencia-ff085c58302c',
      lang: 'es',
    },
    {
      id: 'pingpong-children-en',
      title: 'Table tennis – the best entertainment sport for children and young people',
      excerpt: 'Exploring the benefits of table tennis for health and development of young players.',
      date: '2025-08-19',
      readTime: '5 min read',
      image: '/2.jpg',
      categories: ['health'],
      externalUrl:
        'https://sport-transfer.eu/table-tennis---the-best-entertainment-sport-for-children-and-young-people,3,55',
      lang: 'en',
    },
        {
      id: 'pingpong-physics-en',
      title: 'Unlocking the Secrets of Spin: Understanding the Physics of Table Tennis',
      excerpt: 'The ping pong ball is a six-degree-of-freedom motion in a gravitational field, with the ball interacting with the air, the racket, and the table. This includes three translational and three rotational degrees of freedom. ',
      date: '2024-09-7',
      readTime: '5 min read',
      image: '/1.jpg',
      categories: ['training'],
      externalUrl:
        'https://medium.com/@chrislu81/unlocking-the-secrets-of-spin-understanding-the-physics-of-table-tennis-db45db130561',
      lang: 'en',
    },
  ]

  // Filtra por idioma (fallback a ES si quedara vacío)
  const articlesByLang = useMemo(
    () => allArticles.filter(a => a.lang === lang),
    [lang]
  )
  const articles = articlesByLang.length ? articlesByLang : allArticles.filter(a => a.lang === 'es')

  // Categorías presentes + "All"
  const categories = useMemo(() => {
    const set = new Set<CategoryId>()
    articles.forEach(a => a.categories.forEach(c => set.add(c)))
    return (['all', ...Array.from(set)] as CategoryId[])
  }, [articles])

  const [selected, setSelected] = useState<CategoryId>('all')

  const filtered = useMemo(() => {
    if (selected === 'all') return articles
    return articles.filter(a => a.categories.includes(selected))
  }, [articles, selected])

  const formatDate = (dateStr: string) => {
    if (!mounted) return ''
    const locale = lang === 'en' ? 'en-GB' : lang
    return new Date(dateStr).toLocaleDateString(locale)
  }

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

        {/* Category Filter */}
        <section className="py-8 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((id) => {
                const active = id === selected
                return (
                  <Button
                    key={id}
                    onClick={() => setSelected(id)}
                    variant={active ? 'default' : 'outline'}
                    size="sm"
                    className={
                      active
                        ? 'bg-primary text-primary-foreground hover:opacity-90'
                        : 'border-white/20 text-white/85 hover:bg-white/10'
                    }
                  >
                    {id === 'all' ? tt('news.categories.all') : tt(`news.categories.${id}`)}
                  </Button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Articles Grid */}
        <section className="py-16 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {filtered.length === 0 ? (
              <Card className="bg-white/5 border border-white/10 max-w-3xl mx-auto">
                <CardContent className="p-8 text-center text-white/80">
                  {tt('news.emptySubtitle')}
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.map((article) => (
                  <Card key={article.id} className="bg-card/90 border border-border overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-40 object-cover"
                    />
                    <CardContent className="p-6">
                      <div className="flex items-center text-sm text-white/70 mb-2">
                        <Calendar className="mr-2 h-4 w-4" />
                        {mounted ? formatDate(article.date) : <span className="opacity-0">--/--/----</span>}
                        <Clock className="ml-4 mr-2 h-4 w-4" />
                        {article.readTime}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                      <p className="text-white/80 mb-4">{article.excerpt}</p>
                      <Link href={article.externalUrl} target="_blank" rel="noopener noreferrer">
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
      </div>
    </div>
  )
}
