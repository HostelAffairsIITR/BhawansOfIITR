import { Bhawan, BhawanCategory } from './types'

export const BHAWANS: Bhawan[] = [
  // BOYS
  {
    slug: 'azad',
    name: 'Azad Bhawan',
    fullName: 'Azad Bhawan',
    category: 'boys',
    theme: { primary: '#be123c', primaryLight: '#ffe4e6', primaryDark: '#881337' },
    description: "One of the most iconic boys' residential halls at IIT Roorkee, fostering a legacy of sports excellence, active student leadership, and camaraderie.",
    strength: 350,
    established: '1948'
  },
  {
    slug: 'cautley',
    name: 'Cautley Bhawan',
    fullName: 'Cautley Bhawan',
    category: 'boys',
    theme: { primary: '#0f766e', primaryLight: '#ccfbf1', primaryDark: '#115e59' },
    description: "Steeped in rich history, Cautley Bhawan offers a heritage-rich residential experience with a distinct architectural charm and vibrant campus life.",
    strength: 420,
    established: '1913'
  },
  {
    slug: 'ganga',
    name: 'Ganga Bhawan',
    fullName: 'Ganga Bhawan',
    category: 'boys',
    theme: { primary: '#1d4ed8', primaryLight: '#dbeafe', primaryDark: '#1e3a8a' },
    description: "Centrally located on campus, Ganga Bhawan is known for its high-spirited residents, sports achievements, and active participation in cultural activities.",
    strength: 380,
    established: '1957'
  },
  {
    slug: 'govind',
    name: 'Govind Bhawan',
    fullName: 'Govind Bhawan',
    category: 'boys',
    theme: { primary: '#047857', primaryLight: '#d1fae5', primaryDark: '#064e3b' },
    description: "Home to a close-knit and passionate community, Govind Bhawan boasts scenic surroundings, excellent facilities, and a long tradition of academic dedication.",
    strength: 360,
    established: '1949'
  },
  {
    slug: 'jawahar',
    name: 'Jawahar Bhawan',
    fullName: 'Jawahar Bhawan',
    category: 'boys',
    theme: { primary: '#6d28d9', primaryLight: '#ede9fe', primaryDark: '#4c1d95' },
    description: "Characterized by its massive layout and active community, Jawahar Bhawan is a cornerstone of student life with top-tier recreational amenities.",
    strength: 450,
    established: '1959'
  },
  {
    slug: 'rajendra',
    name: 'Rajendra Bhawan',
    fullName: 'Rajendra Bhawan',
    category: 'boys',
    theme: { primary: '#b45309', primaryLight: '#fef3e2', primaryDark: '#78350f' },
    description: "Offering a serene environment and modern living spaces, Rajendra Bhawan stands out for its strong emphasis on research culture and student teamwork.",
    strength: 340,
    established: '1958'
  },
  {
    slug: 'radhakrishnan',
    name: 'Radhakrishnan Bhawan',
    fullName: 'Radhakrishnan Bhawan',
    category: 'boys',
    theme: { primary: '#4338ca', primaryLight: '#e0e7ff', primaryDark: '#312e81' },
    description: "Named after the legendary academic, Radhakrishnan Bhawan hosts a diverse community of students dedicated to innovation, technology, and sports.",
    strength: 320,
    established: '1950'
  },
  {
    slug: 'rajiv',
    name: 'Rajiv Bhawan',
    fullName: 'Rajiv Bhawan',
    category: 'boys',
    theme: { primary: '#be185d', primaryLight: '#fce7f3', primaryDark: '#831843' },
    description: "A modern residential hall featuring contemporary architecture, Rajiv Bhawan provides excellent living standards and a highly dynamic student community.",
    strength: 520,
    established: '2001'
  },
  {
    slug: 'ravindra',
    name: 'Ravindra Bhawan',
    fullName: 'Ravindra Bhawan',
    category: 'boys',
    theme: { primary: '#0369a1', primaryLight: '#e0f2fe', primaryDark: '#0c4a6e' },
    description: "Known for its beautiful lawns and peaceful study atmosphere, Ravindra Bhawan nurtures balanced academic growth and rich student interactions.",
    strength: 350,
    established: '1955'
  },
  {
    slug: 'malviya',
    name: 'Malviya Bhawan',
    fullName: 'Malviya Bhawan',
    category: 'boys',
    theme: { primary: '#334155', primaryLight: '#f1f5f9', primaryDark: '#0f172a' },
    description: "Providing a quiet and comfortable haven for residents, Malviya Bhawan is beloved for its friendly neighborhood atmosphere and reading facilities.",
    strength: 330,
    established: '1955'
  },
  {
    slug: 'vivekananda',
    name: 'Vivekananda Bhawan',
    fullName: 'Vivekananda Bhawan',
    category: 'boys',
    theme: { primary: '#c2410c', primaryLight: '#fed7aa', primaryDark: '#7c2d12' },
    description: 'One of the oldest and most spirited bhawans of IIT Roorkee, known for its strong community and cultural vibrancy.',
    strength: 320,
    established: '1958'
  },
  // GIRLS
  {
    slug: 'sarojini',
    name: 'Sarojini Bhawan',
    fullName: 'Sarojini Bhawan',
    category: 'girls',
    theme: { primary: '#db2777', primaryLight: '#fce7f3', primaryDark: '#831843' },
    description: "The premier girls' residential hall on campus, Sarojini Bhawan is a hub of active sports teams, cultural clubs, and academic excellence.",
    strength: 380,
    established: '1950'
  },
  {
    slug: 'kasturba',
    name: 'Kasturba Bhawan',
    fullName: 'Kasturba Bhawan',
    category: 'girls',
    theme: { primary: '#7c3aed', primaryLight: '#f3e8ff', primaryDark: '#581c87' },
    description: "Providing a secure, supportive, and modern living environment, Kasturba Bhawan is known for its academic achievements and cultural festivals.",
    strength: 360,
    established: '1960'
  },
  {
    slug: 'indira',
    name: 'Indira Bhawan',
    fullName: 'Indira Bhawan',
    category: 'girls',
    theme: { primary: '#ea580c', primaryLight: '#ffedd5', primaryDark: '#7c2d12' },
    description: "Equipped with superb recreational spaces, Indira Bhawan fosters an inspiring atmosphere for girls to collaborate, design, and lead.",
    strength: 310,
    established: '1980'
  },
  {
    slug: 'himalaya',
    name: 'Himalaya Bhawan',
    fullName: 'Himalaya Bhawan',
    category: 'girls',
    theme: { primary: '#0d9488', primaryLight: '#ccfbf1', primaryDark: '#115e59' },
    description: "A state-of-the-art girls' hostel surrounded by lush greenery, Himalaya Bhawan offers excellent dining and modern facilities for residents.",
    strength: 420,
    established: '2000'
  },
  // MARRIED
  {
    slug: 'gp-hostel',
    name: 'G. P. Hostel',
    fullName: 'G. P. Hostel',
    category: 'married',
    theme: { primary: '#475569', primaryLight: '#f1f5f9', primaryDark: '#1e293b' },
    description: "Providing a comfortable, independent living arrangement for postgraduate and research scholars with standard academic amenities.",
    strength: 240,
    established: '1970'
  },
  {
    slug: 'mr-chopra',
    name: 'M. R. Chopra Hostel',
    fullName: 'M. R. Chopra Hostel',
    category: 'married',
    theme: { primary: '#4b5563', primaryLight: '#f3f4f6', primaryDark: '#1f2937' },
    description: "Named after the former Vice-Chancellor, this hostel is a dedicated residential enclave for postgraduate and doctorate students.",
    strength: 210,
    established: '1960'
  },
  {
    slug: 'azad-wing',
    name: 'Azad Wing',
    fullName: 'Azad Wing',
    category: 'married',
    theme: { primary: '#9f1239', primaryLight: '#ffe4e6', primaryDark: '#4c0519' },
    description: "A specialized residential extension offering premium, peaceful research environments for senior scholars and married students.",
    strength: 140,
    established: '1960'
  },
  {
    slug: 'an-khosla',
    name: 'A. N. Khosla House',
    fullName: 'A. N. Khosla House',
    category: 'married',
    theme: { primary: '#a16207', primaryLight: '#fef9c3', primaryDark: '#451a03' },
    description: "A peaceful residential community dedicated to PhD scholars and married students, named in honor of Dr. A. N. Khosla.",
    strength: 150,
    established: '1960'
  },
  {
    slug: 'kih',
    name: 'K. I. H.',
    fullName: 'K. I. H.',
    category: 'married',
    theme: { primary: '#15803d', primaryLight: '#dcfce7', primaryDark: '#14532d' },
    description: "Khosla International House provides specialized premium accommodation for international students, visitors, and researchers.",
    strength: 120,
    established: '1960'
  },
  // CO-ED
  {
    slug: 'vigyan',
    name: 'Vigyan Bhawan',
    fullName: 'Vigyan Bhawan',
    category: 'coed',
    theme: { primary: '#86198f', primaryLight: '#fae8ff', primaryDark: '#4a044e' },
    description: "A vibrant co-educational residential hall for senior students and research scholars, focused on advanced science and technology studies.",
    strength: 260,
    established: '1980'
  }
]

export const BHAWAN_CATEGORIES: { key: BhawanCategory; label: string; count: number }[] = [
  { key: 'boys', label: 'Boys Hostels', count: 11 },
  { key: 'girls', label: 'Girls Hostels', count: 4 },
  { key: 'married', label: 'Married Hostels', count: 5 },
  { key: 'coed', label: 'Co-ed Hostels', count: 1 }
]

export function getBhawanBySlug(slug: string): Bhawan | undefined {
  const targetSlug = slug === 'vivekanand' ? 'vivekananda' : slug
  return BHAWANS.find(b => b.slug === targetSlug)
}

export function getBhawansByCategory(category: BhawanCategory): Bhawan[] {
  return BHAWANS.filter(b => b.category === category)
}
