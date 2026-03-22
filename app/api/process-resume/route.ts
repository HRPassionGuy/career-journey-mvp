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
  const page1 = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: letter; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.4; color: #000; }
    
    .header { background: #2F5496; padding: 20px; text-align: center; margin-bottom: 10px; }
    .header .name-box { background: white; display: inline-block; padding: 8px 30px; margin-bottom: 8px; }
    .header h1 { font-size: 24pt; font-weight: bold; color: #2F5496; margin: 0; }
    .header .contact { color: white; font-size: 10pt; margin-top: 8px; }
    
    .title { text-align: center; color: #B24C00; font-size: 16pt; font-weight: bold; margin: 15px 0; font-style: italic; }
    
    .section-header { background: #2F5496; color: white; padding: 6px 12px; font-size: 12pt; font-weight: bold; margin: 15px 0 10px 0; }
    
    .two-column { display: table; width: 100%; margin-bottom: 15px; }
    .sidebar { display: table-cell; width: 27%; vertical-align: top; padding-right: 15px; border-right: 2px solid #2F5496; }
    .main-content { display: table-cell; width: 73%; vertical-align: top; padding-left: 15px; }
    
    .expertise-table { width: 100%; }
    .expertise-table td { padding: 3px 8px; font-size: 10pt; }
    
    .summary { margin-bottom: 15px; text-align: justify; }
    
    .job { margin-bottom: 20px; }
    .job-header { margin-bottom: 8px; }
    .company { font-weight: bold; font-size: 12pt; color: #000; }
    .job-title { font-weight: bold; color: #2F5496; }
    .dates { font-style: italic; color: #666; }
    
    .responsibilities { margin: 8px 0; }
    .responsibilities-header { font-weight: bold; margin-bottom: 5px; }
    
    .achievements { margin: 8px 0; }
    .achievements-header { font-weight: bold; margin-bottom: 5px; }
    
    ul { margin-left: 20px; }
    li { margin-bottom: 5px; }
    
    strong { font-weight: bold; }
    
    .early-career li { font-size: 10pt; margin-bottom: 3px; }
    .education li { font-size: 10pt; margin-bottom: 3px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="name-box">
      <h1>${data.name}</h1>
    </div>
    <div class="contact">
      <strong>${data.location}</strong> | <strong>${data.email}</strong> | <strong>${data.phone}</strong>
    </div>
  </div>
  
  <div class="title">${data.current_title}</div>
  
  <div class="two-column">
    <div class="sidebar">
      <div class="section-header">AREAS OF EXPERTISE</div>
      <table class="expertise-table">
        ${data.expertise.map((skill: string, idx: number) => {
          if (idx % 3 === 0) {
            return `<tr>
              <td>• ${data.expertise[idx] || ''}</td>
            </tr>
            ${data.expertise[idx + 1] ? `<tr><td>• ${data.expertise[idx + 1]}</td></tr>` : ''}
            ${data.expertise[idx + 2] ? `<tr><td>• ${data.expertise[idx + 2]}</td></tr>` : ''}`;
          }
          return '';
        }).join('')}
      </table>
    </div>
    
    <div class="main-content">
      <div class="section-header">EXECUTIVE SUMMARY</div>
      <div class="summary">${data.summary}</div>
      
      <div class="section-header">PROFESSIONAL EXPERIENCE</div>
      
      <div class="job">
        <div class="job-header">
          <div class="company">${data.current_job.company} | ${data.current_job.location}</div>
          <div class="job-title">${data.current_job.title}</div>
          <div class="dates">${data.current_job.dates}</div>
        </div>
        
        <div class="responsibilities">
          <div class="responsibilities-header">Key Responsibilities:</div>
          <ul>
            ${data.current_job.responsibilities.map((r: string) => `<li>${r}</li>`).join('')}
          </ul>
        </div>
        
        <div class="achievements">
          <div class="achievements-header">Selected Achievements:</div>
          <ul>
            ${data.current_job.achievements.map((a: string) => `<li>${a}</li>`).join('')}
          </ul>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;

  const page2 = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: letter; margin: 0.5in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Calibri, sans-serif; font-size: 11pt; line-height: 1.4; color: #000; }
    
    .section-header { background: #2F5496; color: white; padding: 6px 12px; font-size: 12pt; font-weight: bold; margin: 15px 0 10px 0; }
    
    .job { margin-bottom: 20px; }
    .job-header { margin-bottom: 8px; }
    .company { font-weight: bold; font-size: 12pt; color: #000; }
    .job-title { font-weight: bold; color: #2F5496; }
    .dates { font-style: italic; color: #666; }
    
    ul { margin-left: 20px; }
    li { margin-bottom: 5px; }
    strong { font-weight: bold; }
    
    .early-career li { font-size: 10pt; margin-bottom: 3px; }
    .education li { font-size: 10pt; margin-bottom: 3px; }
  </style>
</head>
<body>
  ${data.previous_jobs.map((job: any) => `
    <div class="job">
      <div class="job-header">
        <div class="company">${job.company} | ${job.location}</div>
        <div class="job-title">${job.title}</div>
        <div class="dates">${job.dates}</div>
      </div>
      <ul>
        ${job.achievements.map((a: string) => `<li>${a}</li>`).join('')}
      </ul>
    </div>
  `).join('')}
  
  <div class="section-header">EARLY CAREER</div>
  <ul class="early-career">
    ${data.early_career.map((job: string) => `<li>${job}</li>`).join('')}
  </ul>
  
  <div class="section-header">EDUCATION & CERTIFICATIONS</div>
  <ul class="education">
    ${data.education.map((item: string) => `<li>${item}</li>`).join('')}
  </ul>
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

    // MASTER RESUME - Transform content
    const masterPrompt = `You are an expert resume writer. Transform this resume into powerful IMPACT statements while keeping all factual information accurate.

CANDIDATE'S CURRENT RESUME:
${resumeText}

TARGET ROLE: ${targetTitle}

YOUR JOB:
1. Extract their ACTUAL name, contact info, companies, job titles, dates, degrees, certifications
2. TRANSFORM weak task-based statements into IMPACT statements with metrics
3. Use <strong> tags to bold ALL numbers, percentages, dollar amounts, timeframes
4. Use powerful action verbs: Spearheaded, Orchestrated, Architected, Drove, Led, Directed

TRANSFORMATION EXAMPLES:
❌ "Responsible for managing HR operations"
✅ "Directed <strong>$14M</strong> budget supporting <strong>10,000+</strong> employees across <strong>31+</strong> bargaining units"

❌ "Handled employee relations"
✅ "Resolved <strong>200+</strong> employee relations cases annually with <strong>95%</strong> satisfaction rate"

❌ "Worked on recruiting"
✅ "Accelerated time-to-fill by <strong>35%</strong>, hiring <strong>377</strong> candidates across <strong>23</strong> bargaining units in <strong>45 days</strong>"

CRITICAL RULES:
- DO NOT INVENT facts, companies, or dates
- Transform vague statements into quantified achievements
- Every achievement needs a metric (number, %, $, timeframe)
- Use <strong> tags for ALL metrics
- Keep it truthful but powerful

Return ONLY valid JSON:
{
  "name": "Exact name from resume",
  "location": "City, State",
  "email": "email from resume",
  "phone": "phone from resume",
  "current_title": "Their target professional title",
  "summary": "2-3 powerful sentences with <strong>metrics</strong> showing their value proposition",
  "expertise": ["9 key skills optimized for ${targetTitle} role"],
  "current_job": {
    "company": "Actual company name",
    "location": "City, State",
    "title": "Actual title",
    "dates": "Actual dates",
    "responsibilities": [
      "Transformed responsibility with <strong>scope/metrics</strong>",
      "Transformed responsibility with <strong>scope/metrics</strong>",
      "Transformed responsibility with <strong>scope/metrics</strong>"
    ],
    "achievements": [
      "<strong>Growth:</strong> Achievement with <strong>specific metrics</strong>",
      "<strong>Efficiency:</strong> Achievement with <strong>specific metrics</strong>",
      "<strong>Leadership:</strong> Achievement with <strong>specific metrics</strong>"
    ]
  },
  "previous_jobs": [
    {
      "company": "Actual company",
      "location": "City, State",
      "title": "Actual title",
      "dates": "Actual dates",
      "achievements": [
        "Transformed achievement with <strong>metrics</strong>",
        "Transformed achievement with <strong>metrics</strong>"
      ]
    }
  ],
  "early_career": [
    "<strong>Actual Title</strong> – Actual Organization (Actual Years)"
  ],
  "education": [
    "<strong>Actual Degree</strong> – Actual University",
    "<strong>Actual Certification</strong> – Actual Institution"
  ],
  "analysis": {
    "key_strengths": ["strength 1", "strength 2", "strength 3"],
    "areas_for_improvement": ["area 1", "area 2"],
    "recommended_keywords": ["keyword1", "keyword2", "keyword3"],
    "target_roles": ["role 1", "role 2"],
    "summary": "Brief 2-sentence assessment"
  }
}`;

    const masterResponse = await fetch('https://api.anthropic.com/v1/messages', {
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

    if (!masterResponse.ok) {
      const errorData = await masterResponse.json()
      console.error('Master Resume API Error:', errorData)
      return NextResponse.json({ error: 'Processing failed', details: errorData }, { status: masterResponse.status })
    }

    const masterData = await masterResponse.json()
    const masterText = masterData.content[0].text
    let cleanMasterText = masterText.replace(/```json\n?|\n?```/g, '').trim()
    const masterResumeData = JSON.parse(cleanMasterText)
    
    const masterHTML = generateResumeHTML(masterResumeData)

    // VARIANTS - Tailor to specific job descriptions
    const variants = []
    
    for (let i = 0; i < jobDescTexts.length; i++) {
      const variantPrompt = `Tailor the resume for this specific job posting. Keep all facts accurate but emphasize relevant achievements.

JOB POSTING:
${jobDescTexts[i]}

CANDIDATE'S MASTER RESUME DATA:
${JSON.stringify(masterResumeData, null, 2)}

YOUR JOB:
1. Extract the job title and company from the posting
2. Identify the top 3-5 requirements from the job posting
3. Reorder and emphasize achievements that match those requirements
4. Add keywords from the job posting to the summary and expertise
5. Keep all facts accurate - just reposition and emphasize

Return the SAME JSON structure but tailored for this specific role.`;

      const variantResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 16000,
          messages: [{ role: 'user', content: variantPrompt }]
        })
      })

      if (variantResponse.ok) {
        const variantData = await variantResponse.json()
        const variantText = variantData.content[0].text
        let cleanVariantText = variantText.replace(/```json\n?|\n?```/g, '').trim()
        const variantResumeData = JSON.parse(cleanVariantText)
        
        const variantHTML = generateResumeHTML(variantResumeData)
        
        variants.push({
          job_number: i + 1,
          job_title: variantResumeData.current_title || `Position ${i + 1}`,
          company: variantResumeData.current_job.company || 'Target Company',
          tailoring_focus: `Optimized for ${variantResumeData.current_title} role`,
          page1: variantHTML.page1,
          page2: variantHTML.page2
        })
      }
    }

    return NextResponse.json({
      master_resume: {
        page1: masterHTML.page1,
        page2: masterHTML.page2
      },
      variants: variants,
      analysis: masterResumeData.analysis
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
