export default function ThomsonBand() {
  return (
    <section className="w-full border-b border-border bg-surface-raised overflow-hidden relative group h-[280px] sm:h-[380px] md:h-[440px] lg:h-[480px]">
      <img
        src="/images/thomson-building-painting.webp"
        alt="James Thomson Building, IIT Roorkee"
        className="w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-[1.02]"
      />
      {/* Overlay gradient for premium look */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none" />
      
      {/* Bottom text overlay aligned with the main page grid */}
      <div className="absolute bottom-6 sm:bottom-8 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-start">
          <span className="text-white text-xs sm:text-sm font-bold tracking-[0.25em] uppercase drop-shadow-lg" style={{ fontFamily: 'var(--font-sans)' }}>
            James Thomson Building
          </span>
          <p className="text-white/80 text-[9px] sm:text-[10px] font-bold tracking-[0.35em] uppercase mt-1.5 drop-shadow-md" style={{ fontFamily: 'var(--font-sans)' }}>
            Thomson Hall — Est. 1847
          </p>
        </div>
      </div>
    </section>
  )
}
