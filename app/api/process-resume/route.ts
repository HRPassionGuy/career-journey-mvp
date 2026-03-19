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
    const location = formData.get('location') as string
    const salary = formData.get('salary') as string
    
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
          content: `Create professional resume HTML using candidate's ACTUAL experience. Use exact template structure.

CANDIDATE RESUME (USE ACTUAL EXPERIENCE ONLY):
${resumeText}

TARGET: ${targetTitle}

CRITICAL SCOPE DATA:
- Current role oversees: 10,000+ employees (total City workforce)
- Budget: $14M
- Bargaining units: 31+
- Previous role (2003-2005): supported 2,200 employees (subset of departments)

TRANSFORMATION RULES:
Transform tasks into IMPACT with metrics. Examples:
- BAD: "Managed HR operations" 
- GOOD: "Directed <strong>$14M</strong> annual HR budget supporting <strong>10,000+</strong> employees across <strong>31</strong> bargaining units"

Use verbs: Spearheaded, Orchestrated, Architected, Drove, Led, Delivered
Bold ALL numbers: <strong>$14M</strong>, <strong>10,000+</strong>, <strong>70%</strong>

EXACT HTML STRUCTURE - PAGE 1:

<div style="font-family: Calibri, Arial, sans-serif; max-width: 8.5in; margin: 0; padding: 0;">
<div style="background: linear-gradient(to bottom, #2F5496 0%, #2F5496 100%); padding: 15px; text-align: center;">
<div style="background-color: white; display: inline-block; padding: 8px 40px; margin-bottom: 8px;">
<h1 style="margin: 0; color: #2F5496; font-size: 20pt; font-weight: bold; letter-spacing: 1px;">[NAME FROM RESUME]</h1>
</div>
<p style="margin: 0; color: white; font-size: 10pt;">[Address] • [City, State ZIP] • [Phone] • [Email]</p>
</div>

<div style="text-align: center; margin: 12px 0;">
<h2 style="color: #B24C00; font-size: 14pt; font-weight: bold; margin: 0; text-transform: uppercase;">${targetTitle}</h2>
</div>

<table style="width: 100%; border-collapse: collapse;">
<tr>
<td style="width: 27%; vertical-align: top; padding-right: 15px;">

<div style="background-color: #2F5496; color: white; padding: 6px; font-weight: bold; font-size: 10pt; text-align: center; margin-bottom: 8px;">
AREAS OF EXPERTISE
</div>

<div style="font-size: 9pt; line-height: 1.6; text-align: center;">
Strategic HR Leadership<br>
Budget Management ($14M+)<br>
Talent Acquisition<br>
Workforce Planning<br>
Labor Relations<br>
Performance Management<br>
Employee Engagement<br>
Training & Development<br>
Analytics & Metrics<br>
Change Management<br>
Partnership Development<br>
Compliance Management<br>
Cultural Transformation<br>
Executive Advisory
</div>

</td>
<td style="width: 73%; vertical-align: top; padding-left: 15px;">

<p style="font-size: 10pt; line-height: 1.5; margin: 0 0 12px 0; font-style: italic;">
Strategic HR executive with <strong>20+</strong> years managing human capital for <strong>10,000+</strong> employees across <strong>31</strong> bargaining units. Directing <strong>$14M</strong> annual budgets, orchestrating talent initiatives achieving <strong>70%</strong> on-time delivery, architecting organizational transformations for <strong>686+</strong> employee departments.
</p>

<div style="font-size: 10pt; line-height: 1.5; margin-bottom: 12px;">
<div style="margin-bottom: 8px;">
→ <strong>Spearheaded city-wide recruitment transformation achieving 70% on-time delivery</strong><br>
<span style="margin-left: 15px; font-style: italic;">Directed comprehensive job fair initiatives moving <strong>377</strong> candidates to eligible registers with <strong>45-day</strong> processing framework</span>
</div>

<div style="margin-bottom: 8px;">
→ <strong>Architected strategic apprenticeship program addressing critical talent gaps</strong><br>
<span style="margin-left: 15px; font-style: italic;">Orchestrated third-party partnerships for DDOT mechanic apprenticeship targeting Detroit residents</span>
</div>

<div style="margin-bottom: 8px;">
→ <strong>Led organizational restructuring creating 686-employee General Services Department</strong><br>
<span style="margin-left: 15px; font-style: italic;">Managed complex integration across <strong>23</strong> bargaining units with comprehensive HR project leadership</span>
</div>
</div>

</td>
</tr>
</table>

<div style="background-color: #2F5496; color: white; padding: 6px; font-weight: bold; font-size: 11pt; margin-top: 15px; text-align: center;">
PROFESSIONAL EXPERIENCE
</div>

<div style="margin-top: 12px; font-size: 10pt;">

<div style="margin-bottom: 12px;">
<div style="font-weight: bold;">Operations General Manager – Human Resources</div>
<div style="font-style: italic;">City of Detroit | January 2018 – Present</div>
<ul style="margin: 5px 0; padding-left: 20px; line-height: 1.4;">
<li>Spearheaded preparation and monitoring of <strong>$14M</strong> annual HR budget ensuring optimal resource allocation</li>
<li>Architected community and employee engagement programs enhancing employee experience and organizational brand</li>
<li>Delivered comprehensive analytics solutions supporting executive talent decision-making and strategic workforce planning</li>
</ul>
</div>

<div style="margin-bottom: 12px;">
<div style="font-weight: bold;">Manager II – Human Resources</div>
<div style="font-style: italic;">City of Detroit | January 2013 – January 2018</div>
<ul style="margin: 5px 0; padding-left: 20px; line-height: 1.4;">
<li>Orchestrated city-wide recruiting moving <strong>377</strong> candidates to registers with <strong>70%</strong> completion within <strong>45-day</strong> timeframe</li>
<li>Drove strategic partnership launching DDOT mechanic apprenticeship program targeting Detroit residents in 2015</li>
<li>Provided executive advisory maximizing human capital impact on organizational mission and value proposition</li>
</ul>
</div>

</div>
</div>

PAGE 2: Continue with remaining jobs, education section with navy header.

Return complete HTML in JSON format.`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('API Error:', errorData)
      return NextResponse.json({ error: 'Processing failed' }, { status: response.status })
    }

    const data = await response.json()
    const resultText = data.content[0].text
    const result = JSON.parse(resultText.replace(/```json\n?|\n?```/g, '').trim())

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      error: 'Processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
