// ─── API LAYER ────────────────────────────────────────────────────────────────
// Today: returns mock data.
// Later: replace each function body with a Supabase query.
// Components never import from mock-data directly — always through here.

import { AnyEvent, Warden, GalleryImage, Notice } from './types'
import { MOCK_EVENTS, MOCK_WARDENS, MOCK_GALLERY } from './mock-data'

// --- Events ------------------------------------------------------------------
export async function getHomeEvents(): Promise<AnyEvent[]> {
  // TODO: replace with Supabase query
  // const { data } = await supabase.from('events').select('*').eq('featured', true).limit(6)
  return MOCK_EVENTS
}

// --- Wardens -----------------------------------------------------------------
export async function getWardens(): Promise<Warden[]> {
  // TODO: replace with Supabase query
  return MOCK_WARDENS
}

// --- Gallery -----------------------------------------------------------------
export async function getGalleryImages(): Promise<GalleryImage[]> {
  // TODO: replace with Supabase query
  return MOCK_GALLERY
}

export async function getBhavanGalleryImages(bhavanSlug: string): Promise<GalleryImage[]> {
  // TODO: replace with Supabase query
  const nameMap: Record<string, string> = {
    azad: 'Azad',
    cautley: 'Cautley',
    ganga: 'Ganga',
    govind: 'Govind',
    jawahar: 'Jawahar',
    rajendra: 'Rajendra',
    radhakrishnan: 'Radhakrishnan',
    rajiv: 'Rajiv',
    ravindra: 'Ravindra',
    malviya: 'Malviya',
    vivekanand: 'Vivekanand',
    sarojini: 'Sarojini',
    kasturba: 'Kasturba',
    indira: 'Indira',
    himalaya: 'Himalaya',
    'gp-hostel': 'G. P. Hostel',
    'mr-chopra': 'M. R. Chopra',
    'azad-wing': 'Azad Wing',
    'an-khosla': 'A. N. Khosla House',
    kih: 'K. I. H.',
    vigyan: 'Vigyan',
  }
  const name = nameMap[bhavanSlug] || bhavanSlug
  return MOCK_GALLERY.map((img, idx) => ({
    ...img,
    id: `${bhavanSlug}-gallery-${idx}`,
    caption: `${name} Bhavan — ${img.caption}`,
  }))
}


// --- Notices (per bhavan) ----------------------------------------------------
export async function getBhavanNotices(bhavanSlug: string): Promise<Notice[]> {
  // TODO: replace with Supabase query
  // const { data } = await supabase.from('notices').select('*').eq('bhavan_slug', bhavanSlug).order('posted_at', { ascending: false })
  return [
    {
      id: 'n1',
      bhavanSlug,
      title: 'Water Supply Interruption — 7th June',
      body: 'Water supply will be interrupted from 9 AM to 1 PM on June 7th due to maintenance work on the main pipeline.',
      postedAt: '2025-06-04',
      priority: 'urgent',
    },
    {
      id: 'n2',
      bhavanSlug,
      title: 'Mess Menu Change — Effective 10th June',
      body: 'The mess committee has approved a revised menu effective June 10th. Please download the attached PDF for full timings and dish details.',
      postedAt: '2025-06-03',
      priority: 'normal',
      attachmentUrl: '/docs/mess-menu-june.pdf',
    },
    {
      id: 'n3',
      bhavanSlug,
      title: 'Gym Timing Update — Summer Schedule',
      body: 'The bhavan gym will now be open from 5:30 AM to 8:00 AM and 6:00 PM to 9:00 PM during summer break.',
      postedAt: '2025-06-01',
      priority: 'normal',
    },
    {
      id: 'n4',
      bhavanSlug,
      title: 'End Semester Checkout Procedure',
      body: 'All residents must complete checkout by June 15th. Submit NOC form to the warden office before vacating. Download the form below.',
      postedAt: '2025-05-28',
      priority: 'urgent',
      attachmentUrl: '/docs/noc-checkout-form.pdf',
    },
    {
      id: 'n5',
      bhavanSlug,
      title: 'Inter-Bhavan Sports Registration Open',
      body: 'Registration for the inter-bhavan basketball and table tennis tournament is now open. Fill in the team spreadsheet by June 10th.',
      postedAt: '2025-05-25',
      priority: 'normal',
      attachmentUrl: '/docs/sports-registration-info.pdf',
    },
    {
      id: 'n6',
      bhavanSlug,
      title: 'Bhavan Cleanliness & Waste Disposal Drive',
      body: 'To maintain hygiene, residents are requested to segregate dry and wet waste. New dustbins have been installed on every floor.',
      postedAt: '2025-05-20',
      priority: 'normal',
    },
    {
      id: 'n7',
      bhavanSlug,
      title: 'Lan Port Maintenance Schedule',
      body: 'Technical staff will visit wings A and B to upgrade LAN ports and test speeds. Please ensure your rooms are accessible during slots.',
      postedAt: '2025-05-18',
      priority: 'normal',
    },
  ]
}
