'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight, Play, Download, Heart } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function GalleryPage() {
  const { t } = useTranslation()
  const tt = typeof t === 'function' ? t : ((k: string, v?: any) => k)

  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = [
    'All', // sólo visual por ahora
    'Training',
    'Tournaments',
    'Events',
    'Facilities'
  ]

  // Deja la estructura, pero sin datos aún
  const images: Array<{ id: number; src: string; title: string; category: string; description: string }> = []
  const videos: Array<{ id: number; title: string; thumbnail: string; duration: string; description: string }> = []

  const filteredImages = selectedCategory === 'All'
    ? images
    : images.filter(img => img.category === selectedCategory)

  const openLightbox  = (index: number) => setSelectedImage(index)
  const closeLightbox = () => setSelectedImage(null)
  const nextImage = () => { if (selectedImage !== null) setSelectedImage((selectedImage + 1) % filteredImages.length) }
  const prevImage = () => { if (selectedImage !== null) setSelectedImage((selectedImage - 1 + filteredImages.length) % filteredImages.length) }

  return (
    <div className="min-h-screen bg-brand-dark text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-20 bg-hero-gradient text-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black text-white mb-6">{tt('gallery.title')}</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto font-thin">
              {tt('gallery.description')}
            </p>
          </div>
        </section>

        {/* Categorías (visual) */}
        <section className="py-8 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => {
                const active = category === selectedCategory
                return (
                  <Button
                    key={category}
                    variant={active ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={
                      active
                        ? 'bg-primary hover:opacity-90 text-primary-foreground'
                        : 'border-white/20 text-white/85 hover:bg-brand-teal hover:text-brand-dark hover:border-brand-teal'
                    }
                  >
                    {category}
                  </Button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Galería fotos */}
        <section className="py-16 bg-brand-dark">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-8 text-center">{tt('gallery.photoGallery')}</h2>

            {filteredImages.length === 0 ? (
              <div className="max-w-3xl mx-auto text-center text-white/80 bg-white/5 border border-white/10 rounded-lg p-10">
                {tt('gallery.emptySubtitlePhotos')}
                <div className="mt-3 text-accent">{tt('comingSoon', { section: tt('gallery.photoGallery') })}</div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* map imágenes cuando tengas datos */}
              </div>
            )}
          </div>
        </section>

        {/* Vídeos */}
        <section className="py-16 bg-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-black text-white mb-8 text-center">{tt('gallery.videoGallery')}</h2>

            {videos.length === 0 ? (
              <div className="max-w-3xl mx-auto text-center text-white/80 bg-brand-dark border border-white/10 rounded-lg p-10">
                {tt('gallery.emptySubtitleVideos')}
                <div className="mt-3 text-accent">{tt('comingSoon', { section: tt('gallery.videoGallery') })}</div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
                {/* map vídeos cuando tengas datos */}
              </div>
            )}
          </div>
        </section>

        {/* Lightbox */}
        {selectedImage !== null && filteredImages.length > 0 && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-full">
              <img
                src={filteredImages[selectedImage].src || '/placeholder.svg'}
                alt={filteredImages[selectedImage].title}
                className="max-w-full max-h-[80vh] object-contain"
                draggable={false}
              />

              {/* Close */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 bg-brand-dark/60 hover:bg-brand-dark/80 text-white p-2 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Nav */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-dark/60 hover:bg-brand-dark/80 text-white p-3 rounded-full transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-brand-dark/60 hover:bg-brand-dark/80 text-white p-3 rounded-full transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-brand-dark/70 text-white p-4 rounded-lg border border-white/10">
                <h3 className="font-semibold text-lg mb-2">{filteredImages[selectedImage].title}</h3>
                <p className="text-white/80">{filteredImages[selectedImage].description}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
