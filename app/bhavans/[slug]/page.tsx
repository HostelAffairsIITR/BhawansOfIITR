import { notFound } from 'next/navigation'
import { getBhavanBySlug, BHAVANS } from '@/lib/bhavans-data'
import { getBhavanNotices, getBhavanGalleryImages } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import BhavanHero from '@/components/bhavan/BhavanHero'
import NoticesSection from '@/components/bhavan/NoticesSection'
import AmenitiesSection from '@/components/bhavan/AmenitiesSection'
import GallerySection from '@/components/home/GallerySection'
import CouncilSection from '@/components/bhavan/CouncilSection'
import EmergencySection from '@/components/bhavan/EmergencySection'

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

  const [notices, gallery] = await Promise.all([
    getBhavanNotices(slug),
    getBhavanGalleryImages(slug),
  ])

  return (
    <>
      <Navbar />
      <main>
        <BhavanHero bhavan={bhavan} />
        <NoticesSection notices={notices} theme={bhavan.theme} />
        <AmenitiesSection theme={bhavan.theme} />
        <GallerySection images={gallery} />
        <CouncilSection bhavanName={bhavan.name} theme={bhavan.theme} />
        <EmergencySection theme={bhavan.theme} />
      </main>
      <Footer />
    </>
  )
}

