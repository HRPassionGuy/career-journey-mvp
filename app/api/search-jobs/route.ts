import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { resumeAnalysis, targetTitle, location, salary } = await request.json()
    
    // Build search query
    const searchQuery = `${targetTitle} ${location}`
    
    // Call JSearch API
    const response = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(searchQuery)}&num_pages=1`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
          'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
        }
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('JSearch API Error:', errorData)
      return NextResponse.json({ error: 'Job search failed' }, { status: response.status })
    }

    const data = await response.json()
    
    if (!data.data || data.data.length === 0) {
      return NextResponse.json({ 
        jobs: [],
        message: 'No jobs found for this search'
      })
    }

    // Transform JSearch results to our format
    const jobs = data.data.slice(0, 15).map((job: any, index: number) => ({
      title: job.job_title || 'Unknown Title',
      company: job.employer_name || 'Unknown Company',
      location: job.job_city && job.job_state 
        ? `${job.job_city}, ${job.job_state}` 
        : job.job_country || 'Remote',
      posting_date: job.job_posted_at_datetime_utc?.split('T')[0] || new Date().toISOString().split('T')[0],
      match_score: 10 - index, // Simple scoring: first results get higher scores
      summary: job.job_description?.substring(0, 200) || 'No description available',
      link: job.job_apply_link || job.job_google_link || '#'
    }))

    return NextResponse.json({ jobs })

  } catch (error) {
    console.error('Job Search API Error:', error)
    return NextResponse.json({ 
      error: 'Job search failed', 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
