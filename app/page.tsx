import { BhavanCategory } from '@/lib/types'
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

//   const supabase = await createClient()
// const { data, error } = await supabase.from('bhavans').select('*')
// console.log('BHAVANS TEST:', data, error)


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
          poll_options(*),
          users(name)
        `)
        .eq('status', 'published')
        .is('bhavan_scope', null)
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
          const resultsPromises = pollIds.map(async (pollId: string) => {
            const { data } = await supabase.rpc('get_poll_results', { poll_id: pollId })
            return (data || []).map((row: any) => ({
              poll_option_id: String(row.option_id),
              content_item_id: pollId,
              vote_count: Number(row.vote_count)
            }))
          })
          const allResults = await Promise.all(resultsPromises)
          dbVotes = allResults.flat()
        }
      }
    } catch (err) {
      console.warn("Supabase query failed, showing empty state:", err)
    }
  }

  let dbWardens: any[] = []
  let dbGallery: any[] = []
  let dbDosw: any = null

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient()
      const [wardensRes, galleryRes, doswRes] = await Promise.all([
        supabase
          .from('wardens')
          .select('*, bhavans(name)')
          .eq('is_active', true)
          .order('display_order'),
        supabase
          .from('gallery_images')
          .select('*')
          .eq('scope', 'main')
          .order('display_order'),
        supabase
          .from('wardens')
          .select('*')
          .is('bhavan_id', null)
          .eq('is_active', true)
          .maybeSingle()
      ])

      if (wardensRes.data) dbWardens = wardensRes.data
      if (galleryRes.data) dbGallery = galleryRes.data
      if (doswRes.data) dbDosw = doswRes.data
    } catch (err) {
      console.warn("Supabase extra data query failed, using empty fallbacks:", err)
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <EventsSection events={dbEvents} votes={dbVotes} />
        <ThomsonBand />
        <CampusMapSection />
        <BhavansSection activeTab={activeTab} selectedSlug={selectedSlug} />
        <GallerySection images={dbGallery} />
        <WardenSection wardens={dbWardens} />
        <DOSWSection dosw={dbDosw} />
      </main>
      <Footer />
    </>
  )
}
