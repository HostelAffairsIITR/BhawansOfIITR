'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Bhavan } from '@/lib/types'

export default function BhavanHero({ bhavan }: { bhavan: Bhavan }) {
  const { theme } = bhavan
  const [imgError, setImgError] = useState(false)

  return (
    <section
      className="w-full border-b border-white/10"
      style={{
        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%)`,
      }}
    >
      {/* Breadcrumb */}
      <div className="border-b border-white/10 px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto">
          <nav className="flex items-center gap-2 text-xs tracking-wider font-semibold" style={{ fontFamily: 'var(--font-sans)', color: theme.primaryLight }}>
            <Link href="/" className="hover:text-white transition-colors opacity-70 hover:opacity-100">BHAVANS OF IITR</Link>
            <span className="opacity-40">/</span>
            <Link href="/?tab=boys#our-bhavans" className="hover:text-white transition-colors opacity-70 hover:opacity-100">
              {bhavan.category.toUpperCase()} HOSTELS
            </Link>
            <span className="opacity-40">/</span>
            <span className="text-white">{bhavan.name.toUpperCase()}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row min-h-[45vh] md:min-h-[50vh]">
          {/* Left — Text */}
          <div className="flex-1 flex flex-col justify-center py-12 md:py-16 pr-0 md:pr-12 gap-6">
            <div>
              {bhavan.established && (
                <p className="text-xs tracking-[0.2em] font-bold mb-2 uppercase opacity-85" style={{ fontFamily: 'var(--font-sans)', color: theme.primaryLight }}>
                  ESTABLISHED {bhavan.established}
                </p>
              )}
              <h1
                className="text-[clamp(2.5rem,7vw,5rem)] leading-none tracking-tight font-extrabold"
                style={{ fontFamily: 'var(--font-sans)', color: '#ffffff' }}
              >
                {bhavan.name.replace(' Bhawan', '')}
              </h1>
              <p
                className="text-lg sm:text-xl font-bold tracking-widest mt-1 opacity-70 uppercase"
                style={{ fontFamily: 'var(--font-sans)', color: theme.primaryLight }}
              >
                BHAWAN
              </p>
            </div>

            {bhavan.description && (
              <p className="text-sm leading-relaxed max-w-lg opacity-85 text-white/90"
                style={{ fontFamily: 'var(--font-sans)' }}>
                {bhavan.description}
              </p>
            )}

            {bhavan.strength && (
              <div className="flex gap-4 flex-wrap">
                <div className="bg-white/10 border border-white/10 rounded-xl px-5 py-3 shadow-xs backdrop-blur-xs">
                  <p className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-sans)' }}>{bhavan.strength}+</p>
                  <p className="text-[10px] tracking-wider font-bold opacity-75 uppercase" style={{ fontFamily: 'var(--font-sans)', color: theme.primaryLight }}>Residents</p>
                </div>
                <div className="bg-white/10 border border-white/10 rounded-xl px-5 py-3 shadow-xs backdrop-blur-xs">
                  <p className="text-2xl font-black text-white" style={{ fontFamily: 'var(--font-sans)' }}>
                    {new Date().getFullYear() - parseInt(bhavan.established ?? '2000')}
                  </p>
                  <p className="text-[10px] tracking-wider font-bold opacity-75 uppercase" style={{ fontFamily: 'var(--font-sans)', color: theme.primaryLight }}>Years Old</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-4 mt-2">
              <a
                href="#notices"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 hover:-translate-y-0.5 shadow-md hover:shadow-lg active:translate-y-0 cursor-pointer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  background: '#ffffff',
                  color: theme.primary,
                }}
              >
                View Notices &rarr;
              </a>
              <a
                href="#amenities"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider border border-white/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 hover:border-white/40 active:translate-y-0 cursor-pointer"
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: '#ffffff',
                }}
              >
                Amenities &rarr;
              </a>
            </div>
          </div>

          {/* Right — Image */}
          <div className="w-full md:w-2/5 min-h-[260px] md:min-h-0 flex items-center justify-center relative overflow-hidden bg-black/10 backdrop-blur-xs md:border-l border-white/10">
            {!imgError ? (
              <img 
                src={`/images/bhavans/${bhavan.slug}.webp`} 
                alt={bhavan.name} 
                className="absolute inset-0 w-full h-full object-cover"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center" style={{ background: `${theme.primaryDark}30` }}>
                <span className="text-xs font-bold tracking-wider text-center px-8 opacity-40 uppercase" style={{ fontFamily: 'var(--font-sans)', color: theme.primaryLight }}>
                  [ {bhavan.name} Photograph ]
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

