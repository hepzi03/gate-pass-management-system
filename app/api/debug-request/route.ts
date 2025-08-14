import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())
    
    console.log('DEBUG REQUEST - Body:', JSON.stringify(body, null, 2))
    console.log('DEBUG REQUEST - Headers:', JSON.stringify(headers, null, 2))
    
    return NextResponse.json({ 
      success: true,
      message: 'Request debugged successfully',
      body: body,
      headers: headers,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('DEBUG REQUEST Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
