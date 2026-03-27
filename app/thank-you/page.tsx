'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function ThankYouPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard after 5 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-primary-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="card text-center">
          <div className="text-6xl mb-6">🎉</div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Career Journey MVP!
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Your payment was successful. All modules are now unlocked!
          </p>

          <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-3">✅ You Now Have Access To:</h2>
            <ul className="space-y-2 text-gray-700">
              <li>✓ Career Breakthrough Assessment</li>
              <li>✓ Strengths Discovery</li>
              <li>✓ AI-Powered Resume + Job Matches</li>
              <li>✓ Networking Accelerator</li>
              <li>✓ Inner Vue Interview Mastery</li>
            </ul>
          </div>

          <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8 text-left">
            <h2 className="text-xl font-bold text-gray-900 mb-3">🚀 Next Steps:</h2>
            <ol className="space-y-2 text-gray-700">
              <li>1. Go to your dashboard (redirecting automatically...)</li>
              <li>2. Start with the Career Breakthrough Assessment</li>
              <li>3. Complete your Strengths Discovery</li>
              <li>4. Transform your resume and get job matches</li>
            </ol>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="btn btn-primary text-lg px-8 py-4 mb-4"
          >
            Go to Dashboard Now →
          </button>

          <p className="text-sm text-gray-600">
            Redirecting automatically in 5 seconds...
          </p>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-gray-600">
              Questions? Email me directly at{' '}
              <a href="mailto:mgrmarcus@hrpassion.com" className="text-primary-600 font-semibold hover:underline">
                mgrmarcus@hrpassion.com
              </a>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Average response time: 24 hours
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
