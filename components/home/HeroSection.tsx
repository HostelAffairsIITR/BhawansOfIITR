import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="border-b border-border bg-surface-raised">
      <div className="flex flex-col md:flex-row min-h-[55vh] md:min-h-[70vh]">
        {/* Left — Image */}
        <div className="relative w-full md:w-1/2 min-h-[40vh] md:min-h-0 border-b md:border-b-0 md:border-r border-border bg-gray-100 overflow-hidden">
          {/* Replace src with real campus image */}
          <div className="absolute inset-0 bg-black/10 flex items-end p-6 z-10">
            <div className="rounded-md bg-brand/90 backdrop-blur-sm px-4 py-2">
              <span className="text-text-on-brand text-sm tracking-[0.15em]" style={{ fontFamily: 'var(--font-mono)' }}>
                IIT ROORKEE — EST. 1847
              </span>
            </div>
          </div>
          {/* Corner brackets */}
          <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-white z-20" />
          <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-white z-20" />
          <div className="absolute bottom-16 left-4 w-8 h-8 border-l-4 border-b-4 border-white z-20" />
          <div className="absolute bottom-16 right-4 w-8 h-8 border-r-4 border-b-4 border-white z-20" />
          {/* Placeholder — swap with: <Image src="/images/campus-hero.jpg" alt="IIT Roorkee Campus" fill className="object-cover" priority /> */}
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-700 to-neutral-900 flex items-center justify-center">
            <span className="text-white/20 text-xs font-mono text-center px-8">
              [ CAMPUS PHOTOGRAPH ]<br/>Replace with real image
            </span>
          </div>
        </div>

        {/* Right — Text */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 sm:px-12 md:px-16 py-14 md:py-0 gap-6">
          <div>
            <p className="text-accent text-sm tracking-[0.3em] mb-3" style={{ fontFamily: 'var(--font-mono)' }}>
              SINCE 1847
            </p>
            <h2 className="text-[clamp(4rem,10vw,8rem)] leading-none tracking-tight text-brand"
              style={{ fontFamily: 'var(--font-display)' }}>
              175<br/>YEARS
            </h2>
            <p className="text-xl sm:text-2xl font-bold tracking-wide text-text mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
              OF EXCELLENCE,<br />COMMUNITY &amp; LEGACY
            </p>
          </div>

          <p className="text-text-muted text-sm leading-relaxed max-w-sm" style={{ fontFamily: 'var(--font-mono)' }}>
            Indian Institute of Technology Roorkee, Uttarakhand.<br/>
            Home to 21 Bhavans housing thousands of students.
          </p>

          <div className="flex flex-wrap gap-4 mt-2">
            <a
              href="#our-bhavans"
              className="btn-primary px-8 py-3.5 text-sm tracking-widest"
            >
              EXPLORE BHAVANS →
            </a>
            <a
              href="#whats-happening"
              className="btn-secondary px-8 py-3.5 text-sm tracking-widest"
            >
              WHAT'S ON →
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
