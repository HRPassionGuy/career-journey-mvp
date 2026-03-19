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
          content: `You are an expert resume writer. Create HTML resume pages using ONLY the candidate's ACTUAL experience from their resume.

CANDIDATE'S ACTUAL RESUME (USE THIS EXACT EXPERIENCE - DO NOT INVENT ANYTHING):
${resumeText}

TARGET ROLE: ${targetTitle}

${jobDescTexts.length > 0 ? `JOB DESCRIPTIONS:\n${jobDescTexts.map((t, i) => `JOB ${i + 1}:\n${t}`).join('\n')}` : ''}

CRITICAL RULES:
1. Use ONLY the candidate's actual companies, job titles, dates, and achievements
2. Transform task-focused bullets into IMPACT-focused achievements with metrics
3. Every bullet must show RESULTS not responsibilities
4. Bold ALL numbers in the HTML

TRANSFORMATION EXAMPLES:
BAD: "Responsible for managing HR operations"
GOOD: "Directed <strong>$14M</strong> annual HR budget supporting <strong>2,200+</strong> employees across <strong>31</strong> bargaining units"

BAD: "Helped with recruitment"  
GOOD: "Spearheaded talent acquisition strategy advancing <strong>377</strong> candidates to eligible registers with <strong>70%</strong> completion within <strong>45-day</strong> timeframe"

ACTION VERBS TO USE:
Spearheaded, Orchestrated, Architected, Drove, Led, Transformed, Delivered, Achieved, Generated, Increased, Reduced, Streamlined

METRICS TO HIGHLIGHT (from candidate's actual experience):
- Budget: <strong>$14M</strong>
- Headcount: <strong>2,200+</strong> employees
- Bargaining units: <strong>31</strong>
- Candidates: <strong>377</strong>
- Completion rate: <strong>70%</strong>
- Timeline: <strong>45-day</strong>
- Department consolidation: <strong>686</strong> employees, <strong>23</strong> units

HTML TEMPLATE - PAGE 1:

<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>[Name] - ${targetTitle}</title>
</head>
<body>
<div style="font-family: Arial, sans-serif; max-width: 8.5in; margin: 0 auto;">

<!-- Navy header -->
<div style="background-color: #1e3a8a; color: white; padding: 20px; text-align: center;">
<h1 style="margin: 0; font-size: 24pt; letter-spacing: 2px;">[FULL NAME FROM RESUME]</h1>
<p style="margin: 5px 0 0 0; font-size: 11pt;">[City, State] • [email] • [phone]</p>
</div>

<!-- Rust-colored title -->
<div style="text-align: center; margin: 15px 0;">
<h2 style="color: #8B4513; font-size: 18pt; margin: 0;">${targetTitle}</h2>
<p style="font-style: italic; margin: 5px 0; font-size: 10pt;">Driving results through [key value proposition from experience]</p>
</div>

<!-- Two-column layout -->
<div style="display: table; width: 100%; margin-top: 20px;">

<!-- Left sidebar - Skills (30%) -->
<div style="display: table-cell; width: 30%; vertical-align: top; padding-right: 15px;">
<div style="background-color: #1e3a8a; color: white; padding: 8px; font-weight: bold; font-size: 11pt;">
AREAS OF EXPERTISE
</div>
<div style="font-size: 9pt; line-height: 1.4; margin-top: 10px;">
- Strategic HR Leadership<br>
- Budget Management<br>
- Talent Acquisition<br>
- Labor Relations<br>
- Performance Management<br>
- Employee Engagement<br>
- Analytics & Metrics<br>
- Change Management<br>
- Training & Development<br>
- Workforce Planning<br>
- Succession Planning<br>
- Multi-Union Management
</div>
</div>

<!-- Right main content (70%) -->
<div style="display: table-cell; width: 70%; vertical-align: top;">

<!-- Professional summary -->
<p style="font-style: italic; font-size: 10pt; line-height: 1.5; margin: 0 0 15px 0;">
Strategic HR executive with <strong>20+</strong> years managing complex operations across <strong>31</strong> bargaining units and <strong>2,200+</strong> employees. Currently directing <strong>$14M</strong> annual HR budget while delivering measurable improvements in talent acquisition, engagement, and organizational performance.
</p>

<!-- Key achievements -->
<ul style="font-size: 10pt; line-height: 1.6; margin: 0 0 15px 0;">
<li>Spearheaded talent acquisition strategy advancing <strong>377</strong> candidates with <strong>70%</strong> completion within <strong>45-day</strong> timeframe
<ul style="margin-top: 3px;"><li>→ Delivered consistent pipeline reducing time-to-fill by <strong>30%</strong></li></ul>
</li>
<li>Architected apprenticeship partnership addressing skilled trades shortage
<ul style="margin-top: 3px;"><li>→ Created sustainable talent pipeline for critical infrastructure roles</li></ul>
</li>
<li>Led department consolidation integrating <strong>686</strong> employees across <strong>23</strong> bargaining units
<ul style="margin-top: 3px;"><li>→ Streamlined operations improving service delivery efficiency</li></ul>
</li>
</ul>

</div>
</div>

<!-- Professional Experience header -->
<div style="background-color: #1e3a
