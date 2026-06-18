import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import pdf from 'pdf-parse'
// @ts-ignore
import mammoth from 'mammoth'

export const runtime = 'nodejs'

async function fetchAnthropic(init: RequestInit): Promise<Response> {
  let lastError: unknown
  for (let attempt = 1; attempt <= 3; attempt++) {
    try { return await fetch('https://api.anthropic.com/v1/messages', init) }
    catch (error) {
      lastError = error
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, attempt * 1500))
    }
  }
  throw lastError
}

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const lowerName = file.name.toLowerCase()
  if (lowerName.endsWith('.pdf')) {
    try { const pdfData = await pdf(buffer); return pdfData.text }
    catch (err) { console.error('PDF parse error:', err); return '' }
  }
  if (lowerName.endsWith('.docx')) { const result = await mammoth.extractRawText({ buffer }); return result.value }
  if (lowerName.endsWith('.doc')) throw new Error('Older .doc files are not supported yet. Please save the resume as a PDF, DOCX, or paste the text.')
  return buffer.toString('utf-8')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const resume = formData.get('resume') as File
    const targetTitle = formData.get('targetTitle') as string || 'Executive Leader'
    if (!resume) return NextResponse.json({ error: 'Resume required' }, { status: 400 })
    const resumeText = await extractText(resume)
    if (!resumeText || resumeText.trim().length < 100) throw new Error('Could not extract enough text from the resume. Please use a text-based PDF, DOCX, TXT, or paste the resume text directly.')

    const jobDescFiles = formData.getAll('jobDescriptions') as File[]
    const jobDescriptions: string[] = []
    for (const file of jobDescFiles.slice(0, 5)) {
      if (file && file.size > 0) { const text = await extractText(file); if (text) jobDescriptions.push(text) }
    }

    const masterPrompt = `You are an expert résumé strategist and writer. Transform the candidate's résumé into a compelling, factual executive document for a locked premium template.

CANDIDATE'S RESUME:
${resumeText}

TARGET ROLE: ${targetTitle}
JOB DESCRIPTIONS PROVIDED: ${jobDescriptions.length > 0 ? 'YES - tailor to them' : 'NO'}

CONTENT CONTRACT:
1. HEADER: Extract the exact full name, location, email, and phone. Do not add labels.
2. HEADLINE: current_title must be a broad 2-4 word executive headline under 28 characters when possible, such as Business Leader, Customer Experience Leader, Operations Leader, Sales Leader, or Human Resources Leader. Do not use a long job title.
3. TAGLINE: One strong sentence, 90-150 characters.
4. SUMMARY: 3-4 polished third-person sentences totaling 450-600 characters. Include 1-3 source-supported metrics wrapped in <strong> tags. Do not label it Professional Summary.
5. KEY COMPETENCIES: Exactly 4 categories for blue callout boxes. Each must be 2-3 words and no more than 30 characters.
6. EXPERTISE: Exactly 18 skills. Each must be 2-5 words and no more than 38 characters. Use job-posting terminology when provided. Return clean skill names without bullets.
7. CAREER HIGHLIGHTS: Exactly 5 source-supported executive achievements from different parts of the career. Each must be 85-135 characters so the five highlights fill the designed feature area. Wrap every number in <strong> tags.
8. CURRENT ROLE: Write a 300-450 character scope paragraph and exactly 3 achievement bullets. Each bullet must be 120-185 characters and focus on outcomes, leadership, scope, and source-supported metrics.
9. PREVIOUS ROLES: Cover the last 10-15 years in reverse chronological order with 2-3 concise achievement bullets each.
10. EDUCATION: Include actual degrees, certifications, and professional development.

CRITICAL RULES:
- Use only facts supported by the source résumé or supplied job descriptions.
- Never invent metrics, employers, dates, education, credentials, or operational scope.
- Wrap every number in <strong> tags.
- Use active ownership verbs and avoid responsible for, assisted, or helped.
- Tailor summary, expertise, and achievements to supplied job descriptions first, target title second, and natural strengths third.
- Return only valid JSON, with no markdown or commentary.

Return exactly this structure:
{
  "name": "Full Name from resume",
  "location": "City, State",
  "email": "email@example.com",
  "phone": "(000) 000-0000",
  "current_title": "Broad 2-4 word executive headline",
  "tagline": "One powerful 90-150 character value proposition",
  "summary": "450-600 character executive narrative with <strong>metrics</strong>",
  "key_competencies": ["Competency One", "Competency Two", "Competency Three", "Competency Four"],
  "expertise": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8", "Skill 9", "Skill 10", "Skill 11", "Skill 12", "Skill 13", "Skill 14", "Skill 15", "Skill 16", "Skill 17", "Skill 18"],
  "career_highlights": ["85-135 character highlight 1", "85-135 character highlight 2", "85-135 character highlight 3", "85-135 character highlight 4", "85-135 character highlight 5"],
  "skill_categories": ["Category 1", "Category 2", "Category 3", "Category 4"],
  "current_job": {
    "company": "Actual company",
    "location": "City, ST",
    "dates": "Year - Present",
    "title": "Actual title",
    "description": "300-450 character scope paragraph",
    "achievements": ["120-185 character achievement 1", "120-185 character achievement 2", "120-185 character achievement 3"]
  },
  "previous_jobs": [{"company": "Actual company", "location": "City, ST", "dates": "Year - Year", "title": "Actual title", "achievements": ["Achievement 1", "Achievement 2"]}],
  "early_career": ["<strong>Actual Title</strong> – Actual Company (Actual Years)"],
  "education": ["<strong>Actual Degree</strong> – Actual University"],
  "analysis": {
    "key_strengths": ["strength 1", "strength 2", "strength 3"],
    "areas_for_improvement": ["area 1", "area 2"],
    "recommended_keywords": ["keyword1", "keyword2", "keyword3"],
    "target_roles": ["role 1", "role 2"],
    "summary": "Brief assessment"
  }
}`

    const response = await fetchAnthropic({
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 16000, messages: [{ role: 'user', content: masterPrompt }] })
    })
    if (!response.ok) throw new Error('AI API failed')
    const aiResult = await response.json()
    const rawText = aiResult.content[0].text
    const jsonMatch = rawText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in AI response')
    const masterResumeData = JSON.parse(jsonMatch[0])

    const variants = []
    for (let i = 0; i < jobDescriptions.length; i++) {
      const variantPrompt = `Tailor this resume for the job posting below without changing any facts. Preserve the exact JSON structure and all content-count and length requirements from the master resume.

JOB POSTING:
${jobDescriptions[i]}

MASTER RESUME DATA:
${JSON.stringify(masterResumeData, null, 2)}

Prioritize relevant achievements and job-posting keywords. Return only valid JSON.`
      const variantResponse = await fetchAnthropic({
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY || '', 'anthropic-version': '2023-06-01' },
        body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 16000, messages: [{ role: 'user', content: variantPrompt }] })
      })
      if (variantResponse.ok) {
        const variantData = await variantResponse.json()
        const variantText = variantData.content[0].text
        const variantJsonMatch = variantText.match(/\{[\s\S]*\}/)
        if (variantJsonMatch) {
          const variantResumeData = JSON.parse(variantJsonMatch[0])
          variants.push({ variant_number: i + 1, job_title: variantResumeData.current_title, resume_data: variantResumeData })
        }
      }
    }

    return NextResponse.json({ resume_data: masterResumeData, variants, analysis: masterResumeData.analysis })
  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
