import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import Navigation from '@/components/navigation'
import UserDashboard from './user-dashboard'

export default async function DashboardPage() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')
  const uid = session.user.id

  // 🔹 Lanza todo en paralelo
  const [
    profileRes,
    xpRowsRes,
    streakRes,
    recentLogsRes,
    badgesRes,
    leaderboardRes,
    userQuestsRes,
    sessionsRes, // nuevo RPC
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

    // 🚀 reemplaza enrollments+sessions por un RPC O(1) indexado
    supabase.rpc('upcoming_sessions_for_user', { p_user: uid, limit_n: 5 }),
  ])

  const profile = profileRes.data
  const xpRows = xpRowsRes.data ?? []
  const totalXP = xpRows?.[0]?.total_xp ?? 0
  const xpByType = xpRows.filter(r => r.event_type != null)
                         .map(r => ({ type: r.event_type as string, xp: r.event_xp as number }))
  const streak = (streakRes.data ?? 0) as number
  const sessions = sessionsRes.data ?? []
  const recentLogs = recentLogsRes.data ?? []
  const badges = badgesRes.data ?? []
  const leaderboard = leaderboardRes.data ?? []
  const userQuests = userQuestsRes.data ?? []

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
          badges={badges}
          leaderboard={leaderboard}
          weeklyMissions={userQuests}
          uid={uid}
        />
      </div>
    </div>
  )
}
