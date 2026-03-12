import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ResumeAnalysis {
  overall_assessment: string
  strengths: string[]
  improvement_areas: string[]
  ats_score: number
  specific_recommendations: {
    format: string[]
    content: string[]
    keywords: string[]
  }
  rewritten_sections?: {
    professional_summary?: string
    experience_bullets?: string[]
  }
}

export async function analyzeResume(
  resumeText: string,
  targetRole?: string
): Promise<ResumeAnalysis> {
  
  const prompt = `You are Marcus Holmes, "The HR Passion Guy" - an expert career coach with 27 years of HR experience. You specialize in transforming resumes that get results.

## YOUR CORE PHILOSOPHY:
"Your resume is your story; you must tell it well, but in their words."

The best resumes do ONE thing exceptionally well: they prove you can OWN OUTCOMES, not just execute tasks.

## WHY RESUMES FAIL:
❌ No evidence of impact
❌ No credible results  
❌ Passive language - "responsible for" vs. "drove", "led", "achieved"
❌ Generic AI slop and fluffy clichés
❌ Missing clear, concise language and tangible metrics

## YOUR JOB:
Transform this resume to talk like an OWNER, not a task-doer.

## RESUME TO ANALYZE:
${resumeText}

${targetRole ? `## TARGET ROLE: ${targetRole}\n` : ''}

## REQUIRED OUTPUT FORMAT (JSON):

Return ONLY valid JSON (no markdown, no backticks) with this exact structure:

{
  "overall_assessment": "2-3 sentence summary of resume's current effectiveness",
  "strengths": [
    "Specific strength 1 with example",
    "Specific strength 2 with example", 
    "Specific strength 3 with example"
  ],
  "improvement_areas": [
    "Specific weakness 1 with fix",
    "Specific weakness 2 with fix",
    "Specific weakness 3 with fix"
  ],
  "ats_score": 75,
  "specific_recommendations": {
    "format": [
      "Specific formatting fix 1",
      "Specific formatting fix 2"
    ],
    "content": [
      "Specific content improvement 1 with example",
      "Specific content improvement 2 with example"
    ],
    "keywords": [
      "Missing keyword 1 for target role",
      "Missing keyword 2 for target role",
      "Missing keyword 3 for target role"
    ]
  },
  "rewritten_professional_summary": "2-3 sentence powerful summary in THIRD PERSON that leads with expertise level, years of experience, industry/market specifics, and ONE quantified achievement. Example: 'High-caliber business executive with 15+ years driving $500M+ revenue growth in FinTech. Recognized for building ambitious teams and salvaging underperforming client relationships worth $100M+.'",
  "rewritten_experience_bullets": [
    "• Led team of 30 to achieve 150% revenue growth ($192M to $450M) over 3 years through strategic client partnerships and technology transformation.",
    "• Architected loan origination system processing $3B in CARES Act loans, delivering scalable solution in record 20 days.",
    "• Transformed underperforming $96M client relationship into diamond account by rebuilding trust through transparency and accountability."
  ]
}

## CRITICAL RULES:
1. Every bullet MUST start with action verb showing ownership: Led, Drove, Architected, Transformed, Delivered
2. Every bullet MUST include quantified impact (numbers, %, $, time)
3. NEVER use: "assisted", "responsible for", "helped", "supported", "participated"
4. Focus on OUTCOMES over tasks
5. Use power verbs: Spearheaded, Orchestrated, Revolutionized, Propelled, Catalyzed
6. Keep bullets to 2 lines maximum
7. Third-person voice for summary (no "I")

Analyze this resume and return the JSON with your expert recommendations.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    // Extract JSON from response (Claude might wrap it in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse resume analysis response')
    }

    const analysis: ResumeAnalysis = JSON.parse(jsonMatch[0])
    
    return analysis

  } catch (error) {
    console.error('Resume analysis error:', error)
    throw new Error('Failed to analyze resume. Please try again.')
  }
}

// Generate interview questions for Inner Vue tool
export async function generateInterviewQuestions(
  jobTitle: string,
  companyName?: string,
  sessionType: 'behavioral' | 'technical' | 'executive' = 'behavioral',
  count: number = 10
): Promise<string[]> {
  
  const prompt = `Generate ${count} realistic ${sessionType} interview questions for a ${jobTitle} position${companyName ? ` at ${companyName}` : ''}.

Questions should be:
- Specific and realistic for this role level
- Mix of easy, medium, and challenging
- Relevant to current industry trends
- Likely to appear in real interviews

Return ONLY a JSON array of questions, no other text:
["Question 1?", "Question 2?", ...]`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Failed to parse interview questions')
    }

    const questions: string[] = JSON.parse(jsonMatch[0])
    
    return questions

  } catch (error) {
    console.error('Question generation error:', error)
    throw new Error('Failed to generate interview questions')
  }
}

// Evaluate interview answer
export async function evaluateInterviewAnswer(
  question: string,
  answer: string,
  jobTitle: string
): Promise<{
  score: number
  feedback: string
  suggestions: string[]
}> {
  
  const prompt = `You are interviewing a candidate for a ${jobTitle} position.

Question: ${question}

Candidate's Answer: ${answer}

Evaluate this answer and provide:
1. Score (0-100)
2. Specific feedback on what they did well and what could improve
3. 2-3 concrete suggestions for a stronger answer

Return JSON:
{
  "score": 75,
  "feedback": "Your answer demonstrates...",
  "suggestions": ["Try adding...", "Consider mentioning..."]
}`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const responseText = message.content[0].type === 'text' 
      ? message.content[0].text 
      : ''

    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Failed to parse evaluation response')
    }

    return JSON.parse(jsonMatch[0])

  } catch (error) {
    console.error('Answer evaluation error:', error)
    throw new Error('Failed to evaluate answer')
  }
}
