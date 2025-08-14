'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.role) {
      const role = session.user.role
      switch (role) {
        case 'student':
          router.push('/student/dashboard')
          break
        case 'advisor':
          router.push('/advisor/dashboard')
          break
        case 'hod':
          router.push('/hod/dashboard')
          break
        case 'warden':
          router.push('/warden/dashboard')
          break
        case 'guard':
          router.push('/guard/dashboard')
          break
        default:
          router.push('/login')
      }
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading...</p>
      </div>
    </div>
  )
}
