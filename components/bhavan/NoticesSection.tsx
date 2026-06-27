import { BhavanTheme } from '@/lib/types'

export interface DbNoticeItem {
  id: string
  title: string
  priority?: boolean | string | null
  created_at: string
  notices?: {
    body: string
    notice_attachments?: {
      id: string;
      file_url: string;
      file_name: string;
      file_type: string;
    }[] | null
  }[] | {
    body: string
    notice_attachments?: {
      id: string;
      file_url: string;
      file_name: string;
      file_type: string;
    }[] | null
  } | null
}

function NoticeCard({ item, theme }: { item: DbNoticeItem; theme: BhavanTheme }) {
  const isUrgent = item.priority === true || item.priority === 'true' || item.priority === 'urgent'
  const date = new Date(item.created_at)
  const dateStr = date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()

  const noticesData = Array.isArray(item.notices) ? item.notices[0] : item.notices
  const body = noticesData?.body || ''
  const attachments = noticesData?.notice_attachments || []

  return (
    <article
      className="border border-border border-l-4 rounded-r-2xl rounded-l-md p-5 sm:p-6 transition-all duration-200 shadow-xs hover:shadow-sm flex flex-col gap-5 bg-surface-raised"
      style={{
        borderLeftColor: isUrgent ? 'var(--color-accent)' : theme.primary,
      }}
    >
      <div className="flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-2 flex-wrap font-semibold" style={{ fontFamily: 'var(--font-sans)' }}>
          {isUrgent ? (
            <span className="bg-accent/10 text-accent text-[10px] font-extrabold px-2.5 py-0.5 rounded-md tracking-wider uppercase border border-accent/20">
              Urgent
            </span>
          ) : (
            <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md tracking-wider uppercase border"
              style={{
                backgroundColor: `${theme.primaryLight}20`,
                color: theme.primary,
                borderColor: `${theme.primary}20`,
              }}>
              Notice
            </span>
          )}
          <span className="text-[10px] font-bold tracking-wider text-text-muted/80 uppercase">
            {dateStr}
          </span>
        </div>

        <h3 className="text-base font-bold text-text leading-snug mb-1.5" style={{ fontFamily: 'var(--font-sans)' }}>
          {item.title}
        </h3>

        <p className="text-xs sm:text-sm text-text-muted leading-relaxed max-w-3xl whitespace-pre-wrap" style={{ fontFamily: 'var(--font-sans)' }}>
          {body}
        </p>
      </div>

      {attachments.length > 0 && (
        <div className="flex flex-col gap-2 mt-2 pt-4 border-t border-border/50">
          <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Attachments:</p>
          <div className="flex flex-col gap-2">
            {attachments.map(att => (
              <div key={att.id} className="flex items-center justify-between bg-surface border border-border px-4 py-2.5 rounded-xl shadow-xs gap-3">
                <span className="text-xs font-semibold text-text truncate max-w-[200px] sm:max-w-xs">{att.file_name}</span>
                <a
                  href={att.file_url}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase transition-all duration-200 border shrink-0 hover:bg-surface-muted cursor-pointer"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    color: theme.primary,
                    borderColor: `${theme.primary}20`,
                  }}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}

export default function NoticesSection({ notices, theme }: { notices: DbNoticeItem[]; theme: BhavanTheme }) {
  return (
    <section id="notices" className="py-14 sm:py-20 border-b border-border bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl text-brand tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
              Notices & Announcements
            </h2>
            <p className="text-text-muted text-sm mt-1">
              Official updates and bulletins from the warden and council
            </p>
          </div>
          <span className="bg-surface-raised border border-border text-text-muted text-[10px] font-extrabold px-3 py-1.5 rounded-lg tracking-wider uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
            {notices.length} Notice{notices.length !== 1 ? 's' : ''}
          </span>
        </div>

        {notices.length === 0 ? (
          <div className="rounded-2xl border border-border p-12 text-center bg-surface-raised shadow-xs">
            <p className="text-text-muted/50 text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
              No current notices for this bhavan
            </p>
          </div>
        ) : (
          <div className="max-h-[520px] overflow-y-auto pr-2 flex flex-col gap-4">
            {notices.map(notice => (
              <NoticeCard key={notice.id} item={notice} theme={theme} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
