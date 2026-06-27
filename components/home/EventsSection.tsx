import { getBhavanBySlug } from '@/lib/bhavans-data'

export interface DbContentItem {
  id: string
  type: 'poll' | 'blog' | 'announcement' | 'notice'
  title: string
  status: string
  bhavan_scope?: string | null
  priority?: boolean | number | null
  created_at: string
  blogs?: {
    cover_image_url?: string
    excerpt?: string
  }[] | {
    cover_image_url?: string
    excerpt?: string
  } | null
  announcements?: {
    body?: string
    image_url?: string
  }[] | {
    body?: string
    image_url?: string
  } | null
  notices?: {
    body?: string
  }[] | {
    body?: string
  } | null
  poll_options?: {
    id: string
    option_text: string
    display_order: number
  }[] | null
}

const cardBase = 'flex flex-col w-full h-[460px] rounded-xl border border-border bg-surface-raised shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-border-strong'

export function PollCard({ 
  item, 
  votes 
}: { 
  item: DbContentItem
  votes: { poll_option_id: string; content_item_id: string }[]
}) {
  const pollVotes = votes ? votes.filter(v => v.content_item_id === item.id) : []
  const totalVotes = pollVotes.length

  const options = item.poll_options || []
  const sortedOptions = [...options].sort((a, b) => a.display_order - b.display_order)

  return (
    <article className={cardBase}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
        <span className="bg-accent/10 text-accent text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>POLL</span>
        <span className={`text-[10px] font-bold tracking-wider ${item.status === 'open' ? 'text-accent' : 'text-text-muted'}`}
          style={{ fontFamily: 'var(--font-mono)' }}>
          {item.status.toUpperCase()}
        </span>
      </div>

      <div className="bg-surface/40 p-5 flex-1 flex flex-col justify-between overflow-y-auto">
        <div>
          <h3 className="text-text font-bold text-sm leading-relaxed mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
            {item.title}
          </h3>
          <div className="flex flex-col gap-3">
            {sortedOptions.slice(0, 3).map(opt => {
              const optionVotes = pollVotes.filter(v => v.poll_option_id === opt.id).length
              const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0
              return (
                <div key={opt.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text font-medium leading-snug">{opt.option_text}</span>
                    <span className="text-text-muted font-bold shrink-0">{pct}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-surface-muted relative overflow-hidden">
                    <div className="absolute inset-y-0 left-0 bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <p className="text-[10px] font-bold tracking-wider text-text-muted mt-4 uppercase" style={{ fontFamily: 'var(--font-mono)' }}>{totalVotes.toLocaleString()} votes</p>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border gap-3 shrink-0 mt-auto bg-surface-raised">
        <a href={`/events/${item.id}`} className="btn-primary flex-1 py-2.5 text-xs tracking-wider text-center block">
          VOTE NOW
        </a>
        <a href={`/events/${item.id}`} className="btn-secondary w-10 h-10 flex items-center justify-center font-bold p-0 rounded-lg">
          →
        </a>
      </div>
    </article>
  )
}

export function BlogCard({ item }: { item: DbContentItem }) {
  const blogs = Array.isArray(item.blogs) ? item.blogs[0] : item.blogs
  const coverImageUrl = blogs?.cover_image_url
  const excerpt = blogs?.excerpt || ''

  return (
    <article className={cardBase}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
        <span className="bg-brand/10 text-brand text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>BLOG</span>
        <span className="text-[10px] text-text-muted tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
        </span>
      </div>

      {coverImageUrl ? (
        <div className="border-b border-border h-36 shrink-0 overflow-hidden relative">
          <img src={coverImageUrl} alt={item.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="border-b border-border bg-gradient-to-br from-brand-light to-brand-muted h-36 shrink-0 flex items-center justify-center text-text-on-brand/30 text-xs font-mono">
          [ COVER IMAGE ]
        </div>
      )}

      <div className="p-5 flex flex-col gap-2 flex-1 justify-between overflow-y-auto">
        <div>
          <h3 className="text-text font-bold text-sm leading-relaxed mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
            {item.title}
          </h3>
          <p className="text-text-muted text-xs leading-relaxed line-clamp-3">
            {excerpt}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border gap-3 shrink-0 mt-auto bg-surface-raised">
        <a href={`/events/${item.id}`} className="btn-primary flex-1 py-2.5 text-xs tracking-wider text-center block">
          READ MORE
        </a>
        <a href={`/events/${item.id}`} className="btn-secondary w-10 h-10 flex items-center justify-center font-bold p-0 rounded-lg">
          →
        </a>
      </div>
    </article>
  )
}

export function AnnouncementCard({ item }: { item: DbContentItem }) {
  const announcements = Array.isArray(item.announcements) ? item.announcements[0] : item.announcements
  const imageUrl = announcements?.image_url
  const body = announcements?.body || ''

  return (
    <article className={cardBase}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
        <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>ANNOUNCEMENT</span>
        <span className="text-[10px] text-text-muted tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
        </span>
      </div>

      {imageUrl ? (
        <div className="border-b border-border h-36 shrink-0 overflow-hidden relative">
          <img src={imageUrl} alt={item.title} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="border-b border-border bg-gradient-to-br from-blue-400/20 to-blue-600/20 h-36 shrink-0 flex items-center justify-center text-blue-600/30 text-xs font-mono">
          [ ANNOUNCEMENT ]
        </div>
      )}

      <div className="p-5 flex flex-col gap-2 flex-1 justify-between overflow-y-auto">
        <div>
          <h3 className="text-text font-bold text-sm leading-relaxed mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
            {item.title}
          </h3>
          <p className="text-text-muted text-xs leading-relaxed line-clamp-3">
            {body}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border gap-3 shrink-0 mt-auto bg-surface-raised">
        <a href={`/events/${item.id}`} className="btn-primary flex-1 py-2.5 text-xs tracking-wider text-center block">
          VIEW
        </a>
        <a href={`/events/${item.id}`} className="btn-secondary w-10 h-10 flex items-center justify-center font-bold p-0 rounded-lg">
          →
        </a>
      </div>
    </article>
  )
}

export function NoticeCard({ item }: { item: DbContentItem }) {
  const notices = Array.isArray(item.notices) ? item.notices[0] : item.notices
  const body = notices?.body || ''
  const bhavanName = item.bhavan_scope ? (getBhavanBySlug(item.bhavan_scope)?.name || item.bhavan_scope) : null

  return (
    <article className={cardBase}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
        <span className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>NOTICE</span>
        <span className="text-[10px] text-text-muted tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
          {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-2 flex-1 justify-between overflow-y-auto">
        <div className="flex-1">
          {bhavanName && (
            <span className="inline-block bg-surface-muted border border-border text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
              🏢 {bhavanName.replace(' Bhawan', '').replace(' Hostel', '')}
            </span>
          )}
          <h3 className="text-text font-bold text-sm leading-relaxed mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
            {item.title}
          </h3>
          <p className="text-text-muted text-xs leading-relaxed line-clamp-5">
            {body}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border gap-3 shrink-0 mt-auto bg-surface-raised">
        <a href={`/events/${item.id}`} className="btn-primary flex-1 py-2.5 text-xs tracking-wider text-center block">
          VIEW
        </a>
        <a href={`/events/${item.id}`} className="btn-secondary w-10 h-10 flex items-center justify-center font-bold p-0 rounded-lg">
          →
        </a>
      </div>
    </article>
  )
}

export default function EventsSection({ 
  events, 
  votes = [] 
}: { 
  events: DbContentItem[]
  votes?: { poll_option_id: string; content_item_id: string }[] 
}) {
  return (
    <section id="whats-happening" className="py-14 sm:py-20 bg-surface-raised border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
          <div>
            <h2
              className="text-3xl sm:text-4xl text-brand tracking-wide"
              style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
            >
              WHAT'S HAPPENING
            </h2>
            <p className="text-text-muted text-sm mt-2">Polls, blogs &amp; campus updates</p>
          </div>
          <a
            href="/events"
            className="btn-primary px-6 py-3 text-sm tracking-widest whitespace-nowrap"
          >
            VIEW ALL →
          </a>
        </div>

        {events.length === 0 ? (
          <div className="rounded-2xl border border-border bg-surface-raised p-12 text-center shadow-xs">
            <span className="text-3xl block mb-3">📅</span>
            <p className="text-text-muted text-sm font-medium">No published events or announcements found.</p>
          </div>
        ) : (
          <div className="relative">
            <div className="flex gap-5 overflow-x-auto scroll-hidden pb-6 snap-x snap-mandatory items-stretch">
              {events.map(event => (
                <div
                  key={event.id}
                  className="snap-start flex w-[85vw] sm:w-[360px] flex-shrink-0"
                >
                  {event.type === 'poll' && <PollCard item={event} votes={votes} />}
                  {event.type === 'blog' && <BlogCard item={event} />}
                  {event.type === 'announcement' && <AnnouncementCard item={event} />}
                </div>
              ))}
              <div className="flex-shrink-0 w-4" aria-hidden="true" />
            </div>
            <div className="absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-surface-raised to-transparent pointer-events-none" />
          </div>
        )}
      </div>
    </section>
  )
}
