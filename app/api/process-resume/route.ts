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

function generateResumeHTML(data: any): { page1: string; page2: string } {
  const page1 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: letter;
      margin: 0;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .page {
        page-break-after: always;
        margin: 0;
        padding: 0;
      }
    }
    
    * { 
      margin: 0; 
      padding: 0; 
      box-sizing: border-box; 
    }
    
    body { 
      font-family: Calibri, Arial, sans-serif; 
      font-size: 10pt; 
      line-height: 1.3; 
      color: #333;
      background: #fff;
    }
    
    .page {
      width: 8.5in;
      min-height: 11in;
      padding: 0.5in;
      background: white;
    }
    
    /* Header */
    .header-block {
      background: #2F5496;
      margin: -0.5in -0.5in 0.25in -0.5in;
      padding: 0.35in 0.5in 0.3in 0.5in;
      color: white;
    }
    
    .name-card {
      background: white;
      display: inline-block;
      padding: 8px 25px;
      margin-bottom: 8px;
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
      letter-spacing: 0.3px;
      color: white;
    }
    
    /* Two Column Layout */
    .content-wrapper {
      display: flex;
      gap: 0.25in;
      margin-top: 0.15in;
    }
    
    .sidebar {
      flex: 0 0 27%;
      width: 27%;
    }
    
    .main-column {
      flex: 1;
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
      letter-spacing: 0.5px;
    }
    
    /* Title */
    .executive-title {
      color: #B24C00;
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 4px;
      letter-spacing: 0.3px;
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
      line-height: 1.3;
    }
    
    /* Skill Boxes */
    .impact-box-container {
      display: flex;
      gap: 8px;
      margin: 10px 0 12px 0;
    }
    
    .impact-box {
      flex: 1;
      background: #FDF2E9;
      border-left: 3px solid #B24C00;
      padding: 7px 5px;
      font-size: 7.5pt;
      font-weight: bold;
      color: #B24C00;
      text-align: center;
      line-height: 1.2;
    }
    
    /* Jobs */
    .job-entry { 
      margin-bottom: 12px; 
    }
    
    .job-header { 
      font-weight: bold; 
      font-size: 10pt;
      margin-bottom: 2px;
    }
    
    .job-header-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    
    .job-sub-header { 
      font-style: italic; 
      color: #555; 
      margin-bottom: 4px;
      font-size: 9.5pt;
    }
    
    .job-desc {
      font-size: 9pt;
      text-align: justify;
      margin-bottom: 5px;
      line-height: 1.35;
    }
    
    ul { 
      margin: 4px 0 4px 18px; 
      padding: 0;
    }
    
    li { 
      margin-bottom: 4px; 
      font-size: 9pt; 
      line-height: 1.35;
      text-align: justify;
    }
    
    strong { 
      font-weight: bold; 
      color: #000; 
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="header-block">
      <div class="name-card"><h1>${data.name}</h1></div>
      <div class="contact-line">${data.location} • ${data.email} • ${data.phone}</div>
    </div>
    
    <div class="content-wrapper">
      <div class="sidebar">
        <div class="section-label">AREAS OF EXPERTISE</div>
        ${(data.expertise || []).map((s: string) => `<div class="skill-tag">${s}</div>`).join('')}
      </div>
      
      <div class="main-column">
        <div class="executive-title">${data.current_title}</div>
        ${data.tagline ? `<div class="tagline">${data.tagline}</div>` : ''}
        <div class="summary-text">${data.summary}</div>
        
        ${data.skill_categories && data.skill_categories.length > 0 ? `
          <div class="impact-box-container">
            ${data.skill_categories.map((cat: string) => `<div class="impact-box">${cat}</div>`).join('')}
          </div>
        ` : ''}
        
        <div class="section-label">PROFESSIONAL EXPERIENCE</div>
        
        <div class="job-entry">
          <div class="job-header">
            <div class="job-header-line">
              <span>${data.current_job.company} • ${data.current_job.location}</span>
              <span>${data.current_job.dates}</span>
            </div>
          </div>
          <div class="job-sub-header">${data.current_job.title}</div>
          ${data.current_job.description ? `<div class="job-desc">${data.current_job.description}</div>` : ''}
          <ul>
            ${(data.current_job.achievements || []).map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`

  const page2 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: letter;
      margin: 0;
    }
    
    @media print {
      body {
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body { 
      font-family: Calibri, Arial, sans-serif; 
      font-size: 10pt; 
      color: #333;
    }
    
    .page {
      width: 8.5in;
      min-height: 11in;
      padding: 0.5in;
      background: white;
    }
    
    .page-header {
      background: #2F5496;
      color: white;
      padding: 15px 0.5in;
      margin: -0.5in -0.5in 0.25in -0.5in;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      font-size: 10pt;
    }
    
    .section-label {
      background: #2F5496;
      color: white;
      font-size: 9pt;
      font-weight: bold;
      padding: 5px 10px;
      text-transform: uppercase;
      margin: 12px 0 8px 0;
      letter-spacing: 0.5px;
    }
    
    .job-entry { margin-bottom: 12px; }
    
    .job-header { 
      font-weight: bold; 
      font-size: 10pt;
      margin-bottom: 2px;
    }
    
    .job-header-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    
    .job-sub-header { 
      font-style: italic; 
      color: #555; 
      margin-bottom: 4px;
      font-size: 9.5pt;
    }
    
    .job-desc {
      font-size: 9pt;
      text-align: justify;
      margin-bottom: 5px;
      line-height: 1.35;
    }
    
    ul { margin: 4px 0 4px 18px; }
    li { margin-bottom: 4px; font-size: 9pt; line-height: 1.35; text-align: justify; }
    strong { font-weight: bold; color: #000; }
    
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
  <div class="page">
    <div class="page-header">
      <span>${data.name}</span>
      <span>PAGE 2</span>
    </div>
    
    ${(data.previous_jobs || []).map((job: any) => `
      <div class="job-entry">
        <div class="job-header">
          <div class="job-header-line">
            <span>${job.company} • ${job.location}</span>
            <span>${job.dates}</span>
          </div>
        </div>
        <div class="job-sub-header">${job.title}</div>
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
</body>
</html>`

  return { page1, page2 }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const resume = formData.get('resume') as File
    const targetTitle = formData.get('targetTitle') as string || 'Executive Leader'

    if (!resume) return NextResponse.json({ error: 'Resume required' }, { status: 400 })

    const resumeText = await extractText(resume)
    if (!resumeText) throw new Error('Could not read resume')

    const masterPrompt = `You are a professional resume writer. Transform this resume into powerful IMPACT statements.

RESUME:
${resumeText}

TARGET ROLE: ${targetTitle}

TRANSFORMATION RULES:
1. Extract ACTUAL name, contact info, companies, job titles, dates from the resume
2. Transform weak statements into IMPACT with metrics
   EXAMPLE: "Managed HR operations" → "Spearheaded HR operations for <strong>10,000+</strong> employees managing <strong>$14M</strong> annual budget"
3. WRAP ALL NUMBERS IN <strong> TAGS: years, dollars, percentages, counts, timeframes
4. Use action verbs: Spearheaded, Orchestrated, Architected, Drove, Led, Directed
5. DO NOT INVENT any information

Return ONLY this JSON structure (no extra text, no markdown):
{
  "name": "Full Name from resume",
  "location": "City, State",
  "email": "email@example.com",
  "phone": "(000) 000-0000",
  "current_title": "PROFESSIONAL TITLE IN CAPS",
  "tagline": "One powerful sentence describing value",
  "summary": "2-3 sentences with <strong>all</strong> <strong>metrics</strong> <strong>bolded</strong> showing impact",
  "expertise": [
    "• Strategic HR Leadership",
    "• Budget Management ($14M+)",
    "• Talent Acquisition & Retention",
    "• Labor Relations (31 Bargaining Units)",
    "• Organizational Development",
    "• Public Sector HR",
    "• Performance Management",
    "• Employee Engagement",
    "• Workforce Analytics",
    "• Change Management",
    "• Compliance Management",
    "• Partnership Development"
  ],
  "skill_categories": ["Strategic Leadership", "Talent Management", "Operations Excellence", "Stakeholder Relations"],
  "current_job": {
    "company": "Company Name",
    "location": "City, ST",
    "dates": "2018 - Present",
    "title": "Job Title",
    "description": "Brief scope describing role",
    "achievements": [
      "Spearheaded <strong>$14M</strong> budget with <strong>metrics</strong>",
      "Led initiative achieving <strong>70%</strong> completion in <strong>45</strong> days",
      "Managed <strong>10,000+</strong> employees across <strong>31</strong> units"
    ]
  },
  "previous_jobs": [
    {
      "company": "Company",
      "location": "City, ST",
      "dates": "2013 - 2018",
      "title": "Previous Title",
      "achievements": [
        "Achievement with <strong>all</strong> <strong>metrics</strong> <strong>bolded</strong>"
      ]
    }
  ],
  "early_career": [
    "<strong>Title</strong> – Company Name (Years)"
  ],
  "education": [
    "<strong>Degree Name</strong> – University Name",
    "<strong>Certification</strong> – Institution"
  ],
  "analysis": {
    "key_strengths": ["strength 1", "strength 2", "strength 3"],
    "areas_for_improvement": ["area 1", "area 2"],
    "recommended_keywords": ["keyword1", "keyword2", "keyword3"],
    "target_roles": ["role 1", "role 2"],
    "summary": "Brief assessment"
  }
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

    if (!response.ok) throw new Error('API failed')

    const aiResult = await response.json()
    const rawText = aiResult.content[0].text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    
    const resumeData = JSON.parse(jsonMatch[0])
    const html = generateResumeHTML(resumeData)

    return NextResponse.json({
      master_resume: html,
      analysis: resumeData.analysis
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
