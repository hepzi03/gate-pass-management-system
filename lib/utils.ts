import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string) {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function generateQRToken(studentId: string, leaveId: string): string {
  const timestamp = Date.now().toString()
  const randomString = Math.random().toString(36).substring(2, 15)
  return `${studentId}-${leaveId}-${timestamp}-${randomString}`
}

export function isValidQRToken(token: string): boolean {
  const parts = token.split('-')
  return parts.length === 4 && parts.every(part => part.length > 0)
}
