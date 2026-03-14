'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

type EQAnswer = {
  question: string
  score: number
  category: string
}

type Strength = {
  description: string
}

export default function StrengthsEnhancedPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intro' | 'eq_assessment' | 'strengths_input' | 'analyzing' | 'results'>('intro')
  const [loading, setLoading] = useState(false)
  const [eqAnswers, setEqAnswers] = useState<EQAnswer[]>([])
  const [strengths, setStrengths] = useState<Strength[]>([
    { description: '' },
    { description: '' },
    { description: '' }
  ])
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  const eqQuestions = [
    { question: "I am aware of my emotions as I experience them", category: "Self-Awareness" },
    { question: "I can accurately identify and name my emotions", category: "Self-Awareness" },
    { question: "I understand how my emotions affect my thoughts and behavior", category: "Self-Awareness" },
    { question: "I recognize my emotional triggers before reacting", category: "Self-Awareness" },
    { question: "I can distinguish between different emotions I'm feeling", category: "Self-Awareness" },
    { question: "I am aware of my strengths and limitations", category: "Self-Awareness" },
    { question: "I notice how my mood affects my work performance", category: "Self-Awareness" },
    { question: "I can identify what causes me stress", category: "Self-Awareness" },
    { question: "I understand my values and what matters most to me", category: "Self-Awareness" },
    { question: "I am conscious of how others perceive me", category: "Self-Awareness" },
    { question: "I can manage my emotions during stressful situations", category: "Self-Management" },
    { question: "I stay calm and composed when facing challenges", category: "Self-Management" },
    { question: "I can redirect my negative emotions in productive ways", category: "Self-Management" },
    { question: "I resist impulsive reactions when upset", category: "Self-Management" },
    { question: "I maintain focus despite distractions", category: "Self-Management" },
    { question: "I adapt well to changing priorities", category: "Self-Management" },
    { question: "I follow through on commitments even when difficult", category: "Self-Management" },
    { question: "I maintain a positive attitude during setbacks", category: "Self-Management" },
    { question: "I manage my time and energy effectively", category: "Self-Management" },
    { question: "I can delay gratification to achieve long-term goals", category: "Self-Management" },
    { question: "I can sense and understand other people's emotions", category: "Social Awareness" },
    { question: "I pick up on emotional cues from others easily", category: "Social Awareness" },
    { question: "I understand how my actions impact other people's feelings", category: "Social Awareness" },
    { question: "I recognize power dynamics in group situations", category: "Social Awareness" },
    { question: "I notice when someone needs support, even if they don't ask", category: "Social Awareness" },
    { question: "I understand cultural differences in communication styles", category: "Social Awareness" },
    { question: "I can read the 'room' or mood of a group", category: "Social Awareness" },
    { question: "I empathize with perspectives different from my own", category: "Social Awareness" },
    { question: "I notice unspoken tensions in conversations", category: "Social Awareness" },
    { question: "I understand organizational politics and relationships", category: "Social Awareness" },
    { question: "I handle conflicts effectively in my relationships", category: "Relationship Management" },
    { question: "I communicate clearly and listen actively to others", category: "Relationship Management" },
    { question: "I build and maintain positive relationships easily", category: "Relationship Management" },
    { question: "I give constructive feedback without damaging relationships", category: "Relationship Management" },
    { question: "I inspire and influence others toward common goals", category: "Relationship Management" },
    { question: "I work effectively in team settings", category: "Relationship Management" },
    { question: "I help others manage their emotions during difficult times", category: "Relationship Management" },
    { question: "I navigate disagreements to reach win-win solutions", category: "Relationship Management" },
    { question: "I build trust with colleagues and stakeholders", category: "Relationship Management" },
    { question: "I develop and mentor others effectively", category: "Relationship Management" },
  ]

  const handleEQSubmit = () => {
    if (eqAnswers.length === eqQuestions.length) {
      setStep('strengths_input')
    }
  }

const handleStrengthsSubmit = async () => {
    const validStrengths = strengths.filter(s => s.description.trim().length > 0)
    
    if (validStrengths.length < 3) {
      alert('Please describe at least 3 strengths')
      return
    }

    setLoading(true)
    setStep('analyzing')

    try {
      const response = await fetch('/api/analyze-strengths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strengths: validStrengths
        })
      })

      const data = await response.json()
      const analysisText = data.content[0].text
      const analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, '').trim())
      
      setAnalysisResults(analysis)
      
      const supabase = await createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
       const { error } = await supabase.from('module_progress').upsert({
  user_id: user.id,
  module_name: 'strengths', // or 'resume'
  is_unlocked: true,
  is_completed: true,
  progress_percent: 100,
  unlocked_at: new Date().toISOString(),
  completed_at: new Date().toISOString(),
}, {
  onConflict: 'user_id,module_name',
  ignoreDuplicates: false
})

