'use client'

import { useState } from 'react'
import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight, Play, Download, Heart } from 'lucide-react'

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', 'Training', 'Tournaments', 'Events', 'Facilities']

  const images = [
    {
      id: 1,
      src: '/table-tennis-action.png',
      title: 'Championship Final Match',
      category: 'Tournaments',
      description: 'Intense moment from our annual championship final'
    },
    {
      id: 2,
      src: '/table-tennis-training.png',
      title: 'Advanced Training Session',
      category: 'Training',
      description: 'Players practicing advanced techniques with our coaches'
    },
    {
      id: 3,
      src: '/table-tennis-celebration.png',
      title: 'Victory Celebration',
      category: 'Tournaments',
      description: 'Team celebrating after winning the regional championship'
    },
    {
      id: 4,
      src: '/modern-table-tennis-facility.png',
      title: 'Modern Training Facility',
      category: 'Facilities',
      description: 'Our state-of-the-art training facility with professional equipment'
    },
    {
      id: 5,
      src: '/young-table-tennis-training.png',
      title: 'Youth Development Program',
      category: 'Training',
      description: 'Young players learning fundamentals in our youth program'
    },
    {
      id: 6,
      src: '/table-tennis-club.png',
      title: 'Club Team Photo',
      category: 'Events',
      description: 'Annual team photo with all our members and coaches'
    },
    {
      id: 7,
      src: '/female-table-tennis-winner.png',
      title: 'Regional Champion',
      category: 'Tournaments',
      description: 'Sarah Chen after winning the regional championship'
    },
    {
      id: 8,
      src: '/modern-table-tennis.png',
      title: 'Competition Setup',
      category: 'Facilities',
      description: 'Professional tournament setup in our main hall'
    }
  ]

  const videos = [
    {
      id: 1,
      title: 'Advanced Serving Techniques',
      thumbnail: '/placeholder.svg?height=200&width=300',
      duration: '12:34',
      description: 'Learn professional serving techniques from our head coach'
    },
    {
      id: 2,
      title: 'Championship Match Highlights',
      thumbnail: '/placeholder.svg?height=200&width=300',
      duration: '8:45',
      description: 'Best moments from our recent tournament victory'
    },
    {
      id: 3,
      title: 'Club Facility Tour',
      thumbnail: '/placeholder.svg?height=200&width=300',
      duration: '5:20',
      description: 'Take a virtual tour of our modern facilities'
    },
    {
      id: 4,
      title: 'Training Session Highlights',
      thumbnail: '/placeholder.svg?height=200&width=300',
      duration: '15:12',
      description: 'Highlights from our intensive training sessions'
    }
  ]

  const filteredImages = selectedCategory === 'All' 
    ? images 
    : images.filter(img => img.category === selectedCategory)

  const openLightbox = (index: number) => {
    setSelectedImage(index)
  }

  const closeLightbox = () => {
    setSelectedImage(null)
  }

  const nextImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage + 1) % filteredImages.length)
    }
  }

  const prevImage = () => {
    if (selectedImage !== null) {
      setSelectedImage((selectedImage - 1 + filteredImages.length) % filteredImages.length)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-6">Media Gallery</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Explore our collection of photos and videos showcasing the excitement and energy of Thunder TT Club
            </p>
          </div>
        </section>

        {/* Category Filter */}
        <section className="py-8 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={category === selectedCategory ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={category === selectedCategory 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'border-gray-600 text-gray-300 hover:border-orange-500 hover:text-orange-400'
                  }
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Photo Gallery */}
        <section className="py-16 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Photo Gallery</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-800"
                  onClick={() => openLightbox(index)}
                >
                  <img
                    src={image.src || "/placeholder.svg"}
                    alt={image.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                      <h3 className="text-white font-semibold mb-2">{image.title}</h3>
                      <p className="text-gray-300 text-sm px-4">{image.description}</p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button size="sm" variant="outline" className="border-white/50 text-white hover:bg-white hover:text-gray-900">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Video Gallery */}
        <section className="py-16 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Video Gallery</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
              {videos.map((video) => (
                <div key={video.id} className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 hover:border-orange-500 transition-colors duration-300">
                  <div className="relative">
                    <img
                      src={video.thumbnail || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group hover:bg-black/60 transition-colors duration-300">
                      <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-4 group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-8 w-8" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {video.duration}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-white font-semibold text-lg mb-2">{video.title}</h3>
                    <p className="text-gray-300 text-sm mb-4">{video.description}</p>
                    <div className="flex items-center justify-between">
                      <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button variant="ghost" size="sm" className="text-orange-400 hover:text-orange-300">
                        Watch Now
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Lightbox Modal */}
        {selectedImage !== null && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="relative max-w-6xl max-h-full">
              <img
                src={filteredImages[selectedImage].src || "/placeholder.svg"}
                alt={filteredImages[selectedImage].title}
                className="max-w-full max-h-[80vh] object-contain"
              />
              
              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
              
              {/* Navigation Buttons */}
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              {/* Image Info */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/70 text-white p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">{filteredImages[selectedImage].title}</h3>
                <p className="text-gray-300">{filteredImages[selectedImage].description}</p>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-sm text-gray-400">
                    {selectedImage + 1} of {filteredImages.length}
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-white/50 text-white hover:bg-white hover:text-gray-900">
                      <Heart className="mr-2 h-4 w-4" />
                      Like
                    </Button>
                    <Button size="sm" variant="outline" className="border-white/50 text-white hover:bg-white hover:text-gray-900">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
