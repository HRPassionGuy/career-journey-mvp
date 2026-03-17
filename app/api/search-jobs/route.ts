import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
     console.log('Job search API called - v2')
     try {
    const { resumeAnalysis, targetTitle, location, salary } = await request.json()
    
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
          content: `You are a bespoke and boutique recruiter tasked with finding matching roles/jobs based on the information provided by the client.

CLIENT INFORMATION:
Target Job Title: ${targetTitle}
Location: ${location}
Salary Range: ${salary}

CANDIDATE PROFILE:
${JSON.stringify(resumeAnalysis, null, 2)}

CRITICAL REQUIREMENTS:
- Source roles from LinkedIn Jobs, official company career pages, and other reputable job platforms
- Include ONLY roles with verifiable postings and a real application page
- Do NOT infer or fabricate any listings
- Return 12-15 roles that meet these criteria and are actively recruiting
- Each role must have a match score (1-10 scale, with 10 being the closest match possible)

For EACH job, provide:
- title: Exact job title from the posting
- company: Company name
- location: City/State/Country or "Remote"
- posting_date: Today's date (2026-03-17) in YYYY-MM-DD format
- match_score: Integer 1-10 (10 = closest match)
- summary: 2-3 sentences with key requirements from the actual posting
- link: Direct URL to the application page (must be real and verifiable)

YOUR RESPONSE MUST BE ONLY THE JSON OBJECT BELOW. DO NOT include any explanatory text, markdown formatting, or backticks. Start your response with the opening brace {

{
  "jobs": [
    {
      "title": "Senior Sales Director",
      "company": "Microsoft",
      "location": "Remote (USA)",
      "posting_date": "2026-03-17",
      "match_score": 9,
      "summary": "Leads enterprise sales strategy; requires 10+ years experience and proven $50M+ revenue track record.",
      "link": "https://careers.microsoft.com/us/en/job/1234567/Senior-Sales-Director"
    }
  ]
}

IMPORTANT: Jobs must be REAL current postings with REAL application links. Do not generate fake examples.`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Anthropic API Error:', errorData)
      return NextResponse.json({ error: 'Job search failed' }, { status: response.status })
    }

    const data = await response.json()
    let jobsText = data.content[0].text
    
    // Remove any markdown code blocks
    jobsText = jobsText.replace(/```json\n?|\n?```/g, '').trim()
    
    // Try to extract JSON if Claude added extra text
    const jsonMatch = jobsText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jobsText = jsonMatch[0]
    }
    
    const jobsData = JSON.parse(jobsText)
    
    // Sort by match score (highest first)
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
