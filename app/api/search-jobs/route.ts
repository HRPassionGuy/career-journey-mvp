import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { resumeAnalysis, targetTitle, location, salary } = await request.json()
    
    // Call OpenAI (ChatGPT) with web browsing capability
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [{
          role: 'user',
          content: `You are a bespoke and boutique recruiter tasked with finding matching roles/jobs based on the information provided by the client regarding job title; location and role. Source roles from LinkedIn jobs, official company career pages and other reputable job platforms. Include only roles with verifiable postings and a real application page. Do not infer or fabricate any listings. Return 12-15 roles that meet these criteria and are actively recruiting.

TARGET JOB TITLE: ${targetTitle}
LOCATION: ${location}
SALARY RANGE: ${salary}

CANDIDATE PROFILE:
${JSON.stringify(resumeAnalysis, null, 2)}

Deliverables: Return ONLY a JSON object with this exact structure (no markdown, no explanation):

{
  "jobs": [
    {
      "title": "Exact job title",
      "company": "Company name",
      "location": "City, State or Remote",
      "posting_date": "2026-03-17",
      "match_score": 9,
      "summary": "2-3 sentences about the role",
      "link": "https://actual-application-url.com"
    }
  ]
}

Include the link to each job application and a match score for each (scale 1-10, with 10 being the closest match possible).`
        }],
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('OpenAI API Error:', errorData)
      return NextResponse.json({ error: 'Job search failed' }, { status: response.status })
    }

    const data = await response.json()
    let jobsText = data.choices[0].message.content.trim()
    
    // Log what ChatGPT returned
    console.log('ChatGPT Response:', jobsText.substring(0, 500))
    
    // Remove markdown code blocks if present
    jobsText = jobsText.replace(/```json\n?|\n?```/g, '').trim()
    
    // Extract JSON
    const jsonMatch = jobsText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No JSON found in ChatGPT response')
    }
    
    const jobsData = JSON.parse(jsonMatch[0])
    
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
