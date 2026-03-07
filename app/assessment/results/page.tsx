'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'

const BREAKTHROUGH_TYPES: Record<string, any> = {
  interviewer: {
    name: 'The Interviewer',
    emoji: '🎯',
    description: 'You get interviews but struggle to convert them into offers. You know your stuff, but something gets lost in translation during the interview.',
    strengths: [
      'Your resume is strong enough to get noticed',
      'You understand your industry and can articulate your experience',
      'You\'re proactive in your job search'
    ],
    challenges: [
      'Interview answers may lack structure (STAR method)',
      'Difficulty reading interviewer cues and adapting',
      'Salary negotiation nervousness leaving money on the table'
    ],
    nextSteps: [
      'Master the STAR method for behavioral questions',
      'Practice with Inner Vue AI interview simulator ($100 - unlock below)',
      'Learn salary negotiation frameworks that HR insiders use'
    ],
    recommendedModules: ['innervue', 'strengths']
  },
  seeker: {
    name: 'The Seeker',
    emoji: '🧭',
    description: 'You\'re unclear on your direction and need career clarity. You have skills and experience, but you\'re not sure which path maximizes your potential.',
    strengths: [
      'Self-aware enough to know you need clarity',
      'Willing to invest time in strategic career planning',
      'Open to exploring different opportunities'
    ],
    challenges: [
      'Scattered job applications without clear focus',
      'Difficulty articulating your unique value proposition',
      'Imposter syndrome holding you back from pursuing stretch roles'
    ],
    nextSteps: [
      'Complete the Strengths Discovery module ($29 - unlock below)',
      'Map your transferable skills to 3 target roles',
      'Create a focused 90-day career pivot plan with clear milestones'
    ],
    recommendedModules: ['strengths', 'resume']
  },
  networker: {
    name: 'The Networker',
    emoji: '🤝',
    description: 'You need strategic connections to unlock opportunities. You know it\'s about "who you know," but you\'re not sure how to build those relationships authentically.',
    strengths: [
      'Recognize the power of professional relationships',
      'Willing to put yourself out there',
      'Understand that many jobs are filled through referrals'
    ],
    challenges: [
      'LinkedIn profile isn\'t optimized for discovery',
      'Afraid of seeming "salesy" when reaching out',
      'Don\'t have a systematic approach to relationship building'
    ],
    nextSteps: [
      'Access the Networking Accelerator module (FREE - already unlocked!)',
      'Implement the "Value-First" connection framework',
      'Build your LinkedIn authority with daily content strategy'
    ],
    recommendedModules: ['networking', 'strengths']
  },
  pivoter: {
    name: 'The Pivoter',
    emoji: '🔄',
    description: 'You\'re ready for a career change but need a roadmap. You know where you want to go, but the path from here to there isn\'t clear.',
    strengths: [
      'Clear vision of what you want (or don\'t want)',
      'Motivated to make a significant change',
      'Willing to invest in your transition'
    ],
    challenges: [
      'Resume doesn\'t translate your experience to new field',
      'Concerned about taking a step back in title or salary',
      'Uncertain which skills to emphasize for career pivot'
    ],
    nextSteps: [
      'Reposition your resume for career transitions ($150 Resume Module)',
      'Identify 5 industries actively hiring your skillset',
      'Build a 6-month bridge strategy with income protection'
    ],
    recommendedModules: ['resume', 'strengths', 'innervue']
  }
}

function ResultsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type') || 'seeker'
  const result = BREAKTHROUGH_TYPES[type]

  if (!result) {
    router.push('/assessment')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        {/* Hero Result */}
        <div className="text-center mb-12">
          <div className="inline-block bg-white rounded-full p-6 shadow-lg mb-6">
            <span className="text-6xl">{result.emoji}</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            You're {result.name}!
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {result.description}
          </p>
        </div>

        {/* Strengths */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ✨ Your Strengths
          </h2>
          <ul className="space-y-3">
            {result.strengths.map((strength: string, i: number) => (
              <li key={i} className="flex items-start">
                <svg className="w-6 h-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{strength}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Challenges */}
        <div className="card mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ⚠️ What's Holding You Back
          </h2>
          <ul className="space-y-3">
            {result.challenges.map((challenge: string, i: number) => (
              <li key={i} className="flex items-start">
                <svg className="w-6 h-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-gray-700">{challenge}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="card mb-8 bg-primary-50 border-primary-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            🚀 Your Personalized Action Plan
          </h2>
          <ol className="space-y-4">
            {result.nextSteps.map((step: string, i: number) => (
              <li key={i} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                  {i + 1}
                </div>
                <span className="text-gray-900 font-medium pt-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA - Go to Dashboard */}
        <div className="text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="btn-primary text-lg px-8 py-4"
          >
            Go to My Dashboard →
          </button>
          <p className="text-sm text-gray-600 mt-4">
            Your personalized modules are waiting for you
          </p>
        </div>

        {/* Social Proof */}
        <div className="mt-16 bg-white rounded-xl p-8 shadow-lg">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900">
              You're Not Alone
            </h3>
            <p className="text-gray-600">
              Join 500+ professionals who've transformed their careers
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">87%</div>
              <div className="text-sm text-gray-600">Land offers within 90 days</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">$28K</div>
              <div className="text-sm text-gray-600">Average salary increase</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary-600 mb-2">4.9★</div>
              <div className="text-sm text-gray-600">Client satisfaction rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResultsContent />
    </Suspense>
  )
}
