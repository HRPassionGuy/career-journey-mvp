import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { resumeAnalysis, targetTitle, location, salary } = await request.json()
    
    // Call Kimi API with search model
    const response = await fetch('https://api.moonshot.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.KIMI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'kimi-search', // Use the search-enabled model
        messages: [{
          role: 'system',
          content: 'You are a professional recruiter. Use web search to find REAL current job postings from LinkedIn, Indeed, company career pages, and other job platforms.'
        }, {
          role: 'user',
          content: `Search the web for 12-15 REAL current job postings that match this profile:

TARGET JOB TITLE: ${targetTitle}
LOCATION: ${location}
SALARY RANGE: ${salary}

CANDIDATE PROFILE:
${JSON.stringify(resumeAnalysis, null, 2)}

Find REAL jobs from:
- LinkedIn Jobs
- Indeed
- Official company career pages
- Other reputable job platforms

Return ONLY a JSON object (no markdown, no explanation):

{
  "jobs": [
    {
      "title": "exact job title from posting",
      "company": "company name",
      "location": "city, state or Remote",
      "posting_date": "2026-03-17",
      "match_score": 8,
      "summary": "2-3 sentences about the role requirements",
      "link": "actual application URL from the job posting"
    }
  ]
}

Match score: 1-10 (10 = best match). Include REAL application links only.`
        }],
        temperature: 0.7,
        max_tokens: 8000
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Kimi API Error:', errorData)
      return NextResponse.json({ error: 'Job search failed' }, { status: response.status })
    }

    const data = await response.json()
    let jobsText = data.choices[0].message.content.trim()
    
    console.log('Kimi Response (first 500 chars):', jobsText.substring(0, 500))
    
    // Remove markdown code blocks
    jobsText = jobsText.replace(/```json\n?|\n?```/g, '').trim()
    
    // Extract JSON
    const jsonMatch = jobsText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in Kimi response')
      throw new Error('No JSON found in response')
    }
    
    const jobsData = JSON.parse(jsonMatch[0])
    
    // Sort by match score
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
