import { Button } from '@/components/ui/button'
import { Users, Trophy, Heart } from 'lucide-react'
import Link from 'next/link'

export default function BecomeMember() {
  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('/placeholder.svg?height=600&width=1920')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/90 to-red-600/90"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-5xl font-bold text-white mb-6">
          Ready to Join Our Family?
        </h2>
        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
          Become part of Thunder TT Club and experience the thrill of table tennis in a supportive, 
          competitive environment. Your journey to excellence starts here.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Join the Community</h3>
            <p className="text-white/80 text-sm">Connect with passionate players and lifelong friends</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Compete & Win</h3>
            <p className="text-white/80 text-sm">Participate in tournaments and achieve your goals</p>
          </div>
          
          <div className="text-center">
            <div className="bg-white/20 backdrop-blur-sm w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-white font-bold text-lg mb-2">Love the Game</h3>
            <p className="text-white/80 text-sm">Develop your passion for table tennis with expert guidance</p>
          </div>
        </div>

        <Link href="/join">
          <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-12 py-4 text-xl font-semibold">
            Become a Member Today
          </Button>
        </Link>
        
        <p className="text-white/70 text-sm mt-4">
          Special offer: First month free for new members!
        </p>
      </div>
    </section>
  )
}
