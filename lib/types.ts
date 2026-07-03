// ─── EVENT TYPES ────────────────────────────────────────────────────────────
export type EventType = 'poll' | 'blog' | 'tournament-inter' | 'tournament-intra'
export type EventStatus = 'open' | 'closed' | 'upcoming'

export interface BaseEvent {
  id: string
  type: EventType
  title: string
  bhawanSlug?: string   // undefined = inter-bhawan
  bhawanName?: string
  createdAt: string
  status: EventStatus
}

export interface PollOption {
  id: string
  label: string
  votes: number
}

export interface Poll extends BaseEvent {
  type: 'poll'
  question: string
  options: PollOption[]
  totalVotes: number
  endsAt: string
  coverImage?: string
}

export interface Blog extends BaseEvent {
  type: 'blog'
  excerpt: string
  coverImage: string
  author: string
  publishedAt: string
}

export interface Tournament extends BaseEvent {
  type: 'tournament-inter' | 'tournament-intra'
  sport: string
  startDate: string
  endDate?: string
  coverImage?: string
  excerpt?: string
}

export type AnyEvent = Poll | Blog | Tournament

// ─── NOTICE TYPES ────────────────────────────────────────────────────────────
export type NoticePriority = 'normal' | 'urgent'

export interface Notice {
  id: string
  bhawanSlug: string
  title: string
  body: string
  postedAt: string
  priority: NoticePriority
  attachmentUrl?: string
}

// ─── BHAWAN TYPES ────────────────────────────────────────────────────────────
export type BhawanCategory = 'boys' | 'girls' | 'married' | 'coed'

export interface BhawanTheme {
  primary: string        // e.g. "#C2410C" (orange for Vivekananda)
  primaryLight: string   // e.g. "#FED7AA"
  primaryDark: string    // e.g. "#7C2D12"
}

export interface Bhawan {
  slug: string
  name: string
  fullName: string
  category: BhawanCategory
  established?: string
  strength?: number
  wardenName?: string
  wardenEmail?: string
  coverImage?: string
  theme: BhawanTheme
  description?: string
}

// ─── WARDEN TYPES ────────────────────────────────────────────────────────────
export interface Warden {
  name: string
  bhawanName: string
  bhawanSlug: string
  email?: string
  phone?: string
  photoUrl?: string
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────
export interface GalleryImage {
  id: string
  url: string
  caption?: string
  bhawanSlug?: string
}

// ─── COUNCIL MEMBER ──────────────────────────────────────────────────────────
export interface CouncilMember {
  name: string
  role: string
  bhawanSlug: string
  year?: string
  photoUrl?: string
  email?: string
}

// ─── AMENITY ─────────────────────────────────────────────────────────────────
export interface Amenity {
  id: string
  name: string
  icon: string
  description: string
  timing?: string
  details?: string[]
  image_url?: string | null
}

// ─── EMERGENCY CONTACT ───────────────────────────────────────────────────────
export interface EmergencyContact {
  label: string
  phone: string
  available: string
}
