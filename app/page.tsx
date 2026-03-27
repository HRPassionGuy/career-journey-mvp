'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'

export default function LandingPage() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const supabase = createClientSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    setIsAuthenticated(!!user)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚀</span>
              <span className="text-xl font-bold text-gray-900">Career Journey MVP</span>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="btn btn-primary"
                >
                  Go to Dashboard →
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/signin')}
                    className="text-gray-700 hover:text-gray-900 font-medium"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => router.push('/signup')}
                    className="btn btn-primary"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block">
                <span className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold">
                  ✨ Powered by The HR Passion Guy
                </span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Land Your Dream Role in{' '}
                <span className="text-primary-600 relative">
                  30 Days*
                  <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                    <path d="M2 10C60 3 140 3 198 10" stroke="#2563eb" strokeWidth="3" strokeLinecap="round"/>
                  </svg>
                </span>
              </h1>
              
              <p className="text-2xl text-gray-900 font-semibold leading-relaxed">
                I fix your resume, give you job leads, and show you exactly what to say in interviews.
              </p>

              <p className="text-sm text-gray-600">
                Built by an HR leader who has reviewed thousands of resumes and interviews.
              </p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 py-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">100+</div>
                  <div className="text-sm text-gray-600">Success Stories</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">92%</div>
                  <div className="text-sm text-gray-600">Interview Rate</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">27 Yrs</div>
                  <div className="text-sm text-gray-600">HR Expertise</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/signup')}
                  className="btn btn-primary text-lg px-8 py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  Get Started - $147 →
                </button>
                <button
                  onClick={() => {
                    document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="btn btn-outline text-lg px-8 py-4"
                >
                  See How It Works
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 border-2 border-white"></div>
                  ))}
                </div>
                <span>Join hundreds of professionals who've transformed their careers</span>
              </div>

              {/* Disclaimer */}
              <p className="text-xs text-gray-500">
                *Average time to job offer for engaged users. Results vary based on individual effort, market conditions, and experience level.
              </p>
            </div>

            {/* Right: Visual */}
            <div className="relative hidden lg:block animate-float">
              <div className="aspect-square bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 rounded-3xl shadow-2xl transform rotate-3 hover:rotate-6 transition-transform duration-300">
                <div className="absolute inset-0 flex items-center justify-center text-white">
                  <div className="text-center p-8">
                    <div className="text-8xl mb-4">📊</div>
                    <div className="text-2xl font-bold mb-2">Your Career Dashboard</div>
                    <div className="text-primary-100">Powered by AI & 27 Years of HR Expertise</div>
                  </div>
                </div>
              </div>
              
              {/* Floating Cards */}
              <div className="absolute -top-6 -left-6 bg-white rounded-xl shadow-lg p-4 animate-bounce-slow">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">✅</span>
                  <div>
                    <div className="font-semibold text-sm">Resume Optimized</div>
                    <div className="text-xs text-gray-500">ATS Score: 95%</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-lg p-4 animate-bounce-slow" style={{animationDelay: '1s'}}>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <div className="font-semibold text-sm">15 Job Matches</div>
                    <div className="text-xs text-gray-500">90%+ Match Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 opacity-30">
          <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-0 right-1/4 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Here's What Happens Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Here's what happens when you join:
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              'Your resume is rebuilt to actually get interviews',
              'You get up to 15 real job leads based on your experience',
              'You know EXACTLY what to say in behavioral interviews',
              'You stop guessing and start getting responses'
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4 bg-gray-50 p-6 rounded-xl">
                <span className="text-green-500 text-2xl font-bold flex-shrink-0">✅</span>
                <span className="text-xl text-gray-900">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gradient-to-br from-gray-50 to-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              HOW IT WORKS
            </h2>
            <p className="text-2xl text-gray-600 font-semibold">
              Simple. Fast. Effective.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-12">
            {[
              {
                step: '1',
                title: 'Sign up and unlock access',
                description: 'Create your account and get instant access to all 5 modules for $147'
              },
              {
                step: '2',
                title: 'Complete your intake',
                description: 'Tell us about your experience and career goals'
              },
              {
                step: '3',
                title: 'Execute with confidence',
                description: 'Apply, interview, and land the offer'
              }
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-8">
                <div className="flex-shrink-0 w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-2xl shadow-lg">
                  {item.step}
                </div>
                <div className="flex-1 pt-3">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-lg text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why This Is Different Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-gray-900 mb-8 text-center">
              Why this is different
            </h2>
            
            <p className="text-xl text-gray-900 mb-8 font-semibold">
              Most people fail because they're guessing.
            </p>

            <div className="space-y-4">
              {[
                'Guessing what to put on their resume',
                'Guessing what jobs to apply for',
                'Guessing what to say in interviews'
              ].map((item, idx) => (
                <div key={idx} className="flex items-start space-x-3">
                  <span className="text-red-500 text-xl">•</span>
                  <span className="text-lg text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <p className="text-xl text-gray-900 mt-8 font-semibold">
              This system removes the guesswork and gives you a clear path to getting hired.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gradient-to-br from-gray-50 to-primary-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started Today
            </h2>
          </div>

          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-primary-500 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-6 py-2 rounded-bl-2xl font-bold">
                🔥 FOUNDER'S ACCESS
              </div>
              
              <div className="p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white">
                <h3 className="text-3xl font-bold mb-2">Full System Access</h3>
                <p className="text-primary-100">50 spots for a limited time</p>
                <div className="mt-6 flex items-baseline">
                  <span className="text-6xl font-bold">$147</span>
                </div>
              </div>

              <div className="p-8 bg-gray-50">
                <button
                  onClick={() => router.push('/signup')}
                  className="w-full btn btn-primary text-lg py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mb-4"
                >
                  👉 Start Now
                </button>
                <p className="text-center text-sm text-gray-600">
                  Only a limited number of founding spots available before price increases
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-6">
            <div className="text-2xl font-bold mb-2">Career Journey MVP</div>
            <p className="text-gray-400">Powered by The HR Passion Guy</p>
          </div>
          <div className="text-gray-400 text-sm">
            <p>
              <a href="mailto:mgrmarcus@hrpassion.com" className="hover:text-white">
                mgrmarcus@hrpassion.com
              </a>
            </p>
            <p className="mt-2">© 2026 HR Passion LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}
