import { Bhavan, BhavanCategory } from './types'

export const BHAVANS: Bhavan[] = [
  // BOYS
  { slug: 'azad', name: 'Azad Bhawan', fullName: 'Azad Bhawan', category: 'boys', theme: { primary: '#be123c', primaryLight: '#ffe4e6', primaryDark: '#881337' } },
  { slug: 'cautley', name: 'Cautley Bhawan', fullName: 'Cautley Bhawan', category: 'boys', theme: { primary: '#0f766e', primaryLight: '#ccfbf1', primaryDark: '#115e59' } },
  { slug: 'ganga', name: 'Ganga Bhawan', fullName: 'Ganga Bhawan', category: 'boys', theme: { primary: '#1d4ed8', primaryLight: '#dbeafe', primaryDark: '#1e3a8a' } },
  { slug: 'govind', name: 'Govind Bhawan', fullName: 'Govind Bhawan', category: 'boys', theme: { primary: '#047857', primaryLight: '#d1fae5', primaryDark: '#064e3b' } },
  { slug: 'jawahar', name: 'Jawahar Bhawan', fullName: 'Jawahar Bhawan', category: 'boys', theme: { primary: '#6d28d9', primaryLight: '#ede9fe', primaryDark: '#4c1d95' } },
  { slug: 'rajendra', name: 'Rajendra Bhawan', fullName: 'Rajendra Bhawan', category: 'boys', theme: { primary: '#b45309', primaryLight: '#fef3e2', primaryDark: '#78350f' } },
  { slug: 'radhakrishnan', name: 'Radhakrishnan Bhawan', fullName: 'Radhakrishnan Bhawan', category: 'boys', theme: { primary: '#4338ca', primaryLight: '#e0e7ff', primaryDark: '#312e81' } },
  { slug: 'rajiv', name: 'Rajiv Bhawan', fullName: 'Rajiv Bhawan', category: 'boys', theme: { primary: '#be185d', primaryLight: '#fce7f3', primaryDark: '#831843' } },
  { slug: 'ravindra', name: 'Ravindra Bhawan', fullName: 'Ravindra Bhawan', category: 'boys', theme: { primary: '#0369a1', primaryLight: '#e0f2fe', primaryDark: '#0c4a6e' } },
  { slug: 'malviya', name: 'Malviya Bhawan', fullName: 'Malviya Bhawan', category: 'boys', theme: { primary: '#334155', primaryLight: '#f1f5f9', primaryDark: '#0f172a' } },
  { slug: 'vivekanand', name: 'Vivekanand Bhawan', fullName: 'Vivekanand Bhawan', category: 'boys',
    theme: { primary: '#c2410c', primaryLight: '#fed7aa', primaryDark: '#7c2d12' },
    description: 'One of the oldest and most spirited bhavans of IIT Roorkee, known for its strong community and cultural vibrancy.',
    strength: 320, established: '1958'
  },
  // GIRLS
  { slug: 'sarojini', name: 'Sarojini Bhawan', fullName: 'Sarojini Bhawan', category: 'girls', theme: { primary: '#db2777', primaryLight: '#fce7f3', primaryDark: '#831843' } },
  { slug: 'kasturba', name: 'Kasturba Bhawan', fullName: 'Kasturba Bhawan', category: 'girls', theme: { primary: '#7c3aed', primaryLight: '#f3e8ff', primaryDark: '#581c87' } },
  { slug: 'indira', name: 'Indira Bhawan', fullName: 'Indira Bhawan', category: 'girls', theme: { primary: '#ea580c', primaryLight: '#ffedd5', primaryDark: '#7c2d12' } },
  { slug: 'himalaya', name: 'Himalaya Bhawan', fullName: 'Himalaya Bhawan', category: 'girls', theme: { primary: '#0d9488', primaryLight: '#ccfbf1', primaryDark: '#115e59' } },
  // MARRIED
  { slug: 'gp-hostel', name: 'G. P. Hostel', fullName: 'G. P. Hostel', category: 'married', theme: { primary: '#475569', primaryLight: '#f1f5f9', primaryDark: '#1e293b' } },
  { slug: 'mr-chopra', name: 'M. R. Chopra Hostel', fullName: 'M. R. Chopra Hostel', category: 'married', theme: { primary: '#4b5563', primaryLight: '#f3f4f6', primaryDark: '#1f2937' } },
  { slug: 'azad-wing', name: 'Azad Wing', fullName: 'Azad Wing', category: 'married', theme: { primary: '#9f1239', primaryLight: '#ffe4e6', primaryDark: '#4c0519' } },
  { slug: 'an-khosla', name: 'A. N. Khosla House', fullName: 'A. N. Khosla House', category: 'married', theme: { primary: '#a16207', primaryLight: '#fef9c3', primaryDark: '#451a03' } },
  { slug: 'kih', name: 'K. I. H.', fullName: 'K. I. H.', category: 'married', theme: { primary: '#15803d', primaryLight: '#dcfce7', primaryDark: '#14532d' } },
  // CO-ED
  { slug: 'vigyan', name: 'Vigyan Bhawan', fullName: 'Vigyan Bhawan', category: 'coed', theme: { primary: '#86198f', primaryLight: '#fae8ff', primaryDark: '#4a044e' } },
]

export const BHAVAN_CATEGORIES: { key: BhavanCategory; label: string; count: number }[] = [
  { key: 'boys', label: 'Boys Hostels', count: 11 },
  { key: 'girls', label: 'Girls Hostels', count: 4 },
  { key: 'married', label: 'Married Hostels', count: 5 },
  { key: 'coed', label: 'Co-ed Hostels', count: 1 },
]

export function getBhavanBySlug(slug: string): Bhavan | undefined {
  return BHAVANS.find(b => b.slug === slug)
}

export function getBhavansByCategory(category: BhavanCategory): Bhavan[] {
  return BHAVANS.filter(b => b.category === category)
}
