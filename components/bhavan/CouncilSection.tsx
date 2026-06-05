import { BhavanTheme, CouncilMember } from '@/lib/types'

// Mock council data — replace with API fetch later
const MOCK_COUNCIL: CouncilMember[] = [
  { name: 'Aditya Verma', role: 'General Secretary', bhavanSlug: 'vivekanand', year: '3rd Year' },
  { name: 'Priya Sharma', role: 'Cultural Secretary', bhavanSlug: 'vivekanand', year: '2nd Year' },
  { name: 'Rohit Nair', role: 'Sports Secretary', bhavanSlug: 'vivekanand', year: '3rd Year' },
  { name: 'Sneha Patel', role: 'Technical Secretary', bhavanSlug: 'vivekanand', year: '2nd Year' },
  { name: 'Karan Singh', role: 'Mess Secretary', bhavanSlug: 'vivekanand', year: '2nd Year' },
  { name: 'Ananya Roy', role: 'Maintenance Secretary', bhavanSlug: 'vivekanand', year: '3rd Year' },
]

export default function CouncilSection({ bhavanName, theme }: { bhavanName: string; theme: BhavanTheme }) {
  return (
    <section id="council" className="py-14 sm:py-20 border-b border-border bg-surface/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl text-brand tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
            Bhavan Council
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Student representatives of {bhavanName}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
          {MOCK_COUNCIL.map(member => (
            <div key={member.name} className="flex flex-col items-center gap-3 group bg-surface-raised border border-border rounded-xl p-3 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
              {/* Photo */}
              <div className="w-full aspect-square rounded-lg bg-surface flex items-center justify-center overflow-hidden relative border border-border-strong/40">
                {/* Replace with: <Image src={member.photoUrl} alt={member.name} fill className="object-cover object-top" /> */}
                <span
                  className="text-3xl font-extrabold opacity-20"
                  style={{ fontFamily: 'var(--font-sans)', color: theme.primary }}
                >
                  {member.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              {/* Name + Role */}
              <div className="text-center w-full">
                <p className="text-xs font-bold text-text leading-tight truncate" style={{ fontFamily: 'var(--font-sans)' }}>
                  {member.name}
                </p>
                <p
                  className="text-[10px] mt-1 font-bold tracking-wider uppercase truncate"
                  style={{ fontFamily: 'var(--font-sans)', color: theme.primary }}
                >
                  {member.role}
                </p>
                {member.year && (
                  <p className="text-[10px] text-text-muted mt-1 font-medium" style={{ fontFamily: 'var(--font-sans)' }}>
                    {member.year}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
