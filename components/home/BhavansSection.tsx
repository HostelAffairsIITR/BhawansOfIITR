import Link from 'next/link'
import { BHAVANS, BHAVAN_CATEGORIES, getBhavansByCategory } from '@/lib/bhavans-data'
import { BhavanCategory, Bhavan } from '@/lib/types'

interface BhavansSectionProps {
  activeTab: BhavanCategory
  selectedSlug?: string
}

function BhavanButton({ bhavan, isSelected }: { bhavan: Bhavan; isSelected: boolean }) {
  return (
    <Link
      href={`?tab=${bhavan.category}&selected=${bhavan.slug}#our-bhavans`}
      className={`flex items-center justify-between w-full min-h-[48px] px-5 py-3 text-sm font-medium rounded-xl transition-all duration-200
        ${isSelected
          ? 'bg-brand-light text-white border border-brand-light shadow-md scale-[1.02]'
          : 'bg-surface-raised text-text border border-border shadow-xs hover:-translate-y-0.5 hover:shadow-sm hover:border-brand-muted/40 hover:bg-surface-muted/50'
        }`}
    >
      <span>{bhavan.name}</span>
      {isSelected ? (
        <span className="text-white text-xs">✓</span>
      ) : (
        <span className="text-text-muted/40 text-xs group-hover:text-text-muted">→</span>
      )}
    </Link>
  )
}

function BhavanDetail({ bhavan }: { bhavan: Bhavan | undefined }) {
  if (!bhavan) {
    return (
      <div className="rounded-2xl border border-border bg-surface-raised p-10 sm:p-16 flex items-center justify-center min-h-[200px] shadow-sm">
        <p className="text-text-muted text-sm text-center font-medium">
          Select a Bhavan to view its details
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
                {bhavan.category === 'coed' ? 'Co-Ed' : bhavan.category} Hostel
              </span>
              <h3 className="text-2xl sm:text-3xl font-bold text-brand mt-2 leading-tight" style={{ fontFamily: 'var(--font-sans)' }}>
                {bhavan.name}
              </h3>
              {bhavan.established && (
                <p className="text-xs text-text-muted mt-1 font-medium">
                  Established: <span className="text-text">{bhavan.established}</span>
                  {bhavan.strength ? `  ·  Strength: ` : ''}
                  {bhavan.strength ? <span className="text-text">{bhavan.strength} residents</span> : ''}
                </p>
              )}
            </div>

            {bhavan.description ? (
              <p className="text-sm text-text-muted leading-relaxed max-w-xl font-normal mt-2">
                {bhavan.description}
              </p>
            ) : (
              <p className="text-sm text-text-muted/50 leading-relaxed max-w-xl font-normal mt-2 italic">
                No description available. Click below to view the official Bhavan page.
              </p>
            )}
          </div>

          <div className="pt-4">
            <Link
              href={`/bhavans/${bhavan.slug}`}
              className="btn-primary px-6 py-3 text-xs tracking-wider inline-flex items-center gap-2"
            >
              VISIT BHAVAN PAGE →
            </Link>
          </div>
        </div>

        {/* Right Side: Photo Placeholder */}
        <div className="w-full md:w-80 lg:w-96 bg-gradient-to-br from-brand-light to-brand-muted flex flex-col items-center justify-center min-h-[200px] md:min-h-0 p-8 text-center text-white/95">
          <span className="text-2xl mb-2">🏢</span>
          <span className="text-sm font-semibold tracking-wide uppercase">{bhavan.name}</span>
          <span className="text-[10px] text-white/60 font-mono mt-1">[ Photo Coming Soon ]</span>
        </div>
      </div>
    </div>
  )
}

export default function BhavansSection({ activeTab, selectedSlug }: BhavansSectionProps) {
  const bhavansInTab = getBhavansByCategory(activeTab)
  const selectedBhavan = selectedSlug ? BHAVANS.find(b => b.slug === selectedSlug) : undefined

  return (
    <section id="our-bhavans" className="py-14 sm:py-20 bg-surface/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2
              className="text-3xl sm:text-4xl text-brand tracking-wide"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
            >
              OUR BHAVANS
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Explore the 21 residential hostels at IIT Roorkee
            </p>
          </div>
        </div>

        {/* Segmented Pill Tab Selector */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-surface-muted/80 border border-border/40 rounded-xl mb-8 w-full sm:w-fit shadow-xs">
          {BHAVAN_CATEGORIES.map(cat => {
            const isActive = cat.key === activeTab
            return (
              <Link
                key={cat.key}
                href={`?tab=${cat.key}#our-bhavans`}
                className={`px-4 sm:px-5 py-2.5 rounded-lg text-center transition-all duration-200 flex-1 sm:flex-none min-w-[125px]
                  ${isActive
                    ? 'bg-brand-light text-white shadow-xs font-semibold'
                    : 'text-text-muted hover:text-text hover:bg-surface-raised/40'
                  }`}
              >
                <span className="block text-xs font-bold uppercase tracking-wider">{cat.label.replace(' Hostels', '')}</span>
                <span className={`text-[10px] mt-0.5 block ${isActive ? 'text-white/85' : 'text-text-muted/75'}`}>
                  {cat.count} {cat.count === 1 ? 'hostel' : 'hostels'}
                </span>
              </Link>
            )
          })}
        </div>

        {/* Bhavan grid */}
        <div className="rounded-2xl border border-border bg-surface-raised p-6 shadow-xs mb-8">
          <div className={`grid gap-3
            ${activeTab === 'boys' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : ''}
            ${activeTab === 'girls' ? 'grid-cols-1 sm:grid-cols-2' : ''}
            ${activeTab === 'married' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : ''}
            ${activeTab === 'coed' ? 'grid-cols-1 max-w-xs mx-auto' : ''}
          `}>
            {bhavansInTab.map(bhavan => (
              <BhavanButton
                key={bhavan.slug}
                bhavan={bhavan}
                isSelected={bhavan.slug === selectedSlug}
              />
            ))}
          </div>
        </div>

        <BhavanDetail bhavan={selectedBhavan} />
      </div>
    </section>
  )
}
