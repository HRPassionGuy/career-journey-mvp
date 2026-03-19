import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import pdf from 'pdf-parse'

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  
  if (file.name.toLowerCase().endsWith('.pdf')) {
    const pdfData = await pdf(buffer)
    return pdfData.text
  } else {
    return buffer.toString('utf-8')
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    const resume = formData.get('resume') as File
    const targetTitle = formData.get('targetTitle') as string
    const location = formData.get('location') as string
    const salary = formData.get('salary') as string
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume file is required' }, { status: 400 })
    }

    const resumeText = await extractText(resume)
    
    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json({
        error: 'Could not extract text from resume. Please ensure it is not a scanned image or password-protected.'
      }, { status: 400 })
    }

    const jobDescTexts: string[] = []
    const jobDescFiles = formData.getAll('jobDescriptions') as File[]
    
    for (const file of jobDescFiles.slice(0, 5)) {
      if (file && file.size > 0) {
        const text = await extractText(file)
        if (text) jobDescTexts.push(text)
      }
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 16000,
        messages: [{
          role: 'user',
          content: `You are an expert resume writer. Create a resume that EXACTLY matches this template format using ONLY the candidate's ACTUAL experience.

ORIGINAL RESUME - USE THIS EXACT EXPERIENCE:
${resumeText}

TARGET: ${targetTitle}
LOCATION: ${location}
SALARY: ${salary}

${jobDescTexts.length > 0 ? `JOBS TO TAILOR FOR:\n${jobDescTexts.map((t, i) => `JOB ${i + 1}:\n${t}`).join('\n')}` : ''}

TEMPLATE FORMAT:

PAGE 1:
- Navy header with name, contact (City, State • email • phone)
- Position title in rust color with tagline
- LEFT: Skills in 3 columns under "AREAS OF EXPERTISE"
- RIGHT: Summary + achievements with metrics in bold, bullets with → sub-bullets
- Navy "PROFESSIONAL EXPERIENCE" header
- Jobs: COMPANY | Location, dates | Title | bullets with metrics

PAGE 2:
- Continue jobs (last 10-15 years only)
- Navy "EDUCATION" header
- Degree | Institution | Certifications

RULES:
- Use ONLY candidate's actual experience
- Every bullet needs metrics (budget, headcount, %, results)
- Action verbs: Spearheaded, Orchestrated, Led, Drove
- Bold all numbers
- Max 2 lines per bullet
- Talk like owner, not task executor
- 2 pages max

Return JSON only:
{
  "master_resume": {"page1": "html", "page2": "html"},
  "variants": [{"job_number": 1, "job_title": "title", "company": "co", "tailoring_focus": "focus", "page1": "html", "page2": "html"}],
  "analysis": {"key_strengths": [], "areas_for_improvement": [], "recommended_keywords": [], "target_roles": [], "summary": "text"}
}

${jobDescTexts.length > 0 ? `Create ${jobDescTexts.length} variants using candidate's ACTUAL experience.` : 'Master resume only.'}`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Anthropic API Error:', errorData)
      return NextResponse.json({ error: 'Resume processing failed' }, { status: response.status })
    }

    const data = await response.json()
    const resultText = data.content[0].text
    const result = JSON.parse(resultText.replace(/```json\n?|\n?```/g, '').trim())

    return NextResponse.json(result)

  } catch (error) {
    console.error('Resume Processing Error:', error)
    return NextResponse.json({
      error: 'Resume processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
