import { NextRequest, NextResponse } from 'next/server'
// @ts-ignore
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    const { fileData, fileName, targetTitle, location } = await request.json()
    
    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64')
    
    // Extract text from PDF
    let resumeText = ''
    
    if (fileName.toLowerCase().endsWith('.pdf')) {
      const pdfData = await pdf(buffer)
      resumeText = pdfData.text
    } else {
      // For .txt, .doc, .docx files
      resumeText = buffer.toString('utf-8')
    }
    
    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json({
        error: 'Could not extract text from file. Please ensure it\'s not a scanned image or password-protected.'
      }, { status: 400 })
    }
    
    // Call Anthropic API
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
          content: `Analyze this resume for a ${targetTitle} role in ${location}.

RESUME:
${resumeText}

Provide:
1. Key strengths
2. Areas for improvement
3. Recommended keywords for ${targetTitle}
4. Target roles this resume qualifies for

Return ONLY valid JSON (no markdown):
{
  "key_strengths": ["strength 1", "strength 2", "strength 3"],
  "areas_for_improvement": ["area 1", "area 2", "area 3"],
  "recommended_keywords": ["keyword 1", "keyword 2", "keyword 3"],
  "target_roles": ["role 1", "role 2", "role 3"],
  "summary": "2-3 sentence overall assessment"
}`
        }]
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Anthropic API Error:', errorData)
      return NextResponse.json({ error: 'Analysis failed' }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)

  } catch (error) {
    console.error('Resume Analysis API Error:', error)
    return NextResponse.json({ 
      error: 'Analysis failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
