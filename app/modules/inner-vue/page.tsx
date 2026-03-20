'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

export default function InnerVuePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    checkAccess()
  }, [])

  const checkAccess = async () => {
    const supabase = createClientSupabaseClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/sign-in')
      return
    }

    // Check if user has purchased bundle or inner_vue
    const { data: purchases } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .in('product_id', ['bundle_intro', 'bundle_regular', 'inner_vue'])
      .single()

    if (purchases) {
      setHasAccess(true)
    }
    
    setLoading(false)
  }

  const handlePurchase = () => {
    // Redirect to Stripe payment link for Inner Vue
    window.location.href = 'YOUR_STRIPE_PAYMENT_LINK_HERE'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // If user has access, show Google Form
  if (hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Inner Vue - Interview Preparation
            </h1>
            
            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8">
              <p className="text-gray-700 mb-4">
                Complete this form to receive your personalized interview preparation materials within 48 hours.
              </p>
            </div>

            <iframe 
              src="https://docs.google.com/forms/d/e/1FAIpQLSfZwXOXIqu3m3Z8_69v5lYWBSBbGfo7cLnBH4aEfkVfvGFGQQ/viewform?embedded=true"
              width="100%" 
              height="2000"
              frameBorder={0}
              marginHeight={0} 
              marginWidth={0}
              className="w-full border-0"
            >
              Loading…
            </iframe>
          </div>
        </div>
      </div>
    )
  }

  // If no access, show purchase page
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="card">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Inner Vue: Interview Mastery
          </h1>
          
          <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              Respond to Interview Questions Like a Pro
            </h2>
            <p className="text-gray-700 mb-4">
              Master the S.O.A.R. framework and ace every interview question with confidence.
            </p>
            <div className="text-3xl font-bold text-primary-600">
              $147/year
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-gray-900">What You'll Get:</h3>
            <ul className="space-y-3 text-gray-700">
              <li>✅ S.O.A.R. Framework Training</li>
              <li>✅ 50+ Practice Interview Questions</li>
              <li>✅ Personalized Response Templates</li>
              <li>✅ Video Examples & Walkthroughs</li>
              <li>✅ Annual Access to Materials</li>
            </ul>
          </div>

          <button
            onClick={handlePurchase}
            className="btn btn-primary w-full text-xl py-4"
          >
            Purchase Inner Vue - $147/year →
          </button>
        </div>
      </div>
    </div>
  )
}
