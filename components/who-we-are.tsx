import { Award, Heart, Target } from 'lucide-react'

export default function WhoWeAre() {
  return (
    <section id="about" className="py-20 bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">Who We Are</h2>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Founded in 1995, Thunder TT Club has been the premier destination for table tennis enthusiasts 
              in our community. We believe in fostering excellence, sportsmanship, and lifelong friendships 
              through the beautiful game of table tennis. Our experienced coaches and state-of-the-art 
              facilities provide the perfect environment for players of all skill levels to grow and thrive.
            </p>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Excellence</h3>
                <p className="text-gray-400 text-sm">Striving for the highest standards in training and competition</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Community</h3>
                <p className="text-gray-400 text-sm">Building lasting friendships and supporting each other</p>
              </div>
              
              <div className="text-center">
                <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Growth</h3>
                <p className="text-gray-400 text-sm">Continuous improvement and personal development</p>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src="/table-tennis-club.png"
              alt="Thunder TT Club team"
              className="rounded-lg shadow-2xl w-full h-auto"
            />
            <div className="absolute -bottom-6 -right-6 bg-orange-500 text-white p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold">28+</div>
              <div className="text-sm">Years of Excellence</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
