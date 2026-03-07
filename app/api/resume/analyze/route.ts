import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { analyzeResume } from '@/lib/anthropic'
import { sendResumeAnalysisEmail } from '@/lib/email'
// @ts-ignore
import pdf from 'pdf-parse'

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { fileName, fileData } = await request.json()

    // Convert base64 to buffer
    const buffer = Buffer.from(fileData, 'base64')

    // Extract text from PDF
    const pdfData = await pdf(buffer)
    const resumeText = pdfData.text

    if (!resumeText || resumeText.trim().length < 100) {
      return NextResponse.json(
        { error: 'Could not extract text from PDF. Please ensure it\'s not a scanned image.' },
        { status: 400 }
      )
    }

    // Get target role from assessment (optional)
    const { data: assessment } = await supabase
      .from('assessments')
      .select('target_role')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Analyze resume with Claude
    const analysis = await analyzeResume(resumeText, assessment?.target_role)

    // Save to database
    const { data: resumeRecord } = await supabase
      .from('resumes')
      .insert({
        user_id: user.id,
        original_filename: fileName,
        file_text: resumeText,
        analysis_result: analysis,
        strengths: analysis.strengths,
        improvement_areas: analysis.improvement_areas,
        ats_score: analysis.ats_score,
        analysis_status: 'completed',
        analyzed_at: new Date().toISOString(),
      })
      .select()
      .single()

    // Send email notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    if (profile) {
      await sendResumeAnalysisEmail(
        profile.email,
        profile.full_name || 'there',
        analysis.ats_score,
        `${process.env.NEXT_PUBLIC_APP_URL}/modules/resume`
      )
    }

    return NextResponse.json({ analysis, resumeId: resumeRecord?.id })
    
  } catch (error: any) {
    console.error('Resume analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze resume' },
      { status: 500 }
    )
  }
}

// Increase timeout for Claude API call
export const maxDuration = 60 // 60 seconds
