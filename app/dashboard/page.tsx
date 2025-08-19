import { redirect } from 'next/navigation'
import { supabaseServer } from '@/lib/supabase/server'
import Navigation from '@/components/navigation'
import UserDashboard from './user-dashboard'

export default async function DashboardPage() {
  const supabase = supabaseServer()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/login')
  const uid = session.user.id

  // Perfil
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('user_id', uid)
    .single()

  // XP + desglose + racha
  const { data: xpRows } = await supabase.rpc('xp_summary_for_user', { p_user: uid })
  const totalXP = xpRows?.[0]?.total_xp ?? 0
  const xpByType = (xpRows ?? [])
    .filter(r => r.event_type != null)
    .map(r => ({ type: r.event_type as string, xp: r.event_xp as number }))
  const { data: streakVal } = await supabase.rpc('current_streak_days', { p_user: uid })
  const streak = streakVal ?? 0

  // Próximas sesiones (a partir de enrollments)
  const { data: enrollments } = await supabase
    .from('enrollments')
    .select('program_id')
    .eq('user_id', uid)
  const programIds = (enrollments ?? []).map(e => e.program_id)

  let sessions: Array<{id:number; program_id:number; starts_at:string; ends_at:string}> = []
  if (programIds.length) {
    const { data } = await supabase
      .from('sessions')
      .select('id, program_id, starts_at, ends_at')
      .in('program_id', programIds)
      .gt('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(5)
    sessions = data ?? []
  }

  // Training logs recientes
  const { data: recentLogs } = await supabase
    .from('training_logs')
    .select('id, session_type, duration_min, notes, created_at')
    .eq('user_id', uid)
    .order('created_at', { ascending: false })
    .limit(5)

  // Badges del usuario
  const { data: badges } = await supabase
    .from('user_badges')
    .select('id, granted_at, badges(code, name, icon_url)')
    .eq('user_id', uid)
    .order('granted_at', { ascending: false })
    .limit(12)

  // Leaderboard top 6
  const { data: leaderboard } = await supabase.rpc('leaderboard_top', { limit_n: 6 })

  // Weekly missions (muy básico: trae user_quests + quests)
  const { data: userQuests } = await supabase
    .from('user_quests')
    .select('quest_id, progress, status, quests(title, description, xp_reward, steps)')
    .eq('user_id', uid)

  return (
    <div className="min-h-screen bg-[#262425] text-white">
      <Navigation />
      <div className="pt-16">
        <UserDashboard
          profile={{ name: profile?.full_name ?? session.user.email ?? 'Jugador/a' }}
          totalXP={totalXP}
          streak={streak}
          xpByType={xpByType}
          sessions={sessions ?? []}
          recentLogs={recentLogs ?? []}
          badges={badges ?? []}
          leaderboard={leaderboard ?? []}
          weeklyMissions={userQuests ?? []}
          uid={uid}
        />
      </div>
    </div>
  )
}
