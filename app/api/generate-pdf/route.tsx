import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import ResumePDF from '@/components/ResumePDF'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const resumeData = await request.json()
    
    // Generate PDF buffer
    const pdfBuffer = await renderToBuffer(<ResumePDF data={resumeData} />)
    
    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer)
    
    // Return PDF
    return new NextResponse(uint8Array, {
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
