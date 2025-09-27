import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KhaledAun Admin',
  description: 'Admin dashboard for KhaledAun.com',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}