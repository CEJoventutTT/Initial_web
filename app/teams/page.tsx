import Navigation from '@/components/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Calendar, MapPin, Users, Star } from 'lucide-react'

export default function TeamsPage() {
  const teams = [
    {
      name: 'Thunder Seniors',
      division: 'Premier League',
      captain: 'Sarah Chen',
      players: [
        { name: 'Sarah Chen', position: 'Captain', rating: 2250 },
        { name: 'Mike Johnson', position: 'Vice Captain', rating: 2180 },
        { name: 'David Lee', position: 'Player', rating: 2100 },
        { name: 'Emma Wilson', position: 'Player', rating: 2050 },
        { name: 'Alex Rodriguez', position: 'Player', rating: 1980 }
      ],
      record: { wins: 12, losses: 3, draws: 1 },
      nextMatch: { opponent: 'City Champions TTC', date: '2024-02-15', venue: 'Home' }
    },
    {
      name: 'Thunder Juniors',
      division: 'Youth League',
      captain: 'Lisa Park',
      players: [
        { name: 'Tommy Chen', position: 'Captain', rating: 1850 },
        { name: 'Maya Patel', position: 'Vice Captain', rating: 1800 },
        { name: 'Jake Wilson', position: 'Player', rating: 1750 },
        { name: 'Sophie Kim', position: 'Player', rating: 1720 },
        { name: 'Ryan Martinez', position: 'Player', rating: 1680 }
      ],
      record: { wins: 8, losses: 2, draws: 2 },
      nextMatch: { opponent: 'Metro Youth TT', date: '2024-02-12', venue: 'Away' }
    },
    {
      name: 'Thunder Veterans',
      division: 'Masters League',
      captain: 'Robert Kim',
      players: [
        { name: 'Robert Kim', position: 'Captain', rating: 1950 },
        { name: 'Patricia Wong', position: 'Vice Captain', rating: 1900 },
        { name: 'James Liu', position: 'Player', rating: 1850 },
        { name: 'Maria Garcia', position: 'Player', rating: 1820 },
        { name: 'Steven Park', position: 'Player', rating: 1780 }
      ],
      record: { wins: 10, losses: 4, draws: 0 },
      nextMatch: { opponent: 'Golden Age TTC', date: '2024-02-18', venue: 'Home' }
    }
  ]

  const recentResults = [
    {
      date: '2024-01-28',
      homeTeam: 'Thunder Seniors',
      awayTeam: 'Elite Ping Pong Academy',
      homeScore: 5,
      awayScore: 2,
      venue: 'Home'
    },
    {
      date: '2024-01-25',
      homeTeam: 'Metro Youth TT',
      awayTeam: 'Thunder Juniors',
      homeScore: 2,
      awayScore: 5,
      venue: 'Away'
    },
    {
      date: '2024-01-22',
      homeTeam: 'Thunder Veterans',
      awayTeam: 'Riverside Masters',
      homeScore: 4,
      awayScore: 3,
      venue: 'Home'
    }
  ]

  const achievements = [
    {
      year: '2023',
      title: 'Premier League Champions',
      team: 'Thunder Seniors',
      description: 'Undefeated season with 15 wins'
    },
    {
      year: '2023',
      title: 'Youth League Runners-up',
      team: 'Thunder Juniors',
      description: 'Outstanding performance by our young talents'
    },
    {
      year: '2022',
      title: 'Regional Cup Winners',
      team: 'Thunder Seniors',
      description: 'Defeated 16 teams to claim the title'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="pt-16">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold text-white mb-6">Our Teams</h1>
            <p className="text-xl text-white/90 max-w-3xl mx-auto">
              Meet the talented players representing Thunder TT Club in leagues and tournaments across the region.
            </p>
          </div>
        </section>

        {/* Teams Overview */}
        <section className="py-20 bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Team Roster</h2>
              <p className="text-gray-300 text-lg">Our competitive teams across different divisions</p>
            </div>

            <div className="space-y-8">
              {teams.map((team, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-white text-2xl mb-2">{team.name}</CardTitle>
                        <p className="text-orange-400 font-semibold">{team.division}</p>
                        <p className="text-gray-400">Captain: {team.captain}</p>
                      </div>
                      <div className="mt-4 md:mt-0 text-right">
                        <div className="text-2xl font-bold text-white">
                          {team.record.wins}-{team.record.losses}-{team.record.draws}
                        </div>
                        <p className="text-gray-400 text-sm">W-L-D Record</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid lg:grid-cols-2 gap-8">
                      {/* Players */}
                      <div>
                        <h4 className="text-orange-400 font-semibold mb-4 flex items-center">
                          <Users className="mr-2 h-4 w-4" />
                          Team Roster
                        </h4>
                        <div className="space-y-3">
                          {team.players.map((player, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <img
                                  src="/placeholder.svg?height=40&width=40"
                                  alt={player.name}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div>
                                  <div className="text-white font-medium">{player.name}</div>
                                  <div className="text-gray-400 text-sm">{player.position}</div>
                                </div>
                              </div>
                              <div className="text-orange-400 font-semibold">
                                {player.rating}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Next Match */}
                      <div>
                        <h4 className="text-orange-400 font-semibold mb-4 flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Next Match
                        </h4>
                        <div className="bg-gray-700/50 rounded-lg p-6">
                          <div className="text-white font-semibold text-lg mb-2">
                            vs {team.nextMatch.opponent}
                          </div>
                          <div className="space-y-2 text-gray-300">
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4" />
                              {new Date(team.nextMatch.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="mr-2 h-4 w-4" />
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
          </div>
        </section>

        {/* Recent Results */}
        <section className="py-20 bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Results */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-8">Recent Results</h2>
                <div className="space-y-4">
                  {recentResults.map((result, index) => (
                    <Card key={index} className="bg-gray-900 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="text-sm text-gray-400 mb-2">
                              {new Date(result.date).toLocaleDateString()} • {result.venue}
                            </div>
                            <div className="text-white font-medium">
                              {result.homeTeam} vs {result.awayTeam}
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-orange-400">
                            {result.homeScore} - {result.awayScore}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Achievements */}
              <div>
                <h2 className="text-3xl font-bold text-white mb-8">Recent Achievements</h2>
                <div className="space-y-4">
                  {achievements.map((achievement, index) => (
                    <Card key={index} className="bg-gray-900 border-gray-700">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="bg-orange-500 p-3 rounded-lg">
                            <Trophy className="h-6 w-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-orange-400 font-bold">{achievement.year}</span>
                              <Star className="h-4 w-4 text-orange-400" />
                            </div>
                            <h3 className="text-white font-semibold text-lg mb-1">
                              {achievement.title}
                            </h3>
                            <p className="text-gray-400 text-sm mb-2">{achievement.team}</p>
                            <p className="text-gray-300 text-sm">{achievement.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
