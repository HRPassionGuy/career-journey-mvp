'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

type AssessmentAnswer = {
  question: string
  score: number
  category: string
}

export default function StrengthsPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'assessment' | 'wheel' | 'intentions' | 'results'>('intro')
  const [loading, setLoading] = useState(false)
  const [assessmentAnswers, setAssessmentAnswers] = useState<AssessmentAnswer[]>([])
  const [wheelData, setWheelData] = useState({
    strength1: { name: '', currentUse: 5, scope: 5 },
    strength2: { name: '', currentUse: 5, scope: 5 },
    strength3: { name: '', currentUse: 5, scope: 5 },
    strength4: { name: '', currentUse: 5, scope: 5 },
    strength5: { name: '', currentUse: 5, scope: 5 },
  })
  const [intentions, setIntentions] = useState<string[]>(['', '', '', ''])

  const eqQuestions = [
    { question: "I am aware of my emotions as I experience them", category: "Self-Awareness" },
    { question: "I can accurately identify and name my emotions", category: "Self-Awareness" },
    { question: "I understand how my emotions affect my thoughts and behavior", category: "Self-Awareness" },
    { question: "I can manage my emotions during stressful situations", category: "Self-Management" },
    { question: "I stay calm and composed when facing challenges", category: "Self-Management" },
    { question: "I can redirect my negative emotions in productive ways", category: "Self-Management" },
    { question: "I can sense and understand other people's emotions", category: "Social Awareness" },
    { question: "I pick up on emotional cues from others easily", category: "Social Awareness" },
    { question: "I understand how my actions impact other people's feelings", category: "Social Awareness" },
    { question: "I handle conflicts effectively in my relationships", category: "Relationship Management" },
    { question: "I communicate clearly and listen actively to others", category: "Relationship Management" },
    { question: "I build and maintain positive relationships easily", category: "Relationship Management" },
  ]

  const handleAssessmentSubmit = () => {
    // Calculate category scores
    const categories = ['Self-Awareness', 'Self-Management', 'Social Awareness', 'Relationship Management']
    const scores = categories.map(cat => {
      const catAnswers = assessmentAnswers.filter(a => a.category === cat)
      const avg = catAnswers.reduce((sum, a) => sum + a.score, 0) / catAnswers.length
      return { category: cat, score: Math.round(avg) }
    })
    
    setStep('wheel')
  }

  const handleWheelSubmit = () => {
    setStep('intentions')
  }

  const handleIntentionsSubmit = async () => {
    setLoading(true)
    try {
      const supabase = await createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/')
        return
      }

      // Save progress
      await supabase
        .from('module_progress')
        .upsert({
          user_id: user.id,
          module_name: 'strengths',
          is_completed: true,
          progress_percent: 100,
          updated_at: new Date().toISOString(),
        })

      setStep('results')
    } catch (error) {
      console.error('Error saving progress:', error)
      alert('Error saving progress. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getScoreInterpretation = (score: number) => {
    if (score >= 9) return { label: "A Strength to Capitalize On", color: "text-green-600", description: "This is a noteworthy strength. You are highly competent in this skill." }
    if (score >= 7) return { label: "A Strength to Build On", color: "text-blue-600", description: "Above average. With practice, you can excel in this area." }
    if (score >= 5) return { label: "With a Little Improvement, This Could Be a Strength", color: "text-yellow-600", description: "You're aware and doing well, but there's room for improvement." }
    if (score >= 3) return { label: "Something You Should Work On", color: "text-orange-600", description: "This area needs attention to improve your overall effectiveness." }
    return { label: "A Concern You Must Address", color: "text-red-600", description: "This skill area is limiting your effectiveness and needs immediate attention." }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* INTRO: David Metaphor */}
        {step === 'intro' && (
          <div className="card">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Strengths Discovery: The Metaphor of David
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <p className="text-xl text-gray-700 mb-6">
                "I saw this big piece of marble, saw David, and the only thing I needed to do was to remove the pieces that were unnecessary." - Michelangelo
              </p>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Your Journey to Authenticity</h2>
              
              <p className="text-gray-700 mb-4">
                Just as Michelangelo saw David within the marble, this module will help you discover your authentic self by:
              </p>

              <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-6">
                <h3 className="font-bold text-gray-900 mb-3">Two Essential Skills:</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700">
                  <li><strong>Removing limitations</strong> that prevent you from being your authentic self</li>
                  <li><strong>Seeing your "David"</strong> by connecting to your true strengths and values</li>
                </ol>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">What You'll Discover:</h3>
              <ul className="space-y-2 text-gray-700 mb-8">
                <li>✅ Your emotional intelligence strengths and growth areas</li>
                <li>✅ Which strengths you're underutilizing in your current role</li>
                <li>✅ Specific actions to align your daily work with your authentic self</li>
                <li>✅ Your unique path to "inside-out living"</li>
              </ul>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mb-8">
                <p className="text-gray-800 font-semibold">
                  💡 Remember: Authenticity is not just a component of well-being—it's the very core of it. Research shows that behaving authentically promotes psychological growth and fulfillment.
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep('assessment')}
              className="btn btn-primary w-full mt-8"
            >
              Begin Your Discovery →
            </button>
          </div>
        )}

        {/* ASSESSMENT: EQ Questions */}
        {step === 'assessment' && (
          <div className="card">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Emotional Intelligence Assessment
            </h2>
            <p className="text-gray-600 mb-8">
              Rate yourself honestly on each statement (1 = Never, 10 = Always)
            </p>

            <div className="space-y-8">
              {eqQuestions.map((q, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6">
                  <div className="mb-3">
                    <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">
                      {q.category}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium mb-4">{q.question}</p>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-16">Never (1)</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={assessmentAnswers[idx]?.score || 5}
                      onChange={(e) => {
                        const newAnswers = [...assessmentAnswers]
                        newAnswers[idx] = {
                          question: q.question,
                          score: parseInt(e.target.value),
                          category: q.category
                        }
                        setAssessmentAnswers(newAnswers)
                      }}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-20">Always (10)</span>
                    <span className="text-xl font-bold text-primary-600 w-12 text-right">
                      {assessmentAnswers[idx]?.score || 5}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleAssessmentSubmit}
              disabled={assessmentAnswers.length !== eqQuestions.length}
              className="btn btn-primary w-full mt-8"
            >
              Continue to Strengths Wheel →
            </button>
          </div>
        )}

        {/* WHEEL: Strengths Mapping */}
        {step === 'wheel' && (
          <div className="card">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Your Strengths Wheel
            </h2>
            <p className="text-gray-600 mb-8">
              Identify 5 of your key strengths and map their current use vs. potential
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-2">How to Use This Tool:</h3>
              <p className="text-gray-700 mb-3">
                For each strength, rate two things on a scale of 0-10:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>Current Use:</strong> How much do you use this strength now?</li>
                <li><strong>Scope for Growth:</strong> How much room is there to use it more?</li>
              </ul>
              <p className="text-gray-700 mt-3">
                💡 <strong>Big gap = Big opportunity!</strong> If scope is much higher than current use, that's your growth area.
              </p>
            </div>

            {Object.entries(wheelData).map(([key, data], idx) => (
              <div key={key} className="mb-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-bold text-gray-900 mb-4">Strength #{idx + 1}</h3>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strength Name
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setWheelData({
                      ...wheelData,
                      [key]: { ...data, name: e.target.value }
                    })}
                    placeholder="e.g., Social Intelligence, Gratitude, Leadership"
                    className="input"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Use: {data.currentUse}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.currentUse}
                    onChange={(e) => setWheelData({
                      ...wheelData,
                      [key]: { ...data, currentUse: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scope for Growth: {data.scope}/10
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.scope}
                    onChange={(e) => setWheelData({
                      ...wheelData,
                      [key]: { ...data, scope: parseInt(e.target.value) }
                    })}
                    className="w-full"
                  />
                </div>

                <div className={`p-4 rounded ${
                  data.scope - data.currentUse > 3 ? 'bg-green-50 border border-green-200' :
                  data.scope - data.currentUse < -2 ? 'bg-red-50 border border-red-200' :
                  'bg-gray-100'
                }`}>
                  {data.scope - data.currentUse > 3 && (
                    <p className="text-green-800 font-semibold">
                      🌱 Growth Opportunity: This strength has significant room for expansion!
                    </p>
                  )}
                  {data.scope - data.currentUse < -2 && (
                    <p className="text-red-800 font-semibold">
                      ⚠️ Potentially Overused: Consider if this strength is being overplayed in your context.
                    </p>
                  )}
                  {data.scope - data.currentUse >= -2 && data.scope - data.currentUse <= 3 && (
                    <p className="text-gray-700">
                      ✓ Well-utilized: This strength is being used appropriately.
                    </p>
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={handleWheelSubmit}
              className="btn btn-primary w-full mt-8"
            >
              Continue to Action Planning →
            </button>
          </div>
        )}

        {/* INTENTIONS: Action Commitments */}
        {step === 'intentions' && (
          <div className="card">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Implementation Intentions
            </h2>
            <p className="text-gray-600 mb-8">
              Turn insights into action with specific commitments
            </p>

            <div className="bg-green-50 border-l-4 border-green-600 p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-2">Make It Specific:</h3>
              <p className="text-gray-700 mb-3">
                Research shows that specific "if-then" plans dramatically increase follow-through. Be concrete about:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li><strong>When:</strong> specific day, time, or trigger</li>
                <li><strong>Where:</strong> specific location or context</li>
                <li><strong>What:</strong> specific action you'll take</li>
              </ul>
            </div>

            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  1. Based on your strengths, what will you START doing?
                </label>
                <textarea
                  value={intentions[0]}
                  onChange={(e) => {
                    const newIntentions = [...intentions]
                    newIntentions[0] = e.target.value
                    setIntentions(newIntentions)
                  }}
                  placeholder="Example: During the next week, I will use my social intelligence strength by having 3 one-on-one conversations with team members on Tuesday at 2pm in the coffee area."
                  className="input min-h-[100px]"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  2. What will you STOP doing that doesn't align with your strengths?
                </label>
                <textarea
                  value={intentions[1]}
                  onChange={(e) => {
                    const newIntentions = [...intentions]
                    newIntentions[1] = e.target.value
                    setIntentions(newIntentions)
                  }}
                  placeholder="Example: If I'm asked to lead a project that requires detail-oriented execution (not my strength), I will delegate that responsibility to someone who excels at it."
                  className="input min-h-[100px]"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  3. Who will you share your commitment with for accountability?
                </label>
                <textarea
                  value={intentions[2]}
                  onChange={(e) => {
                    const newIntentions = [...intentions]
                    newIntentions[2] = e.target.value
                    setIntentions(newIntentions)
                  }}
                  placeholder="Example: I will tell my manager about my commitment to use my leadership strength more by volunteering to lead our next team initiative."
                  className="input min-h-[100px]"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  4. How will you measure progress in 30 days?
                </label>
                <textarea
                  value={intentions[3]}
                  onChange={(e) => {
                    const newIntentions = [...intentions]
                    newIntentions[3] = e.target.value
                    setIntentions(newIntentions)
                  }}
                  placeholder="Example: I will create an 'I did that' list to track 3 examples per week where I successfully used my top strengths in challenging situations."
                  className="input min-h-[100px]"
                  rows={4}
                />
              </div>
            </div>

            <button
              onClick={handleIntentionsSubmit}
              disabled={loading || intentions.some(i => !i.trim())}
              className="btn btn-primary w-full"
            >
              {loading ? 'Saving...' : 'Complete Assessment →'}
            </button>
          </div>
        )}

        {/* RESULTS */}
        {step === 'results' && (
          <div className="card">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">
                Your Strengths Profile
              </h2>
              <p className="text-xl text-gray-600">
                You've uncovered your authentic self - now live it!
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Your EQ Strengths:</h3>
              {['Self-Awareness', 'Self-Management', 'Social Awareness', 'Relationship Management'].map(cat => {
                const catAnswers = assessmentAnswers.filter(a => a.category === cat)
                const avg = catAnswers.reduce((sum, a) => sum + a.score, 0) / catAnswers.length
                const score = Math.round(avg)
                const interpretation = getScoreInterpretation(score)

                return (
                  <div key={cat} className="mb-6 p-6 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-bold text-gray-900">{cat}</h4>
                      <span className={`text-2xl font-bold ${interpretation.color}`}>
                        {score}/10
                      </span>
                    </div>
                    <p className={`font-semibold mb-2 ${interpretation.color}`}>
                      {interpretation.label}
                    </p>
                    <p className="text-gray-700">{interpretation.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Your Growth Opportunities:</h3>
              {Object.entries(wheelData)
                .filter(([_, data]) => data.name && data.scope - data.currentUse > 2)
                .map(([key, data]) => (
                  <div key={key} className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-bold text-green-900 mb-2">{data.name}</h4>
                    <p className="text-green-800">
                      Current use: {data.currentUse}/10 | Potential: {data.scope}/10
                    </p>
                    <p className="text-green-700 mt-2">
                      Gap of {data.scope - data.currentUse} points = significant growth opportunity!
                    </p>
                  </div>
                ))}
            </div>

            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-3">Your Next Steps:</h3>
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                {intentions.filter(i => i.trim()).map((intention, idx) => (
                  <li key={idx}>{intention}</li>
                ))}
              </ol>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn btn-primary flex-1"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => window.print()}
                className="btn btn-outline flex-1"
              >
                📄 Print / Save PDF
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
