'use client'

import Navigation from '@/components/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from '@/lib/i18n'
import { getArticleSlug, type Lang, type NewsArticle, type NewsCategory } from '@/lib/news'
import Image from 'next/image'

type CategoryId = NewsCategory

function normalizeLang(input?: string | null): Lang {
  const v = (input || 'es').slice(0, 2).toLowerCase();
  return v === 'es' || v === 'en' || v === 'ca' ? (v as Lang) : 'es';
}

export default function NewsPage() {
  const { t, language: hookLang } = useTranslation() as unknown as {
    t: (k: string) => string;
    language?: string;
  };
  const tt = (k: string) => (typeof t === 'function' ? t(k) : k);

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

  const [allArticles, setAllArticles] = useState<NewsArticle[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [feedLang, setFeedLang] = useState<Lang>(lang);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);
  const generation = useRef(0);
  const loadingMore = useRef(false);
  useEffect(() => {
    const currentGeneration = ++generation.current;
    const controller = new AbortController();
    loadingMore.current = false;
    const fetchNews = async () => {
      setLoading(true);
      setLoadError(false);
      setAllArticles([]);
      setNextCursor(null);
      setHasMore(false);
      try {
        const response = await fetch(`/api/news?lang=${lang}`, { cache: 'no-store', signal: controller.signal });
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        const result = await response.json() as { items: NewsArticle[]; hasMore: boolean; nextCursor: string | null; lang: Lang };
        if (controller.signal.aborted || currentGeneration !== generation.current) return;
        setAllArticles(result.items);
        setHasMore(result.hasMore);
        setNextCursor(result.nextCursor);
        setFeedLang(result.lang);
      } catch (err: unknown) {
        if (!controller.signal.aborted && currentGeneration === generation.current) {
          console.error('Failed to fetch news', err);
          setLoadError(true);
        }
      } finally {
        if (!controller.signal.aborted && currentGeneration === generation.current) setLoading(false);
      }
    };

    fetchNews();
    return () => controller.abort();
  }, [lang, retryToken]);

  const articles = allArticles;

  async function loadMore() {
    if (loadingMore.current || loading) return;
    const currentGeneration = generation.current;
    const currentLang = feedLang;
    if (!nextCursor) return;
    const controller = new AbortController();
    loadingMore.current = true;
    setLoading(true);
    setLoadError(false);
    try {
      const response = await fetch(`/api/news?cursor=${encodeURIComponent(nextCursor)}&lang=${currentLang}`, {
        cache: 'no-store',
        signal: controller.signal,
      });
      if (!response.ok) throw new Error('Failed to fetch news');
      const result = await response.json() as { items: NewsArticle[]; hasMore: boolean; nextCursor: string | null };
      if (controller.signal.aborted || currentGeneration !== generation.current) return;
      setAllArticles((current) => [...current, ...result.items]);
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (error) {
      if (!controller.signal.aborted && currentGeneration === generation.current) {
        console.error('Failed to fetch news', error);
        setLoadError(true);
      }
    } finally {
      if (currentGeneration === generation.current) {
        loadingMore.current = false;
        setLoading(false);
      }
    }
  }

  // Categorías presentes + "All"
  const categories = useMemo(() => {
    const set = new Set<CategoryId>()
    articles.forEach(a => a.categories.forEach(c => set.add(c)))
    return (['all', ...Array.from(set)] as CategoryId[])
  }, [articles])

  const [selected, setSelected] = useState<CategoryId>('all')

  useEffect(() => {
    if (selected === 'all') return
    if (categories.includes(selected)) return
    setSelected('all')
  }, [categories, selected])

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
                    <div className="relative overflow-hidden h-52">
                      <Image
                        src={article.image}
                        alt={article.imageAlt || article.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 640px"
                        unoptimized={/^https?:\/\//.test(article.image) || article.image.startsWith('/api/news/images/')}
                        className="object-cover object-[center_20%]"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center text-sm text-white/70 mb-2">
                        <Calendar className="mr-2 h-4 w-4" />
                        {mounted ? formatDate(article.date) : <span className="opacity-0">--/--/----</span>}
                        <Clock className="ml-4 mr-2 h-4 w-4" />
                        {article.readTime}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{article.title}</h3>
                      <p className="text-white/80 mb-4">{article.excerpt}</p>
                      <Link href={`/news/${getArticleSlug(article)}`}>
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
            {loadError && <p role="alert" className="mt-6 text-center text-red-300">{lang === 'ca' ? 'No s’han pogut carregar les notícies.' : lang === 'en' ? 'News could not be loaded.' : 'No se han podido cargar las noticias.'}</p>}
            {(hasMore || loadError) && (
              <div className="mt-10 text-center">
                <Button disabled={loading} onClick={allArticles.length === 0 && loadError ? () => setRetryToken((current) => current + 1) : loadMore}>
                  {loading ? 'Cargando…' : loadError ? (lang === 'ca' ? 'Torna-ho a provar' : lang === 'en' ? 'Retry' : 'Reintentar') : lang === 'ca' ? 'Carregar més' : lang === 'en' ? 'Load more' : 'Cargar más'}
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
