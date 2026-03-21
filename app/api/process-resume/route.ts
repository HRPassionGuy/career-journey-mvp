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
          content: `You are a professional resume writer. Extract information from the candidate's resume and rewrite it using the EXACT template structure below.

CANDIDATE'S RESUME:
${resumeText}

TARGET ROLE: ${targetTitle}

${jobDescTexts.length > 0 ? `JOB DESCRIPTIONS FOR TAILORED VARIANTS:\n${jobDescTexts.map((t, i) => `\nJOB ${i+1}:\n${t}\n`).join('\n')}` : ''}

CRITICAL CONTENT RULES:
1. Extract candidate's ACTUAL name, contact info, companies, titles, dates, achievements from their resume
2. DO NOT INVENT any information - use only what's in the resume
3. Transform weak task descriptions into IMPACT statements with metrics
4. Current scope correction: If candidate mentions "10,000+ employees" use that; if old role mentions "2,200 employees" that was a subset
5. ALWAYS bold numbers and metrics using **bold** in markdown
6. Use strong action verbs: Spearheaded, Orchestrated, Architected, Drove, Led, Directed

MARKDOWN TEMPLATE TO FOLLOW EXACTLY:
---
# {{FULL NAME}}
**{{City, State}}** | **{{Email Address}}** | **{{Phone Number}}**

## {{CURRENT PROFESSIONAL TITLE}}
> *{{A high-level mission statement based on their experience}}*

---

### EXECUTIVE SUMMARY
{{2-3 sentence professional summary highlighting their expertise and value proposition. Include specific metrics.}}

---

### AREAS OF EXPERTISE
| | | |
| :--- | :--- | :--- |
| • {{Skill 1}} | • {{Skill 4}} | • {{Skill 7}} |
| • {{Skill 2}} | • {{Skill 5}} | • {{Skill 8}} |
| • {{Skill 3}} | • {{Skill 6}} | • {{Skill 9}} |

---

### PROFESSIONAL EXPERIENCE

#### {{COMPANY NAME}} | {{Location}}
**{{Most Recent Job Title}}** | *{{Start Date - End Date}}*

**Key Responsibilities:**
* {{Responsibility 1 with scope/metrics}}
* {{Responsibility 2 with scope/metrics}}
* {{Responsibility 3 with scope/metrics}}

**Selected Achievements:**
* **{{Category}}:** {{Achievement with **bolded metrics** - e.g., Achieved **100%+** profitable sales growth over **3-year** period (**$192M** to **$450M**)}}
* **{{Category}}:** {{Achievement with **bolded metrics**}}
* **{{Category}}:** {{Achievement with **bolded metrics**}}

---

#### {{PREVIOUS COMPANY NAME}} | {{Location}}
**{{Previous Job Title}}** | *{{Start Date - End Date}}*

* {{Achievement bullet with **bolded metrics**}}
* {{Achievement bullet with **bolded metrics**}}
* {{Achievement bullet with **bolded metrics**}}

---

### EARLY CAREER
* **{{Title}}** – {{Organization}} ({{Years}})
* **{{Title}}** – {{Organization}} ({{Years}})

---

### EDUCATION & CERTIFICATIONS
* **{{Degree}}** – {{University Name}}
* **{{Certification}}** – {{Institution}}

---

CONVERT THIS MARKDOWN TO HTML WITH THESE EXACT STYLES:

**COLORS:**
- Navy header/sections: #2F5496
- Rust/orange title: #B24C00
- Font: Calibri, sans-serif

**LAYOUT:**
- Page 1: Header (navy bar with white name box) + Title (rust) + Two columns: 27% left sidebar (expertise table), 73% right (summary + first job)
- Page 2: Continue professional experience + early career + education

**HTML STRUCTURE:**
Use professional styling with proper spacing, borders, and the exact color scheme.

Return ONLY valid JSON:
{
  "master_resume": {
    "page1": "<complete HTML with inline styles>",
    "page2": "<complete HTML with inline styles>"
  },
  "variants": [${jobDescTexts.length > 0 ? `
    {
      "job_number": 1,
      "job_title": "extracted from job description",
      "company": "extracted from job description",
      "tailoring_focus": "brief description of how resume was tailored",
      "page1": "<HTML page 1 with inline styles>",
      "page2": "<HTML page 2 with inline styles>"
    }` : ''}
  ],
  "analysis": {
    "key_strengths": ["strength 1", "strength 2", "strength 3"],
    "areas_for_improvement": ["area 1", "area 2"],
    "recommended_keywords": ["keyword1", "keyword2", "keyword3"],
    "target_roles": ["role 1", "role 2"],
    "summary": "Brief 2-sentence assessment"
  }
}`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API Error:', errorData)
      return NextResponse.json({ error: 'Processing failed', details: errorData }, { status: response.status })
    }

    const data = await response.json()
    const resultText = data.content[0].text
    
    // Clean the response
    let cleanText = resultText.replace(/```json\n?|\n?```/g, '').trim()
    
    // Parse JSON
    const result = JSON.parse(cleanText)
    
    // Validate structure
    if (!result.master_resume || !result.master_resume.page1 || !result.master_resume.page2) {
      console.error('Invalid response structure:', result)
      return NextResponse.json({ 
        error: 'Invalid response format',
        received: result 
      }, { status: 500 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
