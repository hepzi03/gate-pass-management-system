import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import { User } from '@/lib/models/user'

export async function GET() {
  try {
    console.log('Test DB: Attempting connection...')
    await dbConnect()
    console.log('Test DB: Connected successfully')
    
    const users = await User.find({}).select('email role name -_id')
    console.log('Test DB: Found users:', users)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connected successfully',
      userCount: users.length,
      users: users
    })
  } catch (error) {
    console.error('Test DB Error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
