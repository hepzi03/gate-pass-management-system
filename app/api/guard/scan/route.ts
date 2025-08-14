import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import { LeaveRequest } from '@/lib/models/leave-request'
import { ScanLog } from '@/lib/models/scan-log'
import { User } from '@/lib/models/user'
import { isValidQRToken } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'guard') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { qrToken } = await request.json()
    
    if (!qrToken) {
      return NextResponse.json({ error: 'QR token is required' }, { status: 400 })
    }

    await dbConnect()

    // Validate QR token format
    if (!isValidQRToken(qrToken)) {
      return NextResponse.json({
        success: false,
        message: 'Invalid QR token format',
        error: 'QR token format is invalid'
      })
    }

    // Find the leave request by QR token
    const leaveRequest = await LeaveRequest.findOne({ qrToken })
    if (!leaveRequest) {
      return NextResponse.json({
        success: false,
        message: 'QR token not found',
        error: 'No leave request found for this QR token'
      })
    }

    // Check if leave is approved
    if (leaveRequest.status !== 'approved') {
      return NextResponse.json({
        success: false,
        message: 'Leave request not approved',
        error: 'Leave request must be approved before scanning'
      })
    }

    // Check if leave dates are valid
    const now = new Date()
    if (now < leaveRequest.fromDate || now > leaveRequest.toDate) {
      return NextResponse.json({
        success: false,
        message: 'Leave period not active',
        error: 'QR code is only valid during the approved leave period'
      })
    }

    // Determine scan type based on current status
    let scanType: 'OUT' | 'IN'
    let message: string
    let isValid = true

    if (leaveRequest.scanStatus === 'not_scanned') {
      scanType = 'OUT'
      message = 'Student marked as OUT successfully'
      leaveRequest.scanStatus = 'out'
      leaveRequest.outTime = now
    } else if (leaveRequest.scanStatus === 'out') {
      scanType = 'IN'
      message = 'Student marked as IN (returned) successfully'
      leaveRequest.scanStatus = 'in'
      leaveRequest.inTime = now
    } else {
      return NextResponse.json({
        success: false,
        message: 'Student already returned',
        error: 'Student has already completed their leave cycle'
      })
    }

    // Get student information
    const student = await User.findById(leaveRequest.studentId)
    if (!student) {
      return NextResponse.json({
        success: false,
        message: 'Student not found',
        error: 'Student information not available'
      })
    }

    // Create scan log
    const scanLog = new ScanLog({
      leaveId: leaveRequest._id,
      guardId: session.user.id,
      scanType,
      qrToken,
      isValid,
      timestamp: now
    })

    await scanLog.save()
    await leaveRequest.save()

    return NextResponse.json({
      success: true,
      message,
      data: {
        studentName: student.name,
        studentId: student.studentId || 'N/A',
        fromDate: leaveRequest.fromDate,
        toDate: leaveRequest.toDate,
        scanType,
        leaveId: leaveRequest._id.toString()
      }
    })

  } catch (error) {
    console.error('Error processing scan:', error)
    return NextResponse.json({
      success: false,
      message: 'Internal server error',
      error: 'Failed to process scan'
    }, { status: 500 })
  }
}
