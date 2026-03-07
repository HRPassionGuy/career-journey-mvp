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
  
  const prompt = `You are an expert resume reviewer and career coach. Analyze this resume and provide detailed, actionable feedback.

${targetRole ? `Target Role: ${targetRole}\n\n` : ''}Resume Content:
${resumeText}

Provide your analysis in the following JSON format:

{
  "overall_assessment": "2-3 sentence summary of the resume's effectiveness",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvement_areas": ["area 1", "area 2", "area 3"],
  "ats_score": 75,
  "specific_recommendations": {
    "format": ["recommendation 1", "recommendation 2"],
    "content": ["recommendation 1", "recommendation 2"],
    "keywords": ["keyword 1", "keyword 2", "keyword 3"]
  },
  "rewritten_sections": {
    "professional_summary": "Rewritten summary if current one is weak",
    "experience_bullets": ["Rewritten bullet 1", "Rewritten bullet 2"]
  }
}

Focus on:
1. ATS compatibility (formatting, keywords, structure)
2. Impact-driven language (quantified achievements)
3. Relevance to target role (if specified)
4. Professional presentation
5. Common mistakes (typos, inconsistencies, gaps)

Be specific and actionable in your recommendations.`

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
