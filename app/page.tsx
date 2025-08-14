'use client'

import Navigation from '@/components/navigation'
import Hero from '@/components/hero'
import WhoWeAre from '@/components/who-we-are'
import TrainingsActivities from '@/components/trainings-activities'
import CompetitionResults from '@/components/competition-results'
import NewsEvents from '@/components/news-events'
import MediaGallery from '@/components/media-gallery'
import BecomeMember from '@/components/become-member'
import Contact from '@/components/contact'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark text-white">
      <Navigation />
      <Hero />
      <WhoWeAre />
      <TrainingsActivities />
      <CompetitionResults />
      <NewsEvents />
      <MediaGallery />
      <BecomeMember />
      <Contact />
    </div>
  )
}
