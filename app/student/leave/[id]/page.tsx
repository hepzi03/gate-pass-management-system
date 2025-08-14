'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, CheckCircle, Clock, XCircle, QrCode } from 'lucide-react'
import Link from 'next/link'

interface LeaveRequest {
  _id: string
  fromDate: string
  toDate: string
  reason: string
  destination: string
  emergencyContact: string
  status: string
  qrToken?: string
  qrTokenExpiry?: string
  approvals: {
    advisor: { status: string; comment?: string; timestamp?: string }
    hod: { status: string; comment?: string; timestamp?: string }
    warden: { status: string; comment?: string; timestamp?: string }
  }
  createdAt: string
}

export default function LeaveRequestDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || session?.user?.role !== 'student') {
      router.push('/login')
      return
    }

    if (params.id) {
      fetchLeaveRequest(params.id as string)
    }
  }, [session, status, router, params.id])

  const fetchLeaveRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/student/leave-requests/${requestId}`)
      if (response.ok) {
        const data = await response.json()
        setLeaveRequest(data.leaveRequest)
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch leave request',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch leave request',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-600'
      case 'rejected':
        return 'text-red-600'
      case 'pending':
        return 'text-yellow-600'
      default:
        return 'text-gray-600'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  if (!leaveRequest) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Leave request not found</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/student/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Leave Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>Leave Request Details</CardTitle>
              <CardDescription>
                Information about your leave request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Status:</span>
                  <div className="flex items-center">
                    {getStatusIcon(leaveRequest.status)}
                    <span className={`ml-2 font-medium ${getStatusColor(leaveRequest.status)}`}>
                      {leaveRequest.status.charAt(0).toUpperCase() + leaveRequest.status.slice(1)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">From Date:</span>
                  <span className="font-medium">
                    {new Date(leaveRequest.fromDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">To Date:</span>
                  <span className="font-medium">
                    {new Date(leaveRequest.toDate).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Reason:</span>
                  <span className="font-medium max-w-xs text-right">
                    {leaveRequest.reason}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Destination:</span>
                  <span className="font-medium">
                    {leaveRequest.destination}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Emergency Contact:</span>
                  <span className="font-medium">
                    {leaveRequest.emergencyContact}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium">
                    {new Date(leaveRequest.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t pt-4">
                <div className="flex space-x-2">
                  {leaveRequest.status === 'approved' && leaveRequest.qrToken && (
                    <Link href={`/student/leave/${leaveRequest._id}/qr`} className="flex-1">
                      <Button className="w-full">
                        <QrCode className="h-4 w-4 mr-2" />
                        View QR Code
                      </Button>
                    </Link>
                  )}
                  <Link href="/student/dashboard" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Status */}
          <Card>
            <CardHeader>
              <CardTitle>Approval Status</CardTitle>
              <CardDescription>
                Current status of your leave request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Advisor:</span>
                  <div className="flex items-center">
                    {getStatusIcon(leaveRequest.approvals.advisor.status)}
                    <span className={`ml-2 text-sm font-medium ${getStatusColor(leaveRequest.approvals.advisor.status)}`}>
                      {leaveRequest.approvals.advisor.status.charAt(0).toUpperCase() + leaveRequest.approvals.advisor.status.slice(1)}
                    </span>
                  </div>
                </div>

                {leaveRequest.approvals.advisor.comment && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <span className="font-medium">Comment:</span> {leaveRequest.approvals.advisor.comment}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">HOD:</span>
                  <div className="flex items-center">
                    {getStatusIcon(leaveRequest.approvals.hod.status)}
                    <span className={`ml-2 text-sm font-medium ${getStatusColor(leaveRequest.approvals.hod.status)}`}>
                      {leaveRequest.approvals.hod.status.charAt(0).toUpperCase() + leaveRequest.approvals.hod.status.slice(1)}
                    </span>
                  </div>
                </div>

                {leaveRequest.approvals.hod.comment && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <span className="font-medium">Comment:</span> {leaveRequest.approvals.hod.comment}
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Warden:</span>
                  <div className="flex items-center">
                    {getStatusIcon(leaveRequest.approvals.warden.status)}
                    <span className={`ml-2 text-sm font-medium ${getStatusColor(leaveRequest.approvals.warden.status)}`}>
                      {leaveRequest.approvals.warden.status.charAt(0).toUpperCase() + leaveRequest.approvals.warden.status.slice(1)}
                    </span>
                  </div>
                </div>

                {leaveRequest.approvals.warden.comment && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    <span className="font-medium">Comment:</span> {leaveRequest.approvals.warden.comment}
                  </div>
                )}
              </div>

              {/* Next Steps */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-2">Next Steps</h4>
                {leaveRequest.status === 'pending' && (
                  <p className="text-sm text-gray-600">
                    Your request is currently under review. You'll be notified once it's approved or rejected.
                  </p>
                )}
                {leaveRequest.status === 'approved' && (
                  <p className="text-sm text-green-600">
                    🎉 Your leave request has been approved! You can now view and download your QR code.
                  </p>
                )}
                {leaveRequest.status === 'rejected' && (
                  <p className="text-sm text-red-600">
                    Your leave request was not approved. Please check the comments above for more details.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
