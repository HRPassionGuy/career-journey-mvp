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

    // Extract job descriptions
    const jobDescFiles = formData.getAll('jobDescriptions') as File[]
    const jobDescriptions: string[] = []
    
    for (const file of jobDescFiles.slice(0, 5)) {
      if (file && file.size > 0) {
        const text = await extractText(file)
        if (text) jobDescriptions.push(text)
      }
    }

    const masterPrompt = `You are an expert résumé strategist and writer. Your task is to transform a candidate's résumé into a compelling, metrics-driven document that follows the structure and visual style of the provided template. Use the candidate's original content to create a polished résumé that will be converted to PDF.

CANDIDATE'S RESUME:
${resumeText}

TARGET ROLE: ${targetTitle}

TRANSFORMATION GUIDELINES:

1. HEADER AND CONTACT INFORMATION:
   - Put the candidate's full name in title case at the top
   - Include email, phone, and hyperlink to LinkedIn or portfolio
   - City/state only if in-person work is required

2. TARGET ROLE:
   - Add the exact title of the position they're applying for below the contact info to match ATS keywords

3. PROFESSIONAL SUMMARY:
   - Write a concise 2-3 sentence third-person summary that states their role and years of experience
   - Identifies relevant industries or markets
   - Highlights one or two quantifiable achievements (e.g., "Drove <strong>$300M</strong> in annual cost savings")
   - WRAP ALL METRICS IN <strong> TAGS

4. AREAS OF EXPERTISE / SKILLS:
   - List 8-10 skills that mirror keywords from the job description
   - Include AI-related and remote-work competencies if relevant
   - Use the exact terminology from the job posting to optimize ATS matching
   - Tailor this list for each role
   - Format as "• Skill Name"

5. PROFESSIONAL EXPERIENCE:
   - Describe the last 10-15 years of roles in reverse chronological order
   - For each, include company, location, dates, and job title
   - Use concise bullet points (no more than two lines each) focused on outcomes
   - Quantify scope, revenue growth, cost savings, headcount managed, budgets, client impact, and KPIs exceeded
   - Use active, ownership verbs ("Drove," "Achieved," "Launched," "Spearheaded," "Orchestrated")
   - AVOID passive or generic phrases like "responsible for," "assisted" or "helped"
   - Showcase entrepreneurial mindset, leadership, and self-motivation, particularly if targeting remote roles
   - WRAP ALL NUMBERS IN <strong> TAGS

6. EDUCATION AND CERTIFICATIONS:
   - List degrees and highlight professional development and industry-specific certifications (e.g., AI, PMP, CISSP)

7. LENGTH AND FORMAT:
   - Keep the résumé to one or two pages
   - Structure the data for clean PDF conversion

TRANSFORMATION EXAMPLES:

BAD: "Managed team and responsible for budget oversight"
GOOD: "Led <strong>15-person</strong> cross-functional team delivering <strong>$2.5M</strong> project <strong>20%</strong> under budget"

BAD: "Assisted with sales initiatives"
GOOD: "Drove <strong>$4.2M</strong> in new revenue by launching strategic partnership program across <strong>3</strong> markets"

BAD: "Worked on customer satisfaction"
GOOD: "Achieved <strong>95%</strong> customer retention rat
