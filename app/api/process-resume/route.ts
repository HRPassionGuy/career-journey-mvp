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
          content: `You are an expert resume writer. Create complete HTML pages that match this exact template format using ONLY the candidate's real experience.

CANDIDATE'S ACTUAL RESUME (DO NOT MAKE UP ANYTHING):
${resumeText}

TARGET ROLE: ${targetTitle}
LOCATION: ${location}
SALARY: ${salary}

${jobDescTexts.length > 0 ? `JOB DESCRIPTIONS:\n${jobDescTexts.map((t, i) => `JOB ${i + 1}:\n${t}`).join('\n')}` : ''}

CRITICAL RULES:
1. Use ONLY the candidate's actual companies, dates, and achievements from the resume above
2. DO NOT invent any experience, companies, or achievements
3. Return complete HTML with inline CSS for each page
4. Each page should be a complete standalone HTML document

HTML TEMPLATE STRUCTURE:

PAGE 1 HTML:
<div style="font-family: Arial, sans-serif; max-width: 8.5in; margin: 0 auto;">
  <!-- Navy header bar -->
  <div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
    <h1 style="margin: 0; font-size: 24pt; letter-spacing: 2px;">CANDIDATE NAME</h1>
    <p style="margin: 5px 0 0 0; font-size: 11pt;">City, State • email@email.com • (555) 555-5555</p>
  </div>
  
  <!-- Position title -->
  <div style="text-align: center; margin: 15px 0;">
    <h2 style="color: #8B4513; font-size: 18pt; margin: 0;">${targetTitle}</h2>
    <p style="font-style: italic; margin: 5px 0; font-size: 10pt;">Driving results through [key value proposition]</p>
  </div>
  
  <!-- Two-column layout -->
  <div style="display: table; width: 100%; margin-top: 20px;">
    <!-- Left sidebar - Skills -->
    <div style="display: table-cell; width: 30%; vertical-align: top; padding-right: 15px;">
      <div style="background-color: #1e3a8a; color: white; padding: 8px; font-weight: bold; font-size: 11pt;">
        AREAS OF EXPERTISE
      </div>
      <div style="font-size: 9pt; line-height: 1.4; margin-top: 10px;">
        • Strategic HR Leadership<br>
        • Talent Acquisition<br>
        • Budget Management<br>
        • Labor Relations<br>
        • Performance Management<br>
        [Continue with relevant skills]
      </div>
    </div>
    
    <!-- Right main content -->
    <div style="display: table-cell; width: 70%; vertical-align: top;">
      <!-- Professional summary -->
      <p style="font-style: italic; font-size: 10pt; line-height: 1.5; margin: 0 0 15px 0;">
        [Summary with years of experience, scope, and achievements using candidate's ACTUAL experience]
      </p>
      
      <!-- Key achievements -->
      <ul style="font-size: 10pt; line-height: 1.6; margin: 0 0 15px 0;">
        <li>Achievement with <strong>metrics in bold</strong>
          <ul style="margin-top: 3px;">
            <li>→ Sub-detail with specific result</li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
  
  <!-- Professional experience header -->
  <div style="background-color: #1e3a8a; color: white; padding: 8px; font-weight: bold; font-size: 11pt; margin-top: 20px;">
    PROFESSIONAL EXPERIENCE
  </div>
  
  <!-- Experience entries -->
  <div style="margin-top: 15px; font-size: 10pt;">
    <div style="margin-bottom: 15px;">
      <div style="display: table; width: 100%;">
        <div style="display: table-cell;"><strong>COMPANY NAME</strong> | City, State</div>
        <div style="display: table-cell; text-align: right; color: #666;">MM/YYYY – MM/YYYY</div>
      </div>
      <div style="font-weight: bold; margin-top: 3px;">Job Title</div>
      <ul style="margin: 5px 0; line-height: 1.5;">
        <li>Achievement bullet with <strong>bold metrics</strong> showing impact
          <ul style="margin-top: 3px;"><li>→ Sub-detail</li></ul>
        </li>
      </ul>
    </div>
  </div>
</div>

PAGE 2 HTML:
<div style="font-family: Arial, sans-serif; max-width: 8.5in; margin: 0 auto;">
  <!-- Continue experience entries -->
  <div style="font-size: 10pt;">
    [Continue with more jobs from last 10-15 years using candidate's ACTUAL experience]
  </div>
  
  <!-- Education header -->
  <div style="background-color: #1e3a8a; color: white; padding: 8px; font-weight: bold; font-size: 11pt; margin-top: 20px;">
    EDUCATION & CERTIFICATIONS
  </div>
  
  <div style="margin-top: 10px; font-size: 10pt;">
    <p><strong>Degree Name</strong> | Institution Name</p>
    <p><strong>Certification</strong> – Issuing Organization</p>
  </div>
</div>

CONTENT RULES:
- Every bullet needs metrics: budget ($14M), headcount (2,200 employees), scope (31 bargaining units), percentages (70% completion), timelines (45-day)
- Action verbs: Spearheaded, Orchestrated, Architected, Drove, Led, Transformed
- Bold ALL numbers: <strong>$14M</strong>, <strong>2,200</strong>, <strong>70%</strong>
- Max 2 lines per bullet
- Show business IMPACT not tasks
- NO "responsible for," "assisted," "helped"
- Only last 10-15 years of experience
- 2 pages maximum

Return JSON with complete HTML:
{
  "master_resume": {
    "page1": "complete HTML for page 1",
    "page2": "complete HTML for page 2"
  },
  "variants": [
    {
      "job_number": 1,
      "job_title": "title from job description",
      "company": "company from job description",
      "tailoring_focus": "how this is customized",
      "page1": "complete HTML",
      "page2": "complete HTML"
    }
  ],
  "analysis": {
    "key_strengths": ["strength 1", "strength 2"],
    "areas_for_improvement": ["area 1", "area 2"],
    "recommended_keywords": ["keyword 1", "keyword 2"],
    "target_roles": ["role 1", "role 2"],
    "summary": "assessment"
  }
}

${jobDescTexts.length > 0 ? `Create ${jobDescTexts.length} variants using candidate's ACTUAL experience.` : ''}`
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
