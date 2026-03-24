import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import pdf from 'pdf-parse'
import CloudConvert from 'cloudconvert'

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

function generateResumeHTML(data: any): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: Calibri, Arial, sans-serif; 
      font-size: 10pt; 
      line-height: 1.3; 
      color: #333;
      background: #fff;
    }
    
    /* Page 1 */
    .page-1 {
      width: 8.5in;
      height: 11in;
      page-break-after: always;
      position: relative;
    }
    
    /* Header */
    .header-block {
      background: #2F5496;
      padding: 30px 0.5in;
      color: white;
    }
    
    .name-card {
      background: white;
      display: inline-block;
      padding: 8px 25px;
      margin-bottom: 10px;
    }
    
    .name-card h1 {
      color: #2F5496;
      font-size: 20pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin: 0;
    }
    
    .contact-line {
      font-size: 10pt;
      color: white;
    }
    
    /* Content Area */
    .content-area {
      padding: 0.5in;
      display: flex;
      gap: 0.25in;
    }
    
    /* Sidebar */
    .sidebar {
      width: 27%;
      flex-shrink: 0;
    }
    
    /* Main Column */
    .main-column {
      width: 73%;
      border-left: 1px solid #ccc;
      padding-left: 0.2in;
    }
    
    /* Section Headers */
    .section-label {
      background: #2F5496;
      color: white;
      font-size: 9pt;
      font-weight: bold;
      padding: 5px 10px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    
    /* Title */
    .executive-title {
      color: #B24C00;
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    
    .tagline {
      font-style: italic;
      color: #666;
      margin-bottom: 10px;
      font-size: 9.5pt;
    }
    
    /* Summary */
    .summary-text {
      text-align: justify;
      margin-bottom: 12px;
      font-size: 9.5pt;
      line-height: 1.35;
    }
    
    /* Expertise */
    .skill-tag {
      font-size: 8.5pt;
      margin-bottom: 3px;
    }
    
    /* Skill Boxes */
    .skill-boxes {
      display: flex;
      gap: 8px;
      margin: 10px 0 12px 0;
    }
    
    .skill-box {
      flex: 1;
      background: #FDF2E9;
      border-left: 3px solid #B24C00;
      padding: 7px 5px;
      font-size: 7.5pt;
      font-weight: bold;
      color: #B24C00;
      text-align: center;
    }
    
    /* Jobs */
    .job-entry { margin-bottom: 12px; }
    
    .job-header { 
      font-weight: bold; 
      font-size: 10pt;
      display: flex;
      justify-content: space-between;
      margin-bottom: 2px;
    }
    
    .job-title { 
      font-style: italic; 
      color: #555; 
      margin-bottom: 4px;
      font-size: 9.5pt;
    }
    
    .job-desc {
      font-size: 9pt;
      text-align: justify;
      margin-bottom: 5px;
    }
    
    ul { margin: 4px 0 4px 18px; }
    li { margin-bottom: 4px; font-size: 9pt; line-height: 1.35; text-align: justify; }
    strong { font-weight: bold; color: #000; }
    
    /* Page 2 */
    .page-2 {
      width: 8.5in;
      height: 11in;
      page-break-before: always;
    }
    
    .page-header {
      background: #2F5496;
      color: white;
      padding: 15px 0.5in;
      display: flex;
      justify-content: space-between;
      font-weight: bold;
      font-size: 10pt;
    }
    
    .page-2-content {
      padding: 0.5in;
    }
    
    .early-career, .education { 
      font-size: 9pt; 
      line-height: 1.5; 
    }
    .early-career div, .education div { 
      margin-bottom: 3px; 
    }
  </style>
</head>
<body>
  <!-- PAGE 1 -->
  <div class="page-1">
    <div class="header-block">
      <div class="name-card"><h1>${data.name}</h1></div>
      <div class="contact-line">${data.location} • ${data.email} • ${data.phone}</div>
    </div>
    
    <div class="content-area">
      <div class="sidebar">
        <div class="section-label">AREAS OF EXPERTISE</div>
        ${(data.expertise || []).map((s: string) => `<div class="skill-tag">${s}</div>`).join('')}
      </div>
      
      <div class="main-column">
        <div class="executive-title">${data.current_title}</div>
        ${data.tagline ? `<div class="tagline">${data.tagline}</div>` : ''}
        <div class="summary-text">${data.summary}</div>
        
        ${data.skill_categories && data.skill_categories.length > 0 ? `
          <div class="skill-boxes">
            ${data.skill_categories.map((cat: string) => `<div class="skill-box">${cat}</div>`).join('')}
          </div>
        ` : ''}
        
        <div class="section-label">PROFESSIONAL EXPERIENCE</div>
        
        <div class="job-entry">
          <div class="job-header">
            <span>${data.current_job.company} • ${data.current_job.location}</span>
            <span>${data.current_job.dates}</span>
          </div>
          <div class="job-title">${data.current_job.title}</div>
          ${data.current_job.description ? `<div class="job-desc">${data.current_job.description}</div>` : ''}
          <ul>
            ${(data.current_job.achievements || []).map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </div>
  
  <!-- PAGE 2 -->
  <div class="page-2">
    <div class="page-header">
      <span>${data.name}</span>
      <span>PAGE 2</span>
    </div>
    
    <div class="page-2-content">
      ${(data.previous_jobs || []).map((job: any) => `
        <div class="job-entry">
          <div class="job-header">
            <span>${job.company} • ${job.location}</span>
            <span>${job.dates}</span>
          </div>
          <div class="job-title">${job.title}</div>
          ${job.description ? `<div class="job-desc">${job.description}</div>` : ''}
          <ul>
            ${(job.achievements || []).map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      `).join('')}
      
      <div class="section-label">EARLY CAREER</div>
      <div class="early-career">
        ${(data.early_career || []).map((item: string) => `<div>${item}</div>`).join('')}
      </div>
      
      <div class="section-label">EDUCATION & PROFESSIONAL DEVELOPMENT</div>
      <div class="education">
        ${(data.education || []).map((item: string) => `<div>${item}</div>`).join('')}
      </div>
    </div>
  </div>
</body>
</html>`
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const resume = formData.get('resume') as File
    const targetTitle = formData.get('targetTitle') as string || 'Executive Leader'

    if (!resume) return NextResponse.json({ error: 'Resume required' }, { status: 400 })

    const resumeText = await extractText(resume)
    if (!resumeText) throw new Error('Could not read resume')

    // AI PROMPT - Extract THEIR skills, not hardcoded
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
  "expertise": ["• Actual skill 1 from resume", "• Actual skill 2", "• Actual skill 3", ...],
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
    const html = generateResumeHTML(resumeData)

   // CONVERT HTML TO PDF USING CLOUDCONVERT
const apiKey = process.env.CLOUDCONVERT_API_KEY
if (!apiKey) {
  throw new Error('CloudConvert API key not configured')
}
const cloudConvert = new CloudConvert(apiKey)

// Create job with upload task
let job = await cloudConvert.jobs.create({
  tasks: {
    'upload-html': {
      operation: 'import/upload'
    },
    'convert-to-pdf': {
      operation: 'convert',
      input: 'upload-html',
      output_format: 'pdf',
      engine: 'chrome',
      page_width: 8.5,
      page_height: 11,
      margin_top: 0,
      margin_bottom: 0,
      margin_left: 0,
      margin_right: 0,
      print_background: true
    },
    'export-pdf': {
      operation: 'export/url',
      input: 'convert-to-pdf'
    }
  }
})

// Upload the HTML file
const uploadTask = job.tasks.filter(task => task.name === 'upload-html')[0]
const { Readable } = require('stream')
const htmlStream = Readable.from([html])
await cloudConvert.tasks.upload(uploadTask, htmlStream, 'resume.html')

// Wait for job completion
job = await cloudConvert.jobs.wait(job.id)

// Get PDF download URL
const exportTask = job.tasks.filter(task => task.name === 'export-pdf')[0]

if (!exportTask || !exportTask.result || !exportTask.result.files || !exportTask.result.files[0]) {
  throw new Error('PDF conversion failed')
}

const pdfUrl = exportTask.result.files[0].url

    return NextResponse.json({
      pdf_url: pdfUrl,
      analysis: resumeData.analysis
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
