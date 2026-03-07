'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

const BREAKTHROUGH_TYPES = {
  interviewer: {
    name: 'The Interviewer',
    description: 'You get interviews but struggle to convert them into offers',
    nextSteps: [
      'Master the STAR method for behavioral questions',
      'Practice with Inner Vue AI interview simulator',
      'Learn salary negotiation frameworks'
    ]
  },
  seeker: {
    name: 'The Seeker',
    description: 'You\'re unclear on your direction and need career clarity',
    nextSteps: [
      'Complete the Strengths Discovery module',
      'Map your transferable skills to target roles',
      'Create a focused 90-day career pivot plan'
    ]
  },
  networker: {
    name: 'The Networker',
    description: 'You need strategic connections to unlock opportunities',
    nextSteps: [
      'Build your LinkedIn authority in 30 days',
      'Master the warm introduction framework',
      'Join our Networking Accelerator module'
    ]
  },
  pivoter: {
    name: 'The Pivoter',
    description: 'You\'re ready for a career change but need a roadmap',
    nextSteps: [
      'Identify industries hiring your skillset',
      'Reposition your resume for career transitions',
      'Build a bridge strategy for your pivot'
    ]
  }
}

export default function AssessmentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    employmentStatus: '',
    targetRole: '',
    biggestObstacle: '',
    timeline: '',
    targetSalaryRange: '',
    coachedBefore: '',
  })

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.employmentStatus !== ''
      case 2: return formData.targetRole.trim() !== ''
      case 3: return formData.biggestObstacle !== ''
      case 4: return formData.timeline !== ''
      case 5: return formData.targetSalaryRange !== ''
      case 6: return formData.coachedBefore !== ''
      default: return false
    }
  }

  const determineBreakthroughType = () => {
    // Logic to determine breakthrough type based on answers
    if (formData.biggestObstacle === 'interviews') return 'interviewer'
    if (formData.biggestObstacle === 'direction') return 'seeker'
    if (formData.biggestObstacle === 'networking') return 'networker'
    return 'pivoter'
  }

  const handleSubmit = async () => {
    setLoading(true)
    
    try {
      const supabase = createClientSupabaseClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const breakthroughType = determineBreakthroughType()

      // Save assessment to database
      const { error } = await supabase.from('assessments').insert({
        user_id: user.id,
        employment_status: formData.employmentStatus,
        target_role: formData.targetRole,
        biggest_obstacle: formData.biggestObstacle,
        timeline: formData.timeline,
        target_salary_range: formData.targetSalaryRange,
        coached_before: formData.coachedBefore === 'yes',
        breakthrough_type: breakthroughType,
      })

      if (error) throw error

      // Unlock networking module (it's free after assessment)
      await supabase.from('module_progress').update({
        is_unlocked: true,
        unlocked_at: new Date().toISOString()
      }).eq('user_id', user.id).eq('module_name', 'networking')

      // Send assessment results email via API
      await fetch('/api/email/assessment-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          breakthroughType,
        })
      })

      // Redirect to results page
      router.push(`/assessment/results?type=${breakthroughType}`)

    } catch (error: any) {
      console.error('Assessment submission error:', error)
      alert('Failed to save assessment. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentStep} of 6
            </span>
            <span className="text-sm font-medium text-primary-600">
              {Math.round((currentStep / 6) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="card min-h-[400px] flex flex-col">
          
          {/* Question 1: Employment Status */}
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What's your current employment status?
              </h2>
              <p className="text-gray-600 mb-6">
                This helps me understand your urgency and tailor your action plan.
              </p>
              <div className="space-y-3">
                {[
                  { value: 'employed', label: 'Employed (looking for better opportunities)', emoji: '💼' },
                  { value: 'unemployed', label: 'Unemployed (actively job searching)', emoji: '🔍' },
                  { value: 'underemployed', label: 'Underemployed (working below my potential)', emoji: '📉' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateField('employmentStatus', option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      formData.employmentStatus === option.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{option.emoji}</span>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question 2: Target Role */}
          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What's your target role or career direction?
              </h2>
              <p className="text-gray-600 mb-6">
                Be as specific as possible. Examples: "Senior Marketing Manager", "Data Analyst", "Career Pivot to Tech"
              </p>
              <input
                type="text"
                value={formData.targetRole}
                onChange={(e) => updateField('targetRole', e.target.value)}
                placeholder="e.g., Senior Product Manager at a SaaS company"
                className="input text-lg"
                autoFocus
              />
              <p className="text-sm text-gray-500 mt-2">
                💡 Tip: The more specific you are, the better I can help you
              </p>
            </div>
          )}

          {/* Question 3: Biggest Obstacle */}
          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What's your biggest obstacle right now?
              </h2>
              <p className="text-gray-600 mb-6">
                This is the KEY question that determines your breakthrough type.
              </p>
              <div className="space-y-3">
                {[
                  { value: 'interviews', label: 'Not getting interviews / resume not working', emoji: '📄' },
                  { value: 'failing', label: 'Getting interviews but no offers', emoji: '💬' },
                  { value: 'direction', label: 'Unclear on my career direction', emoji: '🧭' },
                  { value: 'networking', label: 'Don\'t have the right connections', emoji: '🤝' },
                  { value: 'salary', label: 'Not sure how to negotiate salary', emoji: '💰' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateField('biggestObstacle', option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      formData.biggestObstacle === option.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{option.emoji}</span>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question 4: Timeline */}
          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                How soon do you want to make this career move?
              </h2>
              <p className="text-gray-600 mb-6">
                Your timeline affects the intensity of our strategy.
              </p>
              <div className="space-y-3">
                {[
                  { value: '0-30days', label: 'ASAP (0-30 days) - I need to move fast', emoji: '🚀' },
                  { value: '1-3months', label: '1-3 months - Actively looking', emoji: '⏱️' },
                  { value: '3-6months', label: '3-6 months - Planning ahead', emoji: '📅' },
                  { value: 'exploring', label: 'Just exploring options', emoji: '🔍' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateField('timeline', option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      formData.timeline === option.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{option.emoji}</span>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question 5: Salary Range */}
          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                What's your target salary range?
              </h2>
              <p className="text-gray-600 mb-6">
                This helps me ensure you're not undervaluing yourself.
              </p>
              <div className="space-y-3">
                {[
                  { value: 'under-50k', label: 'Under $50K' },
                  { value: '50k-75k', label: '$50K - $75K' },
                  { value: '75k-100k', label: '$75K - $100K' },
                  { value: '100k-150k', label: '$100K - $150K' },
                  { value: '150k-plus', label: '$150K+' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateField('targetSalaryRange', option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      formData.targetSalaryRange === option.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="font-medium text-gray-900">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Question 6: Coaching Experience */}
          {currentStep === 6 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Have you worked with a career coach before?
              </h2>
              <p className="text-gray-600 mb-6">
                Just curious - helps me understand your experience level.
              </p>
              <div className="space-y-3">
                {[
                  { value: 'yes', label: 'Yes, I\'ve worked with a coach', emoji: '✅' },
                  { value: 'no', label: 'No, this is my first time', emoji: '🆕' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updateField('coachedBefore', option.value)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      formData.coachedBefore === option.value
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{option.emoji}</span>
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-auto pt-8 flex justify-between">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentStep === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              ← Back
            </button>
            
            <button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className={`px-8 py-3 rounded-lg font-semibold ${
                canProceed() && !loading
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {loading ? 'Analyzing...' : currentStep === 6 ? 'See My Results →' : 'Next →'}
            </button>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🔒 Your information is secure and will never be shared
          </p>
        </div>
      </div>
    </div>
  )
}
