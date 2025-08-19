import WelcomeSection from '/components/dashboard/welcome-section'
import StatsPanel from '/components/dashboard/stats-panel'
import BadgesSection from '/components/dashboard/badges-section'
import WeeklyMissions from '/components/dashboard/weekly-missions'
import Leaderboard from '/components/dashboard/leaderboard'
import TrainingLogger from '/components/dashboard/training-logger'

export default function UserDashboard(props: {
  profile: { name: string }
  totalXP: number
  streak: number
  xpByType: Array<{ type:string; xp:number }>
  sessions: Array<{ id:number; program_id:number; starts_at:string; ends_at:string }>
  recentLogs: Array<{ id:number; session_type:string; duration_min:number; notes:string|null; created_at:string }>
  badges: Array<{ id:number; granted_at:string; badges: { code:string; name:string; icon_url:string|null } | null }>
  leaderboard: Array<{ user_id:string; full_name:string|null; total_xp:number }>
  weeklyMissions: Array<{ quest_id:number; progress:any; status:string; quests:{ title:string; description:string; xp_reward:number; steps:any } }>
  uid: string
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          <WelcomeSection name={props.profile.name} />
          <StatsPanel totalXP={props.totalXP} xpByType={props.xpByType} />
          <WeeklyMissions missions={props.weeklyMissions} />
          <TrainingLogger recentLogs={props.recentLogs} uid={props.uid} />
        </div>
        {/* Right */}
        <div className="space-y-8">
          <BadgesSection items={props.badges} />
          <Leaderboard items={props.leaderboard} />
        </div>
      </div>
    </div>
  )
}
