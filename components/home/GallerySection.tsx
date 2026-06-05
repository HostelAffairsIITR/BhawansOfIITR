'use client'
import { useState } from 'react'
import { GalleryImage } from '@/lib/types'

export default function GallerySection({ images }: { images: GalleryImage[] }) {
  const [featured, setFeatured] = useState(0)

  return (
    <section id="gallery" className="py-14 sm:py-20 bg-surface border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-8">
          <h2
            className="text-3xl sm:text-4xl text-brand tracking-wide"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.08em' }}
          >
            GALLERY
          </h2>
          <p className="text-text-muted text-sm mt-1">
            Glimpses of student activities and campus architecture
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 border border-border bg-surface-raised rounded-2xl p-5 shadow-sm">
          {/* Featured image */}
          <div className="flex-1 border border-border bg-gradient-to-br from-brand-light to-brand-muted rounded-xl min-h-[300px] sm:min-h-[420px] flex items-center justify-center relative overflow-hidden shadow-xs">
            <span className="text-white/40 text-xs font-semibold text-center px-8" style={{ fontFamily: 'var(--font-sans)' }}>
              [ {images[featured]?.caption ?? 'Gallery Image'} ]<br />Replace with real images
            </span>
            {images[featured]?.caption && (
              <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 backdrop-blur-xs px-3.5 py-2">
                <span className="text-white text-xs font-semibold tracking-wider" style={{ fontFamily: 'var(--font-sans)' }}>
                  {images[featured].caption}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnail grid */}
          <div className="lg:w-64 xl:w-80">
            <div className="grid grid-cols-4 lg:grid-cols-3 gap-2">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setFeatured(idx)}
                  className={`aspect-square border rounded-lg bg-gradient-to-br from-brand-light/20 to-brand-muted/20 transition-all relative overflow-hidden cursor-pointer
                    ${idx === featured 
                      ? 'border-brand-light ring-2 ring-brand-light ring-offset-2 scale-95 opacity-100' 
                      : 'border-border opacity-70 hover:opacity-100 hover:border-brand-muted'
                    }`}
                  title={img.caption}
                >
                  <span className="text-brand/40 text-[10px] font-bold absolute inset-0 flex items-center justify-center" style={{ fontFamily: 'var(--font-sans)' }}>
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-text-muted/50 text-[10px] font-bold tracking-wider mt-4 text-center uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
              Click thumbnail to preview
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
