'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function NewsEvents() {
  const { t } = useTranslation()

  const news = [
    {
      title: 'Annual Championship Tournament 2024',
      description: 'Join us for our biggest tournament of the year featuring players from across the region. Prizes and trophies await!',
      date: '2024-02-15',
      readTime: '3 min read',
      image: '/table-tennis-championship.png',
      category: 'Tournament'
    },
    {
      title: 'New Training Equipment Arrives',
      description: 'We\'ve upgraded our facilities with state-of-the-art training equipment including robot trainers and professional tables.',
      date: '2024-01-28',
      readTime: '2 min read',
      image: '/modern-table-tennis-facility.png',
      category: 'Facility Update'
    },
    {
      title: 'Youth Development Program Launch',
      description: 'Introducing our new youth development program designed to nurture young talent and build future champions.',
      date: '2024-01-20',
      readTime: '4 min read',
      image: '/young-table-tennis-training.png',
      category: 'Program Launch'
    },
    {
      title: 'Member Spotlight: Sarah Chen',
      description: 'Meet Sarah Chen, our rising star who recently won the regional junior championship. Read about her journey and training.',
      date: '2024-01-12',
      readTime: '5 min read',
      image: '/female-table-tennis-winner.png',
      category: 'Member Spotlight'
    }
  ]

  return (
    <section id="news" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">{t('news.title')}</h2>
          <p className="text-gray-300 text-lg font-thin">
            {t('news.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {news.map((article, index) => (
            <Card key={index} className="bg-gray-800 border-gray-700 hover:border-teal-600 transition-all duration-300 group overflow-hidden">
              <div className="relative overflow-hidden">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-teal-600 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {article.category}
                  </span>
                </div>
              </div>
              
              <CardHeader>
                <div className="flex items-center text-sm text-gray-400 mb-2">
                  <Calendar className="mr-1 h-4 w-4" />
                  {new Date(article.date).toLocaleDateString()}
                  <Clock className="ml-4 mr-1 h-4 w-4" />
                  {article.readTime}
                </div>
                <CardTitle className="text-white group-hover:text-teal-400 transition-colors duration-300 font-medium">
                  {article.title}
                </CardTitle>
                <CardDescription className="text-gray-300 font-thin">
                  {article.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Button variant="ghost" className="text-teal-400 hover:text-teal-300 hover:bg-teal-600/10 p-0 font-medium">
                  {t('news.readMore')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" className="border-teal-600 text-teal-400 hover:bg-teal-600 hover:text-white font-medium">
            {t('news.viewAllNews')}
          </Button>
        </div>
      </div>
    </section>
  )
}
