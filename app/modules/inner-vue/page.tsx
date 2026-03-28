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
      router.push('/signin')
      return
    }

    // Check if user purchased the bundle
    const { data: purchases } = await supabase
      .from('purchases')
      .select('*')
      .eq('user_id', user.id)
      .or('product_id.eq.bundle_founder,module_name.eq.bundle_founder')

    if (purchases && purchases.length > 0) {
      setHasAccess(true)
    } else {
      // No access - redirect to signup
      router.push('/signup')
      return
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  // User has access - show Google Form
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Back to Dashboard Button */}
        <button
          onClick={() => router.push('/dashboard')}
          className="mb-6 text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2 transition"
        >
          <span>←</span> Back to Dashboard
        </button>

        <div className="card">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Inner Vue - Interview Preparation
          </h1>
          
          <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8">
            <p className="text-gray-700 mb-4">
              Complete this form to receive your personalized interview preparation materials within an hour.
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
