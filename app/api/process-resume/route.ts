import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import pdf from 'pdf-parse'
// @ts-ignore
import mammoth from 'mammoth'

export const runtime = 'nodejs'

async function fetchAnthropic(init: RequestInit): Promise<Response> {
  let lastError: unknown

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await fetch('https://api.anthropic.com/v1/messages', init)
    } catch (error) {
      lastError = error
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500))
      }
    }
  }

  throw lastError
}

async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const lowerName = file.name.toLowerCase()
  
  if (lowerName.endsWith('.pdf')) {
    try {
      const pdfData = await pdf(buffer)
      return pdfData.text
    } catch (err) {
      console.error('PDF parse error:', err)
      return ''
    }
  }

  if (lowerName.endsWith('.docx')) {
    const result = await mammoth.extractRawText({ buffer })
    return result.value
  }

  if (lowerName.endsWith('.doc')) {
    throw new Error('Older .doc files are not supported yet. Please save the resume as a PDF, DOCX, or paste the text.')
  }

  return buffer.toString('utf-8')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const resume = formData.get('resume') as File
    const targetTitle = formData.get('targetTitle') as string || 'Executive Leader'

    if (!resume) return NextResponse.json({ error: 'Resume required' }, { status: 400 })

    const resumeText = await extractText(resume)
    if (!resumeText || resumeText.trim().length < 100) {
      throw new Error('Could not extract enough text from the resume. Please use a text-based PDF, DOCX, TXT, or paste the resume text directly.')
    }

    // Extract job descriptions
    const jobDescFiles = formData.getAll('jobDescriptions') as File[]
    const jobDescriptions: string[] = []
    
    for (const file of jobDescFiles.slice(0, 5)) {
      if (file && file.size > 0) {
        const text = await extractText(file)
        if (text) jobDescriptions.push(text)
      }
    }

    const masterPrompt = `You are an expert résumé strategist and writer. Your task is to transform a candidate's résumé into a compelling, metrics-driven executive document that follows a premium two-column résumé template. Use the candidate's original content to create a polished résumé that will be converted to PDF by a locked layout system.

CANDIDATE'S RESUME:
${resumeText}

TARGET ROLE: ${targetTitle}

JOB DESCRIPTIONS PROVIDED: ${jobDescriptions.length > 0 ? 'YES - Use these to tailor the resume' : 'NO - Use target title and resume content'}

TRANSFORMATION GUIDELINES:

1. HEADER AND CONTACT INFORMATION:
   - Put the candidate's full name in title case at the top
   - Include location, email, and phone
   - Do not include labels such as "Email:" or "Phone:"

2. TARGET ROLE:
   - Use a broad, concise executive headline for current_title, such as "Business Leader", "Customer Experience Leader", "Product Leader", "Operations Leader", or "Sales Leader"
   - Do NOT use a long job title as the headline
   - Keep current_title to 2-4 words and under 28 characters whenever possible
   - The headline must look premium as a centered, all-caps title

3. PROFESSIONAL SUMMARY:
   - Do NOT label this section "PROFESSIONAL SUMMARY"; the PDF template places it beneath the headline as narrative text
   - Write 3-4 polished sentences
   - Third-person format
   - Include 1-3 key metrics wrapped in <strong> tags
   - Example: "Strategic HR executive with <strong>27 years</strong> of experience driving organizational transformation and delivering <strong>$21M+</strong> in cost optimization across <strong>10,000+</strong> employee operations."
   - If job descriptions are provided, mirror the key competencies and requirements from those postings in the summary

4. KEY COMPETENCIES:
   - These become small blue callout boxes on the first page
   - List exactly 4 core competency categories (e.g., "Team Building & Development", "Large Account Leadership", "Market Growth Strategy", "Sales & Revenue Growth")
   - Each competency must be SHORT - maximum 2-3 words

5. AREAS OF EXPERTISE / SKILLS:
   - List 14-18 concise skills that mirror keywords from the job description
   - Include AI-related and remote-work competencies if relevant
   - Use the exact terminology from the job posting to optimize ATS matching
   - Tailor this list for each role
   - Do NOT use bullets; return clean skill names only
   - If job descriptions are provided, extract and prioritize the specific competencies and keywords from those postings

6. CAREER HIGHLIGHTS:
   - Create exactly 5 standout achievements that demonstrate executive-level impact
   - These should be the most impressive metrics from their entire career
   - Pull from different time periods and different types of achievements
   - Examples: "Delivered <strong>$2.1M</strong> cost savings", "Reduced turnover by <strong>35%</strong>", "Launched <strong>5</strong> strategic initiatives", "Led <strong>50-person</strong> cross-functional team", "Achieved <strong>98%</strong> compliance rate"
   - WRAP ALL NUMBERS IN <strong> TAGS
   - These appear under the summary as italic copper feature bullets

7. PROFESSIONAL EXPERIENCE:
   - Describe the last 10-15 years of roles in reverse chronological order
   - For each, include company, location, dates, and job title
   - Use concise bullet points focused on outcomes
   - Include 2-4 achievement bullets for the current role and 2-3 bullets for each previous role
   - Quantify scope, revenue growth, cost savings, headcount managed, budgets, client impact, and KPIs exceeded
   - Use active, ownership verbs ("Drove," "Achieved," "Launched," "Spearheaded," "Orchestrated")
   - AVOID passive or generic phrases like "responsible for," "assisted" or "helped"
   - Showcase entrepreneurial mindset, leadership, and self-motivation, particularly if targeting remote roles
   - WRAP ALL NUMBERS IN <strong> TAGS
   - If job descriptions are provided, adjust experience bullets to mirror the specific needs and requirements from those postings

8. EDUCATION AND CERTIFICATIONS:
   - List degrees and highlight professional development and industry-specific certifications (e.g., AI, PMP, CISSP)

9. LENGTH AND FORMAT:
   - Use a polished executive format that may run 1-2 pages
   - Do not force senior or executive content into one cramped page
   - If the résumé is light, keep it to one page; if the candidate has substantial experience, allow two pages
   - Structure the data for clean PDF conversion
   - Enforce a consistent, high-impact format throughout

TRANSFORMATION EXAMPLES:

BAD: "Managed team and responsible for budget oversight"
GOOD: "Led <strong>15-person</strong> cross-functional team delivering <strong>$2.5M</strong> project <strong>20%</strong> under budget"

BAD: "Assisted with sales initiatives"
GOOD: "Drove <strong>$4.2M</strong> in new revenue by launching strategic partnership program across <strong>3</strong> markets"

BAD: "Worked on customer satisfaction"
GOOD: "Achieved <strong>95%</strong> customer retention rate managing <strong>200+</strong> enterprise accounts worth <strong>$50M</strong> ARR"

BAD: "Responsible for HR operations"
GOOD: "Spearheaded HR operations for <strong>10,000+</strong> employees managing <strong>$14M</strong> annual budget"

CRITICAL RULES:
- Extract ACTUAL data from their resume (names, companies, dates, numbers)
- DO NOT INVENT any information
- WRAP EVERY NUMBER in <strong> tags: <strong>20+</strong>, <strong>$14M</strong>, <strong>70%</strong>, <strong>10,000+</strong>
- Transform weak statements into IMPACT with metrics
- Every bullet proves VALUE and OWNERSHIP, not tasks
- Rewrite or transform the résumé into a high-impact version
- Avoid passive language that dilutes the candidate's impact
- Emphasize quantifiable achievements and leadership throughout

TRANSFORMATION INTENSITY LEVEL: EXECUTIVE AND FACTUAL
- Rewrite weak phrasing into high-impact language
- Keep bullets specific, credible, and readable
- Do not invent metrics or operational scope
- Add context only when it is clearly supported by the original résumé or job descriptions
- Ensure every bullet point proves how the candidate creates value and owns outcomes, rather than simply listing tasks

METRICS TO PRIORITIZE WHEN PRESENT IN THE SOURCE:
- Budget size and cost savings/optimization percentage
- Headcount managed and team size led
- Timeline/duration and efficiency improvement
- Geographic scope (departments, locations, regions)
- Compliance rate, satisfaction scores, retention rates

TAILORING PRIORITY:
1. FIRST PRIORITY: If job descriptions are attached, analyze each job description, pick out the specific competencies and keywords, and adjust the professional summary, core skills, and experience bullets to mirror those needs
2. SECOND PRIORITY: If no job descriptions but target title is provided, tailor to that title's typical requirements
3. THIRD PRIORITY: Use the candidate's natural strengths and competencies from their resume content

Create a fully tailored résumé for this submission by following the priority order above.

Return ONLY this JSON structure (no markdown, no extra text):
{
  "name": "Full Name from resume",
  "location": "City, State",
  "email": "email@example.com",
  "phone": "(000) 000-0000",
  "current_title": "Broad 2-4 word executive headline, not a long job title",
  "tagline": "One powerful sentence describing value proposition",
  "summary": "3-4 polished executive sentences with <strong>metrics</strong> bolded in third person",
  "key_competencies": [
    "Team Building",
    "Account Leadership", 
    "Growth Strategy",
    "Revenue Growth"
  ],
  "expertise": [
    "Actual skill 1 extracted from resume",
    "Actual skill 2 extracted from resume",
    "Actual skill 3 extracted from resume",
    "Actual skill 4 extracted from resume",
    "Actual skill 5 extracted from resume",
    "Actual skill 6 extracted from resume",
    "Actual skill 7 extracted from resume",
    "Actual skill 8 extracted from resume",
    "Actual skill 9 extracted from resume",
    "Actual skill 10 extracted from resume",
    "Actual skill 11 extracted from resume",
    "Actual skill 12 extracted from resume",
    "Actual skill 13 extracted from resume",
    "Actual skill 14 extracted from resume"
  ],
  "career_highlights": [
    "Delivered <strong>$XXM</strong> cost savings through specific initiative",
    "Reduced metric by <strong>XX%</strong> across scope",
    "Launched <strong>X</strong> strategic programs impacting outcome",
    "Led <strong>XX-person</strong> team achieving result",
    "Achieved <strong>XX%</strong> compliance/satisfaction/retention rate"
  ],
  "skill_categories": ["Category 1", "Category 2", "Category 3", "Category 4"],
  "current_job": {
    "company": "Actual company from resume",
    "location": "City, ST",
    "dates": "Year - Present",
    "title": "Actual job title",
    "description": "Brief scope paragraph with quantified responsibilities",
    "achievements": [
      "Drove <strong>specific metric</strong> achievement with <strong>quantified</strong> impact",
      "Achieved <strong>measurable outcome</strong> managing <strong>scope size</strong>",
      "Launched <strong>initiative</strong> generating <strong>$X revenue</strong> or <strong>Y% growth</strong>"
    ]
  },
  "previous_jobs": [
    {
      "company": "Actual previous company",
      "location": "City, ST",
      "dates": "Year - Year",
      "title": "Actual previous title",
      "achievements": [
        "Achievement with <strong>all</strong> <strong>metrics</strong> <strong>bolded</strong>",
        "Achievement with <strong>quantified</strong> <strong>impact</strong>"
      ]
    }
  ],
  "early_career": [
    "<strong>Actual Title</strong> – Actual Company (Actual Years)"
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
    "summary": "Brief assessment"
  }
}`

    const response = await fetchAnthropic({
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
    
    const masterResumeData = JSON.parse(jsonMatch[0])

    // GENERATE VARIANTS for each job description
    const variants = []
    
    for (let i = 0; i < jobDescriptions.length; i++) {
      const variantPrompt = `Tailor this resume for the specific job posting below. Keep all facts accurate but emphasize relevant achievements.

JOB POSTING:
${jobDescriptions[i]}

MASTER RESUME DATA:
${JSON.stringify(masterResumeData, null, 2)}

YOUR TASK:
1. Extract the job title and company from the posting
2. Identify the top 5 requirements from the job posting
3. Reorder and emphasize achievements that match those requirements
4. Add keywords from the job posting to summary and expertise
5. Keep all facts accurate - just reposition and emphasize

Return the SAME JSON structure but tailored for this specific role.`

      const variantResponse = await fetchAnthropic({
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
        const variantJsonMatch = variantText.match(/\{[\s\S]*\}/)
        
        if (variantJsonMatch) {
          const variantResumeData = JSON.parse(variantJsonMatch[0])
          variants.push({
            variant_number: i + 1,
            job_title: variantResumeData.current_title,
            resume_data: variantResumeData
          })
        }
      }
    }

    return NextResponse.json({
      resume_data: masterResumeData,
      variants: variants,
      analysis: masterResumeData.analysis
    })

  } catch (error: any) {
    console.error('Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
