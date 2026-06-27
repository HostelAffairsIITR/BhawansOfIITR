import { BhavanCategory } from '@/lib/types'
import { getWardens, getGalleryImages } from '@/lib/api'
import { createClient } from '@/lib/supabase/server'
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let dbEvents: any[] = []
  let dbVotes: any[] = []

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient()
      const { data } = await supabase
        .from('content_items')
        .select(`
          *,
          blogs(*),
          announcements(*),
          notices(*),
          poll_options(*)
        `)
        .eq('status', 'published')
        .neq('type', 'notice')
        .order('priority', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false })
        .limit(8)

      if (data) {
        dbEvents = data
        const pollIds = data
          .filter((item: any) => item.type === 'poll')
          .map((item: any) => item.id)

        if (pollIds.length > 0) {
          const { data: votesData } = await supabase
            .from('poll_votes')
            .select('poll_option_id, content_item_id')
            .in('content_item_id', pollIds)
          if (votesData) {
            dbVotes = votesData
          }
        }
      }
    } catch (err) {
      console.warn("Supabase query failed, showing empty state:", err)
    }
  }

  // All other data fetched server-side in parallel
  const [wardens, gallery] = await Promise.all([
    getWardens(),
    getGalleryImages(),
  ])

  console.log('DB EVENTS:', dbEvents.length, dbEvents)

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <EventsSection events={dbEvents} votes={dbVotes} />
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
