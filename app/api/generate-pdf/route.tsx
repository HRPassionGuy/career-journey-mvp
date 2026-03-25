import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import ResumePDF from '@/components/ResumePDF'
import React from 'react'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(request: NextRequest) {
  try {
    const resumeData = await request.json()
    
    const pdfBuffer = await renderToBuffer(
      React.createElement(ResumePDF, { data: resumeData })
    )
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="resume.pdf"',
      },
    })
    
  } catch (error: any) {
    console.error('PDF generation error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
