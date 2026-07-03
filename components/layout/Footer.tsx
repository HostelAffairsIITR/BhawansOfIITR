import Link from 'next/link'

const FOOTER_LINKS = ['MAP', 'BHAWANS', 'EVENTS', 'ABOUT US', 'CONTACT']

const LINK_MAP: Record<string, string> = {
  'MAP': '/#campus-map',
  'BHAWANS': '/#our-bhawans',
  'EVENTS': '/#whats-happening',
  'ABOUT US': '/about-us',
  'CONTACT': 'mailto:dosw@iitr.ac.in',
}

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-10">
          {/* Logo + Description */}
          <div className="flex flex-col gap-4 max-w-xs">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white p-1.5 overflow-hidden shrink-0 shadow-md">
                <img src="/images/iitr-logo.png" alt="IITR Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-white text-2xl tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                BHAWANS OF IITR
              </span>
            </div>
            <p className="text-white/60 text-xs leading-relaxed" style={{ fontFamily: 'var(--font-sans)' }}>
              The official residential halls portal of IIT Roorkee — Est. 1847.
            </p>
          </div>

          {/* Links and Contact grouped to show side-by-side on mobile, and side-by-side next to description on desktop */}
          <div className="flex flex-row md:flex-row md:items-start gap-10 md:gap-20 justify-between md:justify-start w-full md:w-auto">
            {/* Links */}
            <div className="flex flex-col gap-3">
              <p className="text-white/40 text-xs font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-sans)' }}>Navigation</p>
              <nav className="flex flex-col gap-2">
                {FOOTER_LINKS.map(link => (
                  <a
                    key={link}
                    href={LINK_MAP[link]}
                    className="text-white/80 hover:text-white text-xs font-bold tracking-wider transition-colors uppercase"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {link}
                  </a>
                ))}
              </nav>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-3">
              <p className="text-white/40 text-xs font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-sans)' }}>Contact</p>
              <div className="flex flex-col gap-2 text-white/80 text-xs font-medium" style={{ fontFamily: 'var(--font-sans)' }}>
                <span>Dean of Student Welfare</span>
                <span>IIT Roorkee, Uttarakhand</span>
                <span>247667</span>
                <a href="mailto:dosw@iitr.ac.in" className="hover:text-white transition-colors">dosw@iitr.ac.in</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row sm:justify-between gap-3 text-white/40 text-[11px] font-medium" style={{ fontFamily: 'var(--font-sans)' }}>
          <span>© {new Date().getFullYear()} IIT Roorkee. All rights reserved.</span>
          <span>bhawans.iitr.ac.in</span>
        </div>
      </div>
    </footer>
  )
}
