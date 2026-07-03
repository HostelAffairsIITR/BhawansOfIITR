'use client'
import { useState, useEffect } from 'react'
import { BhawanTheme, Amenity } from '@/lib/types'

const AMENITIES: Amenity[] = [
  {
    id: 'gym',
    name: 'Gym',
    icon: '🏋️',
    description: 'Fully equipped gymnasium with free weights, machines, and cardio equipment.',
    timing: '5:30 AM – 8:00 AM · 6:00 PM – 9:00 PM',
    details: ['Free weights & barbells', 'Cardio machines', 'Resistance machines', 'Open 7 days a week'],
    image_url: null,
  },
  {
    id: 'canteen',
    name: 'Canteen',
    icon: '🍽️',
    description: 'Bhawan mess and attached canteen serving breakfast, lunch, and dinner daily.',
    timing: 'Mess: 7:30 AM – 9:00 PM · Canteen: 8:00 AM – 11:00 PM',
    details: ['Subsidised mess meals', 'À la carte canteen', 'Special Sunday menu', 'Dietary options available'],
    image_url: null,
  },
  {
    id: 'laundry',
    name: 'Laundry',
    icon: '👕',
    description: 'Coin-operated washing machines and dryers on the ground floor.',
    timing: '6:00 AM – 10:00 PM daily',
    details: ['8 washing machines', '4 dryers', 'Ironing stations', 'Detergent available at office'],
    image_url: null,
  },
  {
    id: 'study-room',
    name: 'Study Room',
    icon: '📚',
    description: '24/7 air-conditioned study room with individual carrels and group tables.',
    timing: 'Open 24 hours',
    details: ['60 individual seats', '4 group tables', 'High-speed Wi-Fi', 'Whiteboards available'],
    image_url: null,
  },
  {
    id: 'common-room',
    name: 'Common Room',
    icon: '🎮',
    description: 'Recreation room with TV, table tennis, carrom, chess, and indoor games.',
    timing: '9:00 AM – 11:00 PM',
    details: ['55-inch smart TV', 'Table tennis table', 'Carrom & chess', 'Board games collection'],
    image_url: null,
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    icon: '📡',
    description: 'High-speed campus Wi-Fi throughout the bhawan — all rooms and common areas.',
    timing: '24/7',
    details: ['100 Mbps per user', 'All rooms covered', 'Wired LAN available', 'IITR campus network'],
    image_url: null,
  },
]

export default function AmenitiesSection({ 
  theme, 
  bhawanSlug 
}: { 
  theme: BhawanTheme
  bhawanSlug: string 
}) {
  const [activeId, setActiveId] = useState<string>(AMENITIES[0].id)
  const [imgError, setImgError] = useState(false)

  const active = AMENITIES.find(a => a.id === activeId)!

  // Reset image error state when active tab or hostel changes
  useEffect(() => {
    setImgError(false)
  }, [activeId, bhawanSlug])

  return (
    <section id="amenities" className="py-14 sm:py-20 border-b border-border bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl text-brand tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
            Amenities
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Facilities and services available within the hostel premises
          </p>
        </div>

        {/* Tab row — scrollable on mobile */}
        <div className="flex overflow-x-auto scroll-hidden gap-2 pb-4 mb-6">
          {AMENITIES.map((a) => {
            const isActive = a.id === activeId
            return (
              <button
                key={a.id}
                onClick={() => setActiveId(a.id)}
                className={`flex-shrink-0 flex items-center gap-3 px-5 py-3 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer shadow-xs border
                  ${isActive ? 'text-white' : 'bg-surface-raised border-border text-text hover:bg-surface-muted hover:border-border-strong'}
                `}
                style={{
                  fontFamily: 'var(--font-sans)',
                  backgroundColor: isActive ? theme.primary : undefined,
                  borderColor: isActive ? theme.primary : undefined,
                }}
              >
                <span className="text-lg" aria-hidden>{a.icon}</span>
                <span>{a.name}</span>
              </button>
            )
          })}
        </div>

        {/* Content panel */}
        <div className="rounded-2xl border border-border bg-surface-raised overflow-hidden flex flex-col md:flex-row shadow-sm">
          {/* Left side (60% width) */}
          <div className="md:w-[60%] p-6 sm:p-8 flex flex-col sm:flex-row gap-8 border-b md:border-b-0 md:border-r border-border">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl" aria-hidden>{active.icon}</span>
                <h3 className="text-xl sm:text-2xl font-bold text-text" style={{ fontFamily: 'var(--font-sans)' }}>
                  {active.name}
                </h3>
              </div>
              <p className="text-sm text-text-muted leading-relaxed mb-6" style={{ fontFamily: 'var(--font-sans)' }}>
                {active.description}
              </p>
              {active.timing && (
                <div className="flex items-start gap-3">
                  <span className="text-xs font-bold tracking-widest mt-0.5 shrink-0 uppercase" style={{ fontFamily: 'var(--font-sans)', color: theme.primary }}>
                    Hours
                  </span>
                  <span className="text-xs text-text-muted leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
                    {active.timing}
                  </span>
                </div>
              )}
            </div>

            {active.details && (
              <div className="sm:w-48 md:w-56 flex-shrink-0 border-t sm:border-t-0 sm:border-l border-border pt-6 sm:pt-0 sm:pl-6">
                <p className="text-xs font-bold tracking-widest mb-4 uppercase" style={{ fontFamily: 'var(--font-sans)', color: theme.primary }}>
                  Facilities
                </p>
                <ul className="flex flex-col gap-3">
                  {active.details.map(d => (
                    <li key={d} className="flex items-start gap-2.5 text-xs text-text-muted" style={{ fontFamily: 'var(--font-sans)' }}>
                      <span className="mt-0.5 w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] text-white"
                        style={{ background: theme.primary }}>
                        ✓
                      </span>
                      <span className="leading-normal">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right side (40% width) */}
          <div className="md:w-[40%] min-h-[220px] md:min-h-0 relative flex overflow-hidden">
            {!imgError ? (
              <img 
                src={`/images/bhawans/${bhawanSlug}/amenities/${active.id}.webp`} 
                alt={active.name} 
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div 
                className="w-full h-full flex items-center justify-center text-5xl"
                style={{ backgroundColor: theme.primary }}
              >
                {active.icon}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
