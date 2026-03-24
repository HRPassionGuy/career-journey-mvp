import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import pdf from 'pdf-parse'

export const runtime = 'nodejs'

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  
  if (file.name.toLowerCase().endsWith('.pdf')) {
    try {
      const pdfData = await pdf(buffer)
      return pdfData.text
    } catch (err) {
      console.error('PDF parse error:', err)
      return ''
    }
  } else {
    return buffer.toString('utf-8')
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const resume = formData.get('resume') as File
    const targetTitle = formData.get('targetTitle') as string || 'Executive Leader'

    if (!resume) return NextResponse.json({ error: 'Resume required' }, { status: 400 })

    const resumeText = await extractText(resume)
    if (!resumeText) throw new Error('Could not read resume')

    const masterPrompt = `Transform this resume into IMPACT statements with bolded metrics.

RESUME:
${resumeText}

TARGET ROLE: ${targetTitle}

CRITICAL RULES:
1. Extract ACTUAL skills FROM THE RESUME (not generic HR skills)
2. WRAP ALL NUMBERS in <strong> tags: <strong>20+</strong>, <strong>$14M</strong>, <strong>70%</strong>
3. Transform weak statements to IMPACT
   Example: "Managed operations" → "Spearheaded operations for <strong>10,000+</strong> employees with <strong>$14M</strong> budget"

Return ONLY JSON:
{
  "name": "Actual name from resume",
  "location": "City, State",
  "email": "email",
  "phone": "phone",
  "current_title": "PROFESSIONAL TITLE",
  "tagline": "One powerful sentence",
  "summary": "2-3 sentences with <strong>all</strong> <strong>metrics</strong> <strong>bolded</strong>",
  "expertise": ["• Actual skill 1 from resume", "• Actual skill 2", "• Actual skill 3", "• Actual skill 4", "• Actual skill 5", "• Actual skill 6", "• Actual skill 7", "• Actual skill 8", "• Actual skill 9", "• Actual skill 10"],
  "skill_categories": ["Category 1", "Category 2", "Category 3", "Category 4"],
  "current_job": {
    "company": "Actual company",
    "location": "City, ST",
    "dates": "Year - Present",
    "title": "Actual title",
    "description": "Brief scope",
    "achievements": ["Achievement with <strong>metrics</strong>"]
  },
  "previous_jobs": [{
    "company": "Company",
    "location": "City, ST",
    "dates": "Years",
    "title": "Title",
    "achievements": ["Achievement with <strong>metrics</strong>"]
  }],
  "early_career": ["<strong>Title</strong> – Company (Years)"],
  "education": ["<strong>Degree</strong> – Institution"],
  "analysis": {"key_strengths": [], "target_roles": [], "summary": ""}
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
        messages: [{ role: 'user', content: masterPrompt }]
      })
    })

    if (!response.ok) throw new Error('AI API failed')

    const aiResult = await response.json()
    const rawText = aiResult.content[0].text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in AI response')
    
    const resumeData = JSON.parse(jsonMatch[0])

    return NextResponse.json({
      resume_data: resumeData,
      analysis: resumeData.analysis
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
