'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

type Module = {
  name: string
  displayName: string
  description: string
  longDescription: string
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
  const [allModulesComplete, setAllModulesComplete] = useState(false)

  const moduleDefinitions = [
    {
      name: 'assessment',
      displayName: 'Career Breakthrough Assessment',
      description: 'Discover your breakthrough type and get your personalized roadmap',
      longDescription: 'Take our comprehensive assessment to identify your unique career breakthrough type and receive a customized action plan tailored to your goals.',
      price: 0,
      icon: '📊',
    },
    {
      name: 'strengths',
      displayName: 'Strengths Discovery',
      description: 'Uncover your unique value proposition and leverage points',
      longDescription: 'Deep-dive analysis of your professional strengths, skills, and unique value proposition. Learn how to position yourself as the ideal candidate.',
      price: 67,
      icon: '💪',
    },
    {
      name: 'resume',
      displayName: 'Resume Mastery + Job Match',
      description: 'AI-powered resume rewrite + 12-15 targeted jobs + 5 custom variants',
      longDescription: 'Get your resume professionally rewritten in a proven executive format, receive 12-15 perfectly matched job opportunities, plus 5 job-specific resume variants ready to submit.',
      price: 197,
      icon: '📄',
    },
    {
      name: 'networking',
      displayName: 'Networking Accelerator',
      description: 'Strategic frameworks, templates, and LinkedIn optimization',
      longDescription: 'Master the art of professional networking with proven templates, scripts, and LinkedIn strategies that open doors to hidden opportunities.',
      price: 0,
      icon: '🤝',
    },
    {
      name: 'innervue',
      displayName: 'Inner Vue Interview Tool',
      description: 'Unlimited AI interview practice with personalized S.O.A.R. feedback',
      longDescription: 'Master any interview with unlimited AI-powered practice sessions. Learn the S.O.A.R. framework and get personalized feedback to answer questions like a pro.',
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

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      setUserName(profile?.full_name || 'there')

      const { data: progressData } = await supabase
        .from('module_progress')
        .select('*')
        .eq('user_id', user.id)

      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)

      setHasPurchases(!!(purchaseData && purchaseData.length > 0))

      const modulesWithProgress = moduleDefinitions.map(def => {
        const progress = progressData?.find(p => p.module_name === def.name)
        const hasPurchased = purchaseData?.some(p => 
          p.module_name === def.name || 
          p.module_name === 'bundle_intro' || 
          p.module_name === 'bundle_regular'
        )
        
        const isFreeModule = def.name === 'assessment' || def.name === 'networking'
        
        return {
          ...def,
          isUnlocked: isFreeModule || hasPurchased || progress?.is_unlocked || false,
          isCompleted: progress?.is_completed || false,
          progressPercent: progress?.progress_percent || 0,
        }
      })
      
      setModules(modulesWithProgress)

      // Check if all modules are complete
      const allComplete = modulesWithProgress.every(m => m.isCompleted)
      setAllModulesComplete(allComplete)
      
    } catch (error) {
      console.error('Dashboard load error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleModuleClick = async (module: Module) => {
    if (!module.isUnlocked && module.price > 0) {
      await handlePurchase(module.name)
    } else {
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
    if (moduleName === 'innervue') {
      window.location.href = 'https://buy.stripe.com/test_eVq7sK8cDfe7fb1euDdfG00'
      return
    }
    
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

        {/* All Modules Complete Celebration */}
        {allModulesComplete && (
          <div className="mb-12 card bg-gradient-to-r from-green-600 to-emerald-600 text-white">
            <div className="text-center py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold mb-2">Congratulations!</h2>
              <p className="text-xl mb-4">You've completed all modules in your Career Journey!</p>
              <p className="text-green-100 mb-6">
                You're now equipped with everything you need to land your dream role. 
                Keep applying what you've learned and check back for new opportunities!
              </p>
              <button
                onClick={() => window.location.href = 'mailto:mgrmarcus@hrpassion.com?subject=Career Journey Complete!'}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
              >
                Share Your Success Story →
              </button>
            </div>
          </div>
        )}

        {/* Bundle Offer - ALWAYS SHOW */}
        <div className="mb-12">
          <div className="card bg-gradient-to-r from-green-600 to-green-700 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <div className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm font-semibold mb-3">
                  🎉 LAUNCH SPECIAL - LIMITED TIME
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-2">
                  Career Accelerator - Complete Bundle
                </h3>
                <p className="text-white/90 mb-2">
                  Get ALL modules + 1 year Inner Vue access
                </p>
                <ul className="text-white/80 text-sm space-y-1 mb-4">
                  <li>✓ Resume Mastery + 12-15 Job Matches</li>
                  <li>✓ Inner Vue Interview Tool (Annual Access)</li>
                  <li>✓ Strengths Discovery</li>
                  <li>✓ Networking Accelerator</li>
                  <li>✓ Free Career Assessment</li>
                </ul>
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
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition whitespace-nowrap shadow-lg"
              >
                Claim Launch Offer →
              </button>
            </div>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Career Journey Modules</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((module) => (
              <div
                key={module.name}
                className={`card cursor-pointer transition-all duration-300 hover:shadow-xl ${
                  module.isCompleted 
                    ? 'border-green-500 border-2 bg-green-50' 
                    : module.isUnlocked 
                    ? 'border-primary-500 border-2' 
                    : 'opacity-75 hover:opacity-100'
                }`}
                onClick={() => handleModuleClick(module)}
              >
                <div className="text-5xl mb-4">{module.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {module.displayName}
                </h3>
                <p className="text-gray-600 mb-2 text-sm">{module.description}</p>
                <p className="text-gray-500 text-xs mb-4 leading-relaxed">{module.longDescription}</p>

                {/* Progress Bar */}
                {module.isUnlocked && module.progressPercent > 0 && !module.isCompleted && (
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
                      {module.price === 0 ? 'Start Free' : `Unlock for $${module.price}`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl p-8 text-center border border-primary-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Questions? I'm Here to Help
          </h3>
          <p className="text-gray-600 mb-4">
            Email me directly at{' '}
            <a href="mailto:mgrmarcus@hrpassion.com" className="text-primary-600 font-semibold hover:underline">
              mgrmarcus@hrpassion.com
            </a>
          </p>
          <p className="text-sm text-gray-500">
            Average response time: 24 hours
          </p>
        </div>
      </div>
    </div>
  )
}
