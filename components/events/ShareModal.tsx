'use client'
import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import * as htmlToImage from 'html-to-image'
import QRCode from 'qrcode'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  item: any
  bhawan?: any // Optional details of the Bhawan
}

export default function ShareModal({ isOpen, onClose, item, bhawan }: ShareModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [eventResults, setEventResults] = useState<{ option_id: string | number; vote_count: number }[]>([])
  
  const cardRef = useRef<HTMLDivElement>(null)

  // Fetch poll stats and generate QR code
  useEffect(() => {
    if (!isOpen) return

    // 1. Fetch current votes via secure RPC if type is poll
    if (item.type === 'poll') {
      const supabase = createClient()
      const fetchPollResults = async () => {
        try {
          const { data, error } = await supabase.rpc('get_poll_results', { poll_id: item.id })
          if (!error && data) {
            setEventResults(data)
          }
        } catch (err) {
          console.error('Failed to fetch poll stats:', err)
        }
      }
      fetchPollResults()
    }

    // 2. Generate canonical link QR Code
    const canonicalUrl = `${window.location.origin}/events/${item.id}`
    QRCode.toDataURL(canonicalUrl, {
      margin: 1,
      width: 200,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch((err: any) => console.error('Failed to generate sharing QR:', err))

  }, [isOpen, item])

  if (!isOpen) return null

  // Copy canonical url to clipboard
  const handleCopyLink = () => {
    const canonicalUrl = `${window.location.origin}/events/${item.id}`
    navigator.clipboard.writeText(canonicalUrl)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
  }

  // Generate JPEG data URL from reference (which is rendered off-screen at 1:1 scale)
  const generateJpeg = async (): Promise<string | null> => {
    if (!cardRef.current) return null
    setIsGenerating(true)
    try {
      // Small delay to ensure any dynamic assets/images are fully drawn
      await new Promise(r => setTimeout(r, 400))
      
      const dataUrl = await htmlToImage.toJpeg(cardRef.current, {
        width: 1080,
        height: 1080,
        quality: 0.85,
        cacheBust: true
      })
      return dataUrl
    } catch (error) {
      console.error('Failed to render sharing canvas:', error)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  // Trigger download of JPEG
  const handleDownload = async () => {
    const dataUrl = await generateJpeg()
    if (!dataUrl) return
    const link = document.createElement('a')
    link.download = `${item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-share.jpg`
    link.href = dataUrl
    link.click()
  }

  // Share using Web Share API
  const handleNativeShare = async () => {
    const dataUrl = await generateJpeg()
    if (!dataUrl) return
    try {
      const blob = await fetch(dataUrl).then(res => res.blob())
      const file = new File([blob], 'share-card.jpg', { type: 'image/jpeg' })
      const canonicalUrl = `${window.location.origin}/events/${item.id}`

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: item.title,
          text: `Check out this event from IIT Roorkee: ${item.title}`
        })
      } else {
        await navigator.share({
          title: item.title,
          text: item.title,
          url: canonicalUrl
        })
      }
    } catch (error) {
      console.error('Web share failed:', error)
    }
  }

  // Common metadata
  const primaryColor = bhawan?.theme?.primary || '#ea580c'
  const secondaryColor = bhawan?.theme?.primaryDark || '#7c2d12'

  const baseCoverUrl = 
    item.type === 'blog' ? (item.blogs?.[0]?.cover_image_url || item.blogs?.cover_image_url) :
    item.type === 'announcement' ? (item.announcements?.[0]?.image_url || item.announcements?.image_url) :
    null

  const coverUrl = baseCoverUrl
    ? `${baseCoverUrl}${baseCoverUrl.includes('?') ? '&' : '?'}share_cb=${Date.now()}`
    : null

  const totalVotes = eventResults.reduce((acc, curr) => acc + curr.vote_count, 0)

  // Resolve excerpt text cleanly with fallbacks
  const blogObj = Array.isArray(item.blogs) ? item.blogs[0] : item.blogs
  const announcementObj = Array.isArray(item.announcements) ? item.announcements[0] : item.announcements
  const rawBody = blogObj?.body || announcementObj?.body || ''
  
  const resolvedExcerpt = 
    item.excerpt || 
    blogObj?.excerpt || 
    (rawBody ? (rawBody.replace(/[#*`_\-\[\]()]/g, '').slice(0, 240) + '...') : '') ||
    'Click to view the details on the portal.'

  const resolvedExcerptPreview = 
    item.excerpt || 
    blogObj?.excerpt || 
    (rawBody ? (rawBody.replace(/[#*`_\-\[\]()]/g, '').slice(0, 100) + '...') : '') ||
    'View details on portal.'

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      {/* Modal Container */}
      <div className="bg-surface-raised border border-border text-text rounded-2xl shadow-2xl max-w-md w-full p-6 relative flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-text-muted hover:text-text cursor-pointer z-10 p-1.5 rounded-lg hover:bg-surface-muted transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <h3 className="text-md sm:text-lg font-bold mb-4 pr-8 uppercase tracking-wide" style={{ fontFamily: 'var(--font-sans)' }}>
          Share Event
        </h3>

        {/* ON-SCREEN PREVIEW DISPLAY (Perfect rendering scale without transform hacks) */}
        <div className="flex-1 overflow-y-auto mb-6 flex flex-col items-center justify-center">
          <div className="w-full max-w-[320px] aspect-square rounded-2xl bg-slate-50 border border-slate-200 text-slate-900 p-5 flex flex-col justify-between overflow-hidden relative shadow-md">
            
            {/* Glowing Accent Lights */}
            <div 
              className="absolute rounded-full filter blur-xl opacity-10 w-32 h-32 -top-5 -left-5"
              style={{ background: `radial-gradient(circle, ${primaryColor} 0%, transparent 80%)` }}
            />
            <div 
              className="absolute rounded-full filter blur-xl opacity-10 w-28 h-28 -bottom-5 -right-5"
              style={{ background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 80%)` }}
            />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5 z-10">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center p-0.5 border border-slate-200 shrink-0">
                  <img src="/images/iitr-logo.png" alt="IITR Logo" className="w-full h-full object-contain" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-black tracking-wider text-slate-800">IIT ROORKEE</span>
                </div>
              </div>
              <span className="border border-slate-200 px-2 py-0.5 rounded-md bg-white font-bold text-[8px] tracking-wider text-slate-500 uppercase">
                {bhawan ? bhawan.name.replace(' Bhawan', '') : 'Council'}
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 flex flex-col justify-center py-2 z-10 overflow-hidden">
              {coverUrl ? (
                <div className="grid grid-cols-12 gap-3 items-center">
                  <div className="col-span-5 aspect-[4/5] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex">
                    <img src={coverUrl} crossOrigin="anonymous" alt="Cover" className="w-full h-full object-cover" />
                  </div>
                  <div className="col-span-7 flex flex-col gap-1 min-w-0">
                    <h4 className="text-[12px] font-bold leading-tight text-slate-900 truncate">
                      {item.title}
                    </h4>
                    {item.type === 'blog' && (
                      <span className="text-[7.5px] font-extrabold text-slate-400 uppercase tracking-wide">
                        By: {item.users?.name || 'IITR Hostel Council'}
                      </span>
                    )}
                    <p className="text-[8px] text-slate-500 leading-normal line-clamp-3 font-semibold">
                      {resolvedExcerptPreview}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {item.type === 'poll' && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[7px] font-bold text-slate-400">
                        🗳️ {totalVotes} votes
                      </span>
                    </div>
                  )}
                  <h4 className="text-[14px] font-bold leading-tight text-slate-900 line-clamp-2">
                    {item.title}
                  </h4>
                  {item.type === 'blog' && (
                    <span className="text-[8.5px] font-extrabold text-slate-400 uppercase tracking-wide">
                      By: {item.users?.name || 'IITR Hostel Council'}
                    </span>
                  )}
                  
                  {item.type !== 'poll' && (
                    <p className="text-[9px] text-slate-500 leading-normal line-clamp-4 font-semibold">
                      {resolvedExcerptPreview}
                    </p>
                  )}
                  
                  {item.type === 'poll' && item.poll_options && (
                    <div className="flex flex-col gap-1">
                      {item.poll_options.slice(0, 2).map((opt: any) => {
                        const optionId = String(opt.id)
                        const voteObj = eventResults.find(v => String(v.option_id) === optionId)
                        const voteCount = voteObj ? voteObj.vote_count : 0
                        const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0
                        
                        return (
                          <div key={opt.id} className="relative bg-white border border-slate-200 rounded-md py-1 px-2 overflow-hidden flex items-center justify-between text-[8px]">
                            <div 
                              className="absolute top-0 bottom-0 left-0" 
                              style={{ width: `${percentage}%`, backgroundColor: primaryColor, opacity: 0.1 }} 
                            />
                            <span className="font-bold text-slate-700 truncate pr-2 z-10">{opt.option_text}</span>
                            <span className="font-bold z-10" style={{ color: primaryColor }}>{percentage}%</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-slate-200 pt-2 flex items-center justify-between z-10">
              <div>
                <p className="text-[9px] font-black text-slate-800 uppercase tracking-wide">
                  {bhawan ? `${bhawan.name.toUpperCase()} FEED` : 'COLLEGE EVENTS'}
                </p>
                <p className="text-[7px] text-slate-400 font-mono lowercase">
                  bhawans.iitr.ac.in
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                {qrDataUrl && <img src={qrDataUrl} alt="QR Code" className="w-6 h-6 object-contain" />}
                <span className="text-[6px] font-black text-slate-400 block uppercase leading-none">SCAN<br/>TO<br/><span style={{ color: primaryColor }}>{item.type === 'poll' ? 'VOTE' : 'READ'}</span></span>
              </div>
            </div>

          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col gap-2 mt-auto">
          <button onClick={handleDownload} disabled={isGenerating} className="btn-primary w-full py-3.5 text-xs font-bold tracking-widest cursor-pointer uppercase rounded-xl">
            {isGenerating ? 'GENERATING CARD...' : '📥 DOWNLOAD HIGH-RES CARD'}
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button onClick={handleNativeShare} disabled={isGenerating} className="border border-border bg-surface hover:bg-surface-muted text-text text-xs font-bold py-3 uppercase tracking-wider rounded-xl cursor-pointer">
              📱 DIRECT SHARE
            </button>
            <button onClick={handleCopyLink} className="border border-border bg-surface hover:bg-surface-muted text-text text-xs font-bold py-3 uppercase tracking-wider rounded-xl cursor-pointer">
              {copied ? 'LINK COPIED! ✓' : '🔗 COPY LINK'}
            </button>
          </div>
        </div>

      </div>

      {/* OFF-SCREEN 1080x1080 CANVAS CONTAINER (Rendered at exact 1:1 scale for perfect, crisp quality exports) */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', width: '1080px', height: '1080px', pointerEvents: 'none', zIndex: -100 }}>
        <div 
          ref={cardRef} 
          style={{
            width: '1080px',
            height: '1080px',
            position: 'relative',
            backgroundColor: '#f8fafc',
            color: '#0f172a',
            padding: '56px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.06) 1.5px, transparent 1.5px)',
            backgroundSize: '36px 36px',
            boxSizing: 'border-box'
          }}
        >
          {/* Glowing Accent Lights (With proper un-scaled blur parameters) */}
          <div 
            style={{
              position: 'absolute',
              borderRadius: '9999px',
              width: '500px',
              height: '500px',
              top: '-80px',
              left: '-80px',
              background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
              opacity: 0.15,
              filter: 'blur(100px)'
            }}
          />
          <div 
            style={{
              position: 'absolute',
              borderRadius: '9999px',
              width: '450px',
              height: '450px',
              bottom: '-80px',
              right: '-80px',
              background: `radial-gradient(circle, ${secondaryColor} 0%, transparent 70%)`,
              opacity: 0.15,
              filter: 'blur(100px)'
            }}
          />

          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #e2e8f0',
              paddingBottom: '32px',
              width: '100%',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '9999px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                  overflow: 'hidden',
                  border: '1px solid #f1f5f9'
                }}
              >
                <img
                  src="/images/iitr-logo.png"
                  alt="IITR Logo"
                  style={{ width: '44px', height: '44px', objectFit: 'contain' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '24px', fontWeight: 900, letterSpacing: '0.15em', color: '#0f172a' }}>
                  IIT ROORKEE
                </span>
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: '#64748b', textTransform: 'uppercase' }}>
                  Hostel Council
                </span>
              </div>
            </div>

            <div
              style={{
                border: '1px solid #e2e8f0',
                padding: '10px 20px',
                borderRadius: '12px',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                fontWeight: 900,
                letterSpacing: '0.05em',
                color: '#334155',
                textTransform: 'uppercase'
              }}
            >
              {bhawan ? `🏛️ ${bhawan.name.replace(' Bhawan', '')}` : '🌐 College-Wide'}
            </div>
          </div>

          {/* Body */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flex: 1,
              width: '100%',
              paddingTop: '32px',
              paddingBottom: '32px',
              zIndex: 10
            }}
          >
            {coverUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div
                  style={{
                    width: '380px',
                    height: '475px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '6px solid #ffffff',
                    display: 'flex',
                    marginRight: '36px',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
                    backgroundColor: '#f1f5f9'
                  }}
                >
                  <img src={coverUrl} crossOrigin="anonymous" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h2
                    style={{
                      fontSize: '36px',
                      fontWeight: 900,
                      lineHeight: '1.2',
                      color: '#0f172a',
                      marginBottom: '12px',
                      display: 'flex',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    {item.title}
                  </h2>
                  {item.type === 'blog' && (
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 850,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '14px',
                        display: 'flex'
                      }}
                    >
                      By: {item.users?.name || 'IITR Hostel Council'}
                    </span>
                  )}
                  <p style={{ fontSize: '16px', color: '#475569', lineHeight: '1.6', fontWeight: 600, display: 'flex', marginBottom: '20px' }}>
                    {resolvedExcerpt}
                  </p>
                  
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '12px',
                      fontWeight: 900,
                      color: primaryColor,
                      backgroundColor: `${primaryColor}05`,
                      border: `1px solid ${primaryColor}15`,
                      padding: '8px 16px',
                      borderRadius: '12px',
                      width: 'fit-content',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                  >
                    📖 Read blog by {item.users?.name || 'IITR Hostel Council'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                {item.type === 'poll' && (
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 900,
                        letterSpacing: '0.15em',
                        backgroundColor: '#f1f5f9',
                        border: '1px solid #e2e8f0',
                        color: '#64748b',
                        padding: '6px 14px',
                        borderRadius: '9999px',
                        textTransform: 'uppercase'
                      }}
                    >
                      🗳️ {totalVotes} Votes Cast
                    </span>
                  </div>
                )}

                <h2
                  style={{
                    fontSize: '44px',
                    fontWeight: 900,
                    lineHeight: '1.25',
                    color: '#0f172a',
                    marginBottom: '12px',
                    letterSpacing: '-0.02em',
                    display: 'flex'
                  }}
                >
                  {item.title}
                </h2>

                {item.type === 'blog' && (
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: 850,
                      color: '#64748b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      marginBottom: '16px',
                      display: 'flex'
                    }}
                  >
                    By: {item.users?.name || 'IITR Hostel Council'}
                  </span>
                )}

                {item.type === 'poll' && (
                  <p style={{ fontSize: '17px', color: '#64748b', fontWeight: 600, display: 'flex', marginBottom: '24px' }}>
                    Cast your vote now on the portal to make your opinion count!
                  </p>
                )}

                {item.type === 'poll' && item.poll_options && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
                    {item.poll_options.slice(0, 3).map((opt: any) => {
                      const optionId = String(opt.id)
                      const voteObj = eventResults.find(v => String(v.option_id) === optionId)
                      const voteCount = voteObj ? voteObj.vote_count : 0
                      const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0

                      return (
                        <div
                          key={opt.id}
                          style={{
                            position: 'relative',
                            backgroundColor: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '16px',
                            padding: '18px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              position: 'absolute',
                              top: 0,
                              bottom: 0,
                              left: 0,
                              width: `${percentage}%`,
                              backgroundColor: primaryColor,
                              opacity: 0.12
                            }}
                          />
                          <span style={{ fontSize: '16px', fontWeight: 900, color: '#334155', zIndex: 5 }}>
                            {opt.option_text}
                          </span>
                          <span style={{ fontSize: '16px', fontWeight: 900, color: primaryColor, zIndex: 5 }}>
                            {percentage}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}

                {item.type !== 'poll' && (
                  <p style={{ fontSize: '20px', color: '#475569', lineHeight: '1.7', fontWeight: 600, display: 'flex' }}>
                    {resolvedExcerpt}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '32px',
              width: '100%',
              zIndex: 10
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '12px', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
                Check it out on
              </span>
              <span style={{ fontSize: '20px', fontWeight: 900, color: '#0f172a', letterSpacing: '0.05em', marginBottom: '4px' }}>
                {bhawan ? `${bhawan.name.toUpperCase()} FEED` : 'COLLEGE EVENTS'}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
                bhawans.iitr.ac.in/events/{String(item.id).slice(0, 8)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '12px',
                borderRadius: '16px'
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: '#ffffff',
                  borderRadius: '8px',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                  border: '1px solid #f1f5f9'
                }}
              >
                {qrDataUrl && <img src={qrDataUrl} style={{ width: '68px', height: '68px', objectFit: 'contain' }} alt="QR" />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', letterSpacing: '0.1em' }}>SCAN</span>
                <span style={{ fontSize: '11px', fontWeight: 900, color: '#64748b', letterSpacing: '0.1em' }}>TO</span>
                <span style={{ fontSize: '12px', fontWeight: 900, color: primaryColor, letterSpacing: '0.1em' }}>
                  {item.type === 'poll' ? 'VOTE' : 'READ'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
