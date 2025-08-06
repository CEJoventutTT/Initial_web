import Navigation from '@/components/navigation'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, User, ArrowLeft, Share2, Heart, MessageCircle } from 'lucide-react'
import Link from 'next/link'

// This would typically come from a CMS or database
const getArticleBySlug = (slug: string) => {
  const articles = {
    'annual-championship-2024': {
      id: 'annual-championship-2024',
      title: 'Annual Championship Tournament 2024 - Registration Now Open',
      content: `
        <p>The Thunder TT Club Annual Championship Tournament 2024 is set to be our most exciting event yet! After months of preparation, we're thrilled to announce that registration is now officially open for players of all skill levels.</p>
        
        <h2>Tournament Details</h2>
        <p>This year's championship will take place over three action-packed days from March 15-17, 2024, at our state-of-the-art facility. We're expecting over 200 participants from across the region, making this our largest tournament to date.</p>
        
        <h3>Categories and Divisions</h3>
        <ul>
          <li><strong>Junior Division (Under 18):</strong> Singles and Doubles</li>
          <li><strong>Adult Division (18-40):</strong> Singles, Doubles, and Mixed Doubles</li>
          <li><strong>Masters Division (40+):</strong> Singles and Doubles</li>
          <li><strong>Open Division:</strong> Elite level competition</li>
        </ul>
        
        <h3>Prizes and Recognition</h3>
        <p>We're proud to announce our biggest prize pool yet, with over $10,000 in cash prizes and trophies. Winners in each category will receive:</p>
        <ul>
          <li>Championship trophy and medal</li>
          <li>Cash prizes for top 3 finishers</li>
          <li>Thunder TT Club merchandise package</li>
          <li>Recognition in our hall of fame</li>
        </ul>
        
        <h3>Registration Information</h3>
        <p>Early bird registration is available until February 15th with a 20% discount. The tournament fee includes:</p>
        <ul>
          <li>Entry to all tournament matches</li>
          <li>Official tournament t-shirt</li>
          <li>Welcome reception and awards banquet</li>
          <li>Professional photography of matches</li>
        </ul>
        
        <p>Don't miss this opportunity to compete against the best players in the region and showcase your skills. Register today and be part of Thunder TT Club history!</p>
      `,
      date: '2024-02-01',
      readTime: '5 min read',
      image: '/table-tennis-championship.png',
      category: 'Tournament',
      author: 'Sarah Chen',
      authorBio: 'Tournament Director and Head Coach at Thunder TT Club'
    },
    'new-training-equipment': {
      id: 'new-training-equipment',
      title: 'State-of-the-Art Training Equipment Arrives',
      content: `
        <p>We're excited to announce the arrival of our new state-of-the-art training equipment that will revolutionize the way our members train and improve their game.</p>
        
        <h2>What's New</h2>
        <p>Our latest investment includes professional-grade robot trainers, brand new competition tables, and advanced video analysis systems that will take your training to the next level.</p>
        
        <h3>Robot Trainers</h3>
        <p>The new Butterfly Amicus Prime robot trainers offer unprecedented precision and variety in practice sessions. These machines can simulate any type of spin, speed, and placement, allowing players to practice specific techniques repeatedly.</p>
        
        <h3>Competition Tables</h3>
        <p>We've added six new ITTF-approved competition tables that meet international tournament standards. These tables provide the perfect playing surface for serious training and matches.</p>
        
        <h3>Video Analysis System</h3>
        <p>Our new high-speed camera system allows coaches to record and analyze player techniques in slow motion, providing detailed feedback for improvement.</p>
        
        <p>All equipment is now available for member use during regular training hours. Book your session today!</p>
      `,
      date: '2024-01-28',
      readTime: '3 min read',
      image: '/modern-table-tennis-facility.png',
      category: 'Facility Update',
      author: 'Mike Johnson',
      authorBio: 'Facilities Manager at Thunder TT Club'
    }
  }
  
  return articles[slug as keyof typeof articles] || null
}

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const article = getArticleBySlug(params.slug)
  
  if (!article) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navigation />
        <div className="pt-16 py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Article Not Found</h1>
            <p className="text-gray-300 mb-8">The article you're looking for doesn't exist.</p>
            <Link href="/news">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navigation />
      <div className="pt-16">
        {/* Article Header */}
        <section className="py-12 bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Link href="/news">
              <Button variant="ghost" className="text-orange-400 hover:text-orange-300 mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to News
              </Button>
            </Link>
            
            <div className="mb-6">
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                {article.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {article.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-gray-400 mb-8">
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>{article.author}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                <span>{new Date(article.date).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>{article.readTime}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Heart className="mr-2 h-4 w-4" />
                Like
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <MessageCircle className="mr-2 h-4 w-4" />
                Comment
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Image */}
        <section className="py-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <img
              src={article.image || "/placeholder.svg"}
              alt={article.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg shadow-2xl"
            />
          </div>
        </section>

        {/* Article Content */}
        <section className="py-16 bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-4 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <div 
                  className="prose prose-lg prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
                
                {/* Author Bio */}
                <div className="mt-12 p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <div className="flex items-start space-x-4">
                    <img
                      src="/placeholder.svg?height=60&width=60"
                      alt={article.author}
                      className="w-15 h-15 rounded-full"
                    />
                    <div>
                      <h3 className="text-white font-semibold text-lg mb-2">About {article.author}</h3>
                      <p className="text-gray-300">{article.authorBio}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-8">
                  {/* Share */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-white font-semibold mb-4">Share this article</h3>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                        Share on Twitter
                      </Button>
                      <Button variant="outline" size="sm" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                        Share on Facebook
                      </Button>
                      <Button variant="outline" size="sm" className="w-full border-gray-600 text-gray-300 hover:bg-gray-700">
                        Copy Link
                      </Button>
                    </div>
                  </div>

                  {/* Related Articles */}
                  <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                    <h3 className="text-white font-semibold mb-4">Related Articles</h3>
                    <div className="space-y-4">
                      <Link href="/news/youth-development-program" className="block group">
                        <div className="text-orange-400 group-hover:text-orange-300 font-medium text-sm mb-1">
                          Youth Development Program Launches
                        </div>
                        <div className="text-gray-400 text-xs">Jan 25, 2024</div>
                      </Link>
                      <Link href="/news/member-spotlight-sarah" className="block group">
                        <div className="text-orange-400 group-hover:text-orange-300 font-medium text-sm mb-1">
                          Member Spotlight: Sarah Chen
                        </div>
                        <div className="text-gray-400 text-xs">Jan 22, 2024</div>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
