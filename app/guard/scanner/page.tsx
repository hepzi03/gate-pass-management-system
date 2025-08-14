'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft, Camera, CheckCircle, XCircle, AlertTriangle, QrCode } from 'lucide-react'
import Link from 'next/link'
import { Html5QrcodeScanner } from 'html5-qrcode'

interface ScanResult {
  success: boolean
  message: string
  data?: {
    studentName: string
    studentId: string
    fromDate: string
    toDate: string
    scanType: 'OUT' | 'IN'
    leaveId: string
  }
  error?: string
}

export default function QRScannerPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState<ScanResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const scannerRef = useRef<Html5QrcodeScanner | null>(null)
  const scannerContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated' || session?.user?.role !== 'guard') {
      router.push('/login')
      return
    }
  }, [session, status, router])

  const startScanner = () => {
    if (scannerContainerRef.current && !scannerRef.current) {
      try {
        scannerRef.current = new Html5QrcodeScanner(
          "qr-reader",
          { 
            fps: 10, 
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0
          },
          false
        )

        scannerRef.current.render(
          (decodedText) => {
            handleScan(decodedText)
          },
          (error) => {
            // Handle scan errors silently
            console.log('Scan error:', error)
          }
        )

        setIsScanning(true)
        setScanResult(null)
      } catch (error) {
        toast({
          title: 'Scanner Error',
          description: 'Failed to start QR scanner',
          variant: 'destructive',
        })
      }
    }
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear()
      scannerRef.current = null
    }
    setIsScanning(false)
  }

  const handleScan = async (qrData: string) => {
    if (isProcessing) return
    
    setIsProcessing(true)
    setScanResult(null)

    try {
      const response = await fetch('/api/guard/scan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qrToken: qrData }),
      })

      const result = await response.json()
      setScanResult(result)

      if (result.success) {
        toast({
          title: 'Scan Successful',
          description: result.message,
        })
        // Stop scanner after successful scan
        stopScanner()
      } else {
        toast({
          title: 'Scan Failed',
          description: result.error || 'Invalid QR code',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process scan',
        variant: 'destructive',
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Simulate QR code scanning for demo purposes
  const simulateScan = () => {
    const demoQRData = `demo-student-123-demo-leave-456-${Date.now()}-demo-token`
    handleScan(demoQRData)
  }

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link href="/guard/dashboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Scanner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="h-5 w-5 mr-2" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Scan student QR codes to record entry/exit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isScanning ? (
                <div className="text-center py-8">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <Camera className="h-16 w-16 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-4">Camera is not active</p>
                  <Button onClick={startScanner} className="w-full">
                    <Camera className="h-4 w-4 mr-2" />
                    Start Scanner
                  </Button>
                  <Button 
                    onClick={simulateScan} 
                    variant="outline" 
                    className="w-full mt-2"
                    disabled={isProcessing}
                  >
                    Simulate Scan (Demo)
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative">
                    <div 
                      ref={scannerContainerRef}
                      id="qr-reader"
                      className="w-full"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={stopScanner} variant="outline" className="flex-1">
                      Stop Scanner
                    </Button>
                    <Button 
                      onClick={simulateScan} 
                      variant="outline" 
                      className="flex-1"
                      disabled={isProcessing}
                    >
                      Simulate Scan
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle>Scan Results</CardTitle>
              <CardDescription>
                Latest scan information and status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!scanResult ? (
                <div className="text-center py-8 text-gray-500">
                  <QrCode className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>No scan results yet</p>
                  <p className="text-sm">Scan a QR code to see results here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg ${
                    scanResult.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-center mb-2">
                      {scanResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-2" />
                      )}
                      <span className={`font-medium ${
                        scanResult.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {scanResult.success ? 'Scan Successful' : 'Scan Failed'}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      scanResult.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {scanResult.message}
                    </p>
                  </div>

                  {scanResult.data && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3">Student Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Name:</span>
                          <span className="font-medium">{scanResult.data.studentName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Student ID:</span>
                          <span className="font-medium">{scanResult.data.studentId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Leave Period:</span>
                          <span className="font-medium">
                            {new Date(scanResult.data.fromDate).toLocaleDateString()} - {new Date(scanResult.data.toDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Scan Type:</span>
                          <span className={`font-medium px-2 py-1 rounded text-xs ${
                            scanResult.data.scanType === 'OUT' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {scanResult.data.scanType}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {scanResult.error && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <div className="flex items-center mb-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500 mr-2" />
                        <span className="font-medium text-yellow-800">Error Details</span>
                      </div>
                      <p className="text-sm text-yellow-700">{scanResult.error}</p>
                    </div>
                  )}

                  <Button 
                    onClick={() => setScanResult(null)} 
                    variant="outline" 
                    className="w-full"
                  >
                    Clear Results
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
