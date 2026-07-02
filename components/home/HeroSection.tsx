import Image from 'next/image'
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="border-b border-border bg-surface-raised">
      <div className="flex flex-col md:flex-row min-h-[55vh] md:min-h-[70vh]">
        {/* Left — Image */}
        <div className="relative w-full md:w-1/2 min-h-[40vh] md:min-h-0 border-b md:border-b-0 md:border-r border-border bg-gray-100 overflow-hidden">
          <img 
            src="/images/campus-hero.webp" 
            alt="IIT Roorkee Campus" 
            className="absolute inset-0 w-full h-full object-cover"
          />
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
