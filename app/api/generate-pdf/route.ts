import { NextRequest, NextResponse } from 'next/server'
import ReactPDF from '@react-pdf/renderer'
import ResumePDF from '@/components/ResumePDF'
import React from 'react'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const resumeData = await request.json()
    
    // Generate PDF
    const pdfStream = await ReactPDF.renderToStream(
      React.createElement(ResumePDF, { data: resumeData })
    )
    
    // Convert stream to buffer
    const chunks: Buffer[] = []
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk))
    }
    const pdfBuffer = Buffer.concat(chunks)
    
    // Return PDF
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
