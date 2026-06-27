import { notFound } from 'next/navigation'
import { getBhavanBySlug, BHAVANS } from '@/lib/bhavans-data'
import { getBhavanGalleryImages } from '@/lib/api'
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
        const { data: noticesData } = await supabase
          .from('content_items')
          .select('*, notices(*, notice_attachments(*))')
          .eq('type', 'notice')
          .eq('status', 'published')
          .eq('bhavan_scope', bhavanData.id)
          .order('created_at', { ascending: false })

        if (noticesData) {
          dbNotices = noticesData
        }
      }
    } catch (err) {
      console.warn("Supabase notice fetch failed, showing empty state:", err)
    }
  }

  const gallery = await getBhavanGalleryImages(slug)

  return (
    <>
      <Navbar />
      <main>
        <BhavanHero bhavan={bhavan} />
        <NoticesSection notices={dbNotices} theme={bhavan.theme} />
        <AmenitiesSection theme={bhavan.theme} />
        <GallerySection images={gallery} />
        <CouncilSection bhavanName={bhavan.name} theme={bhavan.theme} />
        <EmergencySection theme={bhavan.theme} />
      </main>
      <Footer />
    </>
  )
}

