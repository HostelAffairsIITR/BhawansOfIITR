import { BHAVANS } from '@/lib/bhavans-data'
import Link from 'next/link'

interface SupabaseWarden {
  id: number
  name: string
  image_url: string | null
  title: string
  bhavan_id: number | null
  is_active: boolean
  display_order: number
  bhavans?: {
    name: string
  } | null
}

export default function WardenSection({ wardens }: { wardens: SupabaseWarden[] }) {
  if (!wardens || wardens.length === 0) return null

  const getBhavanSlugByName = (bhavanName: string) => {
    const nameClean = bhavanName.toLowerCase().replace(' bhawan', '').replace(' hostel', '').replace(' house', '').trim()
    const found = BHAVANS.find(b => 
      b.name.toLowerCase().replace(' bhawan', '').replace(' hostel', '').replace(' house', '').trim() === nameClean
    )
    return found?.slug || nameClean
  }

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
          {wardens.map(warden => {
            const bhName = warden.bhavans?.name || ''
            const slug = getBhavanSlugByName(bhName)
            const avatarLetter = warden.name.split(' ').pop()?.[0] || 'W'

            return (
              <Link
                key={warden.id}
                href={`/bhavans/${slug}`}
                className="flex flex-col items-center gap-3 group w-28 sm:w-32 hover:-translate-y-1 transition-all duration-200"
              >
                {/* Avatar circle */}
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-border bg-gradient-to-br from-brand-light/10 to-brand-muted/20 flex items-center justify-center overflow-hidden transition-all duration-200 group-hover:scale-105 group-hover:shadow-sm relative">
                  {warden.image_url ? (
                    <img src={warden.image_url} alt={warden.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-brand-muted/40" style={{ fontFamily: 'var(--font-display)' }}>
                      {avatarLetter}
                    </span>
                  )}
                </div>
                {/* Label */}
                <div className="border border-border bg-surface-raised rounded-xl px-2 py-2 text-center w-full group-hover:border-brand-muted group-hover:shadow-xs transition-all duration-200">
                  <p className="text-xs font-bold text-text leading-tight truncate">
                    {warden.name.replace('Prof. ', '')}
                  </p>
                  <p className="text-[10px] font-medium text-text-muted leading-tight truncate mt-1 uppercase tracking-wider">
                    {bhName.replace(' Bhawan', '')}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
