import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
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
        tools: [{
          type: "web_search_20250305",
          name: "web_search"
        }],
        messages: [{
          role: 'user',
          content: `You are a bespoke and boutique recruiter tasked with finding matching roles/jobs based on the information provided by the client.

CLIENT INFORMATION:
Target Job Title: ${targetTitle}
Location: ${location}
Salary Range: ${salary}

CANDIDATE PROFILE:
${JSON.stringify(resumeAnalysis, null, 2)}

USE WEB SEARCH to find 12-15 REAL job postings from:
- LinkedIn Jobs
- Official company career pages
- Indeed
- Other reputable job platforms

For EACH job you find, extract:
- title: Exact job title from the posting
- company: Company name
- location: City/State/Country or "Remote"
- posting_date: Date from posting (YYYY-MM-DD format)
- match_score: Integer 1-10 based on candidate fit
- summary: 2-3 sentences with key requirements
- link: ACTUAL application URL

Return ONLY valid JSON:
{"jobs":[{"title":"...","company":"...","location":"...","posting_date":"...","match_score":9,"summary":"...","link":"https://..."}]}`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Anthropic API Error:', errorData)
      return NextResponse.json({ error: 'Job search failed' }, { status: response.status })
    }

    const data = await response.json()
    
    // Extract text from all content blocks
    let jobsText = ''
    for (const block of data.content) {
      if (block.type === 'text') {
        jobsText += block.text
      }
    }
    
    // Remove markdown and extract JSON
    jobsText = jobsText.replace(/```json\n?|\n?```/g, '').trim()
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
