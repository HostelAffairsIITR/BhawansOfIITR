import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bhavans of IITR — IIT Roorkee Residential Halls',
  description: 'The official portal for residential halls (bhavans) of IIT Roorkee, established 1847. Explore hostels, events, notices, and campus life.',
  keywords: ['IIT Roorkee', 'IITR', 'Bhavans', 'Hostels', 'Student Life'],
  openGraph: {
    title: 'Bhavans of IITR',
    description: 'Official residential halls portal — IIT Roorkee',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-surface text-text antialiased">
        {children}
      </body>
    </html>
  )
}
