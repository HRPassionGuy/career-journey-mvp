'use client'

import { useState } from 'react'
import { createClientSupabaseClient } from '@/lib/supabase'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

export default function ResumeModulePage() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<any>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      setError('')
    } else {
      setError('Please upload a PDF file')
    }
  }

  const handleUploadAndAnalyze = async () => {
    if (!file) return

    setUploading(true)
    setAnalyzing(true)
    setError('')

    try {
      const supabase = createClientSupabaseClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Convert PDF to base64
      const base64 = await fileToBase64(file)

      // Send to API for analysis
      const response = await fetch('/api/resume/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileData: base64,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Analysis failed')
      }

      setAnalysis(result.analysis)
      
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setUploading(false)
      setAnalyzing(false)
    }
  }

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        resolve(result.split(',')[1]) // Remove data:application/pdf;base64, prefix
      }
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        
        <div className="mb-8">
          <a href="/dashboard" className="text-primary-600 hover:text-primary-700">
            ← Back to Dashboard
          </a>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Resume Mastery + Professional Redo
        </h1>
        <p className="text-xl text-gray-600 mb-12">
          Get AI-powered resume analysis and optimization that beats ATS systems
        </p>

        {!analysis ? (
          <div className="card">
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-primary-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload Your Resume
              </h2>
              <p className="text-gray-600 mb-8">
                PDF format only • Maximum 5MB
              </p>

              <label className="inline-block">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <span className="btn-primary cursor-pointer inline-block">
                  Choose File
                </span>
              </label>

              {file && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg inline-block">
                  <div className="flex items-center gap-3">
                    <FileText className="w-6 h-6 text-gray-600" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleUploadAndAnalyze}
                    disabled={uploading}
                    className="btn-primary mt-4 w-full"
                  >
                    {uploading ? 'Analyzing...' : 'Analyze My Resume'}
                  </button>
                </div>
              )}

              {error && (
                <div className="mt-6 bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  {error}
                </div>
              )}

              {analyzing && (
                <div className="mt-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">
                    Analyzing your resume with AI... This takes 30-60 seconds
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Assessment */}
            <div className="card bg-primary-50 border-primary-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Overall Assessment
              </h2>
              <p className="text-gray-700 mb-4">{analysis.overall_assessment}</p>
              <div className="flex items-center gap-3">
                <div className="text-4xl font-bold text-primary-600">
                  {analysis.ats_score}/100
                </div>
                <div>
                  <div className="font-semibold text-gray-900">ATS Compatibility Score</div>
                  <div className="text-sm text-gray-600">
                    {analysis.ats_score >= 80 ? 'Excellent!' : 
                     analysis.ats_score >= 60 ? 'Good, needs improvement' : 
                     'Needs significant work'}
                  </div>
                </div>
              </div>
            </div>

            {/* Strengths */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-500" />
                What's Working
              </h2>
              <ul className="space-y-2">
                {analysis.strengths.map((strength: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-700">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvement Areas */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-amber-500" />
                Areas to Improve
              </h2>
              <ul className="space-y-2">
                {analysis.improvement_areas.map((area: string, i: number) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-amber-500 mt-1">⚠</span>
                    <span className="text-gray-700">{area}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specific Recommendations */}
            <div className="card">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Specific Recommendations
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Format Fixes:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.specific_recommendations.format.map((rec: string, i: number) => (
                      <li key={i} className="text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Content Improvements:</h3>
                  <ul className="list-disc list-inside space-y-1">
                    {analysis.specific_recommendations.content.map((rec: string, i: number) => (
                      <li key={i} className="text-gray-700">{rec}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Missing Keywords:</h3>
                  <div className="flex flex-wrap gap-2">
                    {analysis.specific_recommendations.keywords.map((keyword: string, i: number) => (
                      <span key={i} className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Rewritten Sections */}
            {analysis.rewritten_sections && (
              <div className="card bg-green-50 border-green-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  ✨ Suggested Rewrites
                </h2>
                
                {analysis.rewritten_sections.professional_summary && (
                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 mb-2">Professional Summary:</h3>
                    <p className="text-gray-700 bg-white p-4 rounded-lg">
                      {analysis.rewritten_sections.professional_summary}
                    </p>
                  </div>
                )}

                {analysis.rewritten_sections.experience_bullets && (
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">Experience Bullets:</h3>
                    <ul className="space-y-2">
                      {analysis.rewritten_sections.experience_bullets.map((bullet: string, i: number) => (
                        <li key={i} className="text-gray-700 bg-white p-3 rounded-lg">
                          • {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => {
                  setAnalysis(null)
                  setFile(null)
                }}
                className="btn-secondary"
              >
                Upload Another Resume
              </button>
              <button
                onClick={() => window.print()}
                className="btn-primary"
              >
                Download Analysis (PDF)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
