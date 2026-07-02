import { notFound } from 'next/navigation'
import { getBhavanBySlug, BHAVANS } from '@/lib/bhavans-data'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BhavanHero from '@/components/bhavan/BhavanHero'
import NoticesSection from '@/components/bhavan/NoticesSection'
import AmenitiesSection from '@/components/bhavan/AmenitiesSection'
import GallerySection from '@/components/home/GallerySection'
import CouncilSection from '@/components/bhavan/CouncilSection'
import EmergencySection from '@/components/bhavan/EmergencySection'
import { createClient } from '@/lib/supabase/server'
import BhavanEventsList from '@/components/bhavan/BhavanEventsList'

export const revalidate = 60

// Generate static pages for all bhavans at build time
export async function generateStaticParams() {
  return BHAVANS.map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bhavan = getBhavanBySlug(slug)
  if (!bhavan) return { title: 'Not Found' }
  return {
    title: `${bhavan.name} — Bhavans of IITR`,
    description: bhavan.description ?? `${bhavan.name} residential hall at IIT Roorkee`,
  }
}

export default async function BhavanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bhavan = getBhavanBySlug(slug)
  if (!bhavan) notFound()

  let dbNotices: any[] = []
  let dbGallery: any[] = []
  let dbCouncil: any[] = []
  let dbEvents: any[] = []
  let dbVotes: any[] = []

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient()
      const { data: bhavanData } = await supabase
        .from('bhavans')
        .select('id, name')
        .in('name', [bhavan.name, 'Vivekanand Bhawan'])
        .maybeSingle()

      if (bhavanData) {
        const bhavanId = bhavanData.id

        // Fetch notices, gallery, events, and current term in parallel
        const [noticesRes, galleryRes, termRes, eventsRes] = await Promise.all([
          supabase
            .from('content_items')
            .select('*, notices(*, notice_attachments(*))')
            .eq('type', 'notice')
            .eq('status', 'published')
            .eq('bhavan_scope', bhavanId)
            .order('created_at', { ascending: false }),
          supabase
            .from('gallery_images')
            .select('*')
            .eq('scope', 'bhavan')
            .eq('bhavan_id', bhavanId)
            .order('display_order'),
          supabase
            .from('council_terms')
            .select('id, label')
            .eq('is_current', true)
            .maybeSingle(),
          supabase
            .from('content_items')
            .select('*, blogs(*), announcements(*), poll_options(*), users(name)')
            .eq('status', 'published')
            .eq('bhavan_scope', bhavanId)
            .neq('type', 'notice')
            .order('created_at', { ascending: false })
        ])

        if (noticesRes.data) dbNotices = noticesRes.data
        if (galleryRes.data) dbGallery = galleryRes.data
        if (eventsRes.data) {
          dbEvents = eventsRes.data
          const pollIds = dbEvents.filter(e => e.type === 'poll').map(e => e.id)
          if (pollIds.length > 0) {
            const votePromises = pollIds.map(async (id) => {
              const { data } = await supabase.rpc('get_poll_results', { poll_id: id })
              return (data || []).map((row: any) => ({
                poll_option_id: row.option_id,
                content_item_id: id,
                vote_count: row.vote_count
              }))
            })
            const resolved = await Promise.all(votePromises)
            dbVotes = resolved.flat()
          }
        }

        if (termRes.data) {
          const { data: membersRes } = await supabase
            .from('members')
            .select('*')
            .eq('council_term_id', termRes.data.id)
            .eq('bhavan_id', bhavanId)
            .eq('group_type', 'bhavan_council')
            .order('display_order')

          if (membersRes) {
            dbCouncil = membersRes
          }
        }
      }
    } catch (err) {
      console.warn("Supabase notice/gallery/council fetch failed, showing fallback state:", err)
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <BhavanHero bhavan={bhavan} />
        <NoticesSection notices={dbNotices} theme={bhavan.theme} />
        
        {dbEvents.length > 0 && (
          <section id="events" className="py-14 sm:py-20 border-b border-border bg-surface/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl text-brand tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                  Bhavan Events
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  Latest polls, announcements, and blogs scoped to {bhavan.name}
                </p>
              </div>

              <BhavanEventsList events={dbEvents} votes={dbVotes} bhavan={bhavan} />
            </div>
          </section>
        )}

        <AmenitiesSection theme={bhavan.theme} bhavanSlug={bhavan.slug} />
        <GallerySection images={dbGallery} emptyMessage="Photos coming soon" />
        <CouncilSection bhavanName={bhavan.name} theme={bhavan.theme} members={dbCouncil} />
        <EmergencySection theme={bhavan.theme} />
      </main>
      <Footer />
    </>
  )
}

