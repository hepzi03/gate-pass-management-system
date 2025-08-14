import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/lib/db'
import { LeaveRequest } from '@/lib/models/leave-request'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    
    const leaveRequests = await LeaveRequest.find({ 
      studentId: session.user.id 
    }).sort({ createdAt: -1 })

    return NextResponse.json({ leaveRequests })
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { fromDate, toDate, reason, destination, emergencyContact, attachment } = body

    // Validation
    if (!fromDate || !toDate || !reason || !destination || !emergencyContact) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Check if fromDate is not in the past
    if (new Date(fromDate) < new Date()) {
      return NextResponse.json(
        { error: 'From date cannot be in the past' }, 
        { status: 400 }
      )
    }

    // Check if toDate is after fromDate
    if (new Date(toDate) <= new Date(fromDate)) {
      return NextResponse.json(
        { error: 'To date must be after from date' }, 
        { status: 400 }
      )
    }

    await dbConnect()

    // Create new leave request
    const leaveRequest = new LeaveRequest({
      studentId: session.user.id,
      fromDate: new Date(fromDate),
      toDate: new Date(toDate),
      reason,
      destination,
      emergencyContact,
      attachment: attachment || undefined,
      status: 'pending',
      approvals: {
        advisor: { status: 'pending' },
        hod: { status: 'pending' },
        warden: { status: 'pending' }
      }
    })

    await leaveRequest.save()

    return NextResponse.json({ 
      message: 'Leave request created successfully',
      leaveRequest 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating leave request:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
