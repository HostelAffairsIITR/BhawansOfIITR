import { BhavanTheme } from '@/lib/types'

interface CouncilMemberProp {
  id: number
  name: string
  image_url: string | null
  title: string
  display_order: number
}

export default function CouncilSection({ 
  bhavanName, 
  theme,
  members = []
}: { 
  bhavanName: string
  theme: BhavanTheme
  members?: CouncilMemberProp[]
}) {
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

        {members.length === 0 ? (
          <div className="rounded-2xl border border-border p-12 text-center bg-surface-raised shadow-xs">
            <p className="text-text-muted/50 text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
              Council details coming soon
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5">
            {members.map(member => {
              const initials = member.name.split(' ').map(n => n[0]).join('')

              return (
                <div key={member.id} className="flex flex-col items-center gap-3 group bg-surface-raised border border-border rounded-xl p-3 shadow-xs hover:shadow-sm hover:-translate-y-0.5 transition-all duration-200">
                  {/* Photo */}
                  <div className="w-full aspect-square rounded-lg bg-surface flex items-center justify-center overflow-hidden relative border border-border-strong/40">
                    {member.image_url ? (
                      <img src={member.image_url} alt={member.name} className="absolute inset-0 w-full h-full object-cover object-top" />
                    ) : (
                      <span
                        className="text-3xl font-extrabold opacity-20"
                        style={{ fontFamily: 'var(--font-sans)', color: theme.primary }}
                      >
                        {initials}
                      </span>
                    )}
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
                      {member.title}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
