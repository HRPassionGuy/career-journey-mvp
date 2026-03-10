'use client'

import { useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClientSupabaseClient()
      
      // Sign up user
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password: Math.random().toString(36).slice(-12), // Generate random password
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/assessment`,
        },
      })

      if (signUpError) throw signUpError

      // Show success message instead of redirecting
      alert(`✅ Success! Check your email (${email}) for a confirmation link to continue to your assessment.\n\nDon't see it? Check your spam folder.`)
      
      // Clear form
      setEmail('')
      setFullName('')
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">Career Journey</h1>
          <button className="text-gray-600 hover:text-gray-900">
            Already have an account? <span className="text-primary-600">Sign In</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column - Value Prop */}
          <div>
            <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              ✨ From the HR Passion Guy - 27 Years of HR Expertise
            </div>
            
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Land Your Dream Role in 90 Days
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              Stop sending resumes into the void. Get the exact system that helped 500+ professionals land $100K+ roles, negotiate 20%+ raises, and pivot into careers they love.
            </p>

            <div className="space-y-4 mb-8">
              {[
                'AI-powered interview prep that actually works',
                'Resume optimization that beats ATS systems',
                'Proven networking strategies from an HR insider',
                'Personalized coaching from Marcus Holmes (SHRM-CP, PHR)',
              ].map((benefit, i) => (
                <div key={i} className="flex items-start">
                  <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary-600 mr-2">500+</span>
                <span>Clients Placed</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary-600 mr-2">$120K</span>
                <span>Avg. Salary</span>
              </div>
              <div className="flex items-center">
                <span className="text-2xl font-bold text-primary-600 mr-2">4.9★</span>
                <span>Rating</span>
              </div>
            </div>
          </div>

          {/* Right Column - Sign Up Form */}
          <div className="card">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Start Your Free Assessment
              </h3>
              <p className="text-gray-600">
                Discover what's blocking your career progress in 5 minutes
              </p>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="input"
                  placeholder="Marcus Holmes"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-lg"
              >
                {loading ? 'Creating Your Account...' : 'Start Free Assessment →'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                No credit card required • Takes 5 minutes • Get instant results
              </p>
            </form>

            {/* Social Proof */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-3">
                Trusted by professionals at:
              </p>
              <div className="flex justify-center items-center space-x-6 text-gray-400 text-sm font-semibold">
                <span>Google</span>
                <span>•</span>
                <span>Microsoft</span>
                <span>•</span>
                <span>Amazon</span>
                <span>•</span>
                <span>Meta</span>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Your Career Transformation Journey
          </h3>
          
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { step: 1, title: 'Free Assessment', description: 'Discover your career breakthrough type', icon: '📊' },
              { step: 2, title: 'Strengths Discovery', description: 'Unlock your unique value proposition', price: '$29', icon: '💪' },
              { step: 3, title: 'Resume Mastery', description: 'ATS-optimized resume + rewrite', price: '$150', icon: '📄' },
              { step: 4, title: 'Network Building', description: 'Strategic connection frameworks', price: 'FREE', icon: '🤝' },
              { step: 5, title: 'Interview Prep', description: 'AI-powered Inner Vue practice', price: '$100', icon: '🎯' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                  {item.icon}
                </div>
                <div className="text-primary-600 font-semibold mb-2">Step {item.step}</div>
                <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                {item.price && (
                  <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {item.price}
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-lg text-gray-600 mb-2">
              <span className="font-bold text-primary-600">Complete Bundle: $497</span> first year
            </p>
            <p className="text-sm text-gray-500">Annual renewal: $218/year</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-24 py-12 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="mb-2">© 2026 HR Passion LLC • Career Journey by Marcus Holmes</p>
          <p className="text-sm">SHRM-CP, PHR • 27 Years HR Experience • Detroit, MI</p>
        </div>
      </footer>
    </div>
  )
}
