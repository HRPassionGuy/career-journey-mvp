'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

export default function ResumeModulePage() {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'processing' | 'results'>('upload')
  const [loading, setLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescFiles, setJobDescFiles] = useState<File[]>([])
  const [targetTitle, setTargetTitle] = useState('')
  const [location, setLocation] = useState('')
  const [salary, setSalary] = useState('')
  const [results, setResults] = useState<any>(null)
  const [jobs, setJobs] = useState<any>(null)

  const handleSubmit = async () => {
    if (!resumeFile || !targetTitle || !location) {
      alert('Please upload resume and fill in all required fields')
      return
    }

    setLoading(true)
    setStep('processing')

    try {
      // Step 1: Process resume
      const formData = new FormData()
      formData.append('resume', resumeFile)
      jobDescFiles.forEach(file => formData.append('jobDescriptions', file))
      formData.append('targetTitle', targetTitle)
      formData.append('location', location)
      formData.append('salary', salary)

      const resumeResponse = await fetch('/api/process-resume', {
        method: 'POST',
        body: formData
      })

      if (!resumeResponse.ok) {
        throw new Error('Resume processing failed')
      }

      const resumeData = await resumeResponse.json()
      
      // Step 2: Search for jobs
      const jobsResponse = await fetch('/api/search-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeAnalysis: resumeData.analysis,
          targetTitle,
          location,
          salary
        })
      })

      if (!jobsResponse.ok) {
        throw new Error('Job search failed')
      }

      const jobsData = await jobsResponse.json()
      
      setResults(resumeData)
      setJobs(jobsData)
      
      // Save completion status
      const supabase = await createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await supabase.from('module_progress').upsert({
          user_id: user.id,
          module_name: 'resume',
          is_unlocked: true,
          is_completed: true,
          progress_percent: 100,
          unlocked_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
        })
      }

      setStep('results')
    } catch (error) {
      console.error('Error:', error)
      alert('Error processing resume. Please try again.')
      setStep('upload')
    } finally {
      setLoading(false)
    }
  }

  const downloadResumePDF = async (resumeData: any, variant?: number) => {
    const page1 = variant !== undefined ? resumeData.variants[variant].page1 : resumeData.master_resume.page1
    const page2 = variant !== undefined ? resumeData.variants[variant].page2 : resumeData.master_resume.page2
    
    const content = `${page1}\n\n${page2}`
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = variant !== undefined ? `resume_variant_${variant + 1}.txt` : 'master_resume.txt'
    a.click()
  }

  const downloadJobsExcel = () => {
    if (!jobs || !jobs.jobs) return
    
    const headers = ['Title', 'Company', 'Location', 'PostingDate', 'Summary', 'Link']
    const rows = jobs.jobs.map((job: any) => [
      job.title,
      job.company,
      job.location,
      job.posting_date,
      job.summary,
      job.link
    ])
    
    const csv = [
      headers.join('\t'),
      ...rows.map((row: any[]) => row.join('\t'))
    ].join('\n')
    
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'job_opportunities.csv'
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        
        {step === 'upload' && (
          <div className="card">
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Resume Mastery + Job Match
            </h1>
            
            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-3">What You'll Receive:</h2>
              <ul className="space-y-2 text-gray-700">
                <li>✅ Professional resume rewritten in proven template format</li>
                <li>✅ 5 job-specific resume variants (if you provide job descriptions)</li>
                <li>✅ 12-15 targeted job matches with application links</li>
                <li>✅ Excel spreadsheet with all opportunities</li>
                <li>✅ Downloadable PDF resumes ready to submit</li>
              </ul>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Upload Your Resume <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Upload Job Descriptions (Optional - up to 5)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  multiple
                  onChange={(e) => setJobDescFiles(Array.from(e.target.files || []).slice(0, 5))}
                  className="input"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload up to 5 job postings to get tailored resume variants
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Target Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={targetTitle}
                  onChange={(e) => setTargetTitle(e.target.value)}
                  placeholder="e.g., Senior Sales Director"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Target Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., Remote (USA) or Detroit, MI"
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Desired Salary Range
                </label>
                <input
                  type="text"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="e.g., $150,000 - $200,000"
                  className="input"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !resumeFile || !targetTitle || !location}
              className="btn btn-primary w-full mt-8"
            >
              Process Resume & Find Jobs →
            </button>
          </div>
        )}

        {step === 'processing' && (
          <div className="card text-center">
            <div className="text-6xl mb-6">📄</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Processing Your Resume...</h2>
            <p className="text-xl text-gray-600 mb-8">
              Rewriting your resume and searching for opportunities...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
            </div>
          </div>
        )}

        {step === 'results' && results && (
          <div className="card">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">✅</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Your Resume Package is Ready!</h2>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
                Master Resume
              </h3>
              <button
                onClick={() => downloadResumePDF(results)}
                className="btn btn-primary"
              >
                📄 Download Master Resume
              </button>
            </div>

            {results.variants && results.variants.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
                  Job-Specific Resume Variants
                </h3>
                <div className="space-y-4">
                  {results.variants.map((variant: any, idx: number) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-700 mb-3">
                        <strong>Variant {idx + 1}:</strong> {variant.tailoring_focus}
                      </p>
                      <button
                        onClick={() => downloadResumePDF(results, idx)}
                        className="btn btn-outline"
                      >
                        📄 Download Variant {idx + 1}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {jobs && jobs.jobs && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-primary-600">
                  Job Opportunities ({jobs.jobs.length} matches)
                </h3>
                <button
                  onClick={downloadJobsExcel}
                  className="btn btn-primary mb-6"
                >
                  📊 Download Job List (Excel)
                </button>

                <div className="space-y-4">
                  {jobs.jobs.slice(0, 5).map((job: any, idx: number) => (
                    <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                      <h4 className="font-bold text-gray-900 mb-2">{job.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{job.company} • {job.location}</p>
                      <p className="text-gray-700 mb-3">{job.summary}</p>
                      <a 
                        href={job.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        Apply Now →
                      </a>
                    </div>
                  ))}
                  <p className="text-gray-600 text-center">
                    ...and {jobs.jobs.length - 5} more opportunities in the Excel file
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="btn btn-primary flex-1"
              >
                Return to Dashboard
              </button>
              <button
                onClick={() => {
                  setStep('upload')
                  setResumeFile(null)
                  setJobDescFiles([])
                  setResults(null)
                  setJobs(null)
                }}
                className="btn btn-outline flex-1"
              >
                Process Another Resume
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
