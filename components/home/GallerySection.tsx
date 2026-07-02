'use client'
import { useState } from 'react'

interface SupabaseGalleryImage {
  id: number
  scope: string
  bhavan_id: number | null
  image_url: string
  caption?: string | null
  display_order: number
}

interface GallerySectionProps {
  images: SupabaseGalleryImage[]
  emptyMessage?: string
}

export default function GallerySection({ images, emptyMessage = 'Gallery coming soon' }: GallerySectionProps) {
  const [featured, setFeatured] = useState(0)

  const hasImages = images && images.length > 0

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

        {!hasImages ? (
          <div className="border border-dashed border-border rounded-2xl p-12 text-center bg-surface-raised/40">
            <p className="text-text-muted text-xs font-semibold tracking-wider uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
              {emptyMessage}
            </p>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 border border-border bg-surface-raised rounded-2xl p-5 shadow-sm">
            {/* Featured image */}
            <div className="flex-1 border border-border bg-gradient-to-br from-brand-light to-brand-muted rounded-xl min-h-[300px] sm:min-h-[420px] flex items-center justify-center relative overflow-hidden shadow-xs">
              {images[featured]?.image_url ? (
                <img 
                  src={images[featured].image_url} 
                  alt={images[featured].caption || 'Gallery Image'} 
                  className="absolute inset-0 w-full h-full object-cover" 
                />
              ) : (
                <span className="text-white/40 text-xs font-semibold text-center px-8" style={{ fontFamily: 'var(--font-sans)' }}>
                  [ {images[featured]?.caption ?? 'Gallery Image'} ]
                </span>
              )}
              
              {images[featured]?.caption && (
                <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 backdrop-blur-xs px-3.5 py-2 z-10">
                  <span className="text-white text-xs font-semibold tracking-wider block" style={{ fontFamily: 'var(--font-sans)' }}>
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
                    title={img.caption || ''}
                  >
                    {img.image_url ? (
                      <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-brand/40 text-[10px] font-bold absolute inset-0 flex items-center justify-center" style={{ fontFamily: 'var(--font-sans)' }}>
                        {idx + 1}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="text-text-muted/50 text-[10px] font-bold tracking-wider mt-4 text-center uppercase" style={{ fontFamily: 'var(--font-sans)' }}>
                Click thumbnail to preview
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
