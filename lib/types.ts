// ─── EVENT TYPES ────────────────────────────────────────────────────────────
export type EventType = 'poll' | 'blog' | 'tournament-inter' | 'tournament-intra'
export type EventStatus = 'open' | 'closed' | 'upcoming'

export interface BaseEvent {
  id: string
  type: EventType
  title: string
  bhavanSlug?: string   // undefined = inter-bhavan
  bhavanName?: string
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
  bhavanSlug: string
  title: string
  body: string
  postedAt: string
  priority: NoticePriority
  attachmentUrl?: string
}

// ─── BHAVAN TYPES ────────────────────────────────────────────────────────────
export type BhavanCategory = 'boys' | 'girls' | 'married' | 'coed'

export interface BhavanTheme {
  primary: string        // e.g. "#C2410C" (orange for Vivekananda)
  primaryLight: string   // e.g. "#FED7AA"
  primaryDark: string    // e.g. "#7C2D12"
}

export interface Bhavan {
  slug: string
  name: string
  fullName: string
  category: BhavanCategory
  established?: string
  strength?: number
  wardenName?: string
  wardenEmail?: string
  coverImage?: string
  theme: BhavanTheme
  description?: string
}

// ─── WARDEN TYPES ────────────────────────────────────────────────────────────
export interface Warden {
  name: string
  bhavanName: string
  bhavanSlug: string
  email?: string
  phone?: string
  photoUrl?: string
}

// ─── GALLERY ─────────────────────────────────────────────────────────────────
export interface GalleryImage {
  id: string
  url: string
  caption?: string
  bhavanSlug?: string
}

// ─── COUNCIL MEMBER ──────────────────────────────────────────────────────────
export interface CouncilMember {
  name: string
  role: string
  bhavanSlug: string
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
