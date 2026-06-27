'use client'
import { useState, useEffect } from 'react'

export default function ShareSection({ title }: { title: string }) {
  const [shareUrl, setShareUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setShareUrl(window.location.href)
    }
  }, [])

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${shareUrl}`)}`

  return (
    <div className="flex flex-wrap items-center gap-4 border-t border-border pt-8 mt-8">
      <span className="text-xs font-extrabold uppercase tracking-wider text-text-muted" style={{ fontFamily: 'var(--font-mono)' }}>
        SHARE THIS EVENT:
      </span>

      <div className="flex items-center gap-2">
        {/* Twitter / X */}
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-border bg-surface hover:bg-surface-muted hover:border-border-strong text-text font-bold text-xs px-4 py-2 rounded-xl transition-all duration-150 shadow-xs"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4l11.733 16h4.267l-11.733 -16z"/>
            <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/>
          </svg>
          SHARE ON X
        </a>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-border bg-surface hover:bg-surface-muted hover:border-border-strong text-text font-bold text-xs px-4 py-2 rounded-xl transition-all duration-150 shadow-xs"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
          </svg>
          WHATSAPP
        </a>
      </div>
    </div>
  )
}
