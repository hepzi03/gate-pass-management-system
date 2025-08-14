import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import { LeaveRequest } from '@/lib/models/leave-request'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'warden') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    // Fetch leave requests that have been approved by HOD and are pending Warden approval
    const leaveRequests = await LeaveRequest.find({
      'approvals.hod.status': 'approved',
      'approvals.warden.status': { $in: ['pending', 'approved', 'rejected'] }
    })
    .populate('studentId', 'name studentId')
    .sort({ createdAt: -1 })

    return NextResponse.json({ leaveRequests })
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
