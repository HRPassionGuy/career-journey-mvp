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
    @page { size: letter; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Calibri, Arial, sans-serif; 
      font-size: 10pt; 
      line-height: 1.3; 
      color: #333;
      background: #fff;
    }
    
    /* Header Section */
    .header-block {
      background: #2F5496;
      margin: -0.5in -0.5in 20px -0.5in;
      padding: 25px 0.5in 20px 0.5in;
      text-align: left;
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
      margin: 0;
      letter-spacing: 0.5px;
    }
    .contact-line {
      font-size: 10pt;
      color: white;
      letter-spacing: 0.3px;
    }
    
    /* Two Column Layout */
    .content-wrapper {
      display: table;
      width: 100%;
      table-layout: fixed;
    }
    .sidebar {
      display: table-cell;
      width: 27%;
      vertical-align: top;
      padding-right: 15px;
    }
    .main-column {
      display: table-cell;
      width: 73%;
      vertical-align: top;
      border-left: 1px solid #ccc;
      padding-left: 18px;
    }
    
    /* Section Headers */
    .section-label {
      background: #2F5496;
      color: white;
      font-size: 9pt;
      font-weight: bold;
      padding: 5px 10px;
      text-transform: uppercase;
      margin-bottom: 10px;
      letter-spacing: 0.5px;
    }
    
    /* Title and Tagline */
    .executive-title {
      color: #B24C00;
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin-bottom: 5px;
      letter-spacing: 0.3px;
    }
    .tagline {
      font-style: italic;
      color: #666;
      margin-bottom: 12px;
      font-size: 9.5pt;
    }
    
    /* Summary */
    .summary-text {
      text-align: justify;
      margin-bottom: 12px;
      font-size: 9.5pt;
      line-height: 1.4;
    }
    
    /* Expertise Sidebar */
    .skill-item {
      font-size: 8.5pt;
      margin-bottom: 4px;
      line-height: 1.3;
    }
    
    /* Skill Category Boxes */
    .skill-boxes {
      display: table;
      width: 100%;
      margin: 12px 0;
    }
    .skill-boxes-row {
      display: table-row;
    }
    .skill-box {
      display: table-cell;
      background: #FFF4E6;
      border-left: 3px solid #B24C00;
      padding: 8px 6px;
      font-size: 8pt;
      font-weight: bold;
      color: #B24C00;
      text-align: center;
      width: 25%;
    }
    .skill-box + .skill-box {
      border-left: 3px solid #B24C00;
      padding-left: 6px;
    }
    
    /* Experience */
    .job-entry { margin-bottom: 15px; }
    .job-header { 
      font-weight: bold; 
      font-size: 10pt; 
      margin-bottom: 3px;
    }
    .job-header-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .job-title { 
      font-style: italic; 
      color: #555; 
      margin-bottom: 5px;
      font-size: 9.5pt;
    }
    .job-desc {
      font-size: 9pt;
      text-align: justify;
      margin-bottom: 6px;
      line-height: 1.35;
    }
    
    ul { margin: 6px 0 6px 20px; padding: 0; }
    li { 
      margin-bottom: 5px; 
      font-size: 9pt; 
      line-height: 1.35;
      text-align: justify;
    }
    strong { font-weight: bold; color: #000; }
  </style>
</head>
<body>
  <div class="header-block">
    <div class="name-card"><h1>${data.name || 'NAME'}</h1></div>
    <div class="contact-line">${data.location || 'City, State'} • ${data.email || 'email@example.com'} • ${data.phone || '(000) 000-0000'}</div>
  </div>
  
  <div class="content-wrapper">
    <div class="sidebar">
      <div class="section-label">AREAS OF EXPERTISE</div>
      ${(data.expertise || []).map((s: string) => `<div class="skill-item">${s}</div>`).join('')}
    </div>
    
    <div class="main-column">
      <div class="executive-title">${data.current_title || 'PROFESSIONAL TITLE'}</div>
      ${data.tagline ? `<div class="tagline">${data.tagline}</div>` : ''}
      <div class="summary-text">${data.summary || ''}</div>
      
      ${data.skill_categories && data.skill_categories.length > 0 ? `
        <div class="skill-boxes">
          <div class="skill-boxes-row">
            ${data.skill_categories.map((cat: string) => `<div class="skill-box">${cat}</div>`).join('')}
          </div>
        </div>
      ` : ''}
      
      <div class="section-label">PROFESSIONAL EXPERIENCE</div>
      
      ${data.current_job ? `
        <div class="job-entry">
          <div class="job-header">
            <div class="job-header-line">
              <span>${data.current_job.company || 'Company'} • ${data.current_job.location || 'City, ST'}</span>
              <span>${data.current_job.dates || 'Year - Present'}</span>
            </div>
          </div>
          <div class="job-title">${data.current_job.title || 'Job Title'}</div>
          ${data.current_job.description ? `<div class="job-desc">${data.current_job.description}</div>` : ''}
          <ul>
            ${(data.current_job.achievements || []).map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      ` : ''}
    </div>
  </div>
</body>
</html>`

  const page2 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: letter; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Calibri, Arial, sans-serif; font-size: 10pt; color: #333; }
    
    .page-header {
      background: #2F5496;
      color: white;
      padding: 15px 0.5in;
      margin: -0.5in -0.5in 20px -0.5in;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: bold;
      font-size: 11pt;
    }
    
    .section-label {
      background: #2F5496;
      color: white;
      font-size: 9pt;
      font-weight: bold;
      padding: 5px 10px;
      text-transform: uppercase;
      margin: 15px 0 10px 0;
    }
    
    .job-entry { margin-bottom: 15px; }
    .job-header { 
      font-weight: bold; 
      font-size: 10pt; 
      margin-bottom: 3px;
    }
    .job-header-line {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .job-title { 
      font-style: italic; 
      color: #555; 
      margin-bottom: 5px;
      font-size: 9.5pt;
    }
    ul { margin: 6px 0 6px 20px; }
    li { margin-bottom: 5px; font-size: 9pt; line-height: 1.35; text-align: justify; }
    strong { font-weight: bold; color: #000; }
    
    .early-career, .education { font-size: 9pt; line-height: 1.5; }
    .early-career div, .education div { margin-bottom: 4px; }
  </style>
</head>
<body>
  <div class="page-header">
    <span>${data.name || 'NAME'}</span>
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
      <div class="job-title">${job.title}</div>
      ${job.description ? `<div style="font-size:9pt;margin-bottom:6px;text-align:justify;">${job.description}</div>` : ''}
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
</body>
</html>`

  return { page1, page2 }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const resume = formData.get('resume') as File
    const targetTitle = formData.get('targetTitle') as string

    if (!resume) {
      return NextResponse.json({ error: 'Resume required' }, { status: 400 })
    }

    const resumeText = await extractText(resume)
    if (!resumeText || resumeText.length < 100) {
      return NextResponse.json({ error: 'Could not extract resume text' }, { status: 400 })
    }

    const prompt = `Transform this resume into IMPACT statements with BOLDED metrics.

RESUME TEXT:
${resumeText}

TARGET ROLE: ${targetTitle}

YOU MUST:
1. Extract actual name, contact, companies, titles, dates
2. Wrap EVERY number in <strong> tags: <strong>20+</strong> years, <strong>$14M</strong> budget, <strong>70%</strong> completion
3. Transform weak statements to IMPACT

EXAMPLE TRANSFORMATION:
Input: "Managed HR operations for city employees"
Output: "Spearheaded HR operations for <strong>10,000+</strong> employees across <strong>31</strong> bargaining units with <strong>$14M</strong> budget"

Return ONLY this JSON structure:
{
  "name": "Full Name",
  "location": "City, State",
  "email": "email@example.com",
  "phone": "(000) 000-0000",
  "current_title": "OPERATIONS GENERAL MANAGER – HUMAN RESOURCES",
  "tagline": "One sentence value proposition",
  "summary": "Paragraph with <strong>all</strong> <strong>metrics</strong> <strong>bolded</strong>",
  "expertise": ["• Skill 1", "• Skill 2", "• Skill 3", "• Skill 4", "• Skill 5", "• Skill 6", "• Skill 7", "• Skill 8", "• Skill 9", "• Skill 10", "• Skill 11", "• Skill 12"],
  "skill_categories": ["Strategic Leadership", "Talent Management", "Operations Excellence", "Stakeholder Relations"],
  "current_job": {
    "company": "Company Name",
    "location": "City, ST",
    "dates": "2018 - Present",
    "title": "Job Title",
    "description": "Brief scope paragraph",
    "achievements": [
      "Achievement with <strong>numbers</strong> and <strong>metrics</strong> bolded",
      "Another achievement with <strong>all</strong> <strong>metrics</strong> bolded"
    ]
  },
  "previous_jobs": [{
    "company": "Company",
    "location": "City, ST",
    "dates": "2013 - 2018",
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
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    const text = data.content[0].text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    
    if (!jsonMatch) {
      throw new Error('No JSON in response')
    }
    
    const resumeData = JSON.parse(jsonMatch[0])
    const html = generateResumeHTML(resumeData)

    return NextResponse.json({
      master_resume: html,
      variants: [],
      analysis: resumeData.analysis
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'Processing failed', 
      message: error.message 
    }, { status: 500 })
  }
}
