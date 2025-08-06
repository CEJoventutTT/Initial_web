'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Play } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function MediaGallery() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const { t } = useTranslation()

  const photos = [
    '/placeholder-hoxca.png',
    '/table-tennis-training.png',
    '/table-tennis-celebration.png',
    '/modern-table-tennis.png',
    '/placeholder.svg?height=400&width=600'
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % photos.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <section id="gallery" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-white mb-4">{t('gallery.title')}</h2>
          <p className="text-gray-300 text-lg font-thin">
            {t('gallery.description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Photo Slider */}
          <div className="relative">
            <h3 className="text-2xl font-medium text-white mb-6">{t('gallery.photoGallery')}</h3>
            <div className="relative overflow-hidden rounded-lg bg-gray-900">
              <div 
                className="flex transition-transform duration-300 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo || "/placeholder.svg"}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-80 object-cover flex-shrink-0"
                  />
                ))}
              </div>
              
              {/* Navigation buttons */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              {/* Dots indicator */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {photos.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? 'bg-teal-600' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Video Section */}
          <div>
            <h3 className="text-2xl font-medium text-white mb-6">{t('gallery.featuredVideo')}</h3>
            <div className="relative rounded-lg overflow-hidden bg-gray-900">
              <img
                src="/placeholder.svg?height=320&width=600"
                alt="Training video thumbnail"
                className="w-full h-80 object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-white rounded-full p-6">
                  <Play className="h-8 w-8" />
                </Button>
              </div>
              <div className="absolute bottom-4 left-4 right-4">
                <h4 className="text-white font-medium text-lg mb-2">
                  Advanced Serving Techniques
                </h4>
                <p className="text-gray-300 text-sm font-thin">
                  Learn professional serving techniques from our head coach in this comprehensive training video.
                </p>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-900 rounded-lg">
                <div className="relative">
                  <img
                    src="/placeholder.svg?height=80&width=120"
                    alt="Video thumbnail"
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-white font-medium">Championship Match Highlights</h5>
                  <p className="text-gray-400 text-sm font-thin">Best moments from our recent tournament victory</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4 p-4 bg-gray-900 rounded-lg">
                <div className="relative">
                  <img
                    src="/placeholder.svg?height=80&width=120"
                    alt="Video thumbnail"
                    className="w-20 h-12 object-cover rounded"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Play className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h5 className="text-white font-medium">Club Facility Tour</h5>
                  <p className="text-gray-400 text-sm font-thin">Take a virtual tour of our modern facilities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
