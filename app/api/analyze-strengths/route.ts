import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { strengths } = await request.json()

    const strengthsList = strengths.map((s: any, i: number) => `${i + 1}. ${s.description}`).join('\n')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `You are an expert career coach analyzing professional strengths. For each strength description below, identify:

1. Professional Competencies (Leadership, Strategic Thinking, Communication, Analytical Thinking, Emotional Intelligence, Problem Solving, Change Management, Coaching, Decision Making, etc.)
2. Neurodynamic Performance Indicators (High Performance Energy, Connectors, Transformers, Innovators, Rhythms)
3. Interview Positioning (how to articulate this professionally)

Strengths:
${strengthsList}

Return ONLY valid JSON (no markdown, no backticks):
{
  "strengths": [
    {
      "original": "user description",
      "competencies": ["Competency 1", "Competency 2", "Competency 3"],
      "neurodynamic": ["Indicator 1", "Indicator 2"],
      "positioning": "Professional statement",
      "development_tip": "Specific action"
    }
  ],
  "overall_profile": "2-3 sentence summary",
  "top_growth_area": "Key development recommendation"
}`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Anthropic API Error:', errorData)
      return NextResponse.json({ error: 'Anthropic API failed', details: errorData }, { status: response.status })
    }

    const data = await response.json()
    
    // Return the full Anthropic response (it has the structure the frontend expects)
    return NextResponse.json(data)

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json({ error: 'Analysis failed', message: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
