import Navigation from '@/components/navigation'
import WelcomeSection from './welcome-section'
import StatsPanel from './stats-panel'
import BadgesSection from './badges-section'
import WeeklyMissions from './weekly-missions'
import Leaderboard from './leaderboard'
import TrainingLogger from './training-logger'

type Props = {
  profile?: { name: string }
  totalXP?: number
  xpByType?: Array<{ type:string; xp:number }>
  weeklyMissions?: Array<{ quest_id:number; progress:any; status:string; quests:{ title:string; description:string; xp_reward:number; steps:any } | null }>
  recentLogs?: Array<{ id:number; session_type:string; duration_min:number; notes:string|null; created_at:string }>
  badges?: Array<{ id:number; granted_at:string; badges: { code:string; name:string; icon_url:string|null } | null }>
  leaderboard?: Array<{ user_id:string; full_name:string|null; total_xp:number }>
  uid?: string
}

export default function UserDashboard({
  profile = { name: 'Jugador/a' },
  totalXP = 0,
  xpByType = [],
  weeklyMissions = [],
  recentLogs = [],
  badges = [],
  leaderboard = [],
  uid = '',
}: Props) {
  return (
    <div className="min-h-screen bg-[#262425] text-white">
      <Navigation />
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left */}
            <div className="lg:col-span-2 space-y-8">
              <WelcomeSection name={profile.name} />
              <StatsPanel totalXP={totalXP} xpByType={xpByType} />
              <WeeklyMissions missions={weeklyMissions} />
              <TrainingLogger recentLogs={recentLogs} uid={uid} />
            </div>
            {/* Right */}
            <div className="space-y-8">
              <BadgesSection items={badges} />
              <Leaderboard items={leaderboard} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
