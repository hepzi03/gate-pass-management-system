import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db'
import { ScanLog } from '@/lib/models/scan-log'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'guard') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    // Fetch scan logs for this guard
    const scanLogs = await ScanLog.find({ 
      guardId: session.user.id 
    })
    .populate({
      path: 'leaveId',
      populate: {
        path: 'studentId',
        select: 'name studentId'
      }
    })
    .sort({ timestamp: -1 })
    .limit(100) // Limit to last 100 scans

    return NextResponse.json({ scanLogs })
  } catch (error) {
    console.error('Error fetching scan logs:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
