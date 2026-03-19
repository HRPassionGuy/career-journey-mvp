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
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume file is required' }, { status: 400 })
    }

    const resumeText = await extractText(resume)
    
    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json({ error: 'Could not extract text from resume.' }, { status: 400 })
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
          content: `Transform this resume into professional HTML format. Use ONLY candidate's actual experience.

RESUME:
${resumeText}

TARGET ROLE: ${targetTitle}

${jobDescTexts.length > 0 ? `JOB DESCRIPTIONS FOR VARIANTS:\n${jobDescTexts.map((t, i) => `JOB ${i+1}:\n${t}\n`).join('\n')}` : ''}

COLORS: Navy #2F5496, Rust/Orange #B24C00
FONT: Calibri

CRITICAL RULES:
1. Use candidate's ACTUAL companies, titles, dates - DO NOT INVENT
2. Current role scope: 10,000+ employees (NOT 2,200 - that was old role)
3. Transform tasks to IMPACT: "Managed operations" → "Directed <strong>$14M</strong> budget supporting <strong>10,000+</strong> employees"
4. Bold ALL numbers with <strong> tags
5. Use verbs: Spearheaded, Orchestrated, Architected, Drove, Led

STRUCTURE:
- Navy header bar with white name box, contact info
- Rust/orange title centered
- Two columns: 27% left (skills sidebar), 73% right (summary + achievements)
- Navy "PROFESSIONAL EXPERIENCE" header
- Job entries with company, dates, bullets with → sub-bullets
- Page 2: Continue jobs, navy "EDUCATION" header

Return ONLY valid JSON:
{
  "master_resume": {
    "page1": "<complete HTML page 1>",
    "page2": "<complete HTML page 2>"
  },
  "variants": [${jobDescTexts.length > 0 ? `
    {
      "job_number": 1,
      "job_title": "from job desc",
      "company": "from job desc", 
      "tailoring_focus": "how tailored",
      "page1": "<HTML>",
      "page2": "<HTML>"
    }` : ''}
  ],
  "analysis": {
    "key_strengths": ["strength 1", "strength 2", "strength 3"],
    "areas_for_improvement": ["area 1", "area 2"],
    "recommended_keywords": ["keyword1", "keyword2", "keyword3"],
    "target_roles": ["role 1", "role 2"],
    "summary": "Brief assessment"
  }
}`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API Error:', errorData)
      return NextResponse.json({ error: 'Processing failed', details: errorData }, { status: response.status })
    }

    const data = await response.json()
    const resultText = data.content[0].text
    
    // Clean the response
    let cleanText = resultText.replace(/```json\n?|\n?```/g, '').trim()
    
    // Parse JSON
    const result = JSON.parse(cleanText)
    
    // Validate structure
    if (!result.master_resume || !result.master_resume.page1 || !result.master_resume.page2) {
      console.error('Invalid response structure:', result)
      return NextResponse.json({ 
        error: 'Invalid response format',
        received: result 
      }, { status: 500 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
