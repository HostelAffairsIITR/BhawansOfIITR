import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

interface SupabaseMember {
  id: number
  council_term_id: number
  enrollment_id: string
  name: string
  image_url: string | null
  title: string
  group_type: string
  bhavan_id: number | null
  vertical: string | null
  display_order: number
}

export const revalidate = 60

export default async function AboutUsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  let haMembers: SupabaseMember[] = []
  let termLabel = ''

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = await createClient()
      
      // 1. Fetch current term
      const { data: currentTerm } = await supabase
        .from('council_terms')
        .select('id, label')
        .eq('is_current', true)
        .maybeSingle()

      if (currentTerm) {
        termLabel = currentTerm.label
        
        // 2. Fetch hostel affairs members
        const { data: membersData } = await supabase
          .from('members')
          .select('*')
          .eq('council_term_id', currentTerm.id)
          .eq('group_type', 'hostel_affairs')
          .order('vertical, display_order')

        if (membersData) {
          haMembers = membersData as SupabaseMember[]
        }
      }
    } catch (err) {
      console.warn("Supabase queries failed for About Us page:", err)
    }
  }

  // 3. Resolve Secretary
  const secretary = haMembers.find(m => m.title.toLowerCase().includes('secretary'))
  const secretaryName = secretary?.name || 'Divyansh Gupta'
  const secretaryRole = secretary?.title || 'Hostel Affairs Secretary, IIT Roorkee'
  const secretaryImage = secretary?.image_url || null
  const secretaryInitials = secretaryName.split(' ').map(n => n[0]).join('')
  const secretaryEmail = 'has@iitr.ac.in'
  const secretaryBio = 'Responsible for leading student residential policies, mess sanitation, and inter-bhawan sports/cultural leagues across the campus hostels.'

  // 4. Filter out secretary and group remaining by vertical
  const otherMembers = haMembers.filter(m => m.id !== secretary?.id)
  
  const byVertical = otherMembers.reduce((acc, member) => {
    const key = member.vertical || 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(member)
    return acc
  }, {} as Record<string, SupabaseMember[]>)

  const verticals = Object.keys(byVertical).sort()

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface/30 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl text-brand uppercase tracking-wider font-extrabold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
              Hostel Affairs Secretariat {termLabel ? `(${termLabel})` : ''}
            </h1>
            <p className="text-text-muted text-sm sm:text-base mt-2 max-w-md mx-auto">
              Meet the student representatives and divisions working behind the residential community at IIT Roorkee.
            </p>
          </div>

          {/* Secretary Section (Top in Middle) */}
          <section className="mb-16">
            <div className="max-w-md mx-auto rounded-2xl border border-border bg-surface-raised p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-all duration-200">
              {/* Profile Avatar */}
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-brand to-brand-light flex items-center justify-center text-white text-4xl font-extrabold mx-auto shadow-sm mb-5 relative overflow-hidden group border border-border">
                {secretaryImage ? (
                  <img src={secretaryImage} alt={secretaryName} className="w-full h-full object-cover" />
                ) : (
                  <span>{secretaryInitials}</span>
                )}
              </div>
              
              {/* Secretary Info */}
              <h2 className="text-lg sm:text-xl font-bold text-text" style={{ fontFamily: 'var(--font-sans)' }}>
                {secretaryName}
              </h2>
              <p className="text-xs font-bold text-brand uppercase tracking-wider mt-1" style={{ fontFamily: 'var(--font-sans)' }}>
                {secretaryRole}
              </p>
              <p className="text-xs text-text-muted font-medium mt-1">
                4th Year · B.Tech
              </p>
              <p className="text-xs text-text-muted leading-relaxed mt-4 bg-surface/50 border border-border/60 rounded-xl p-3">
                {secretaryBio}
              </p>

              <a
                href={`mailto:${secretaryEmail}`}
                className="mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm border border-border bg-surface/50 hover:bg-surface-muted cursor-pointer text-text w-full"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{secretaryEmail}</span>
              </a>
            </div>
          </section>

          {/* Separator */}
          <div className="border-t border-border/60 mb-12 max-w-5xl mx-auto" />

          {/* Secretariat Divisions */}
          <section className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h3 className="text-2xl sm:text-3xl text-brand uppercase tracking-wider font-extrabold" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.05em' }}>
                Secretariat Teams
              </h3>
              <p className="text-text-muted text-xs sm:text-sm mt-1">
                Explore the functional branches of the hostel council
              </p>
            </div>

            {haMembers.length === 0 ? (
              <div className="rounded-2xl border border-border p-12 text-center bg-surface-raised shadow-xs">
                <p className="text-text-muted/50 text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                  Team details coming soon
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                {verticals.map(vertical => {
                  const verticalMembers = byVertical[vertical]

                  return (
                    <div key={vertical} className="border-b border-border/40 pb-10 last:border-b-0 last:pb-0">
                      <h4 className="text-base font-bold text-brand uppercase tracking-wider mb-6 pl-2.5 border-l-4 border-accent" style={{ fontFamily: 'var(--font-sans)' }}>
                        {vertical}
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
                        {verticalMembers.map(member => {
                          const initials = member.name.split(' ').map(n => n[0]).join('')

                          return (
                            <div
                              key={member.id}
                              className="flex flex-col items-center gap-3 bg-surface-raised border border-border rounded-xl p-4 text-center shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200"
                            >
                              {/* Photo / Avatar */}
                              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-light/10 to-brand-muted/20 flex items-center justify-center text-brand text-lg font-extrabold border border-border-strong/20 overflow-hidden relative">
                                {member.image_url ? (
                                  <img src={member.image_url} alt={member.name} className="absolute inset-0 w-full h-full object-cover" />
                                ) : (
                                  <span>{initials}</span>
                                )}
                              </div>
                              {/* Info */}
                              <div className="w-full">
                                <p className="text-xs font-bold text-text leading-tight truncate" style={{ fontFamily: 'var(--font-sans)' }}>
                                  {member.name}
                                </p>
                                <p className="text-[10px] font-bold text-brand uppercase tracking-wider mt-1 truncate" style={{ fontFamily: 'var(--font-sans)' }}>
                                  {member.title}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
