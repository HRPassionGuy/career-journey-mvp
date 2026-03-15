import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const resumeFile = formData.get('resume') as File
    const jobDescriptions = formData.getAll('jobDescriptions') as File[]
    const targetTitle = formData.get('targetTitle') as string
    const location = formData.get('location') as string
    const salary = formData.get('salary') as string
    
    // Convert resume to text
    const resumeText = await resumeFile.text()
    
    // Convert job descriptions to text
    const jobDescTexts = await Promise.all(
      jobDescriptions.map(async (file) => await file.text())
    )
    
    // Call Anthropic to analyze and rewrite resume
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
          content: `You are an expert resume writer following Marcus Holmes' "HR Passion Guy" methodology.

RESUME TO REWRITE:
${resumeText}

TARGET JOB TITLE: ${targetTitle}
LOCATION: ${location}
DESIRED SALARY: ${salary}

${jobDescTexts.length > 0 ? `JOB DESCRIPTIONS PROVIDED:\n${jobDescTexts.map((text, i) => `\nJob ${i + 1}:\n${text}`).join('\n')}` : ''}

TASK:
Rewrite this resume in a professional executive format (2 pages max).

Structure:
PAGE 1: Name/Contact, Areas of Expertise (25-30 keywords), Professional Summary, Key Achievements
PAGE 2: Professional Experience (detailed), Early Career, Education

Return ONLY valid JSON (no markdown):
{
  "master_resume": {
    "page1": "Full formatted text for page 1",
    "page2": "Full formatted text for page 2"
  },
  "variants": [
  {
    "job_number": 1,
    "job_title": "Exact job title extracted from uploaded job description",
    "company": "Company name from job description",
    "tailoring_focus": "How this resume is customized for this specific role",
    "page1": "Variant page 1 text",
    "page2": "Variant page 2 text"
  }
]
  "analysis": {
    "key_strengths": ["strength 1", "strength 2"],
    "target_roles": ["role 1", "role 2"],
    "recommended_keywords": ["keyword 1", "keyword 2"]
  }
}`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Anthropic API Error:', errorData)
      return NextResponse.json({ error: 'Resume analysis failed' }, { status: response.status })
    }

    const data = await response.json()
    const analysisText = data.content[0].text
    const analysis = JSON.parse(analysisText.replace(/```json\n?|\n?```/g, '').trim())
    
    return NextResponse.json(analysis)

  } catch (error) {
    console.error('Resume API Error:', error)
    return NextResponse.json({ 
      error: 'Resume processing failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
