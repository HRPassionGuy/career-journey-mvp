import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { resumeAnalysis, targetTitle, location, salary } = await request.json()
    
    // Call Anthropic to search for jobs
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 8000,
        messages: [{
          role: 'user',
          content: `You are a job search expert. Find 12-15 REAL, CURRENT job opportunities that match this candidate's profile.

TARGET JOB TITLE: ${targetTitle}
LOCATION: ${location}
SALARY RANGE: ${salary}

CANDIDATE PROFILE:
${JSON.stringify(resumeAnalysis, null, 2)}

CRITICAL REQUIREMENTS:
1. Find 12-15 real job postings (minimum 12, maximum 15)
2. Each job MUST include a match score (0-100%) based on candidate fit
3. Sort results by match score (highest match first)
4. Provide realistic company career page URLs
5. Focus on senior/executive level positions
6. Include specific requirements in summary (years experience, education, skills)

For EACH job, provide:
- title: Exact job title
- company: Company name  
- location: City/Country or "Remote"
- posting_date: Today's date (2026-03-14) in YYYY-MM-DD format
- match_score: Number 0-100 representing % match to candidate
- summary: 2-3 sentences including key requirements (education, years experience, specific skills)
- link: Direct application URL (format: https://careers.COMPANY.com/JOB-TITLE/job)

Return ONLY valid JSON (no markdown, no backticks):
{
  "jobs": [
    {
      "title": "Senior Sales Director",
      "company": "Microsoft",
      "location": "Remote (USA)",
      "posting_date": "2026-03-14",
      "match_score": 95,
      "summary": "Leads enterprise sales strategy across North America; manages $200M+ portfolio and team of 30+ sales professionals; requires 10+ years enterprise software sales experience, proven track record of exceeding $50M revenue targets, and MBA preferred.",
      "link": "https://careers.microsoft.com/senior-sales-director/job"
    }
  ]
}`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Anthropic API Error:', errorData)
      return NextResponse.json({ error: 'Job search failed' }, { status: response.status })
    }

    const data = await response.json()
    const jobsText = data.content[0].text
    const jobsData = JSON.parse(jobsText.replace(/```json\n?|\n?```/g, '').trim())
    
    // Sort by match score (highest first) - ensure it's sorted
    if (jobsData.jobs) {
      jobsData.jobs.sort((a: any, b: any) => (b.match_score || 0) - (a.match_score || 0))
    }
    
    return NextResponse.json(jobsData)

  } catch (error) {
    console.error('Job Search API Error:', error)
    return NextResponse.json({ 
      error: 'Job search failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
