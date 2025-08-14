import Navigation from '@/components/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight, User } from 'lucide-react'
import Link from 'next/link'

export default function NewsPage() {
  const featuredArticle = {
    id: 'annual-championship-2024',
    title: 'Annual Championship Tournament 2024 - Registration Now Open',
    excerpt:
      "Our biggest tournament of the year is approaching! Join players from across the region for three days of intense competition, prizes, and celebration of table tennis excellence.",
    content: 'The Thunder TT Club Annual Championship Tournament 2024 is set to be our most exciting event yet...',
    date: '2024-02-01',
    readTime: '5 min read',
    image: '/table-tennis-championship.png',
    category: 'Tournament',
    author: 'Sarah Chen',
    featured: true,
  }

  const articles = [
    {
      id: 'new-training-equipment',
      title: 'State-of-the-Art Training Equipment Arrives',
      excerpt:
        "We've upgraded our facilities with professional-grade robot trainers, new tables, and advanced video analysis systems to enhance your training experience.",
      date: '2024-01-28',
      readTime: '3 min read',
      image: '/modern-table-tennis-facility.png',
      category: 'Facility Update',
      author: 'Mike Johnson',
    },
    {
      id: 'youth-development-program',
      title: 'Youth Development Program Launches',
      excerpt:
        'Introducing our comprehensive youth development initiative designed to nurture young talent and build the next generation of table tennis champions.',
      date: '2024-01-25',
      readTime: '4 min read',
      image: '/young-table-tennis-training.png',
      category: 'Program Launch',
      author: 'Lisa Park',
    },
    {
      id: 'member-spotlight-sarah',
      title: "Member Spotlight: Sarah Chen's Championship Journey",
      excerpt:
        'Follow Sarah’s inspiring path from beginner to regional champion, and learn about the dedication and training that led to her recent victory.',
      date: '2024-01-22',
      readTime: '6 min read',
      image: '/female-table-tennis-winner.png',
      category: 'Member Spotlight',
      author: 'David Lee',
    },
    {
      id: 'winter-league-results',
      title: 'Winter League Season Concludes with Thunder Victory',
      excerpt:
        'Our senior team dominated the winter league, finishing with an impressive 14-1 record and claiming the championship title.',
      date: '2024-01-18',
      readTime: '3 min read',
      image: '/table-tennis-celebration.png',
      category: 'Results',
      author: 'Emma Wilson',
    },
    {
      id: 'coaching-workshop',
      title: 'Advanced Coaching Workshop with International Expert',
      excerpt:
        'Join us for a special workshop with former Olympic coach Zhang Wei, covering advanced techniques and modern training methodologies.',
      date: '2024-01-15',
      readTime: '4 min read',
      image: '/table-tennis-training.png',
      category: 'Workshop',
      author: 'Alex Rodriguez',
    },
    {
      id: 'facility-expansion',
      title: 'Club Expansion Plans Announced',
      excerpt:
        'Exciting news about our upcoming facility expansion, including two new courts, a fitness area, and improved locker rooms.',
      date: '2024-01-12',
      readTime: '5 min read',
      image: '/modern-table-tennis.png',
      category: 'Announcement',
      author: 'Robert Kim',
    },
  ]

  const categories = [
    'All',
    'Tournament',
    'Facility Update',
    'Program Launch',
    'Member Spotlight',
    'Results',
    'Workshop',
    'Announcement',
  ]

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="py-20 bg-gradient-to-r from-brand-red to-brand-teal">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-4">News &amp; Updates</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-thin">
              Stay informed with the latest news, events, and achievements from Thunder TT Club
            </p>
          </div>
        </section>

        {/* Featured Article */}
        <section className="py-16 bg-white/5 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-white">Featured Story</h2>
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
                    <span className="bg-brand-red text-white px-3 py-1 rounded-full text-xs font-semibold">
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
                  <p className="text-white/90 text-lg mb-6 leading-relaxed">{featuredArticle.excerpt}</p>

                  <Link href={`/news/${featuredArticle.id}`}>
                    <Button className="bg-brand-red hover:bg-brand-red/90 text-white">
                      Read Full Story
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Category Filter (visual, sin estado aún) */}
        <section className="py-8 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === 'All' ? 'default' : 'outline'}
                  size="sm"
                  className={
                    category === 'All'
                      ? 'bg-brand-red hover:bg-brand-red/90 text-white'
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article) => (
                <Card
                  key={article.id}
                  className="bg-white/5 border border-white/10 hover:border-brand-red transition-all duration-300 group overflow-hidden"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={article.image || '/placeholder.svg'}
                      alt={article.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-brand-red text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {article.category}
                      </span>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-center text-sm text-white/70 mb-2">
                      <Calendar className="mr-1 h-3 w-3" />
                      {new Date(article.date).toLocaleDateString()}
                      <Clock className="ml-3 mr-1 h-3 w-3" />
                      {article.readTime}
                    </div>
                    <CardTitle className="text-white group-hover:text-brand-teal transition-colors duration-300 line-clamp-2 font-semibold">
                      {article.title}
                    </CardTitle>
                    <CardDescription className="text-white/85 line-clamp-3">
                      {article.excerpt}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-sm text-white/70">
                        <User className="mr-1 h-3 w-3" />
                        {article.author}
                      </div>
                      <Link href={`/news/${article.id}`}>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-brand-teal hover:text-brand-teal/80 hover:bg-white/10 p-0"
                        >
                          Read More
                          <ArrowRight className="ml-2 h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Load More */}
        <section className="py-8 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Button className="border border-white/20 bg-white/5 text-white hover:bg-brand-red hover:text-white">
              Load More Articles
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
