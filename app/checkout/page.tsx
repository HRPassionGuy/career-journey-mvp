'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
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
      router.push('/signin')
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
      // Already purchased - go to dashboard
      router.push('/dashboard')
      return
    }
    
    setCheckingAuth(false)
  }

const handleCheckout = async () => {
  setLoading(true)

  try {
    const response = await fetch('/api/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'bundle_founder'
      })
    })

    const data = await response.json()
    
    if (!response.ok) {
      // Show the actual error message from the API
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 py-20">
      <div className="max-w-lg mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-primary-500 relative">
          <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-6 py-2 rounded-bl-2xl font-bold z-10">
            🔥 FOUNDER'S ACCESS
          </div>
          
          <div className="p-8 bg-gradient-to-br from-primary-600 to-primary-700 text-white mt-8">
            <h3 className="text-3xl font-bold mb-2">Full System Access</h3>
            <p className="text-primary-100">50 spots for a limited time</p>
            <div className="mt-6 flex items-baseline">
              <span className="text-6xl font-bold">$147</span>
            </div>
          </div>

          <div className="p-8 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Unlock All 5 Modules:</h3>
            {[
              'Career Breakthrough Assessment',
              'Strengths Discovery',
              'AI-Powered Resume + Job Matches',
              'Networking Accelerator',
              'Inner Vue Interview Mastery'
            ].map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <span className="text-green-500 font-bold flex-shrink-0">✓</span>
                <span className="text-gray-700">{feature}</span>
              </div>
            ))}
          </div>

          <div className="p-8 bg-gray-50">
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full btn btn-primary text-lg py-4 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all mb-4"
            >
              {loading ? 'Processing...' : '👉 Unlock Full Access - $147'}
            </button>
            <p className="text-center text-sm text-gray-600 mb-4">
              Only a limited number of founding spots available before price increases
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full text-gray-600 hover:text-gray-900 text-sm"
            >
              ← Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
