import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db'
import { LeaveRequest } from '@/lib/models/leave-request'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'hod') {
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

    // Find the leave request
    const leaveRequest = await LeaveRequest.findById(params.id)
    if (!leaveRequest) {
      return NextResponse.json({ error: 'Leave request not found' }, { status: 404 })
    }

    // Check if advisor has approved
    if (leaveRequest.approvals.advisor.status !== 'approved') {
      return NextResponse.json({ error: 'Advisor must approve first' }, { status: 400 })
    }

    // Update the HOD approval status - map actions to correct enum values
    const statusValue = action === 'approve' ? 'approved' : 'rejected'
    leaveRequest.approvals.hod = {
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
