'use client'

import { useEffect, useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, CheckCircle, ChevronRight } from 'lucide-react'

interface Module {
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
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('')
  const router = useRouter()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const supabase = createClientSupabaseClient()
      
      // Get user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/')
        return
      }

      // Get profile
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
     const modulesWithProgress = moduleDefinitions.map(def => {
  const progress = progressData?.find(p => p.module_name === def.name)
  const hasPurchased = purchases?.some(p => p.module_name === def.name)
  
  // Assessment and Networking are always unlocked (free)
  const isFreeModule = def.name === 'assessment' || def.name === 'networking'
  
  return {
    ...def,
    isUnlocked: isFreeModule || hasPurchased || progress?.is_unlocked || false,
    isCompleted: progress?.is_completed || false,
    progressPercent: progress?.progress_percent || 0,
    continueUrl: def.name === 'assessment' ? '/assessment' : 
                 def.name === 'resume' ? '/modules/resume' :
                 def.name === 'networking' ? '/modules/networking' :
                 def.name === 'innervue' ? '/modules/innervue' :
                 def.name === 'strengths' ? '/modules/strengths' : '#'
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
      router.push(`/modules/${module.name}`)
    }
  }

  const handlePurchase = async (moduleName: string) => {
    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleName }),
      })

      const { url, error } = await response.json()
      
      if (error) throw new Error(error)
      if (url) window.location.href = url
      
    } catch (error: any) {
      alert(`Payment error: ${error.message}`)
    }
  }

  const calculateOverallProgress = () => {
    const completedModules = modules.filter(m => m.isCompleted).length
    return Math.round((completedModules / modules.length) * 100)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Career Journey</h1>
              <p className="text-gray-600">by the HR Passion Guy</p>
            </div>
            <button 
              onClick={async () => {
                const supabase = createClientSupabaseClient()
                await supabase.auth.signOut()
                router.push('/')
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {userName}! 👋
          </h2>
          <p className="text-gray-600 text-lg">
            You're {calculateOverallProgress()}% through your career transformation journey
          </p>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{calculateOverallProgress()}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-primary-600 to-primary-400 h-3 rounded-full transition-all"
                style={{ width: `${calculateOverallProgress()}%` }}
              />
            </div>
          </div>
        </div>

       {/* Bundle Offers (if nothing purchased yet) */}
{(!purchases || purchases.length === 0) && (
  <div className="space-y-4 mb-12">
    {/* Intro Offer */}
    <div className="card bg-gradient-to-r from-green-600 to-green-700 text-white">
      <div className="flex justify-between items-center">
        <div>
          <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-3">
            🎉 EARLY BIRD SPECIAL
          </div>
          <h3 className="text-2xl font-bold mb-2">
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
          className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          Claim Intro Offer →
        </button>
      </div>
    </div>

    {/* Regular Bundle */}
    <div className="card bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="flex justify-between items-center">
        <div>
          <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-3">
            💎 BEST VALUE
          </div>
          <h3 className="text-2xl font-bold mb-2">
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
          className="bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
        >
          Get Complete Bundle →
        </button>
      </div>
    </div>
  </div>
)}

        {/* Modules Grid */}
        <div className="space-y-6">
          {modules.map((module, index) => (
            <div
              key={module.name}
              className={`card hover:shadow-xl transition-all cursor-pointer ${
                !module.isUnlocked && module.price > 0 ? 'opacity-75' : ''
              }`}
              onClick={() => handleModuleClick(module)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start flex-1">
                  {/* Icon */}
                  <div className="text-5xl mr-6">{module.icon}</div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {module.displayName}
                      </h3>
                      {module.isCompleted && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                      {!module.isUnlocked && module.price > 0 && (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {module.description}
                    </p>

                    {/* Progress bar for unlocked modules */}
                    {module.isUnlocked && !module.isCompleted && module.progressPercent > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{module.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary-600 h-2 rounded-full"
                            style={{ width: `${module.progressPercent}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Status badges */}
                    <div className="flex items-center gap-2">
                      {module.price === 0 && (
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          FREE
                        </span>
                      )}
                      {module.price > 0 && !module.isUnlocked && (
                        <span className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold">
                          ${module.price}
                        </span>
                      )}
                      {module.isUnlocked && !module.isCompleted && (
                        <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          IN PROGRESS
                        </span>
                      )}
                      {module.isCompleted && (
                        <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                          ✓ COMPLETED
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="ml-6">
                  {!module.isUnlocked && module.price > 0 ? (
                    <button className="btn-primary flex items-center gap-2">
                      Unlock Now
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button className="btn-secondary flex items-center gap-2">
                      {module.isCompleted ? 'Review' : 'Continue'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
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
