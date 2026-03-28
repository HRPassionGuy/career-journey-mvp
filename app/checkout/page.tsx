'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

export default function CheckoutPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const supabase = createClientSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/signin?message=Please sign in to continue')
      return
    }

    // Check if they already purchased
    const { data: purchase } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .or('product_id.eq.bundle_founder,module_name.eq.bundle_founder')
      .single()

    if (purchase) {
      router.push('/dashboard')
      return
    }
    
    setCheckingAuth(false)
  }

  const handleCheckout = async () => {
    setLoading(true)

    try {
      const supabase = createClientSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        alert('Please sign in again')
        router.push('/signin')
        return
      }

      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          productId: 'bundle_founder'
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        alert(data.error || 'Error creating checkout session')
        setLoading(false)
        return
      }
      
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('No checkout URL received')
        setLoading(false)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Error processing payment')
      setLoading(false)
    }
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Unlock Full Access</h1>
          <p className="text-gray-600">Get instant access to all 5 career transformation modules</p>
        </div>

        <div className="card mb-6">
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-baseline justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Founder's Access</h2>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary-600">$147</div>
                <div className="text-sm text-gray-500">One-time payment</div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="font-semibold text-gray-900">What's Included:</h3>
            
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Emotional Intelligence Assessment</h4>
                <p className="text-sm text-gray-600">Discover your EQ strengths and growth areas</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Strengths Discovery</h4>
                <p className="text-sm text-gray-600">Uncover your unique professional advantages</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">AI-Powered Resume Builder</h4>
                <p className="text-sm text-gray-600">Transform your resume with AI analysis and job matching</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Strategic Networking Guide</h4>
                <p className="text-sm text-gray-600">Master relationship-building for career growth</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-green-600 text-sm">✓</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Inner Vue Interview Prep (1 Year Access)</h4>
                <p className="text-sm text-gray-600">Practice unlimited interviews with AI feedback</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="btn btn-primary w-full text-lg py-4"
          >
            {loading ? 'Processing...' : 'Unlock Full Access - $147'}
          </button>

          <p className="text-center text-sm text-gray-500 mt-4">
            Secure payment powered by Stripe
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
