import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import { LeaveRequest } from '@/lib/models/leave-request'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('GET Leave Requests: Connecting to database...')
    await dbConnect()
    console.log('GET Leave Requests: Database connected successfully')
    
    const leaveRequests = await LeaveRequest.find({ 
      studentId: session.user.id 
    }).sort({ createdAt: -1 })

    console.log(`GET Leave Requests: Found ${leaveRequests.length} requests`)
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
    console.log('POST Leave Request: Starting...')
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'student') {
      console.log('POST Leave Request: Unauthorized - no session or wrong role')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('POST Leave Request: Session validated for user:', session.user.email)
    const body = await request.json()
    const { fromDate, toDate, reason, destination, emergencyContact, attachment } = body

    console.log('POST Leave Request: Request body:', { fromDate, toDate, reason, destination, emergencyContact })

    // Validation
    if (!fromDate || !toDate || !reason || !destination || !emergencyContact) {
      console.log('POST Leave Request: Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Check if fromDate is not in the past
    if (new Date(fromDate) < new Date()) {
      console.log('POST Leave Request: From date is in the past')
      return NextResponse.json(
        { error: 'From date cannot be in the past' }, 
        { status: 400 }
      )
    }

    // Check if toDate is after fromDate
    if (new Date(toDate) <= new Date(fromDate)) {
      console.log('POST Leave Request: To date must be after from date')
      return NextResponse.json(
        { error: 'To date must be after from date' }, 
        { status: 400 }
      )
    }

    console.log('POST Leave Request: Connecting to database...')
    await dbConnect()
    console.log('POST Leave Request: Database connected successfully')

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

    console.log('POST Leave Request: Saving to database...')
    await leaveRequest.save()
    console.log('POST Leave Request: Successfully saved with ID:', leaveRequest._id)

    return NextResponse.json({ 
      message: 'Leave request created successfully',
      leaveRequest 
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating leave request:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}
