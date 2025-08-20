import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import Navigation from '@/components/navigation'
import UserDashboard from './user-dashboard'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')
  const uid = session.user.id

  const [
    profileRes,
    xpRowsRes,
    streakRes,
    recentTrainingRes,
    badgesRes,
    leaderboardRes,
    userQuestsRes,
    sessionsRes,
    recentAttendanceRes,
  ] = await Promise.all([
    supabase.from('profiles')
      .select('full_name, role')
      .eq('user_id', uid)
      .single(),

    supabase.rpc('xp_summary_for_user', { p_user: uid }),

    supabase.rpc('current_streak_days', { p_user: uid }),

    supabase.from('training_logs')
      .select('id, session_type, duration_min, notes, created_at')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })
      .limit(5),

    supabase.from('user_badges')
      .select('id, granted_at, badges(code, name, icon_url)')
      .eq('user_id', uid)
      .order('granted_at', { ascending: false })
      .limit(12),

    supabase.rpc('leaderboard_top', { limit_n: 6 }),

    supabase.from('user_quests')
      .select('quest_id, progress, status, quests(title, description, xp_reward, steps)')
      .eq('user_id', uid),

    supabase.rpc('upcoming_sessions_for_user', { p_user: uid, limit_n: 5 }),

    supabase.from('attendance_logs')
      .select('id, session_id, program_id, checked_at')
      .eq('student_id', uid)
      .order('checked_at', { ascending: false })
      .limit(10),
  ])

  const profile      = profileRes.data
  const xpRows       = xpRowsRes.data ?? []
  const totalXP      = xpRows?.[0]?.total_xp ?? 0
  const xpByType     = (xpRows ?? [])
    .filter((r: any) => r?.event_type != null)
    .map((r: any) => ({ type: String(r.event_type), xp: Number(r.event_xp ?? r.delta ?? 0) }))
  const streak       = Number(streakRes.data ?? 0)
  const sessions     = sessionsRes.data ?? []
  const recentLogs   = recentTrainingRes.data ?? []
  const badges       = badgesRes.data ?? []
  const leaderboard  = leaderboardRes.data ?? []
  const userQuests   = userQuestsRes.data ?? []
  const recentAttendance = recentAttendanceRes.data ?? []

  return (
    <div className="min-h-screen bg-[#262425] text-white">
      <Navigation />
      <div className="pt-16">
        <UserDashboard
          profile={{ name: profile?.full_name ?? session.user.email ?? 'Jugador/a' }}
          totalXP={totalXP}
          streak={streak}
          xpByType={xpByType}
          sessions={sessions}
          recentLogs={recentLogs}
          recentAttendance={recentAttendance}
          badges={badges}
          leaderboard={leaderboard}
          weeklyMissions={userQuests}
          uid={uid}
        />
      </div>
    </div>
  )
}
