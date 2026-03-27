'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

type Module = {
  name: string
  displayName: string
  description: string
  longDescription: string
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
  const [hasFullAccess, setHasFullAccess] = useState(false)
  const [allModulesComplete, setAllModulesComplete] = useState(false)

  const moduleDefinitions = [
    {
      name: 'assessment',
      displayName: 'Career Breakthrough Assessment',
      description: 'Discover your breakthrough type and get your personalized roadmap',
      longDescription: 'Take our comprehensive assessment to identify your unique career breakthrough type and receive a customized action plan tailored to your goals.',
      icon: '📊',
    },
    {
      name: 'strengths',
      displayName: 'Strengths Discovery',
      description: 'Uncover your unique value proposition and leverage points',
      longDescription: 'Deep-dive analysis of your professional strengths, skills, and unique value proposition. Learn how to position yourself as the ideal candidate.',
      icon: '💪',
    },
    {
      name: 'resume',
      displayName: 'Resume Mastery + Job Match',
      description: 'AI-powered resume rewrite + 12-15 targeted jobs + 5 custom variants',
      longDescription: 'Get your resume professionally rewritten in a proven executive format, receive 12-15 perfectly matched job opportunities, plus 5 job-specific resume variants ready to submit.',
      icon: '📄',
    },
    {
      name: 'networking',
      displayName: 'Networking Accelerator',
      description: 'Strategic frameworks, templates, and LinkedIn optimization',
      longDescription: 'Master the art of professional networking with proven templates, scripts, and LinkedIn strategies that open doors to hidden opportunities.',
      icon: '🤝',
    },
    {
      name: 'innervue',
      displayName: 'Inner Vue Interview Tool',
      description: 'Master behavioral interviews with S.O.A.R. framework',
      longDescription: 'Master any interview with AI-powered practice. Learn the S.O.A.R. framework and get personalized feedback to answer questions like a pro.',
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

      // Check if user purchased the bundle
      const { data: purchaseData } = await supabase
        .from('purchases')
        .select('*')
        .eq('user_id', user.id)
        .eq('product_id', 'bundle_founder')

      const hasPaid = !!(purchaseData && purchaseData.length > 0)
      setHasFullAccess(hasPaid)

      const { data: progressData } = await supabase
        .from('module_progress')
        .select('*')
        .eq('user_id', user.id)

      // If they paid, everything is unlocked. If not, everything is locked.
      const modulesWithProgress = moduleDefinitions.map(def => {
        const progress = progressData?.find(p => p.module_name === def.name)
        
        return {
          ...def,
          isUnlocked: hasPaid,
          isCompleted: progress?.is_completed || false,
          progressPercent: progress?.progress_percent || 0,
        }
      })
      
      setModules(modul
