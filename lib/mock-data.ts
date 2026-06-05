// ─── MOCK DATA ────────────────────────────────────────────────────────────────
// Replace fetch calls in lib/api.ts with real Supabase queries later.
// Shape of data here exactly mirrors what the API will return.

import { AnyEvent, Warden, GalleryImage } from './types'

export const MOCK_EVENTS: AnyEvent[] = [
  {
    id: 'poll-1',
    type: 'poll',
    title: 'Which Bhavan Has The Best Mess Food?',
    question: 'Vote now — results revealed on Bhavan Day.',
    status: 'open',
    createdAt: '2025-11-01',
    endsAt: '2025-12-15',
    totalVotes: 1247,
    options: [
      { id: 'a', label: 'Ganga Bhawan', votes: 412 },
      { id: 'b', label: 'Vivekanand Bhawan', votes: 389 },
      { id: 'c', label: 'Cautley Bhawan', votes: 284 },
      { id: 'd', label: 'Others', votes: 162 },
    ],
  },
  {
    id: 'blog-1',
    type: 'blog',
    title: 'Life in Ganga Bhawan — A Fresher\'s Perspective',
    excerpt: 'Moving into Ganga Bhawan was unlike anything I had imagined. The corridors buzz with energy past midnight...',
    coverImage: '/images/placeholder-campus.jpg',
    author: 'Aryan Mehta',
    publishedAt: '2024-11-10',
    status: 'open',
    createdAt: '2024-11-10',
    bhavanSlug: 'ganga',
    bhavanName: 'Ganga Bhawan',
  },
  {
    id: 'poll-2',
    type: 'poll',
    title: 'Best Inter-Bhavan Cultural Night 2024?',
    question: 'From Thomso to Cognizance — which bhavan owned the stage?',
    status: 'open',
    createdAt: '2024-11-20',
    endsAt: '2024-12-01',
    totalVotes: 892,
    options: [
      { id: 'a', label: 'Azad Bhawan', votes: 310 },
      { id: 'b', label: 'Vivekanand Bhawan', votes: 287 },
      { id: 'c', label: 'Rajendra Bhawan', votes: 195 },
      { id: 'd', label: 'Others', votes: 100 },
    ],
  },
  {
    id: 'blog-2',
    type: 'blog',
    title: 'Azad Bhawan Wins Inter-Bhavan Football Cup',
    excerpt: 'In a nail-biting final, Azad Bhawan clinched the Inter-Bhavan Football Cup for the third consecutive year...',
    coverImage: '/images/placeholder-campus.jpg',
    author: 'Rohan Sharma',
    publishedAt: '2024-10-20',
    status: 'closed',
    createdAt: '2024-10-20',
  },
]

export const MOCK_WARDENS: Warden[] = [
  { name: 'Prof. R. K. Sharma', bhavanName: 'Azad Bhawan', bhavanSlug: 'azad' },
  { name: 'Prof. S. Mehta', bhavanName: 'Ganga Bhawan', bhavanSlug: 'ganga' },
  { name: 'Prof. A. Verma', bhavanName: 'Vivekanand Bhawan', bhavanSlug: 'vivekanand' },
  { name: 'Prof. P. Singh', bhavanName: 'Rajendra Bhawan', bhavanSlug: 'rajendra' },
  { name: 'Prof. M. Gupta', bhavanName: 'Sarojini Bhawan', bhavanSlug: 'sarojini' },
  { name: 'Prof. K. Tiwari', bhavanName: 'Cautley Bhawan', bhavanSlug: 'cautley' },
]

export const MOCK_GALLERY: GalleryImage[] = [
  { id: '1', url: '/images/placeholder-campus.jpg', caption: 'Thomson Building' },
  { id: '2', url: '/images/placeholder-campus.jpg', caption: 'Solani River View' },
  { id: '3', url: '/images/placeholder-campus.jpg', caption: 'Bhavan Day 2024' },
  { id: '4', url: '/images/placeholder-campus.jpg', caption: 'Inter-Bhavan Sports' },
  { id: '5', url: '/images/placeholder-campus.jpg', caption: 'Cultural Night' },
  { id: '6', url: '/images/placeholder-campus.jpg', caption: 'Mess Hall' },
  { id: '7', url: '/images/placeholder-campus.jpg', caption: 'Common Room' },
  { id: '8', url: '/images/placeholder-campus.jpg', caption: 'Main Gate' },
  { id: '9', url: '/images/placeholder-campus.jpg', caption: 'Library' },
]
