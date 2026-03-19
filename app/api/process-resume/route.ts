import { NextRequest, NextResponse } from 'next/server'
import formidable from 'formidable'
import fs from 'fs/promises'
// @ts-ignore
import pdf from 'pdf-parse'

export const config = {
  api: {
    bodyParser: false,
  },
}

async function parseFormData(req: NextRequest) {
  const formData = await req.formData()
  const resume = formData.get('resume') as File
  const targetTitle = formData.get('targetTitle') as string
  const location = formData.get('location') as string
  const salary = formData.get('salary') as string
  
  const jobDescriptions: File[] = []
  let index = 0
  while (formData.has('jobDescriptions')) {
    const file = formData.get('jobDescriptions') as File
    if (file) jobDescriptions.push(file)
    index++
    if (index > 10) break
  }
  
  return { resume, targetTitle, location, salary, jobDescriptions }
}

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
    const { resume, targetTitle, location, salary, jobDescriptions } = await parseFormData(request)
    
    if (!resume) {
      return NextResponse.json({ error: 'Resume file is required' }, { status: 400 })
    }

    // Extract text from resume
    const resumeText = await extractText(resume)
    
    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json({
        error: 'Could not extract text from resume. Please ensure it is not a scanned image or password-protected.'
      }, { status: 400 })
    }

    // Extract text from job descriptions
    const jobDescTexts = await Promise.all(
      jobDescriptions.map(file => extractText(file))
    )

    // Call Anthropic API to rewrite resume
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
          content: `You are an expert resume writer. Rewrite this resume in a professional executive format optimized for ${targetTitle} roles.

ORIGINAL RESUME:
${resumeText}

TARGET ROLE: ${targetTitle}
LOCATION: ${location}
SALARY RANGE: ${salary}

${jobDescTexts.length > 0 ? `JOB DESCRIPTIONS TO TAILOR FOR:\n${jobDescTexts.map((text, i) => `\nJOB ${i + 1}:\n${text}`).join('\n')}` : ''}

FORMAT REQUIREMENTS:
- 2 pages maximum
- Executive format with navy blue headers (#1e3a8a)
- Professional sections: Contact | Summary | Areas of Expertise (3 columns) | Professional Experience | Education
- Use metrics and achievements with specific numbers
- ATS-optimized with relevant keywords for ${targetTitle}

Return ONLY valid JSON (no markdown):
{
  "master_resume": {
    "page1": "First page content with proper formatting",
    "page2": "Second page content"
  },
  "variants": [
    {
      "job_number": 1,
      "job_title": "Extract exact job title from job description 1",
      "company": "Extract company name from job description 1",
      "tailoring_focus": "How this resume is customized for this specific role",
      "page1": "Variant page 1 tailored for this job",
      "page2": "Variant page 2 tailored for this job"
    }
  ],
  "analysis": {
    "key_strengths": ["strength 1", "strength 2"],
    "areas_for_improvement": ["area 1", "area 2"],
    "recommended_keywords": ["keyword 1", "keyword 2"],
    "target_roles": ["role 1", "role 2"],
    "summary": "Brief assessment"
  }
}

${jobDescTexts.length > 0 ? `Create ${jobDescTexts.length} variants, one for each job description provided.` : 'No variants needed - only create master_resume.'}`
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
