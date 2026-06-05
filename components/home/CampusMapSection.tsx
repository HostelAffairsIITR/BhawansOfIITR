'use client'
import dynamic from 'next/dynamic'

const LeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[480px] bg-surface flex flex-col items-center justify-center gap-4 relative overflow-hidden">
      {/* Grid Pattern */}
      <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="loading-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e5e5" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#loading-grid)" />
      </svg>

      <div className="relative z-10 flex flex-col items-center gap-2">
        <svg className="animate-spin h-8 w-8 text-brand-muted" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="text-xs font-bold uppercase tracking-wider text-text-muted mt-2">Loading Map...</p>
      </div>
    </div>
  )
})

export default function CampusMapSection() {
  return (
    <section id="campus-map" className="py-14 sm:py-20 bg-surface/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2
            className="text-3xl sm:text-4xl text-brand tracking-wide uppercase"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
          >
            OUR CAMPUS
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Minimalist interactive map of the IIT Roorkee hostels and navigation pathways
          </p>
        </div>

        {/* Map Container */}
        <div className="w-full border border-border bg-surface-raised rounded-2xl relative overflow-hidden shadow-sm min-h-[480px]">
          <LeafletMap />
        </div>
      </div>
    </section>
  )
}

