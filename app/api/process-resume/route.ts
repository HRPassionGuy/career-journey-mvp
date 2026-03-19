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
        error: 'Could not extract text from resume.'
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

    const promptContent = `Create HTML resume using ONLY candidate's ACTUAL experience. Transform tasks into IMPACT with metrics.

CANDIDATE'S RESUME:
${resumeText}

TARGET: ${targetTitle}

RULES:
1. Use candidate's actual companies, dates, achievements ONLY
2. Transform bullets: "Managed operations" becomes "Directed $14M budget supporting 2,200+ employees"
3. Bold ALL numbers: <strong>$14M</strong>, <strong>2,200+</strong>, <strong>70%</strong>
4. Use verbs: Spearheaded, Orchestrated, Architected, Drove, Led, Transformed

COLORS:
- Navy headers: #1e3a8a
- Title color: #8B4513 (rust/brown)

PAGE 1 STRUCTURE:
- Navy header with name, contact
- Rust title: ${targetTitle}
- Two columns: 30% skills sidebar (navy header "AREAS OF EXPERTISE"), 70% content
- Summary with metrics from experience
- Achievement bullets with → sub-bullets
- Navy "PROFESSIONAL EXPERIENCE" header
- Job entries with metrics

PAGE 2:
- Continue jobs (last 10-15 years)
- Navy "EDUCATION & CERTIFICATIONS" header
- Degree, certifications

Return complete HTML in JSON:
{
  "master_resume": {"page1": "html", "page2": "html"},
  "variants": [{"job_number": 1, "job_title": "title", "company": "co", "tailoring_focus": "focus", "page1": "html", "page2": "html"}],
  "analysis": {"key_strengths": [], "areas_for_improvement": [], "recommended_keywords": [], "target_roles": [], "summary": "text"}
}`

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
        messages: [{ role: 'user', content: promptContent }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API Error:', errorData)
      return NextResponse.json({ error: 'Processing failed' }, { status: response.status })
    }

    const data = await response.json()
    const resultText = data.content[0].text
    const result = JSON.parse(resultText.replace(/```json\n?|\n?```/g, '').trim())

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
