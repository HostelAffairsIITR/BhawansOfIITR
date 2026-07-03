import { notFound } from 'next/navigation'
import { getBhawanBySlug, BHAWANS } from '@/lib/bhawans-data'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BhawanHero from '@/components/bhawan/BhawanHero'
import NoticesSection from '@/components/bhawan/NoticesSection'
import AmenitiesSection from '@/components/bhawan/AmenitiesSection'
import GallerySection from '@/components/home/GallerySection'
import CouncilSection from '@/components/bhawan/CouncilSection'
import EmergencySection from '@/components/bhawan/EmergencySection'
import { createClient } from '@/lib/supabase/server'
import BhawanEventsList from '@/components/bhawan/BhawanEventsList'

export const revalidate = 60

// Generate static pages for all bhawans at build time
export async function generateStaticParams() {
  return BHAWANS.map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bhawan = getBhawanBySlug(slug)
  if (!bhawan) return { title: 'Not Found' }
  return {
    title: `${bhawan.name} — Bhawans of IITR`,
    description: bhawan.description ?? `${bhawan.name} residential hall at IIT Roorkee`,
  }
}

export default async function BhawanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const bhawan = getBhawanBySlug(slug)
  if (!bhawan) notFound()

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
      const { data: bhawanData } = await supabase
        .from('bhavans')
        .select('id, name')
        .in('name', [bhawan.name, 'Vivekanand Bhawan'])
        .maybeSingle()

      if (bhawanData) {
        const bhawanId = bhawanData.id

        // Fetch notices, gallery, events, and current term in parallel
        const [noticesRes, galleryRes, termRes, eventsRes] = await Promise.all([
          supabase
            .from('content_items')
            .select('*, notices(*, notice_attachments(*))')
            .eq('type', 'notice')
            .eq('status', 'published')
            .eq('bhavan_scope', bhawanId)
            .order('created_at', { ascending: false }),
          supabase
            .from('gallery_images')
            .select('*')
            .eq('scope', 'bhawan')
            .eq('bhavan_id', bhawanId)
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
            .eq('bhavan_scope', bhawanId)
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
            .eq('bhavan_id', bhawanId)
            .eq('group_type', 'bhawan_council')
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
        <BhawanHero bhawan={bhawan} />
        <NoticesSection notices={dbNotices} theme={bhawan.theme} />
        
        {dbEvents.length > 0 && (
          <section id="events" className="py-14 sm:py-20 border-b border-border bg-surface/20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="mb-8">
                <h2 className="text-3xl sm:text-4xl text-brand tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
                  Bhawan Events
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  Latest polls, announcements, and blogs scoped to {bhawan.name}
                </p>
              </div>

              <BhawanEventsList events={dbEvents} votes={dbVotes} bhawan={bhawan} />
            </div>
          </section>
        )}

        <AmenitiesSection theme={bhawan.theme} bhawanSlug={bhawan.slug} />
        <GallerySection images={dbGallery} emptyMessage="Photos coming soon" />
        <CouncilSection bhawanName={bhawan.name} theme={bhawan.theme} members={dbCouncil} />
        <EmergencySection theme={bhawan.theme} />
      </main>
      <Footer />
    </>
  )
}

