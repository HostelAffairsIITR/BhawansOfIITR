import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Bhawans of IITR — IIT Roorkee Residential Halls',
  description: 'The official portal for residential halls (bhawans) of IIT Roorkee, established 1847. Explore hostels, events, notices, and campus life.',
  keywords: ['IIT Roorkee', 'IITR', 'Bhawans', 'Hostels', 'Student Life'],
  openGraph: {
    title: 'Bhawans of IITR',
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
