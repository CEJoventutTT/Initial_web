import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Calendar, MapPin } from 'lucide-react'

export default function CompetitionResults() {
  const recentMatches = [
    {
      date: '2024-01-15',
      opponent: 'City Champions TTC',
      result: 'W 5-2',
      venue: 'Home',
      type: 'League Match'
    },
    {
      date: '2024-01-08',
      opponent: 'Metro Table Tennis Club',
      result: 'W 4-3',
      venue: 'Away',
      type: 'Cup Quarter-Final'
    },
    {
      date: '2024-01-01',
      opponent: 'Elite Ping Pong Academy',
      result: 'L 2-5',
      venue: 'Neutral',
      type: 'Tournament'
    },
    {
      date: '2023-12-18',
      opponent: 'Riverside TT Club',
      result: 'W 6-1',
      venue: 'Home',
      type: 'League Match'
    }
  ]

  const standings = [
    { position: 1, team: 'Thunder TT Club', played: 12, won: 10, lost: 2, points: 30 },
    { position: 2, team: 'City Champions TTC', played: 12, won: 9, lost: 3, points: 27 },
    { position: 3, team: 'Elite Ping Pong Academy', played: 12, won: 8, lost: 4, points: 24 },
    { position: 4, team: 'Metro Table Tennis Club', played: 12, won: 6, lost: 6, points: 18 },
    { position: 5, team: 'Riverside TT Club', played: 12, won: 3, lost: 9, points: 9 }
  ]

  return (
    <section id="teams" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Competition & Results</h2>
          <p className="text-gray-300 text-lg">
            Follow our teams' journey through leagues and tournaments
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Matches */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-orange-500" />
                Recent Matches
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMatches.map((match, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(match.date).toLocaleDateString()}
                        <MapPin className="ml-3 mr-1 h-3 w-3" />
                        {match.venue}
                      </div>
                      <div className="text-white font-medium">{match.opponent}</div>
                      <div className="text-xs text-orange-400">{match.type}</div>
                    </div>
                    <div className={`text-lg font-bold px-3 py-1 rounded ${
                      match.result.startsWith('W') 
                        ? 'text-green-400 bg-green-400/10' 
                        : 'text-red-400 bg-red-400/10'
                    }`}>
                      {match.result}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* League Standings */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="mr-2 h-5 w-5 text-orange-500" />
                League Standings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left text-gray-400 pb-2">Pos</th>
                      <th className="text-left text-gray-400 pb-2">Team</th>
                      <th className="text-center text-gray-400 pb-2">P</th>
                      <th className="text-center text-gray-400 pb-2">W</th>
                      <th className="text-center text-gray-400 pb-2">L</th>
                      <th className="text-center text-gray-400 pb-2">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, index) => (
                      <tr key={index} className={`border-b border-gray-800 ${
                        team.position === 1 ? 'bg-orange-500/10' : ''
                      }`}>
                        <td className="py-2 text-white font-medium">{team.position}</td>
                        <td className="py-2 text-white">{team.team}</td>
                        <td className="py-2 text-center text-gray-300">{team.played}</td>
                        <td className="py-2 text-center text-green-400">{team.won}</td>
                        <td className="py-2 text-center text-red-400">{team.lost}</td>
                        <td className="py-2 text-center text-orange-400 font-bold">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
