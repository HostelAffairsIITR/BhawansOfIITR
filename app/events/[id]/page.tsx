import { notFound } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import ReactMarkdown from 'react-markdown'
import { getBhawanBySlug, BHAWANS } from '@/lib/bhawans-data'
import PollVoting from '@/components/events/PollVoting'
import CommentsSection from '@/components/events/CommentsSection'
import ShareSection from '@/components/event/ShareSection'

import { Metadata } from 'next'

interface EventDetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from('content_items')
    .select('title, type')
    .eq('id', id)
    .single()

  if (!item || item.type === 'notice') {
    return {
      title: 'IITR Hostel Council'
    }
  }

  const imageUrl = `/api/events/${id}/og`

  return {
    title: `${item.title} | IITR Hostel Council`,
    openGraph: {
      title: item.title,
      description: `View this ${item.type} on the IITR Bhawans portal.`,
      images: [
        {
          url: imageUrl,
          width: 1080,
          height: 1080,
          alt: item.title
        }
      ],
      type: 'article'
    },
    twitter: {
      card: 'summary_large_image',
      title: item.title,
      images: [imageUrl]
    }
  }
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  const currentUserId = user?.id || null

  // 1. Fetch main content item
  const { data: item } = await supabase
    .from('content_items')
    .select(`
      *,
      blogs(*),
      announcements(*),
      notices(*),
      poll_options(*),
      users(name, image_url)
    `)
    .eq('id', id)
    .single()

  if (!item) {
    notFound()
  }

  // 2. Fetch notice attachments if notice
  let attachments: any[] = []
  if (item.type === 'notice') {
    const { data: attachmentsData } = await supabase
      .from('notice_attachments')
      .select('*')
      .eq('notice_id', id)
    if (attachmentsData) {
      attachments = attachmentsData
    }
  }

  // 3. Fetch poll votes if poll
  let votes: any[] = []
  if (item.type === 'poll') {
    const { data: resultsData } = await supabase
      .rpc('get_poll_results', { poll_id: id })
    if (resultsData) {
      votes = resultsData.map((row: any) => ({
        poll_option_id: String(row.option_id),
        content_item_id: id,
        vote_count: Number(row.vote_count)
      }))
    }
  }

  // 4. Fetch comments if allowed
  let comments: any[] = []
  if (item.allows_comments) {
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, users(name, image_url)')
      .eq('content_item_id', id)
      .order('created_at', { ascending: true })
    if (commentsData) {
      comments = commentsData
    }
  }

  // 5. Fetch bhawan name if scoped notice
  let bhawanName: string | null = null
  let bhawanRestrictionMessage: string | null = null
  let selectedBhawan: any = null
  if (item.bhavan_scope) {
    const { data: bhawanData } = await supabase
      .from('bhavans')
      .select('name')
      .eq('id', item.bhavan_scope)
      .single()
    
    // Fall back to lookup from static data if ID matches index mapping
    bhawanName = bhawanData?.name || getBhawanBySlug(String(item.bhavan_scope))?.name || item.bhavan_scope
    selectedBhawan = BHAWANS.find(b => b.name === bhawanName || b.slug === String(item.bhavan_scope))

    // Check voting/access restrictions for bhawan-scoped polls
    if (currentUserId && item.type === 'poll') {
      const { data: userData } = await supabase
        .from('users')
        .select('bhavan_id')
        .eq('id', currentUserId)
        .maybeSingle()
      
      const userBhawanId = userData?.bhavan_id || null
      if (userBhawanId !== item.bhavan_scope) {
        bhawanRestrictionMessage = `This poll is only open to ${bhawanName} residents`
      }
    }
  }

  // Resolve author (from permissions / fallback)
  let authorName = 'IITR Hostel Council'
  const { data: permission } = await supabase
    .from('permissions')
    .select('users(name)')
    .eq('content_item_id', id)
    .or('role.eq.manager,role.eq.co_manager')
    .limit(1)
    .maybeSingle()
  if (permission && (permission as any).users?.name) {
    authorName = (permission as any).users.name
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface py-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          {/* Back Button */}
          <a href="/events" className="inline-flex items-center gap-2 text-text-muted hover:text-brand text-xs font-bold uppercase tracking-wider mb-8 transition-colors">
            ← BACK TO EVENTS
          </a>

          {/* Render layout based on type */}
          <div className="bg-surface-raised border border-border rounded-2xl shadow-sm overflow-hidden p-6 sm:p-10 mb-10">
            {item.type === 'poll' && (
              <div>
                <span className="inline-block bg-accent/10 text-accent text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase mb-4" style={{ fontFamily: 'var(--font-mono)' }}>POLL</span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text mb-6" style={{ fontFamily: 'var(--font-sans)' }}>{item.title}</h1>
                <PollVoting 
                  itemId={id} 
                  options={item.poll_options || []} 
                  initialVotes={votes} 
                  currentUserId={currentUserId} 
                  bhawanRestrictionMessage={bhawanRestrictionMessage} 
                />
              </div>
            )}

            {item.type === 'blog' && (() => {
              const blogData = Array.isArray(item.blogs) ? item.blogs[0] : item.blogs
              return (
                <div>
                  <span className="inline-block bg-brand/10 text-brand text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase mb-4" style={{ fontFamily: 'var(--font-mono)' }}>BLOG</span>
                  {blogData?.cover_image_url && (
                    <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-6 relative">
                      <img src={blogData.cover_image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-brand mb-2" style={{ fontFamily: 'var(--font-sans)' }}>{item.title}</h1>
                  <p className="text-xs text-text-muted mb-8 font-semibold tracking-wider uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                    BY <span>{item.users?.name ?? 'IITR Hostel Council'}</span> · {new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div className="prose dark:prose-invert max-w-none text-text leading-relaxed text-sm sm:text-base">
                    <ReactMarkdown>{blogData?.body ?? 'No content written yet.'}</ReactMarkdown>
                  </div>
                </div>
              )
            })()}

            {item.type === 'announcement' && (() => {
              const announcementData = Array.isArray(item.announcements) ? item.announcements[0] : item.announcements
              return (
                <div>
                  <span className="inline-block bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase mb-4" style={{ fontFamily: 'var(--font-mono)' }}>ANNOUNCEMENT</span>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-text mb-2" style={{ fontFamily: 'var(--font-sans)' }}>{item.title}</h1>
                  <p className="text-xs text-text-muted mb-8 font-semibold tracking-wider uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                    BY <span>{item.users?.name ?? 'IITR Hostel Council'}</span> · {new Date(item.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  {announcementData?.image_url && (
                    <div className="w-full h-64 sm:h-80 rounded-xl overflow-hidden mb-6 relative">
                      <img src={announcementData.image_url} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="text-text leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                    <p>{announcementData?.body ?? 'No content written yet.'}</p>
                  </div>
                </div>
              )
            })()}

            {item.type === 'notice' && (
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <span className="inline-block bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>NOTICE</span>
                  {bhawanName && (
                    <span className="inline-block bg-surface border border-border text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                      🏢 {bhawanName}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text mb-6" style={{ fontFamily: 'var(--font-sans)' }}>{item.title}</h1>
                <div className="text-text leading-relaxed text-sm sm:text-base whitespace-pre-wrap mb-8">
                  { (Array.isArray(item.notices) ? item.notices[0]?.body : item.notices?.body) || 'No notice details provided.' }
                </div>

                {/* Attachments */}
                {attachments.length > 0 && (
                  <div className="border-t border-border pt-6 mt-6">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-4" style={{ fontFamily: 'var(--font-mono)' }}>ATTACHMENTS</h3>
                    <div className="flex flex-col gap-3">
                      {attachments.map(att => (
                        <div key={att.id} className="flex items-center justify-between border border-border bg-surface p-4 rounded-xl shadow-xs">
                          <div className="min-w-0 flex-1 pr-4">
                            <p className="text-xs font-bold text-text truncate">{att.file_name}</p>
                            <p className="text-[10px] text-text-muted uppercase font-bold mt-1" style={{ fontFamily: 'var(--font-mono)' }}>{att.file_type || 'PDF'}</p>
                          </div>
                          <a href={att.file_url} download target="_blank" rel="noopener noreferrer" className="btn-primary py-2 px-4 text-xs font-semibold tracking-wider shrink-0">
                            DOWNLOAD
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Share Buttons */}
          {item.allows_share && item.type !== 'notice' && (
            <ShareSection item={item} bhawan={selectedBhawan} />
          )}

          {/* Comments Section */}
          {item.allows_comments && (
            <CommentsSection contentItemId={id} initialComments={comments} currentUserId={currentUserId} />
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}
