import Navigation from '@/components/navigation'
import WelcomeSection from './welcome-section'
import StatsPanel from './stats-panel'
import BadgesSection from './badges-section'
import WeeklyMissions from './weekly-missions'
import Leaderboard from './leaderboard'
import TrainingLogger from './training-logger'

export default function UserDashboard() {
  return (
    <div className="min-h-screen bg-[#262425] text-white">
      <Navigation />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-8">
              <WelcomeSection />
              <StatsPanel />
              <WeeklyMissions />
              <TrainingLogger />
            </div>
            {/* Right */}
            <div className="space-y-8">
              <BadgesSection />
              <Leaderboard />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
