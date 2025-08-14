'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, QrCode, Download, CheckCircle, Clock, XCircle } from 'lucide-react'
import Link from 'next/link'
import QRCode from 'qrcode'

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

export default function QRCodePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()
  const [leaveRequest, setLeaveRequest] = useState<LeaveRequest | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('')

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
        
        // Generate QR code if approved
        if (data.leaveRequest.qrToken) {
          generateQRCode(data.leaveRequest.qrToken)
        }
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

  const generateQRCode = async (qrToken: string) => {
    try {
      const qrDataUrl = await QRCode.toDataURL(qrToken, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeDataUrl(qrDataUrl)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate QR code',
        variant: 'destructive',
      })
    }
  }

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a')
      link.download = `leave-pass-${leaveRequest?._id}.png`
      link.href = qrCodeDataUrl
      link.click()
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
          {/* QR Code Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <QrCode className="h-5 w-5 mr-2" />
                Leave Pass QR Code
              </CardTitle>
              <CardDescription>
                Scan this QR code at the gate for entry/exit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {leaveRequest.status === 'approved' && leaveRequest.qrToken ? (
                <div className="text-center">
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <img 
                      src={qrCodeDataUrl} 
                      alt="QR Code" 
                      className="w-64 h-64 mx-auto"
                    />
                  </div>
                  <div className="mt-4 space-y-2">
                    <Button onClick={downloadQRCode} className="w-full">
                      <Download className="h-4 w-4 mr-2" />
                      Download QR Code
                    </Button>
                    <p className="text-sm text-gray-500">
                      Show this QR code to the guard when leaving and returning
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <QrCode className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-2">
                    {leaveRequest.status === 'pending' 
                      ? 'QR Code will be available after approval' 
                      : 'QR Code not available'
                    }
                  </p>
                  <p className="text-sm text-gray-400">
                    Current status: {leaveRequest.status}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

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
              </div>

              {/* Approval Status */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Approval Status</h4>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Advisor:</span>
                    <div className="flex items-center">
                      {getStatusIcon(leaveRequest.approvals.advisor.status)}
                      <span className={`ml-2 text-sm font-medium ${getStatusColor(leaveRequest.approvals.advisor.status)}`}>
                        {leaveRequest.approvals.advisor.status.charAt(0).toUpperCase() + leaveRequest.approvals.advisor.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">HOD:</span>
                    <div className="flex items-center">
                      {getStatusIcon(leaveRequest.approvals.hod.status)}
                      <span className={`ml-2 text-sm font-medium ${getStatusColor(leaveRequest.approvals.hod.status)}`}>
                        {leaveRequest.approvals.hod.status.charAt(0).toUpperCase() + leaveRequest.approvals.hod.status.slice(1)}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Warden:</span>
                    <div className="flex items-center">
                      {getStatusIcon(leaveRequest.approvals.warden.status)}
                      <span className={`ml-2 text-sm font-medium ${getStatusColor(leaveRequest.approvals.warden.status)}`}>
                        {leaveRequest.approvals.warden.status.charAt(0).toUpperCase() + leaveRequest.approvals.warden.status.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {leaveRequest.qrToken && (
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">QR Token</h4>
                  <p className="text-xs text-gray-500 break-all">
                    {leaveRequest.qrToken}
                  </p>
                  {leaveRequest.qrTokenExpiry && (
                    <p className="text-xs text-gray-500 mt-1">
                      Expires: {new Date(leaveRequest.qrTokenExpiry).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
