'use client'

import { useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const supabase = createClientSupabaseClient()
      
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) throw error

      setMessage('Check your email for the sign-in link!')
    } catch (err: any) {
      setMessage(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back!</h1>
          <p className="text-gray-600">Sign in to continue your career journey</p>
        </div>

        <div className="card">
          <form onSubmit={handleSignIn} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input"
                placeholder="your@email.com"
              />
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${message.includes('Check') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <a href="/" className="text-primary-600 hover:text-primary-700 font-semibold">
                Start Free Assessment
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

**Once deployed, go to:**
```
https://career-journey-mvp.vercel.app/signin
