import { BhavanCategory } from '@/lib/types'
import { getHomeEvents, getWardens, getGalleryImages } from '@/lib/api'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import HeroSection from '@/components/home/HeroSection'
import EventsSection from '@/components/home/EventsSection'
import ThomsonBand from '@/components/home/ThomsonBand'
import CampusMapSection from '@/components/home/CampusMapSection'
import BhavansSection from '@/components/home/BhavansSection'
import GallerySection from '@/components/home/GallerySection'
import WardenSection from '@/components/home/WardenSection'
import DOSWSection from '@/components/home/DOSWSection'

interface HomePageProps {
  searchParams: Promise<{ tab?: string; selected?: string }>
}

// ISR — revalidate every 60 seconds for events/wardens
export const revalidate = 60

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams
  const activeTab = (['boys', 'girls', 'married', 'coed'].includes(params.tab ?? '')
    ? params.tab
    : 'boys') as BhavanCategory
  const selectedSlug = params.selected

  // All data fetched server-side in parallel
  const [events, wardens, gallery] = await Promise.all([
    getHomeEvents(),
    getWardens(),
    getGalleryImages(),
  ])

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <EventsSection events={events} />
        <ThomsonBand />
        <CampusMapSection />
        <BhavansSection activeTab={activeTab} selectedSlug={selectedSlug} />
        <GallerySection images={gallery} />
        <WardenSection wardens={wardens} />
        <DOSWSection />
      </main>
      <Footer />
    </>
  )
}
