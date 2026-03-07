import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { sendAssessmentResultsEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { userId, breakthroughType } = await request.json()

    const supabase = await createServerSupabaseClient()

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name')
      .eq('id', userId)
      .single()

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Send email
    await sendAssessmentResultsEmail(
      profile.email,
      profile.full_name || 'there',
      breakthroughType,
      `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`
    )

    return NextResponse.json({ success: true })
    
  } catch (error: any) {
    console.error('Email send error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
