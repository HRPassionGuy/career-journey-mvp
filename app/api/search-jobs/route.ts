import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { resumeAnalysis, targetTitle, location, salary } = await request.json()
    
    // Call Anthropic to search for jobs and create Excel data
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
          content: `You are a job search expert. Find 12-15 relevant job opportunities.

TARGET JOB TITLE: ${targetTitle}
LOCATION: ${location}
SALARY RANGE: ${salary}

CANDIDATE PROFILE:
${JSON.stringify(resumeAnalysis, null, 2)}

TASK:
Search for 12-15 senior/executive level positions that match this profile. Focus on:
- Leadership and management roles
- Positions matching the target title or related titles
- Companies hiring in the specified location (or remote)
- Roles that align with candidate's expertise

For EACH job, provide:
1. Title - Exact job title
2. Company - Company name
3. Location - City/Country or "Remote"
4. PostingDate - Today's date in YYYY-MM-DD format
5. Summary - 2-3 sentence summary including key requirements (education, years experience, specific skills)
6. Link - Direct application URL (use realistic company career page URLs)

Return ONLY valid JSON (no markdown):
{
  "jobs": [
    {
      "title": "Senior Sales Director",
      "company": "Tech Corp",
      "location": "Remote (USA)",
      "posting_date": "2026-03-14",
      "summary": "Leads national sales strategy for enterprise software; manages team of 25+ sales professionals; requires 10+ years enterprise sales experience and proven track record of $50M+ revenue generation.",
      "link": "https://careers.techcorp.com/senior-sales-director/job"
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
    
    return NextResponse.json(jobsData)

  } catch (error) {
    console.error('Job Search API Error:', error)
    return NextResponse.json({ 
      error: 'Job search failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
