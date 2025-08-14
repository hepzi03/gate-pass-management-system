import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db'
import { LeaveRequest } from '@/lib/models/leave-request'
import { User } from '@/lib/models/user'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'advisor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    // Get advisor's assigned students
    const advisor = await User.findById(session.user.id)
    if (!advisor || !advisor.assignedStudents) {
      return NextResponse.json({ leaveRequests: [] })
    }

    // Fetch leave requests from assigned students
    const leaveRequests = await LeaveRequest.find({
      studentId: { $in: advisor.assignedStudents }
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
