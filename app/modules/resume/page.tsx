'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientSupabaseClient } from '@/lib/supabase'

type AnalysisResult = {
  key_strengths: string[]
  areas_for_improvement: string[]
  recommended_keywords: string[]
  target_roles: string[]
  summary: string
}

export default function ResumeModulePage() {
  const router = useRouter()
  const [step, setStep] = useState<'upload' | 'analyzing' | 'analysis' | 'processing' | 'results'>('upload')
  const [loading, setLoading] = useState(false)
  const [resumeFile, setResumeFile] = useState<File | null>(null)
  const [jobDescFiles, setJobDescFiles] = useState<File[]>([])
  const [targetTitle, setTargetTitle] = useState('')
  const [location, setLocation] = useState('')
  const [salary, setSalary] = useState('')
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
  const [results, setResults] = useState<any>(null)
  const [jobs, setJobs] = useState<any>(null)

  const handleAnalyze = async () => {
    if (!resumeFile || !targetTitle || !location) {
      alert('Please upload resume and fill in all required fields')
      return
    }

    setLoading(true)
    setStep('analyzing')

    try {
      const reader = new FileReader()
      const base64File = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string
          const base64 = result.split(',')[1]
          resolve(base64)
        }
        reader.onerror = reject
        reader.readAsDataURL(resumeFile)
      })
      
      const analysisResponse = await fetch('/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: resumeFile.name,
          fileData: base64File
        })
      })

      if (!analysisResponse.ok) {
        throw new Error('Analysis failed')
      }

      const analysisData = await analysisResponse.json()
      const analysisText = analysisData.content[0].text
      const analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, '').trim())
      
      setAnalysisResult(analysis)
      setStep('analysis')
    } catch (error) {
      console.error('Error:', error)
      alert('Error analyzing resume. Please try again.')
      setStep('upload')
    } finally {
      setLoading(false)
    }
  }

  const handleRewrite = async () => {
    setLoading(true)
    setStep('processing')

    try {
      const formData = new FormData()
      formData.append('resume', resumeFile!)
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
      
      const supabase = createClientSupabaseClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: existing } = await supabase
          .from('module_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('module_name', 'resume')
          .single()

        if (existing) {
          await supabase
            .from('module_progress')
            .update({
              is_completed: true,
              progress_percent: 100,
              completed_at: new Date().toISOString(),
            })
            .eq('user_id', user.id)
            .eq('module_name', 'resume')
        } else {
          await supabase
            .from('module_progress')
            .insert({
              user_id: user.id,
              module_name: 'resume',
              is_unlocked: true,
              is_completed: true,
              progress_percent: 100,
              unlocked_at: new Date().toISOString(),
              completed_at: new Date().toISOString(),
            })
        }
      }

      setStep('results')
    } catch (error) {
      console.error('Error:', error)
      alert('Error processing resume. Please try again.')
      setStep('analysis')
    } finally {
      setLoading(false)
    }
  }

  const downloadResumePDF = async (resumeData: any, variant?: number) => {
    const page1 = variant !== undefined ? resumeData.variants[variant].page1 : resumeData.master_resume.page1
    const page2 = variant !== undefined ? resumeData.variants[variant].page2 : resumeData.master_resume.page2
    const fileName = variant !== undefined ? `resume_variant_${variant + 1}` : 'master_resume'
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${fileName}</title>
  <style>
    @page {
      size: letter;
      margin: 0.5in;
    }
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  ${page1}
  <div style="page-break-after: always;"></div>
  ${page2}
</body>
</html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.html`
    a.click()
    URL.revokeObjectURL(url)
    
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(htmlContent)
      printWindow.document.close()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  const downloadJobsExcel = () => {
  if (!jobs || !jobs.jobs) return
  
  let xlsContent = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
  <meta charset="UTF-8">
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Job Opportunities</x:Name>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
</head>
<body>
  <table border="1">
    <tr style="background-color: #1e3a8a; color: white; font-weight: bold;">
      <th>Match Score</th>
      <th>Title</th>
      <th>Company</th>
      <th>Location</th>
      <th>Posted Date</th>
      <th>Summary</th>
      <th>Application Link</th>
    </tr>
${jobs.jobs.map((job: any) => `    <tr>
      <td style="mso-number-format:'\\@';">${job.match_score}/10</td>
      <td>${job.title}</td>
      <td>${job.company}</td>
      <td>${job.location}</td>
      <td>${job.posting_date}</td>
      <td>${job.summary}</td>
      <td><a href="${job.link}" target="_blank">Apply Now</a></td>
    </tr>`).join('\n')}
  </table>
</body>
</html>`
  
  const blob = new Blob(['\ufeff' + xlsContent], { type: 'application/vnd.ms-excel;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `job_opportunities_${targetTitle.replace(/\s+/g, '_')}.xls`
  a.click()
  URL.revokeObjectURL(url)
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
                <li>✅ Professional resume analysis with recommendations</li>
                <li>✅ Resume rewritten in proven template format</li>
                <li>✅ 5 job-specific resume variants (if you provide job descriptions)</li>
                <li>✅ 12-15 targeted job matches with application links</li>
                <li>✅ Excel spreadsheet with all opportunities</li>
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
              onClick={handleAnalyze}
              disabled={loading || !resumeFile || !targetTitle || !location}
              className="btn btn-primary w-full mt-8"
            >
              Analyze My Resume →
            </button>
          </div>
        )}

        {step === 'analyzing' && (
          <div className="card text-center">
            <div className="text-6xl mb-6">🔍</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Analyzing Your Resume...</h2>
            <p className="text-xl text-gray-600 mb-8">
              Identifying strengths and opportunities for improvement...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600"></div>
            </div>
          </div>
        )}

        {step === 'analysis' && analysisResult && (
          <div className="card">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📊</div>
              <h2 className="text-4xl font-bold text-gray-900 mb-2">Resume Analysis Complete</h2>
              <p className="text-xl text-gray-600">{analysisResult.summary}</p>
            </div>

            <div className="space-y-8 mb-8">
              <div className="p-6 bg-green-50 rounded-lg border-l-4 border-green-600">
                <h3 className="text-xl font-bold text-gray-900 mb-4">✅ Key Strengths</h3>
                <ul className="space-y-2">
                  {analysisResult.key_strengths.map((strength, idx) => (
                    <li key={idx} className="text-gray-700">• {strength}</li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-yellow-50 rounded-lg border-l-4 border-yellow-600">
                <h3 className="text-xl font-bold text-gray-900 mb-4">⚡ Areas for Improvement</h3>
                <ul className="space-y-2">
                  {analysisResult.areas_for_improvement.map((area, idx) => (
                    <li key={idx} className="text-gray-700">• {area}</li>
                  ))}
                </ul>
              </div>

              <div className="p-6 bg-blue-50 rounded-lg border-l-4 border-blue-600">
                <h3 className="text-xl font-bold text-gray-900 mb-4">🎯 Recommended Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {analysisResult.recommended_keywords.map((keyword, idx) => (
                    <span key={idx} className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-6 bg-purple-50 rounded-lg border-l-4 border-purple-600">
                <h3 className="text-xl font-bold text-gray-900 mb-4">💼 Target Roles</h3>
                <ul className="space-y-2">
                  {analysisResult.target_roles.map((role, idx) => (
                    <li key={idx} className="text-gray-700">• {role}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-primary-50 border-l-4 border-primary-600 p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-3">Ready to Rewrite?</h3>
              <p className="text-gray-700">
                Based on this analysis, I'll now rewrite your resume in a professional executive format,
                incorporating these recommendations and optimizing for {targetTitle} roles.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep('upload')}
                className="btn btn-outline flex-1"
              >
                ← Back
              </button>
              <button
                onClick={handleRewrite}
                disabled={loading}
                className="btn btn-primary flex-1"
              >
                Rewrite My Resume →
              </button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="card text-center">
            <div className="text-6xl mb-6">📄</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Rewriting Your Resume...</h2>
            <p className="text-xl text-gray-600 mb-8">
              Creating professional resume and searching for opportunities...
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
                        <strong>Variant {idx + 1} - {variant.job_title} at {variant.company}</strong>
                        <br />
                        <span className="text-sm text-gray-600">{variant.tailoring_focus}</span>
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
                  setAnalysisResult(null)
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
