'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@/lib/i18n'

type Lang = 'es' | 'en' | 'ca'

type HomeNews = {
  title: string
  description: string
  date: string // ISO-like
  readTime: string
  image: string
  category: string
  href: string
  lang: Lang
}

function normalizeLang(input?: string | null): Lang {
  const v = (input || 'es').slice(0, 2).toLowerCase()
  return v === 'es' || v === 'en' || v === 'ca' ? (v as Lang) : 'es'
}

export default function NewsEvents() {
  const { t, lang: hookLang } = useTranslation() as unknown as {
    t: (k: string) => string
    lang?: string
  }

  // idioma reactivo con fallback + escucha de <html lang>
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
  const allNews: HomeNews[] = [
    {
      title: "El ping-pong en la infància i l'adolescència: un camí cap a la salut física i mental",
      description: 'Impacte del tennis de taula en el desenvolupament físic, cognitiu i social dels joves.',
      date: '2025-08-19',
      readTime: '5 min read',
      image: '/2.jpg',
      category: 'Salut',
      href: 'https://medium.com/@ce.joventut.tt/el-ping-pong-en-la-infància-i-ladolescència-un-camí-cap-a-la-salut-física-i-mental-f756c586d32c',
      lang: 'ca',
    },
    {
      title: 'El ping-pong en la infancia y adolescencia: un camino hacia la salud física y mental',
      description: 'Impacto del tenis de mesa en el desarrollo físico, cognitivo y social de niños y adolescentes.',
      date: '2025-08-19',
      readTime: '5 min read',
      image: '/2.jpg',
      category: 'Salud',
      href: 'https://medium.com/@ce.joventut.tt/el-ping-pong-en-la-infancia-y-adolescencia-un-aliado-para-crecer-con-cuerpo-y-mente-sanos-611ba01cd98a',
      lang: 'es',
    },
    {
      title: 'El ping-pong: mucho más que un juego, un aliado contra la demencia',
      description: 'Cómo el tenis de mesa puede ayudar a mantener el cerebro joven y activo.',
      date: '2025-08-19',
      readTime: '5 min read',
      image: '/encyclopedia-02-00107-g003-550.jpg',
      category: 'Salud',
      href: 'https://medium.com/@ce.joventut.tt/el-ping-pong-mucho-más-que-un-juego-un-aliado-contra-la-demencia-ff085c58302c',
      lang: 'es',
    },
    {
      title: 'Table tennis – the best entertainment sport for children and young people',
      description: 'Exploring the benefits of table tennis for health and development of young players.',
      date: '2025-08-19',
      readTime: '5 min read',
      image: '/2.jpg',
      category: 'Health',
      href: 'https://sport-transfer.eu/table-tennis---the-best-entertainment-sport-for-children-and-young-people,3,55',
      lang: 'en',
    },
            {

      title: 'Unlocking the Secrets of Spin: Understanding the Physics of Table Tennis',
      description: 'The ping pong ball is a six-degree-of-freedom motion in a gravitational field, with the ball interacting with the air, the racket, and the table. This includes three translational and three rotational degrees of freedom. ',
      date: '2024-09-7',
      readTime: '5 min read',
      image: '/1.jpg',
      category: 'Training',
      href:
        'https://medium.com/@chrislu81/unlocking-the-secrets-of-spin-understanding-the-physics-of-table-tennis-db45db130561',
      lang: 'en',
    },
  ]

  // noticias visibles según idioma (fallback a ES si quedara vacío)
  const news = useMemo(() => {
    const byLang = allNews.filter(n => n.lang === lang)
    return byLang.length ? byLang : allNews.filter(n => n.lang === 'es')
  }, [lang])

  const formatDate = (dateStr: string) => {
    if (!mounted) return ''
    const locale = lang === 'en' ? 'en-GB' : lang
    return new Date(dateStr).toLocaleDateString(locale)
  }

  return (
    <section id="news" className="py-20 bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">{t('news.title')}</h2>
          <p className="text-white/80 text-lg font-thin">{t('news.description')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {news.map((article, index) => (
            <Card
              key={index}
              className="bg-white/5 border border-white/10 hover:scale-[1.01] transition-transform duration-300 overflow-hidden"
            >
              <div className="relative overflow-hidden">
                <img
                  src={article.image || '/placeholder.svg'}
                  alt={article.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
              </div>

              <CardHeader>
                <div className="flex items-center text-sm text-white/70 mb-2">
                  <Calendar className="mr-1 h-4 w-4" />
                  {mounted ? formatDate(article.date) : <span className="opacity-0">--/--/----</span>}
                  <Clock className="ml-4 mr-1 h-4 w-4" />
                  {article.readTime}
                </div>
                <CardTitle className="text-white">{article.title}</CardTitle>
                <CardDescription className="text-white/80">
                  {article.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Link href={article.href} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-primary text-primary-foreground hover:opacity-90">
                    {t('news.readMore')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/news">
            <Button className="border border-white/20 bg-white/5 text-white hover:bg-primary hover:text-primary-foreground">
              {t('news.viewAllNews')}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
