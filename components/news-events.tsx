'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { detectArticleLang, normalizeCategory } from '@/lib/news'
import Image from 'next/image'

type Lang = 'es' | 'en' | 'ca';

type Article = {
  id: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  image: string;
  category: string;
  href: string;
  lang: Lang;
};

function normalizeLang(input?: string | null): Lang {
  const v = (input || 'es').slice(0, 2).toLowerCase();
  return v === 'es' || v === 'en' || v === 'ca' ? (v as Lang) : 'es';
}

export default function NewsEvents() {
  const { t, lang: hookLang } = useTranslation() as unknown as {
    t: (k: string) => string;
    lang?: string;
  };

  const [lang, setLang] = useState<Lang>(normalizeLang(hookLang));
  useEffect(() => {
    setLang(normalizeLang(hookLang));
  }, [hookLang]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const el = document.documentElement;
    const update = () => setLang(normalizeLang(el.getAttribute('lang')));
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ['lang'] });
    return () => mo.disconnect();
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [allArticles, setAllArticles] = useState<Article[]>([]);
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const items = await response.json();
        
        const articles = items.map((item: any) => {
          const content = item['content:encoded'] || '';
          const imageUrlMatch = content.match(/<img[^>]+src="([^">]+)"/);
          const imageUrl = imageUrlMatch ? imageUrlMatch[1] : '/placeholder.jpg';

          const description = content.replace(/<[^>]*>/g, '').substring(0, 150);
          
          const words = content.split(' ').length;
          const readTime = `${Math.ceil(words / 200)} min read`;

          const detectedLang = detectArticleLang({
            title: item.title,
            content,
            categories: item.categories,
          });

          return {
            id: item.guid,
            title: item.title,
            description: description,
            date: item.isoDate,
            readTime: readTime,
            image: imageUrl,
            category: normalizeCategory(item.categories?.[0] || 'news'),
            href: item.link,
            lang: detectedLang,
          };
        });

        setAllArticles(articles);
      } catch (err: unknown) {
        console.error('Failed to fetch news', err);
      }
    };

    fetchNews();
  }, []);

  const news = useMemo(() => {
    const byLang = allArticles.filter(n => n.lang === lang);
    return byLang.length ? byLang.slice(0, 4) : allArticles.filter(n => n.lang === 'es').slice(0, 4);
  }, [lang, allArticles]);

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
              <div className="relative overflow-hidden h-48">
                <Image
                  src={article.image || '/placeholder.svg'}
                  alt={article.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  unoptimized
                  className="object-cover"
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
