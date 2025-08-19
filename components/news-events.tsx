'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function NewsEvents() {
  const { t } = useTranslation()

  const news = [  
{
  title: 'El ping-pong: mucho más que un juego, un aliado contra la demencia',
  description: 'Publicado en Medium: cómo el tenis de mesa puede ser un aliado para la salud física y cognitiva, especialmente en personas mayores.',
  date: '2025-08-19',
  readTime: '5 min read',
  image: '/encyclopedia-02-00107-g003-550.jpg',
  category: 'Salud'
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
    <section id="news" className="py-20" style={{ backgroundColor: '#262425' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">{t('news.title')}</h2>
          <p className="text-gray-300 text-lg font-thin">
            {t('news.description')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
          {news.map((article, index) => (
            <Card 
              key={index} 
              className="border hover:scale-[1.01] transition-transform duration-300 overflow-hidden"
              style={{ 
                backgroundColor: '#2F2C2D', 
                borderColor: '#5D8C87' 
              }}
            >
              <div className="relative overflow-hidden">
                <img
                  src={article.image || "/placeholder.svg"}
                  alt={article.title}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4">
                  <span 
                    className="px-3 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: '#BF0F30' }}
                  >
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
                <CardTitle 
                  className="transition-colors duration-300 font-medium"
                  style={{ color: 'white' }}
                >
                  {article.title}
                </CardTitle>
                <CardDescription className="text-gray-300 font-thin">
                  {article.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Button 
                  variant="ghost" 
                  className="p-0 font-medium"
                  style={{ color: '#2C6DFF' }}
                >
                  {t('news.readMore')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            className="font-medium"
            style={{ 
              borderColor: '#BF0F30', 
              color: '#BF0F30' 
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = '#BF0F30'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = '#BF0F30'
            }}
          >
            {t('news.viewAllNews')}
          </Button>
        </div>
      </div>
    </section>
  )
}
