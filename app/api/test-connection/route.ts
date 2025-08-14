import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Check if environment variables are set
    const mongoUri = process.env.MONGODB_URI
    const nextAuthSecret = process.env.NEXTAUTH_SECRET
    const nextAuthUrl = process.env.NEXTAUTH_URL
    
    return NextResponse.json({ 
      success: true,
      message: 'Environment variables check',
      hasMongoUri: !!mongoUri,
      hasNextAuthSecret: !!nextAuthSecret,
      hasNextAuthUrl: !!nextAuthUrl,
      mongoUriPrefix: mongoUri ? mongoUri.substring(0, 20) + '...' : 'NOT SET',
      nextAuthUrl: nextAuthUrl || 'NOT SET'
    })
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
