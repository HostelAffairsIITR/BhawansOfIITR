export default function DOSWSection() {
  return (
    <section id="about" className="py-14 sm:py-20 border-b border-border bg-surface/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h2 className="text-3xl sm:text-4xl text-brand tracking-wide uppercase" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}>
            Message from DoSW
          </h2>
          <p className="text-text-muted text-sm mt-1">
            A welcoming message from the Dean of Student Welfare
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12 rounded-2xl border border-border bg-surface-raised p-6 sm:p-10 shadow-sm hover:shadow-md transition-shadow duration-200">
          {/* Photo */}
          <div className="flex-shrink-0 flex flex-col items-center gap-3 self-center md:self-start">
            <div className="w-44 h-52 sm:w-48 sm:h-56 rounded-xl border border-border bg-surface-muted flex items-center justify-center overflow-hidden shadow-xs">
              {/* Replace with: <Image src="/images/dosw.jpg" alt="Dean of Student Welfare" fill className="object-cover" /> */}
              <span className="text-[10px] font-bold tracking-wider text-text-muted/50 uppercase" style={{ fontFamily: 'var(--font-mono)' }}>[ DOSW PHOTO ]</span>
            </div>
            <div className="border border-border bg-surface/50 rounded-xl px-4 py-2 text-center w-full shadow-xs">
              <p className="text-xs font-bold text-text tracking-wide" style={{ fontFamily: 'var(--font-sans)' }}>PROF. [NAME]</p>
              <p className="text-[10px] text-text-muted mt-0.5 uppercase tracking-wider font-semibold" style={{ fontFamily: 'var(--font-sans)' }}>DEAN OF STUDENT WELFARE</p>
            </div>
          </div>

          {/* Message */}
          <div className="flex-1 flex flex-col justify-center">
            <span className="text-[5rem] leading-none text-brand/10 font-serif select-none -mb-8 -ml-2">&ldquo;</span>
            <blockquote className="text-text font-medium text-sm sm:text-base leading-relaxed italic" style={{ fontFamily: 'var(--font-sans)' }}>
              Welcome to the Bhavans of IIT Roorkee — the heart of campus life. Our residential halls
              are more than places to sleep; they are communities that shape engineers, leaders, and
              lifelong friendships. The spirit of camaraderie that flows through each bhavan is what
              makes IIT Roorkee truly special. I invite you to explore, engage, and become part of
              this extraordinary legacy.
            </blockquote>
            <p className="text-xs text-text-muted/80 mt-6 font-semibold tracking-wider" style={{ fontFamily: 'var(--font-sans)' }}>
              — DEAN OF STUDENT WELFARE, IIT ROORKEE
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

