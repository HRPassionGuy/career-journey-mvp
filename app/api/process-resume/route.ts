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
      font-size: 10.5pt; 
      line-height: 1.3; 
      color: #000; 
    }
    
    /* Header */
    .header {
      background: #2F5496;
      padding: 15px 20px;
      margin: -40px -40px 0 -40px;
    }
    .name-box {
      background: white;
      display: inline-block;
      padding: 5px 25px;
      margin-bottom: 5px;
    }
    .name-box h1 {
      font-size: 20pt;
      font-weight: bold;
      color: #2F5496;
      margin: 0;
      letter-spacing: 0.5px;
    }
    .contact-info {
      color: white;
      font-size: 9.5pt;
      text-align: left;
      margin-top: 3px;
    }
    
    /* Title */
    .title {
      color: #B24C00;
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 8px 0;
      letter-spacing: 0.5px;
    }
    
    .tagline {
      font-style: italic;
      font-size: 9.5pt;
      margin-bottom: 10px;
      color: #333;
    }
    
    /* Two Column Layout */
    .container {
      display: table;
      width: 100%;
      margin-top: 10px;
    }
    
    .sidebar {
      display: table-cell;
      width: 27%;
      vertical-align: top;
      padding-right: 12px;
    }
    
    .main-content {
      display: table-cell;
      width: 73%;
      vertical-align: top;
      padding-left: 12px;
      border-left: 1px solid #ccc;
    }
    
    /* Section Headers */
    .section-header {
      background: #2F5496;
      color: white;
      padding: 4px 8px;
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 8px 0 6px 0;
      letter-spacing: 0.3px;
    }
    
    /* Expertise List */
    .expertise-list {
      font-size: 9pt;
      line-height: 1.4;
    }
    .expertise-list div {
      margin-bottom: 3px;
    }
    
    /* Executive Summary */
    .summary {
      font-size: 9.5pt;
      line-height: 1.35;
      text-align: justify;
      margin-bottom: 8px;
    }
    
    /* Skills Boxes */
    .skills-boxes {
      display: flex;
      gap: 8px;
      margin: 8px 0;
    }
    .skill-box {
      flex: 1;
      background: #FFF4E6;
      border-left: 3px solid #B24C00;
      padding: 6px 8px;
      font-size: 8.5pt;
      font-weight: bold;
      text-align: center;
      color: #B24C00;
    }
    
    /* Job Entries */
    .job {
      margin-bottom: 12px;
    }
    
    .company-header {
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 2px;
    }
    
    .job-title {
      font-style: italic;
      font-size: 9.5pt;
      margin-bottom: 4px;
    }
    
    .job-description {
      font-size: 9pt;
      line-height: 1.3;
      text-align: justify;
      margin-bottom: 6px;
    }
    
    /* Bullets */
    ul {
      margin: 0 0 6px 18px;
      padding: 0;
      font-size: 9pt;
    }
    
    li {
      margin-bottom: 4px;
      line-height: 1.3;
    }
    
    .sub-bullet {
      margin-left: 15px;
      font-size: 8.5pt;
      font-style: italic;
      color: #333;
    }
    
    strong { font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name-box">
      <h1>${data.name}</h1>
    </div>
    <div class="contact-info">
      ${data.location} • ${data.email} • ${data.phone}
    </div>
  </div>
  
  <div class="container">
    <div class="sidebar">
      <div class="section-header">AREAS OF EXPERTISE</div>
      <div class="expertise-list">
        ${data.expertise.map((skill: string) => `<div>• ${skill}</div>`).join('')}
      </div>
    </div>
    
    <div class="main-content">
      <div class="title">${data.current_title}</div>
      <div class="tagline">${data.tagline || ''}</div>
      
      ${data.summary}
      
      ${data.skill_categories ? `<div class="skills-boxes">
        ${data.skill_categories.map((cat: string) => `<div class="skill-box">${cat}</div>`).join('')}
      </div>` : ''}
      
      <div class="section-header">PROFESSIONAL EXPERIENCE</div>
      
      <div class="job">
        <div class="company-header">${data.current_job.company} • ${data.current_job.location} • ${data.current_job.dates}</div>
        <div class="job-title">${data.current_job.title}</div>
        <div class="job-description">${data.current_job.description || ''}</div>
        <ul>
          ${data.current_job.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
        </ul>
      </div>
    </div>
  </div>
</body>
</html>`;

  const page2 = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: letter; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: Calibri, Arial, sans-serif; 
      font-size: 10.5pt; 
      line-height: 1.3; 
      color: #000; 
    }
    
    .page-header {
      background: #2F5496;
      color: white;
      padding: 8px 15px;
      font-size: 12pt;
      font-weight: bold;
      margin: -40px -40px 15px -40px;
      display: flex;
      justify-content: space-between;
    }
    
    .section-header {
      background: #2F5496;
      color: white;
      padding: 4px 8px;
      font-size: 10pt;
      font-weight: bold;
      text-transform: uppercase;
      margin: 12px 0 6px 0;
    }
    
    .job {
      margin-bottom: 12px;
    }
    
    .company-header {
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 2px;
    }
    
    .job-title {
      font-style: italic;
      font-size: 9.5pt;
      margin-bottom: 4px;
    }
    
    .job-description {
      font-size: 9pt;
      line-height: 1.3;
      text-align: justify;
      margin-bottom: 6px;
    }
    
    ul {
      margin: 0 0 6px 18px;
      padding: 0;
      font-size: 9pt;
    }
    
    li {
      margin-bottom: 4px;
      line-height: 1.3;
    }
    
    .sub-bullet {
      margin-left: 15px;
      font-size: 8.5pt;
      font-style: italic;
    }
    
    .testimonial {
      background: #FFF4E6;
      border: 2px solid #B24C00;
      padding: 10px;
      margin: 10px 0;
      font-size: 8.5pt;
      font-style: italic;
      line-height: 1.4;
    }
    
    .testimonial-author {
      font-weight: bold;
      font-style: normal;
      margin-top: 6px;
      text-align: right;
    }
    
    .early-career {
      font-size: 9pt;
      line-height: 1.4;
    }
    
    .education {
      font-size: 9pt;
      line-height: 1.4;
    }
    
    strong { font-weight: bold; }
  </style>
</head>
<body>
  <div class="page-header">
    <span>${data.name}</span>
    <span>PAGE 2</span>
  </div>
  
  ${data.previous_jobs.map((job: any) => `
    <div class="job">
      <div class="company-header">${job.company} • ${job.location} • ${job.dates}</div>
      <div class="job-title">${job.title}</div>
      ${job.description ? `<div class="job-description">${job.description}</div>` : ''}
      <ul>
        ${job.achievements.map((achievement: string) => `<li>${achievement}</li>`).join('')}
      </ul>
    </div>
  `).join('')}
  
  ${data.testimonial ? `
    <div class="testimonial">
      "${data.testimonial.quote}"
      <div class="testimonial-author">— ${data.testimonial.author}, ${data.testimonial.title}</div>
    </div>
  ` : ''}
  
  <div class="section-header">EARLY CAREER</div>
  <div class="early-career">
    ${data.early_career.map((item: string) => `<div>${item}</div>`).join('')}
  </div>
  
  <div class="section-header">EDUCATION & PROFESSIONAL DEVELOPMENT</div>
  <div class="education">
    ${data.education.map((item: string) => `<div>${item}</div>`).join('')}
  </div>
</body>
</html>`;

  return { page1, page2 };
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

    const masterPrompt = `Transform this resume into powerful IMPACT statements. Extract factual data and rewrite weak content.

RESUME:
${resumeText}

TARGET: ${targetTitle}

RULES:
1. Extract ACTUAL name, contact, companies, titles, dates
2. Transform "managed" → "Spearheaded <strong>$X</strong> initiative achieving <strong>Y%</strong> growth"
3. Bold ALL metrics with <strong> tags
4. Keep facts accurate

Return JSON:
{
  "name": "Full Name",
  "location": "City, State",
  "email": "email",
  "phone": "phone",
  "current_title": "Professional Title",
  "tagline": "One-sentence value proposition",
  "summary": "<p>Paragraph with <strong>metrics</strong> showing impact</p>",
  "expertise": ["Skill 1", "Skill 2", ... 12-15 skills],
  "skill_categories": ["Category 1", "Category 2", "Category 3", "Category 4"],
  "current_job": {
    "company": "Company",
    "location": "City, ST",
    "dates": "Year - Present",
    "title": "Job Title",
    "description": "Brief scope paragraph",
    "achievements": [
      "Achievement with <strong>metrics</strong>",
      "Achievement with <strong>metrics</strong>"
    ]
  },
  "previous_jobs": [{
    "company": "Company",
    "location": "City, ST",
    "dates": "Year - Year",
    "title": "Title",
    "description": "Optional scope",
    "achievements": ["Achievement with <strong>metrics</strong>"]
  }],
  "early_career": ["Title – Company (Years)"],
  "education": ["Degree – Institution"],
  "testimonial": {
    "quote": "Optional testimonial text",
    "author": "Name",
    "title": "Title, Company"
  },
  "analysis": {
    "key_strengths": ["strength"],
    "areas_for_improvement": ["area"],
    "recommended_keywords": ["keyword"],
    "target_roles": ["role"],
    "summary": "Assessment"
  }
}`;

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

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    const text = data.content[0].text
    const clean = text.replace(/```json\n?|\n?```/g, '').trim()
    const resumeData = JSON.parse(clean)
    
    const html = generateResumeHTML(resumeData)

    return NextResponse.json({
      master_resume: html,
      variants: [],
      analysis: resumeData.analysis
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
