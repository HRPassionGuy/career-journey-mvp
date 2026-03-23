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
  const styles = `
    <style>
      @page { size: letter; margin: 0; }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; 
        font-size: 10pt; 
        line-height: 1.3; 
        color: #333;
        background: #fff;
      }
      .page {
        width: 8.5in;
        min-height: 11in;
        padding: 0.5in;
        position: relative;
      }
      
      /* Blue Header */
      .header-block {
        background: #2F5496;
        margin: -0.5in -0.5in 20px -0.5in;
        padding: 30px 0.5in;
        color: white;
      }
      .name-card {
        background: white;
        display: inline-block;
        padding: 8px 25px;
        margin-bottom: 10px;
        border-radius: 2px;
      }
      .name-card h1 {
        color: #2F5496;
        font-size: 22pt;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 0;
      }
      .contact-line {
        font-size: 10pt;
        letter-spacing: 0.5px;
      }

      /* Two Column Layout */
      .content-wrapper {
        display: flex;
        gap: 25px;
      }
      .sidebar {
        flex: 0 0 27%;
      }
      .main-column {
        flex: 1;
        border-left: 1px solid #ddd;
        padding-left: 20px;
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
      
      /* Title */
      .executive-title {
        color: #B24C00;
        font-size: 15pt;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
        letter-spacing: 0.3px;
      }
      .tagline {
        font-style: italic;
        color: #555;
        margin-bottom: 15px;
        font-size: 9.5pt;
      }

      /* Content */
      .summary-text {
        text-align: justify;
        margin-bottom: 15px;
        font-size: 9.5pt;
        line-height: 1.4;
      }
      .skill-tag {
        display: block;
        font-size: 8.5pt;
        margin-bottom: 4px;
        line-height: 1.3;
      }
      
      /* Skill Boxes */
      .impact-box-container {
        display: flex;
        gap: 10px;
        margin: 15px 0;
      }
      .impact-box {
        flex: 1;
        background: #FDF2E9;
        border-left: 4px solid #B24C00;
        padding: 8px;
        font-size: 8pt;
        font-weight: bold;
        color: #B24C00;
        text-align: center;
      }

      /* Jobs */
      .job-entry { margin-bottom: 15px; }
      .job-header { 
        font-weight: bold; 
        font-size: 10pt; 
        display: flex; 
        justify-content: space-between;
        margin-bottom: 3px;
      }
      .job-sub-header { 
        font-style: italic; 
        color: #444; 
        margin-bottom: 5px;
        font-size: 9.5pt;
      }
      .job-desc {
        font-size: 9pt;
        text-align: justify;
        margin-bottom: 6px;
        line-height: 1.35;
      }
      ul { margin-left: 18px; margin-top: 5px; }
      li { margin-bottom: 4px; font-size: 9pt; line-height: 1.35; }
      strong { color: #000; font-weight: 700; }
    </style>
  `

  const page1 = `
    <!DOCTYPE html>
    <html>
    <head>${styles}</head>
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
            <div class="tagline">${data.tagline || ''}</div>
            <div class="summary-text">${data.summary}</div>
            
            <div class="impact-box-container">
              ${(data.skill_categories || []).map((cat: string) => `<div class="impact-box">${cat}</div>`).join('')}
            </div>

            <div class="section-label">PROFESSIONAL EXPERIENCE</div>
            <div class="job-entry">
              <div class="job-header">
                <span>${data.current_job.company} • ${data.current_job.location}</span>
                <span>${data.current_job.dates}</span>
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
    </html>
  `

  const page2 = `
    <!DOCTYPE html>
    <html>
    <head>${styles}</head>
    <body>
      <div class="page">
        <div class="header-block" style="padding: 15px 0.5in;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-weight:bold; text-transform:uppercase; font-size:11pt;">${data.name}</span>
            <span>PAGE 2</span>
          </div>
        </div>
        
        <div style="margin-top:20px;">
          ${(data.previous_jobs || []).map((job: any) => `
            <div class="job-entry">
              <div class="job-header">
                <span>${job.company} • ${job.location}</span>
                <span>${job.dates}</span>
              </div>
              <div class="job-sub-header">${job.title}</div>
              ${job.description ? `<div class="job-desc">${job.description}</div>` : ''}
              <ul>
                ${(job.achievements || []).map((a: string) => `<li>${a}</li>`).join('')}
              </ul>
            </div>
          `).join('')}
        </div>

        <div class="section-label">EARLY CAREER</div>
        <div style="font-size:9pt; line-height:1.6; margin-bottom:20px;">
          ${(data.early_career || []).map((item: string) => `<div style="margin-bottom:3px;">${item}</div>`).join('')}
        </div>

        <div class="section-label">EDUCATION & PROFESSIONAL DEVELOPMENT</div>
        <div style="font-size:9pt; line-height:1.6;">
          ${(data.education || []).map((item: string) => `<div style="margin-bottom:3px;">${item}</div>`).join('')}
        </div>
      </div>
    </body>
    </html>
  `

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

    const masterPrompt = `Transform resume into IMPACT statements. CRITICAL: Wrap ALL numbers in <strong> tags.

RESUME:
${resumeText}

TARGET: ${targetTitle}

RULES:
1. Extract actual name, contact, companies, titles, dates
2. WRAP EVERY NUMBER: <strong>20+</strong>, <strong>$14M</strong>, <strong>70%</strong>, <strong>10,000+</strong>
3. Transform: "Managed team" → "Led <strong>25-person</strong> team achieving <strong>$5M</strong> growth"

Return ONLY JSON:
{
  "name": "Full Name",
  "location": "City, State",
  "email": "email",
  "phone": "phone",
  "current_title": "PROFESSIONAL TITLE",
  "tagline": "One-sentence value proposition",
  "summary": "Impact paragraph with <strong>every</strong> <strong>number</strong> <strong>bolded</strong>",
  "expertise": ["• Skill 1", "• Skill 2", "• Skill 3", "• Skill 4", "• Skill 5", "• Skill 6", "• Skill 7", "• Skill 8", "• Skill 9", "• Skill 10"],
  "skill_categories": ["Category 1", "Category 2", "Category 3", "Category 4"],
  "current_job": {
    "company": "Company",
    "location": "City, ST",
    "dates": "Year - Present",
    "title": "Title",
    "description": "Brief scope",
    "achievements": ["Achievement with <strong>metrics</strong> bolded"]
  },
  "previous_jobs": [{
    "company": "Company",
    "location": "City, ST",
    "dates": "Year - Year",
    "title": "Title",
    "achievements": ["Achievement with <strong>metrics</strong>"]
  }],
  "early_career": ["<strong>Title</strong> – Company"],
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
