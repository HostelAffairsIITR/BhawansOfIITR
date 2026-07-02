import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import EventsGrid from '@/components/events/EventsGrid'
import { DbContentItem } from '@/components/home/EventsSection'

interface EventsPageProps {
  searchParams: Promise<{ type?: string; status?: string }>
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams
  const activeType = params.type || 'all'
  const activeStatusParam = params.status || 'active'
  const activeStatus = activeStatusParam === 'past' ? 'archived' : 'published'

  const supabase = await createClient()

  // Build content items query
  let query = supabase
    .from('content_items')
    .select('*, blogs(*), announcements(*), notices(*), poll_options(*), users(name)')
    .eq('status', activeStatus)
    .is('bhavan_scope', null)
    .neq('type', 'notice')

  if (activeType !== 'all') {
    query = query.eq('type', activeType)
  }

  const { data: rawEvents } = await query
    .order('priority', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  const events = (rawEvents || []) as DbContentItem[]

  // Fetch poll votes for poll items returned
  let votes: any[] = []
  if (events.length > 0) {
    const pollIds = events
      .filter((item) => item.type === 'poll')
      .map((item) => item.id)

    if (pollIds.length > 0) {
      const resultsPromises = pollIds.map(async (pollId: string) => {
        const { data } = await supabase.rpc('get_poll_results', { poll_id: pollId })
        return (data || []).map((row: any) => ({
          poll_option_id: String(row.option_id),
          content_item_id: pollId,
          vote_count: Number(row.vote_count)
        }))
      })
      const allResults = await Promise.all(resultsPromises)
      votes = allResults.flat()
    }
  }

  // Type Filter Tabs list
  const TYPE_TABS = [
    { label: 'ALL', value: 'all' },
    { label: 'POLLS', value: 'poll' },
    { label: 'BLOGS', value: 'blog' },
    { label: 'ANNOUNCEMENTS', value: 'announcement' },
  ]

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface">
        {/* Page Header */}
        <section className="py-20 sm:py-28 border-b border-border bg-surface-raised">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <h1 className="text-4xl sm:text-5xl md:text-6xl text-brand tracking-widest text-center" style={{ fontFamily: 'var(--font-display)' }}>
              WHAT'S ON
            </h1>
            <p className="text-text-muted text-center text-sm mt-4 max-w-md mx-auto leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
              Stay updated with active student polls, blog posts, official notices, and announcements from IIT Roorkee Hostels.
            </p>
          </div>
        </section>

        {/* Filters and Controls */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-6 sm:pt-20 sm:pb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Type Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-surface-muted/80 border border-border/40 rounded-xl w-full md:w-fit shadow-xs">
            {TYPE_TABS.map(tab => {
              const isActive = activeType === tab.value
              return (
                <Link
                  key={tab.value}
                  href={`?type=${tab.value}&status=${activeStatusParam}`}
                  className={`px-4 sm:px-5 py-2.5 rounded-lg text-center transition-all duration-200 text-xs font-bold uppercase tracking-wider block
                    ${isActive
                      ? 'bg-brand text-white shadow-xs'
                      : 'text-text-muted hover:text-text hover:bg-surface-raised/40'
                    }`}
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>

          {/* Status Toggle */}
          <div className="flex gap-1.5 p-1 bg-surface-muted/80 border border-border/40 rounded-xl shadow-xs shrink-0 self-end md:self-auto">
            <Link
              href={`?type=${activeType}&status=active`}
              className={`px-4 py-2.5 rounded-lg text-center transition-all duration-200 text-xs font-bold uppercase tracking-wider block
                ${activeStatusParam === 'active'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-text-muted hover:text-text hover:bg-surface-raised/40'
                }`}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              ACTIVE
            </Link>
            <Link
              href={`?type=${activeType}&status=past`}
              className={`px-4 py-2.5 rounded-lg text-center transition-all duration-200 text-xs font-bold uppercase tracking-wider block
                ${activeStatusParam === 'past'
                  ? 'bg-brand text-white shadow-xs'
                  : 'text-text-muted hover:text-text hover:bg-surface-raised/40'
                }`}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              PAST
            </Link>
          </div>
        </div>

        {/* Content Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-28 sm:pb-40">
          {events.length === 0 ? (
            <div className="text-center py-24 bg-surface-raised rounded-2xl border border-border shadow-xs">
              <span className="text-4xl block mb-4">📅</span>
              <h3 className="text-lg font-bold text-text mb-1" style={{ fontFamily: 'var(--font-sans)' }}>No items found</h3>
              <p className="text-text-muted text-sm" style={{ fontFamily: 'var(--font-sans)' }}>No published content matches the selected filters.</p>
            </div>
          ) : (
            <EventsGrid events={events} votes={votes} showShare={activeStatusParam === 'active'} />
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
