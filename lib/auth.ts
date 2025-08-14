import CredentialsProvider from 'next-auth/providers/credentials'
import dbConnect from '@/lib/db'
import { User } from '@/lib/models/user'
import { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('Auth: Missing credentials')
          return null
        }

        try {
          console.log('Auth: Attempting database connection...')
          await dbConnect()
          console.log('Auth: Database connected successfully')
          
          console.log('Auth: Looking for user with email:', credentials.email)
          const user = await User.findOne({ email: credentials.email }).select('+password')
          
          if (!user) {
            console.log('Auth: User not found')
            return null
          }

          console.log('Auth: User found, checking password...')
          const isPasswordValid = await user.comparePassword(credentials.password)
          
          if (!isPasswordValid) {
            console.log('Auth: Invalid password')
            return null
          }

          console.log('Auth: Authentication successful for user:', user.email)
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
            department: user.department,
            studentId: user.studentId,
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.department = user.department
        token.studentId = user.studentId
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.department = token.department as string
        session.user.studentId = token.studentId as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  jwt: {
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key',
}
