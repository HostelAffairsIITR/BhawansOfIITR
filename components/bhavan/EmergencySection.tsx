import { BhavanTheme, EmergencyContact } from '@/lib/types'

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { label: 'Warden (Emergency)', phone: '+91-1332-285XXX', available: '24/7' },
  { label: 'IITR Security', phone: '+91-1332-285000', available: '24/7' },
  { label: 'Campus Health Centre', phone: '+91-1332-285XXX', available: '8 AM – 8 PM' },
  { label: 'Ambulance', phone: '108', available: '24/7' },
  { label: 'Fire Station', phone: '101', available: '24/7' },
  { label: 'DOSW Office', phone: '+91-1332-285XXX', available: 'Office Hours' },
]

export default function EmergencySection({ theme }: { theme: BhavanTheme }) {
  return (
    <section id="emergency" className="py-14 sm:py-20 border-b border-border bg-surface/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl text-brand tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
            Emergency Contacts
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Important telephone numbers and helpline services
          </p>
        </div>

        <div className="rounded-2xl border border-border overflow-hidden bg-surface-raised shadow-sm">
          {EMERGENCY_CONTACTS.map((contact, i) => (
            <div
              key={contact.label}
              className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 transition-colors duration-150 hover:bg-surface/30
                ${i < EMERGENCY_CONTACTS.length - 1 ? 'border-b border-border/60' : ''}
              `}
              style={{ background: i % 2 === 0 ? 'var(--color-surface-raised)' : 'var(--color-surface)/10' }}
            >
              <div className="flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: theme.primary }} />
                <div>
                  <p className="text-sm font-bold text-text" style={{ fontFamily: 'var(--font-sans)' }}>
                    {contact.label}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5" style={{ fontFamily: 'var(--font-sans)' }}>
                    Available: {contact.available}
                  </p>
                </div>
              </div>

              <a
                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer border shrink-0 w-fit self-start sm:self-auto"
                style={{
                  fontFamily: 'var(--font-sans)',
                  color: theme.primary,
                  backgroundColor: `${theme.primaryLight}25`,
                  borderColor: `${theme.primary}20`,
                }}
              >
                {contact.phone}
              </a>
            </div>
          ))}
        </div>

        <p className="text-xs text-text-muted mt-6 text-center font-medium uppercase tracking-wider" style={{ fontFamily: 'var(--font-sans)' }}>
          In a life-threatening emergency, always dial 112 first
        </p>
      </div>
    </section>
  )
}

