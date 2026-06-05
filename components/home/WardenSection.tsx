import { Warden } from '@/lib/types'
import Link from 'next/link'

export default function WardenSection({ wardens }: { wardens: Warden[] }) {
  return (
    <section id="wardens" className="py-14 sm:py-20 bg-surface/30 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2
            className="text-3xl sm:text-4xl text-brand tracking-wide"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
          >
            BHAVAN WARDENS
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Faculty wardens in charge of residential administration
          </p>
        </div>

        <div className="flex flex-wrap gap-6 justify-start">
          {wardens.map(warden => (
            <Link
              key={warden.bhavanSlug}
              href={`/bhavans/${warden.bhavanSlug}`}
              className="flex flex-col items-center gap-3 group w-28 sm:w-32 hover:-translate-y-1 transition-all duration-200"
            >
              {/* Avatar circle */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-border bg-gradient-to-br from-brand-light/10 to-brand-muted/20 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-105 group-hover:shadow-sm">
                {/* Replace with <Image src={warden.photoUrl} fill className="object-cover" /> */}
                <span className="text-3xl font-bold text-brand-muted/40" style={{ fontFamily: 'var(--font-display)' }}>
                  {warden.name.split(' ').pop()?.[0]}
                </span>
              </div>
              {/* Label */}
              <div className="border border-border bg-surface-raised rounded-xl px-2 py-2 text-center w-full group-hover:border-brand-muted group-hover:shadow-xs transition-all duration-200">
                <p className="text-xs font-bold text-text leading-tight truncate">
                  {warden.name.replace('Prof. ', '')}
                </p>
                <p className="text-[10px] font-medium text-text-muted leading-tight truncate mt-1 uppercase tracking-wider">
                  {warden.bhavanName.replace(' Bhawan', '')}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
