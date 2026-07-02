import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'
import { BHAVANS } from '@/lib/bhavans-data'
import QRCode from 'qrcode'

export const runtime = 'edge'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch content item details
    const { data: item, error: itemError } = await supabase
      .from('content_items')
      .select(`
        *,
        blogs(*),
        announcements(*),
        notices(*),
        poll_options(*),
        users(name)
      `)
      .eq('id', id)
      .single()

    if (itemError || !item || item.type === 'notice') {
      return new Response('Not Found', { status: 404 })
    }

    // 2. Fetch bhavan details if scoped
    let bhavanObj: any = null
    if (item.bhavan_scope) {
      const { data: bhavanData } = await supabase
        .from('bhavans')
        .select('name')
        .eq('id', item.bhavan_scope)
        .single()
      
      if (bhavanData) {
        bhavanObj = BHAVANS.find(b => b.name === bhavanData.name || b.slug === String(item.bhavan_scope))
      }
    }

    // 3. Resolve theme colors
    const primaryColor = bhavanObj?.theme?.primary || '#ea580c'
    const secondaryColor = bhavanObj?.theme?.primaryDark || '#7c2d12'
    const primaryLight = bhavanObj?.theme?.primaryLight || '#ffedd5'

    // 4. Generate QR code as base64 data URL
    const url = new URL(request.url)
    const canonicalUrl = `${url.origin}/events/${id}`
    const qrDataUrl = await QRCode.toDataURL(canonicalUrl, {
      margin: 1,
      width: 180,
      color: {
        dark: '#000000',
        light: '#ffffff'
      }
    })

    // 5. Fetch poll stats if type is poll
    let eventResults: { option_id: string | number; vote_count: number }[] = []
    if (item.type === 'poll') {
      const { data, error } = await supabase.rpc('get_poll_results', { poll_id: id })
      if (!error && data) {
        eventResults = data
      }
    }
    const totalVotes = eventResults.reduce((acc, curr) => acc + curr.vote_count, 0)

    // Resolve cover image URL
    const coverUrl = 
      item.type === 'blog' ? (item.blogs?.[0]?.cover_image_url || item.blogs?.cover_image_url) :
      item.type === 'announcement' ? (item.announcements?.[0]?.image_url || item.announcements?.image_url) :
      null

    // Resolve excerpt text cleanly with fallbacks
    const blogObj = Array.isArray(item.blogs) ? item.blogs[0] : item.blogs
    const announcementObj = Array.isArray(item.announcements) ? item.announcements[0] : item.announcements
    const rawBody = blogObj?.body || announcementObj?.body || ''
    
    const resolvedExcerpt = 
      item.excerpt || 
      blogObj?.excerpt || 
      (rawBody ? (rawBody.replace(/[#*`_\-\[\]()]/g, '').slice(0, 240) + '...') : '') ||
      'Click to view the details on the portal.'

    // Satori JSX Layout Configuration
    return new ImageResponse(
      (
        <div
          style={{
            width: '1080px',
            height: '1080px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'between',
            backgroundColor: '#f8fafc',
            padding: '56px',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Glowing Backlights */}
          <div
            style={{
              position: 'absolute',
              borderRadius: '9999px',
              width: '500px',
              height: '500px',
              top: '-80px',
              left: '-80px',
              background: `radial-gradient(circle, ${primaryColor} 0%, transparent 70%)`,
              opacity: 0.15
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
              opacity: 0.15
            }}
          />

          {/* Dotted Background Grid Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              flexWrap: 'wrap',
              opacity: 0.06,
              backgroundImage: 'radial-gradient(circle, #0f172a 1.5px, transparent 1.5px)',
              backgroundSize: '36px 36px',
              pointerEvents: 'none'
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
              {/* IITR Mock Logo Badge */}
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
                  border: '1px solid #f1f5f9',
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                }}
              >
                <img
                  src={`${url.origin}/images/iitr-logo.png`}
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
                textTransform: 'uppercase',
                boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)'
              }}
            >
              {bhavanObj ? `🏛️ ${bhavanObj.name.replace(' Bhawan', '')}` : '🌐 College-Wide'}
            </div>
          </div>

          {/* Content Area */}
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
              // Split cover image layout
              <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <div
                  style={{
                    width: '380px',
                    height: '475px', // 4:5 aspect ratio
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '6px solid #ffffff',
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    display: 'flex',
                    marginRight: '36px'
                  }}
                >
                  <img src={coverUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover" />
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
                  
                  {/* CTA Badge */}
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
              // Full text / Poll layout
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

                {/* Poll progress bars */}
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
                            overflow: 'hidden',
                            boxShadow: '0 1px 2px 0 rgba(0,0,0,0.02)'
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
                  <p style={{ fontSize: '18px', color: '#475569', lineHeight: '1.6', fontWeight: 600, display: 'flex' }}>
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
                {bhavanObj ? `${bhavanObj.name.toUpperCase()} FEED` : 'COLLEGE EVENTS'}
              </span>
              <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 700 }}>
                bhavans.iitr.ac.in/events/{String(id).slice(0, 8)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '12px',
                borderRadius: '16px',
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
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
                <img src={qrDataUrl} style={{ width: '68px', height: '68px', objectFit: 'contain' }} alt="QR" />
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
      ),
      {
        width: 1080,
        height: 1080
      }
    )
  } catch (err: any) {
    console.error('OG generation failed:', err)
    return new Response('Error generating image', { status: 500 })
  }
}
