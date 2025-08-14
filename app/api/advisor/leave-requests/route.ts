import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import { LeaveRequest } from '@/lib/models/leave-request'
import { User } from '@/lib/models/user'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'advisor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Advisor API: Connecting to database...')
    await dbConnect()
    console.log('Advisor API: Database connected successfully')
    
    // Get advisor's assigned students
    const advisor = await User.findById(session.user.id)
    console.log('Advisor API: Found advisor:', advisor?.name, 'with assigned students:', advisor?.assignedStudents)
    
    if (!advisor || !advisor.assignedStudents || advisor.assignedStudents.length === 0) {
      console.log('Advisor API: No assigned students found')
      return NextResponse.json({ leaveRequests: [] })
    }

    // Convert string IDs to ObjectIds if needed
    const studentIds = advisor.assignedStudents.map(id => 
      typeof id === 'string' ? id : id.toString()
    )
    
    console.log('Advisor API: Looking for leave requests from students:', studentIds)

    // Fetch leave requests from assigned students
    const leaveRequests = await LeaveRequest.find({
      studentId: { $in: studentIds }
    })
    .populate('studentId', 'name studentId email')
    .sort({ createdAt: -1 })

    console.log('Advisor API: Found leave requests:', leaveRequests.length)
    
    return NextResponse.json({ leaveRequests })
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}
