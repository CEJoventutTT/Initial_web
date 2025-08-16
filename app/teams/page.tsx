'use client'

import Navigation from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Calendar, Users } from 'lucide-react'
import { useTranslation } from '@/lib/i18n'

export default function TeamsPage() {
  const { t } = useTranslation()
  const tt = typeof t === 'function' ? t : ((k: string, v?: any) => k)

  // Mantengo la estructura, pero vacío (cuando tengas datos, rellena aquí).
  const teams: Array<{
    name: string
    division: string
    captain: string
    players: { name: string; position: string; rating: number }[]
    record: { wins: number; losses: number; draws: number }
    nextMatch: { opponent: string; date: string; venue: string }
  }> = []

  const recentResults: Array<{
    date: string
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    venue: string
  }> = []

  const achievements: Array<{
    year: string
    title: string
    team: string
    description: string
  }> = []

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="pt-16">
        {/* Hero */}
        <section className="relative py-20 bg-hero-gradient text-foreground">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-black mb-6">{tt('teams.title')}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto font-thin">
              {tt('teams.description')}
            </p>
          </div>
        </section>

        {/* Teams Overview */}
        <section className="py-20 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black mb-4">{tt('teams.teamRoster')}</h2>
              <p className="text-muted-foreground text-lg">
                {tt('teams.teamRosterDesc')}
              </p>
            </div>

            {teams.length === 0 ? (
              <Card className="bg-card/90 border border-border max-w-3xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-center text-2xl">
                    {tt('teams.emptyTitle')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                  {tt('teams.emptySubtitle')}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {teams.map((team, index) => (
                  <Card key={index} className="bg-card/90 border border-border">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                          <CardTitle className="text-2xl mb-2 text-foreground">{team.name}</CardTitle>
                          <p className="text-primary font-semibold">{team.division}</p>
                          <p className="text-accent/80">
                            {tt('teams.captain')}: {team.captain}
                          </p>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                          <div className="text-2xl font-bold text-foreground">
                            {team.record.wins}-{team.record.losses}-{team.record.draws}
                          </div>
                          <p className="text-muted-foreground text-sm">{tt('teams.record')}</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="grid lg:grid-cols-2 gap-8">
                        {/* Players */}
                        <div>
                          <h4 className="text-primary font-semibold mb-4 flex items-center">
                            <Users className="mr-2 h-4 w-4" />
                            {tt('teams.teamRoster')}
                          </h4>
                          <div className="space-y-3">
                            {team.players.map((player, idx) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border"
                              >
                                <div className="flex items-center space-x-3">
                                  <img
                                    src="/placeholder.svg?height=40&width=40"
                                    alt={player.name}
                                    className="w-10 h-10 rounded-full"
                                  />
                                  <div>
                                    <div className="text-foreground font-medium">{player.name}</div>
                                    <div className="text-muted-foreground text-sm">{player.position}</div>
                                  </div>
                                </div>
                                <div className="font-semibold text-accent">{player.rating}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Next Match */}
                        <div>
                          <h4 className="text-primary font-semibold mb-4 flex items-center">
                            <Calendar className="mr-2 h-4 w-4" />
                            {tt('teams.nextMatch')}
                          </h4>
                          <div className="rounded-lg p-6 bg-card border border-border">
                            <div className="text-foreground font-semibold text-lg mb-2">
                              vs {team.nextMatch.opponent}
                            </div>
                            <div className="space-y-2 text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4 text-accent" />
                                {new Date(team.nextMatch.date).toLocaleDateString()}
                              </div>
                              <div className="flex items-center">
                                <Trophy className="mr-2 h-4 w-4 text-accent" />
                                {team.nextMatch.venue}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Results & Achievements */}
        <section className="py-20 bg-muted border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
            {/* Results */}
            <div>
              <h2 className="text-3xl font-black mb-8 text-foreground">{tt('teams.recentResults')}</h2>
              {recentResults.length === 0 ? (
                <Card className="bg-card border border-border">
                  <CardContent className="p-6 text-muted-foreground">
                    {tt('teams.emptySubtitle')}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* map recentResults aquí cuando tengas datos */}
                </div>
              )}
            </div>

            {/* Achievements */}
            <div>
              <h2 className="text-3xl font-black mb-8 text-foreground">{tt('teams.recentAchievements')}</h2>
              {achievements.length === 0 ? (
                <Card className="bg-card border border-border">
                  <CardContent className="p-6 text-muted-foreground">
                    {tt('teams.emptySubtitle')}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {/* map achievements aquí cuando tengas datos */}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
