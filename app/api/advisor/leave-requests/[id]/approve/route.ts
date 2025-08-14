import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import { LeaveRequest } from '@/lib/models/leave-request'
import { User } from '@/lib/models/user'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'advisor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action, comment } = await request.json()
    
    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' }, 
        { status: 400 }
      )
    }

    await dbConnect()

    // Get advisor's assigned students
    const advisor = await User.findById(session.user.id)
    if (!advisor || !advisor.assignedStudents) {
      return NextResponse.json({ error: 'No students assigned' }, { status: 400 })
    }

    // Find the leave request and verify it belongs to an assigned student
    const leaveRequest = await LeaveRequest.findById(params.id)
    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    if (!advisor.assignedStudents.includes(leaveRequest.studentId)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Update the approval status - map actions to correct enum values
    const statusValue = action === 'approve' ? 'approved' : 'rejected'
    leaveRequest.approvals.advisor = {
      status: statusValue,
      comment: comment || undefined,
      timestamp: new Date()
    }

    // If rejected, update overall status
    if (action === 'reject') {
      leaveRequest.status = 'rejected'
    }

    await leaveRequest.save()

    return NextResponse.json({ 
      message: `Leave request ${action}d successfully`,
      leaveRequest 
    })
  } catch (error) {
    console.error('Error updating leave request:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