if (error) {
  console.error('Supabase save error:', error)
}
      }
      setStep('results')
    } catch (error) {
      console.error('Error:', error)
      alert('Error analyzing strengths. Please try again.')
      setStep('strengths_input')
    } finally {
      setLoading(false)
    }
  }
  const getEQScoreInterpretation = (score: number) => {
    if (score >= 9) return { label: "Exceptional Strength", color: "text-green-600", description: "You demonstrate mastery in this area." }
    if (score >= 7) return { label: "Strong Capability", color: "text-blue-600", description: "This is a solid strength." }
    if (score >= 5) return { label: "Developing Competency", color: "text-yellow-600", description: "Room for growth." }
    if (score >= 3) return { label: "Growth Opportunity", color: "text-orange-600", description: "Needs development." }
    return { label: "Priority Development Area", color: "text-red-600", description: "Needs immediate attention." }
  }

  const calculateCategoryScores = () => {
    const categories = ['Self-Awareness', 'Self-Management', 'Social Awareness', 'Relationship Management']
    return categories.map(cat => {
      const catAnswers = eqAnswers.filter(a => a && a.category === cat)
      if (catAnswers.length === 0) {
        return { category: cat, score: 0 }
      }
      const avg = catAnswers.reduce((sum, a) => sum + a.score, 0) / catAnswers.length
      return { category: cat, score: Math.round(avg * 10) / 10 }
    })
  }
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {step === 'intro' && (
          <div className="card">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Strengths Discovery: Know Yourself, Lead Better
            </h1>
            
            <div className="prose prose-lg max-w-none">
              <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mt-0 mb-4">What is Emotional Intelligence (EQ)?</h2>
                <p className="text-gray-700 mb-0">
                  Emotional Intelligence is your ability to recognize, understand, and manage your own emotions while also perceiving and influencing the emotions of others. Research shows EQ accounts for 58% of job performance and is the single biggest predictor of workplace success.
                </p>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why EQ Matters for Your Career</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-3">🎯 Performance Impact</h3>
                  <ul className="space-y-2 text-gray-700 text-base">
                    <li>• 90% of top performers have high EQ</li>
                    <li>• Leaders with high EQ drive 20% higher team performance</li>
                    <li>• EQ predicts salary increases and promotions</li>
                  </ul>
                </div>

                <div className="bg-white border border-gray-200 p-6 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-3">💼 Career Success</h3>
                  <ul className="space-y-2 text-gray-700 text-base">
                    <li>• Better conflict resolution</li>
                    <li>• Stronger stakeholder relationships</li>
                    <li>• Enhanced decision-making under pressure</li>
                  </ul>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 mb-8">
                <h3 className="font-bold text-gray-900 mb-3">The 4 Domains of Emotional Intelligence</h3>
                <ol className="space-y-3 text-gray-700">
                  <li><strong>Self-Awareness:</strong> Knowing your emotions, strengths, and values</li>
                  <li><strong>Self-Management:</strong> Controlling impulses and managing stress</li>
                  <li><strong>Social Awareness:</strong> Understanding others and dynamics</li>
                  <li><strong>Relationship Management:</strong> Building trust and inspiring others</li>
                </ol>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">What You'll Discover:</h3>
              <ul className="space-y-2 text-gray-700 mb-8">
                <li>✅ Your EQ profile across all 4 domains</li>
                <li>✅ How your strengths map to professional competencies</li>
                <li>✅ Positioning statements for interviews</li>
                <li>✅ Personalized development roadmap</li>
                <li>✅ Downloadable PDF report</li>
              </ul>
            </div>

            <button onClick={() => setStep('eq_assessment')} className="btn btn-primary w-full mt-8">
              Begin Your Assessment →
            </button>
          </div>
        )}

        {step === 'eq_assessment' && (
          <div className="card">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Emotional Intelligence Assessment</h2>
            <p className="text-gray-600 mb-2">Rate yourself honestly (1 = Never, 10 = Always)</p>
            <p className="text-sm text-gray-500 mb-8">Progress: {eqAnswers.length} of {eqQuestions.length}</p>

            <div className="space-y-8">
              {eqQuestions.map((q, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-6">
                  <div className="mb-3">
                    <span className="text-sm font-semibold text-primary-600 uppercase tracking-wide">{q.category}</span>
                  </div>
                  <p className="text-gray-900 font-medium mb-4">{idx + 1}. {q.question}</p>
                  
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-500 w-16">Never</span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={eqAnswers[idx]?.score || 5}
                      onChange={(e) => {
                        const newAnswers = [...eqAnswers]
                        newAnswers[idx] = {
                          question: q.question,
                          score: parseInt(e.target.value),
                          category: q.category
                        }
                        setEqAnswers(newAnswers)
                      }}
                      className="flex-1"
                    />
                    <span className="text-sm text-gray-500 w-16">Always</span>
                    <span className="text-xl font-bold text-primary-600 w-12 text-right">
                      {eqAnswers[idx]?.score || 5}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={handleEQSubmit}
              disabled={eqAnswers.length !== eqQuestions.length}
              className="btn btn-primary w-full mt-8"
            >
              Continue →
            </button>
          </div>
        )}

        {step === 'strengths_input' && (
          <div className="card">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Describe Your Strengths</h2>
            <p className="text-gray-600 mb-8">Describe 3-5 professional strengths in your own words.</p>

            <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
              <h3 className="font-bold text-gray-900 mb-2">Examples:</h3>
              <ul className="text-gray-700 space-y-2 text-sm">
                <li>• "I excel at breaking down complex problems into steps"</li>
                <li>• "I build relationships by listening and finding common ground"</li>
                <li>• "I stay calm under pressure and keep teams focused"</li>
              </ul>
            </div>

            <div className="space-y-6">
              {strengths.map((strength, idx) => (
                <div key={idx}>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Strength #{idx + 1} {idx < 3 && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={strength.description}
                    onChange={(e) => {
                      const newStrengths = [...strengths]
                      newStrengths[idx].description = e.target.value
                      setStrengths(newStrengths)
                    }}
                    placeholder="Describe a strength..."
                    className="input min-h-[100px]"
                    rows={4}
                  />
                </div>
              ))}

              {strengths.length < 5 && (
                <button onClick={() => setStrengths([...strengths, { description: '' }])} className="btn btn-outline">
                  + Add Another
                </button>
              )}
            </div>

            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep('eq_assessment')} className="btn btn-outline flex-1">← Back</button>
              <button
                onClick={handleStrengthsSubmit}
                disabled={loading || strengths.filter(s => s.description.trim()).length < 3}
                className="btn btn-primary flex-1"
              >
                Analyze →
              </button>
            </div>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="card text-center">
            <div className="text-6xl mb-6">🧠</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Your Strengths...</h2>
            <p className="text-xl text-gray-600 mb-8">Mapping to professional competencies...</p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
            </div>
          </div>
        )}
       {step === 'results' && analysisResults && eqAnswers.length > 0 && (
          <div className="card">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🎯</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Your Professional Profile</h2>
              <p className="text-xl text-gray-600">{analysisResults.overall_profile}</p>
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-600">
                Your Emotional Intelligence Profile
              </h3>
              
              {calculateCategoryScores().map(({ category, score }) => {
                const interpretation = getEQScoreInterpretation(score)
                const percentage = (score / 10) * 100

                return (
                  <div key={category} className="mb-8 p-6 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-bold text-gray-900">{category}</h4>
                      <span className={`text-2xl font-bold ${interpretation.color}`}>{score}/10</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div className="bg-primary-600 h-3 rounded-full" style={{ width: `${percentage}%` }}></div>
                    </div>
                    
                    <p className={`font-semibold mb-2 ${interpretation.color}`}>{interpretation.label}</p>
                    <p className="text-gray-700">{interpretation.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-600">
                Your Strengths → Professional Competencies
              </h3>
              
              {analysisResults.strengths.map((strength: any, idx: number) => (
                <div key={idx} className="mb-8 p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
                  <h4 className="font-bold text-gray-900 mb-4 text-lg">
                    Strength #{idx + 1}: {strength.original.substring(0, 100)}...
                  </h4>
                  
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">PROFESSIONAL COMPETENCIES:</p>
                    <div className="flex flex-wrap gap-2">
                      {strength.competencies.map((comp: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm">
                          {comp}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">PERFORMANCE INDICATORS:</p>
                    <div className="flex flex-wrap gap-2">
                      {strength.neurodynamic.map((neuro: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                          {neuro}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4 p-4 bg-white rounded border border-green-200">
                    <p className="text-sm font-semibold text-green-800 mb-2">💼 INTERVIEW POSITIONING:</p>
                    <p className="text-gray-800 italic">"{strength.positioning}"</p>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded border border-yellow-200">
                    <p className="text-sm font-semibold text-yellow-800 mb-2">🌱 DEVELOPMENT TIP:</p>
                    <p className="text-gray-800">{strength.development_tip}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-3 border-b-2 border-primary-600">
                Priority Development Area
              </h3>
              <div className="p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border-l-4 border-orange-600">
                <p className="text-lg text-gray-800 font-medium">{analysisResults.top_growth_area}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => router.push('/dashboard')} className="btn btn-primary flex-1">
                Return to Dashboard
              </button>
              <button onClick={() => window.print()} className="btn btn-outline flex-1">
                📄 Print / Save PDF
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
