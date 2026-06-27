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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient()
      const { data: bhavanData } = await supabase
        .from('bhavans')
        .select('id, name')
        .eq('name', bhavan.name)
        .single()

      if (bhavanData) {
        const bhavanId = bhavanData.id

        // Fetch notices, gallery, and current term in parallel
        const [noticesRes, galleryRes, termRes] = await Promise.all([
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
            .maybeSingle()
        ])

        if (noticesRes.data) dbNotices = noticesRes.data
        if (galleryRes.data) dbGallery = galleryRes.data

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
        <AmenitiesSection theme={bhavan.theme} />
        <GallerySection images={dbGallery} emptyMessage="Photos coming soon" />
        <CouncilSection bhavanName={bhavan.name} theme={bhavan.theme} members={dbCouncil} />
        <EmergencySection theme={bhavan.theme} />
      </main>
      <Footer />
    </>
  )
}

