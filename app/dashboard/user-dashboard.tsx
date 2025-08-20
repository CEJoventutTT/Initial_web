'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import WelcomeSection from '@/components/dashboard/welcome-section'
import StatsPanel from '@/components/dashboard/stats-panel'
import BadgesSection from '@/components/dashboard/badges-section'
import WeeklyMissions from '@/components/dashboard/weekly-missions'
import Leaderboard from '@/components/dashboard/leaderboard'
import TrainingLogger from '@/components/dashboard/training-logger'

type SessionItem   = { id:number; program_id:number; starts_at:string; ends_at:string }
type TrainingLog   = { id:number; session_type:string; duration_min:number; notes:string|null; created_at:string }
type BadgeItem     = { id:number; granted_at:string; badges: { code:string; name:string; icon_url:string|null } | null }
type LeaderItem    = { user_id:string; full_name:string|null; total_xp:number }
type MissionItem   = { quest_id:number; progress:any; status:string; quests:{ title:string; description:string; xp_reward:number; steps:any } }
type AttendanceLog = { id:number; session_id:number; program_id:number; checked_at:string }

export default function UserDashboard(props: {
  profile: { name: string }
  totalXP: number
  streak: number
  xpByType: Array<{ type:string; xp:number }>
  sessions: Array<SessionItem>
  recentLogs: Array<TrainingLog>
  recentAttendance: Array<AttendanceLog>
  badges: Array<BadgeItem>
  leaderboard: Array<LeaderItem>
  weeklyMissions: Array<MissionItem>
  uid: string
}) {
  const attendance = props.recentAttendance ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Panel del estudiante</h1>
        <Link href="/dashboard/scan">
          <Button className="bg-primary text-white hover:bg-primary/90">Escanear QR</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left */}
        <div className="lg:col-span-2 space-y-8">
          <WelcomeSection name={props.profile.name} />
          <StatsPanel totalXP={props.totalXP} xpByType={props.xpByType} />

          {/* Asistencias recientes */}
          <section className="rounded-2xl bg-white/5 border border-white/10 p-5">
            <h2 className="text-lg font-semibold mb-3">Asistencias recientes</h2>
            {attendance.length === 0 ? (
              <p className="text-white/60">Aún no hay asistencias registradas.</p>
            ) : (
              <ul className="divide-y divide-white/10">
                {attendance.map((a) => (
                  <li key={a.id} className="py-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm text-white/80">Log #{a.id}</p>
                      <p className="text-xs text-white/50">
                        Sesión: {a.session_id} · Programa: {a.program_id}
                      </p>
                    </div>
                    <time className="text-sm text-white/70">
                      {new Date(a.checked_at).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </section>

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
