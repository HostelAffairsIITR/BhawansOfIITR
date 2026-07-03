'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BHAWANS, BHAWAN_CATEGORIES, getBhawansByCategory } from '@/lib/bhawans-data'
import { BhawanCategory, Bhawan } from '@/lib/types'

function BhawanButton({ 
  bhawan, 
  isSelected, 
  onSelect 
}: { 
  bhawan: Bhawan; 
  isSelected: boolean; 
  onSelect: () => void 
}) {
  return (
    <button
      onClick={onSelect}
      className={`flex items-center justify-between w-full min-h-[48px] px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer
        ${isSelected
          ? 'bg-brand-light text-white border border-brand-light shadow-md scale-[1.02]'
          : 'bg-surface-raised text-text border border-border shadow-xs hover:-translate-y-0.5 hover:shadow-sm hover:border-brand-muted/40 hover:bg-surface-muted/50'
        }`}
    >
      <span>{bhawan.name}</span>
      {isSelected ? (
        <span className="text-white text-xs">✓</span>
      ) : (
        <span className="text-text-muted/40 text-xs group-hover:text-text-muted">→</span>
      )}
    </button>
  )
}

function BhawanDetail({ bhawan }: { bhawan: Bhawan | undefined }) {
  const [imgError, setImgError] = useState(false)

  // Reset imgError when selected bhawan changes
  useEffect(() => {
    setImgError(false)
  }, [bhawan?.slug])

  if (!bhawan) {
    return (
      <div className="rounded-2xl border border-border bg-surface-raised p-10 sm:p-16 flex items-center justify-center min-h-[200px] shadow-sm">
        <p className="text-text-muted text-sm text-center font-medium">
          Select a Bhawan to view its details
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-surface-raised overflow-hidden shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex flex-col md:flex-row min-h-[280px]">
        {/* Left Side: Details */}
        <div className="flex-1 p-6 sm:p-8 flex flex-col gap-5 justify-between">
          <div className="flex flex-col gap-3">
            <div>
              <span className="bg-brand/10 text-brand text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                {bhawan.category === 'coed' ? 'Co-Ed' : bhawan.category} Hostel
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-brand mt-2 leading-tight" style={{ fontFamily: 'var(--font-sans)' }}>
                {bhawan.name}
              </h3>
              {bhawan.established && (
                <p className="text-xs text-text-muted mt-1 font-medium">
                  Established: <span className="text-text">{bhawan.established}</span>
                  {bhawan.strength ? `  ·  Strength: ` : ''}
                  {bhawan.strength ? <span className="text-text">{bhawan.strength} residents</span> : ''}
                </p>
              )}
            </div>

            {bhawan.description ? (
              <p className="text-sm text-text-muted leading-relaxed max-w-xl font-normal mt-2">
                {bhawan.description}
              </p>
            ) : (
              <p className="text-sm text-text-muted/50 leading-relaxed max-w-xl font-normal mt-2 italic">
                No description available. Click below to view the official Bhawan page.
              </p>
            )}
          </div>

          <div className="pt-4">
            <Link
              href={`/bhawans/${bhawan.slug}`}
              className="btn-primary px-6 py-3 text-xs tracking-wider inline-flex items-center gap-2"
            >
              VISIT BHAWAN PAGE →
            </Link>
          </div>
        </div>

        {/* Right Side: Photo */}
        <div className="w-full md:w-80 lg:w-96 relative min-h-[200px] md:min-h-0 overflow-hidden bg-gradient-to-br from-brand-light to-brand-muted flex flex-col items-center justify-center p-8 text-center text-white/95">
          {!imgError ? (
            <img 
              src={`/images/bhawans/${bhawan.slug}.webp`} 
              alt={bhawan.name} 
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <>
              <span className="text-2xl mb-2">🏢</span>
              <span className="text-sm font-semibold tracking-wide uppercase">{bhawan.name}</span>
              <span className="text-[10px] text-white/60 font-mono mt-1">[ Photo Coming Soon ]</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BhawansSection() {
  const [activeTab, setActiveTab] = useState<BhawanCategory>('boys')
  const [selectedSlug, setSelectedSlug] = useState<string>('azad')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tabParam = params.get('tab')
    const selectedParam = params.get('selected')

    if (tabParam && ['boys', 'girls', 'married', 'coed'].includes(tabParam)) {
      setActiveTab(tabParam as BhawanCategory)
    }
    if (selectedParam) {
      setSelectedSlug(selectedParam)
    } else {
      // Auto-select first Bhawan in the active tab category on initial load
      const bhawans = getBhawansByCategory(tabParam as BhawanCategory || 'boys')
      if (bhawans.length > 0) {
        setSelectedSlug(bhawans[0].slug)
      }
    }
  }, [])

  const handleTabChange = (category: BhawanCategory) => {
    setActiveTab(category)
    const bhawans = getBhawansByCategory(category)
    if (bhawans.length > 0) {
      setSelectedSlug(bhawans[0].slug)
      updateUrlParams(category, bhawans[0].slug)
    } else {
      setSelectedSlug('')
      updateUrlParams(category, '')
    }
  }

  const handleBhawanSelect = (category: BhawanCategory, slug: string) => {
    setSelectedSlug(slug)
    updateUrlParams(category, slug)
  }

  const updateUrlParams = (tab: string, selected: string) => {
    const newUrl = `?tab=${tab}${selected ? `&selected=${selected}` : ''}#our-bhawans`
    window.history.replaceState(null, '', newUrl)
  }

  const bhawansInTab = getBhawansByCategory(activeTab)
  const selectedBhawan = selectedSlug ? BHAWANS.find(b => b.slug === selectedSlug) : undefined

  return (
    <section id="our-bhawans" className="py-14 sm:py-20 bg-surface/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2
              className="text-3xl sm:text-4xl text-brand tracking-wide"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
            >
              OUR BHAWANS
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Explore the 21 residential hostels at IIT Roorkee
            </p>
          </div>
        </div>

        {/* Segmented Pill Tab Selector */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-surface-muted/80 border border-border/40 rounded-xl mb-8 w-full sm:w-fit shadow-xs">
          {BHAWAN_CATEGORIES.map(cat => {
            const isActive = cat.key === activeTab
            return (
              <button
                key={cat.key}
                onClick={() => handleTabChange(cat.key)}
                className={`px-4 sm:px-5 py-2.5 rounded-lg text-center transition-all duration-200 flex-1 sm:flex-none min-w-[125px] cursor-pointer
                  ${isActive
                    ? 'bg-brand-light text-white shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text hover:bg-surface-raised/40'
                  }`}
              >
                <span className="block text-xs font-bold uppercase tracking-wider">{cat.label.replace(' Hostels', '')}</span>
                <span className={`text-[10px] mt-0.5 block ${isActive ? 'text-white/85' : 'text-text-muted/75'}`}>
                  {cat.count} {cat.count === 1 ? 'hostel' : 'hostels'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bhawan grid */}
        <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-xs mb-8">
          <div className={`grid gap-3
            ${activeTab === 'boys' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : ''}
            ${activeTab === 'girls' ? 'grid-cols-1 sm:grid-cols-2' : ''}
            ${activeTab === 'married' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
            ${activeTab === 'coed' ? 'grid-cols-1 max-w-xs mx-auto' : ''}
          `}>
            {bhawansInTab.map(bhawan => (
              <BhawanButton
                key={bhawan.slug}
                bhawan={bhawan}
                isSelected={bhawan.slug === selectedSlug}
                onSelect={() => handleBhawanSelect(bhawan.category, bhawan.slug)}
              />
            ))}
          </div>
        </div>

        <BhawanDetail bhawan={selectedBhawan} />
      </div>
    </section>
  )
}
