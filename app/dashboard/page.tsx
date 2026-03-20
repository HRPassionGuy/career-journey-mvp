'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

type Module = {
  name: string
  displayName: string
  description: string
  price: number
  icon: string
  isUnlocked: boolean
  isCompleted: boolean
  progressPercent: number
}

export default function DashboardPage() {
  const router = useRouter()
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const [hasPurchases, setHasPurchases] = useState(false)

  const moduleDefinitions = [
    {
      name: 'assessment',
      displayName: 'Career Breakthrough Assessment',
      description: 'Discover your breakthrough type and get your personalized roadmap',
      price: 0,
      icon: '📊',
    },
    {
      name: 'strengths',
      displayName: 'Strengths Discovery',
      description: 'Uncover your unique value proposition and leverage points',
      price: 67,
      icon: '💪',
    },
    {
      name: 'resume',
      displayName: 'Resume Mastery + Job Match',
      description: 'AI-powered resume rewrite + 12-15 targeted jobs + 5 custom variants',
      price: 197,
      icon: '📄',
    },
    {
      name: 'networking',
      displayName: 'Networking Accelerator',
      description: 'Strategic frameworks, templates, and LinkedIn optimization',
      price: 97,
      icon: '🤝',
    },
    {
      name: 'innervue',
      displayName: 'Inner Vue Interview Tool',
      description: 'Unlimited AI interview practice with personalized S.O.A.R. feedback',
      price: 147,
      icon: '🎯',
    },
  ]

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      const supabase = await createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      setUserName(profile?.full_name || 'there')

      // Get module progress
      const { data: progressData } = await supabase
        .from('module_progress')
        .select('*')
        .eq('user_id', user.id)

      // Get purchases
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)

      setHasPurchases(!!(purchaseData && purchaseData.length > 0))

      const modulesWithProgress = moduleDefinitions.map(def => {
        const progress = progressData?.find(p => p.module_name === def.name)
        const hasPurchased = purchaseData?.some(p => p.product_id === 'innervue' || p.product_id === 'bundle_intro' || p.product_id === 'bundle_regular')
        
        // Assessment and Networking are always unlocked (free)
        const isFreeModule = def.name === 'assessment' || def.name === 'networking'
        
        return {
          ...def,
          isUnlocked: isFreeModule || hasPurchased || progress?.is_unlocked || false,
          isCompleted: progress?.is_completed || false,
          progressPercent: progress?.progress_percent || 0,
        }
      })
      
      setModules(modulesWithProgress)
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModuleClick = async (module: Module) => {
    if (!module.isUnlocked && module.price > 0) {
      // Redirect to payment
      await handlePurchase(module.name)
    } else {
      // Navigate to module
      const moduleRoutes: Record<string, string> = {
        assessment: '/assessment',
        resume: '/modules/resume',
        networking: '/modules/networking',
        innervue: '/modules/inner-vue',
        strengths: '/modules/strengths',
      }
      router.push(moduleRoutes[module.name] || '/dashboard')
    }
  }

  const handlePurchase = async (moduleName: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName }),
      })

      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert('Something went wrong. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-xl text-gray-600">
            Your career transformation journey continues here
          </p>
        </div>

        {/* Bundle Offers (if nothing purchased yet) */}
        {!hasPurchases && (
          <div className="space-y-4 mb-12">
            {/* Intro Offer */}
            <div className="card bg-gradient-to-r from-green-600 to-green-700 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                    🎉 EARLY BIRD SPECIAL
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    Career Accelerator - Intro Offer
                  </h3>
                  <p className="text-white/90 mb-4">
                    Get ALL modules + 1 year Inner Vue access - Limited time only!
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold">$197</span>
                    <span className="text-white/75 line-through text-xl">$508</span>
                    <span className="bg-yellow-400 text-green-900 px-2 py-1 rounded text-sm font-semibold">
                      Save $311
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase('bundle_intro')}
                  className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition whitespace-nowrap"
                >
                  Claim Intro Offer →
                </button>
              </div>
            </div>

            {/* Regular Bundle */}
            <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex-1">
                  <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                    💎 BEST VALUE
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold mb-2">
                    Career Accelerator - Complete Bundle
                  </h3>
                  <p className="text-white/90 mb-4">
                    Everything you need to land your dream role
                  </p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-4xl font-bold">$397</span>
                    <span className="text-white/75 line-through">$508</span>
                    <span className="bg-white/20 px-2 py-1 rounded text-sm font-semibold">
                      Save $111
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handlePurchase('bundle_regular')}
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition whitespace-nowrap"
                >
                  Get Complete Bundle →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modules Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Career Journey Modules</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <div
                key={module.name}
                className={`card cursor-pointer transition hover:shadow-lg ${
                  module.isUnlocked ? 'border-primary-500 border-2' : 'opacity-75'
                }`}
                onClick={() => handleModuleClick(module)}
              >
                <div className="text-4xl mb-4">{module.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {module.displayName}
                </h3>
                <p className="text-gray-600 mb-4 text-sm">{module.description}</p>

                {/* Progress Bar */}
                {module.isUnlocked && module.progressPercent > 0 && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-primary-600">
                        {module.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full transition-all"
                        style={{ width: `${module.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <div>
                  {module.isCompleted ? (
                    <button className="btn btn-secondary w-full">
                      ✅ Completed - Review
                    </button>
                  ) : module.isUnlocked ? (
                    <button className="btn btn-primary w-full">
                      {module.progressPercent > 0 ? 'Continue' : 'Start'} →
                    </button>
                  ) : (
                    <button className="btn btn-outline w-full">
                      Unlock for ${module.price}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gray-100 rounded-xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Questions? I'm Here to Help
          </h3>
          <p className="text-gray-600 mb-4">
            Reply to any email from me or send a message to marcus@hrpassionguy.com
          </p>
          <p className="text-sm text-gray-500">
            Average response time: 24 hours
          </p>
        </div>
      </div>
    </div>
  )
}
