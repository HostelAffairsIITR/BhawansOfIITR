import { AnyEvent, Poll, Blog } from '@/lib/types'

const cardBase = 'flex flex-col w-full h-[460px] rounded-xl border border-border bg-surface-raised shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md hover:border-border-strong'

function PollCard({ event }: { event: Poll }) {
  return (
    <article className={cardBase}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
        <span className="bg-accent/10 text-accent text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>POLL</span>
        <span className={`text-[10px] font-bold tracking-wider ${event.status === 'open' ? 'text-accent' : 'text-text-muted'}`}
          style={{ fontFamily: 'var(--font-mono)' }}>
          {event.status.toUpperCase()}
        </span>
      </div>

      <div className="bg-surface/40 p-5 flex-1 flex flex-col justify-between overflow-y-auto">
        <div>
          <h3 className="text-text font-bold text-sm leading-relaxed mb-4" style={{ fontFamily: 'var(--font-sans)' }}>
            {event.title}
          </h3>
          <div className="flex flex-col gap-3">
            {event.options.slice(0, 3).map(opt => {
              const pct = event.totalVotes > 0 ? Math.round((opt.votes / event.totalVotes) * 100) : 0
              return (
                <div key={opt.id} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text font-medium leading-snug">{opt.label}</span>
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
        <p className="text-[10px] font-bold tracking-wider text-text-muted mt-4 uppercase" style={{ fontFamily: 'var(--font-mono)' }}>{event.totalVotes.toLocaleString()} votes</p>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border gap-3 shrink-0 mt-auto bg-surface-raised">
        <button className="btn-primary flex-1 py-2.5 text-xs tracking-wider">
          VOTE NOW
        </button>
        <button className="btn-secondary w-10 h-10 flex items-center justify-center font-bold p-0 rounded-lg">
          →
        </button>
      </div>
    </article>
  )
}

function BlogCard({ event }: { event: Blog }) {
  return (
    <article className={cardBase}>
      <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border shrink-0">
        <span className="bg-brand/10 text-brand text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>BLOG</span>
        <span className="text-[10px] text-text-muted tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
          {new Date(event.publishedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
        </span>
      </div>

      <div className="border-b border-border bg-gradient-to-br from-brand-light to-brand-muted h-36 shrink-0 flex items-center justify-center text-text-on-brand/30 text-xs font-mono">
        [ COVER IMAGE ]
      </div>

      <div className="p-5 flex flex-col gap-2 flex-1 justify-between overflow-y-auto">
        <div>
          <h3 className="text-text font-bold text-sm leading-relaxed mb-2" style={{ fontFamily: 'var(--font-sans)' }}>
            {event.title}
          </h3>
          <p className="text-text-muted text-xs leading-relaxed line-clamp-3">
            {event.excerpt}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border gap-3 shrink-0 mt-auto bg-surface-raised">
        <button className="btn-primary flex-1 py-2.5 text-xs tracking-wider">
          READ MORE
        </button>
        <button className="btn-secondary w-10 h-10 flex items-center justify-center font-bold p-0 rounded-lg">
          →
        </button>
      </div>
    </article>
  )
}

export default function EventsSection({ events }: { events: AnyEvent[] }) {
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
            href="https://events.bhavans.iitr.ac.in"
            className="btn-primary px-6 py-3 text-sm tracking-widest whitespace-nowrap"
          >
            VIEW MORE →
          </a>
        </div>

        <div className="relative">
          <div className="flex gap-5 overflow-x-auto scroll-hidden pb-6 snap-x snap-mandatory items-stretch">
            {events.map(event => (
              <div
                key={event.id}
                className="snap-start flex w-[85vw] sm:w-[360px] flex-shrink-0"
              >
                {event.type === 'poll'
                  ? <PollCard event={event as Poll} />
                  : <BlogCard event={event as Blog} />
                }
              </div>
            ))}
            <div className="flex-shrink-0 w-4" aria-hidden="true" />
          </div>
          <div className="absolute right-0 top-0 bottom-6 w-16 bg-gradient-to-l from-surface-raised to-transparent pointer-events-none" />
        </div>
      </div>
    </section>
  )
}
