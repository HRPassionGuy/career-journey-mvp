import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { resumeAnalysis, targetTitle, location, salary } = await request.json()
    
    // Use Responses API with web_search tool
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: `You are a bespoke and boutique recruiter. Use web search to find 12-15 REAL current job postings.

TARGET JOB TITLE: ${targetTitle}
LOCATION: ${location}
SALARY RANGE: ${salary}

CANDIDATE PROFILE:
${JSON.stringify(resumeAnalysis, null, 2)}

Search LinkedIn Jobs, Indeed, company career pages, and other job platforms for REAL current openings.

Return ONLY a JSON array (no markdown, no explanation):

{
  "jobs": [
    {
      "title": "exact job title from posting",
      "company": "company name",
      "location": "city, state or Remote",
      "posting_date": "YYYY-MM-DD",
      "match_score": 8,
      "summary": "2-3 sentences about requirements",
      "link": "actual application URL"
    }
  ]
}

Match score 1-10 (10 = best match). Include REAL application links only.`
      }],
      tools: [{
        type: 'function',
        function: {
          name: 'web_search',
          description: 'Search the web for current job postings'
        }
      }]
    })

    const content = response.choices[0].message.content
    
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    console.log('OpenAI Response:', content.substring(0, 500))

    // Parse JSON from response
    let jobsText = content.trim().replace(/```json\n?|\n?```/g, '').trim()
    
    const jsonMatch = jobsText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
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
