'use client'

import { useRouter } from 'next/navigation'

export default function InnerVuePage() {
  const router = useRouter()

  const handlePurchase = () => {
    // Redirect to Stan Store for payment
    window.location.href = 'https://stan.store/HRPassionGuy/p/respond-to-interview-questions-like-a-pro'
  }

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
              $147
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-bold text-gray-900">What You'll Get:</h3>
            <ul className="space-y-3 text-gray-700">
              <li>✅ S.O.A.R. Framework Training</li>
              <li>✅ 50+ Practice Interview Questions</li>
              <li>✅ Personalized Response Templates</li>
              <li>✅ Video Examples & Walkthroughs</li>
              <li>✅ Lifetime Access to Materials</li>
            </ul>
          </div>

          <button
            onClick={handlePurchase}
            className="btn btn-primary w-full text-xl py-4"
          >
            Purchase Inner Vue - $147 →
          </button>
        </div>
      </div>
    </div>
  )
}
