'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils/compress-image'

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\s+/g, '-')        // replace spaces with hyphens
    .replace(/[^a-zA-Z0-9.\-_]/g, '') // remove any other invalid characters
    .toLowerCase()
}

interface GalleryImage {
  id: number
  scope: 'main' | 'bhawan'
  bhavan_id: number | null
  image_url: string
  caption: string | null
  display_order: number
  uploaded_by: string | null
  bhawans?: {
    name: string
  } | null
}

interface Bhawan {
  id: number
  name: string
}

export default function AdminGalleryPage() {
  const supabase = createClient()

  // State
  const [images, setImages] = useState<GalleryImage[]>([])
  const [bhawans, setBhawans] = useState<Bhawan[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Filters / Tabs
  const [activeTab, setActiveTab] = useState<'main' | 'bhawan'>('main')
  const [selectedBhawanId, setSelectedBhawanId] = useState<string>('')

  // Form State
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Inline Caption Edit State
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editCaption, setEditCaption] = useState('')

  const loadData = async () => {
    try {
      // 1. Get current session
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setCurrentUserId(user.id)

      // 2. Fetch gallery
      const { data: galleryData, error: galleryError } = await supabase
        .from('gallery_images')
        .select('*, bhawans(name)')
        .order('scope, bhavan_id, display_order')

      if (galleryError) throw galleryError
      if (galleryData) setImages(galleryData as GalleryImage[])

      // 3. Fetch bhawans list
      const { data: bhawansData, error: bhError } = await supabase
        .from('bhavans')
        .select('id, name')
        .order('name')

      if (bhError) throw bhError
      if (bhawansData) {
        setBhawans(bhawansData as Bhawan[])
        if (bhawansData.length > 0) {
          setSelectedBhawanId(bhawansData[0].id.toString())
        }
      }
    } catch (err) {
      console.error('Failed to load gallery content:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Helper to extract Supabase Storage path from publicUrl
  const getStoragePathFromUrl = (url: string, bucketName: string) => {
    const parts = url.split(`/public/${bucketName}/`)
    return parts.length > 1 ? parts[1] : null
  }

  // Upload Image
  const handleUploadImage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newImageFile || uploading) return

    setUploading(true)
    setErrorMsg('')

    const scope = activeTab
    const selectedBhawan = scope === 'bhawan' ? parseInt(selectedBhawanId) : null

    try {
      const compressed = await compressImage(newImageFile)
      const safeName = sanitizeFilename(compressed.name)
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('gallery-images')
        .upload(`${scope}/${Date.now()}-${safeName}`, compressed)

      if (uploadError) throw uploadError

      // 2. Get Public Url
      const { data: { publicUrl } } = supabase.storage
        .from('gallery-images')
        .getPublicUrl(uploadData.path)

      // 3. Insert metadata row into table
      const { error: insertError } = await supabase
        .from('gallery_images')
        .insert({
          scope,
          bhavan_id: selectedBhawan,
          image_url: publicUrl,
          caption: caption.trim() || null,
          display_order: 0,
          uploaded_by: currentUserId
        })

      if (insertError) throw insertError

      // Reset
      setNewImageFile(null)
      setCaption('')
      
      // Reload
      loadData()
    } catch (err: any) {
      console.error('Upload failed:', err)
      setErrorMsg(err.message || 'An error occurred during gallery upload.')
    } finally {
      setUploading(false)
    }
  }

  // Delete Image
  const handleDeleteImage = async (img: GalleryImage) => {
    const confirm = window.confirm('Are you sure you want to delete this gallery image?')
    if (!confirm) return

    try {
      // 1. Delete from storage bucket
      const storagePath = getStoragePathFromUrl(img.image_url, 'gallery-images')
      if (storagePath) {
        await supabase.storage.from('gallery-images').remove([storagePath])
      }

      // 2. Delete database row
      const { error: deleteError } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', img.id)

      if (deleteError) throw deleteError

      setImages(prev => prev.filter(i => i.id !== img.id))
    } catch (err: any) {
      console.error('Failed to delete image:', err)
      alert(err.message || 'Failed to delete image.')
    }
  }

  // Inline Caption Save
  const handleSaveCaption = async (id: number) => {
    try {
      const { error } = await supabase
        .from('gallery_images')
        .update({ caption: editCaption.trim() || null })
        .eq('id', id)

      if (error) throw error

      setImages(prev => prev.map(img => img.id === id ? { ...img, caption: editCaption.trim() || null } : img))
      setEditingId(null)
    } catch (err) {
      console.error('Failed to save caption:', err)
    }
  }

  // Native HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString())
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, targetIndex: number, filteredList: GalleryImage[]) => {
    e.preventDefault()
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'))
    if (sourceIndex === targetIndex) return

    // Rearrange within filtered subset
    const reorderedList = [...filteredList]
    const [removed] = reorderedList.splice(sourceIndex, 1)
    reorderedList.splice(targetIndex, 0, removed)

    // Assign display orders
    const updatedSubset = reorderedList.map((img, idx) => ({ ...img, display_order: idx }))

    // Update full images array state
    setImages(prev => {
      const rest = prev.filter(img => 
        activeTab === 'main' 
          ? img.scope !== 'main' 
          : (img.scope !== 'bhawan' || img.bhavan_id !== parseInt(selectedBhawanId))
      )
      return [...rest, ...updatedSubset].sort((a, b) => a.display_order - b.display_order)
    })

    // Batch update to Supabase
    try {
      await Promise.all(
        updatedSubset.map(img => 
          supabase
            .from('gallery_images')
            .update({ display_order: img.display_order })
            .eq('id', img.id)
        )
      )
    } catch (err) {
      console.error('Failed to persist reordered gallery image displays:', err)
    }
  }

  // Filter images according to active filters
  const filteredImages = images
    .filter(img => {
      if (activeTab === 'main') {
        return img.scope === 'main'
      } else {
        return img.scope === 'bhawan' && img.bhavan_id === parseInt(selectedBhawanId)
      }
    })
    .sort((a, b) => a.display_order - b.display_order)

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-brand uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
          Gallery Management
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Upload and organize images displayed across the main page and individual Bhawan gallery sections.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-4 pb-0.5">
        <button
          onClick={() => setActiveTab('main')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all
            ${activeTab === 'main' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text'}`}
        >
          Main Page Gallery
        </button>
        <button
          onClick={() => setActiveTab('bhawan')}
          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider cursor-pointer border-b-2 transition-all
            ${activeTab === 'bhawan' ? 'border-brand text-brand' : 'border-transparent text-text-muted hover:text-text'}`}
        >
          Bhawan Galleries
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Grid display (Left Columns) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Bhawan selector dropdown if Bhawan Galleries is active */}
          {activeTab === 'bhawan' && (
            <div className="flex items-center gap-2 border border-border bg-surface-raised p-4 rounded-xl max-w-sm">
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Select Bhawan:</label>
              <select
                value={selectedBhawanId}
                onChange={(e) => setSelectedBhawanId(e.target.value)}
                className="text-xs p-2 rounded-lg border border-border bg-surface text-text flex-1"
              >
                {bhawans.map(bh => (
                  <option key={bh.id} value={bh.id}>{bh.name}</option>
                ))}
              </select>
            </div>
          )}

          {loading ? (
            <p className="text-xs font-bold text-text-muted animate-pulse py-8 text-center uppercase">Loading gallery...</p>
          ) : filteredImages.length === 0 ? (
            <div className="border border-dashed border-border rounded-2xl p-12 text-center bg-surface-raised/40">
              <p className="text-xs text-text-muted italic">No images in this gallery scope yet.</p>
            </div>
          ) : (
            <div>
              <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-3">
                💡 Drag and drop grids to rearrange order.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {filteredImages.map((img, idx) => {
                  const isEditing = editingId === img.id

                  return (
                    <div
                      key={img.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, idx)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, idx, filteredImages)}
                      className="border border-border bg-surface-raised rounded-xl overflow-hidden shadow-xs hover:shadow-sm cursor-grab active:cursor-grabbing group relative"
                    >
                      <div className="aspect-video relative bg-surface-muted flex items-center justify-center border-b border-border">
                        <img src={img.image_url} alt={img.caption || ''} className="w-full h-full object-cover select-none pointer-events-none" />
                        <span className="absolute top-2 left-2 bg-black/60 text-white font-mono text-[9px] px-1.5 py-0.5 rounded">
                          #{img.display_order}
                        </span>
                      </div>

                      {/* Info Panel */}
                      <div className="p-3 text-xs flex flex-col gap-2">
                        {isEditing ? (
                          <div className="flex gap-1.5 items-center">
                            <input
                              type="text"
                              value={editCaption}
                              onChange={(e) => setEditCaption(e.target.value)}
                              className="p-1 border border-border bg-surface text-[10px] text-text rounded focus:outline-none flex-1"
                              placeholder="Caption"
                            />
                            <button onClick={() => handleSaveCaption(img.id)} className="text-green-600 font-bold uppercase text-[9px]">Save</button>
                            <button onClick={() => setEditingId(null)} className="text-text-muted font-bold uppercase text-[9px]">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start gap-2">
                            <p className="text-[10px] font-medium text-text italic truncate flex-1" title={img.caption || 'No caption'}>
                              {img.caption || 'No caption'}
                            </p>
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => {
                                  setEditingId(img.id)
                                  setEditCaption(img.caption || '')
                                }}
                                className="text-accent hover:text-accent-hover text-[9px] font-bold uppercase"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteImage(img)}
                                className="text-red-500 hover:text-red-700 text-[9px] font-bold uppercase"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Upload Form Panel (Right Column) */}
        <div className="lg:col-span-1">
          <div className="border border-border bg-surface-raised p-6 rounded-2xl shadow-xs">
            <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
              🖼️ Upload New Image
            </h3>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleUploadImage} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Image File *</label>
                <input
                  type="file"
                  required
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setNewImageFile(file)
                  }}
                  className="w-full p-3.5 border border-border bg-surface rounded-xl cursor-pointer file:border-0 file:bg-brand-light/10 file:text-brand file:font-bold file:rounded-xl file:px-2 file:py-0.5 file:text-[10px]"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Caption / Description</label>
                <input
                  type="text"
                  placeholder="e.g. Cautley Bhawan Front View"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-border bg-surface text-text"
                />
              </div>

              <div className="bg-surface/50 border border-border/60 p-3.5 rounded-xl">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block mb-1">Target Gallery:</span>
                <span className="text-xs font-bold text-brand uppercase tracking-wider">
                  {activeTab === 'main' ? 'Main Landing Page' : `${bhawans.find(b => b.id === parseInt(selectedBhawanId))?.name || 'Selected Bhawan'}`}
                </span>
              </div>

              <button
                type="submit"
                disabled={!newImageFile || uploading}
                className="btn-primary py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer text-center"
              >
                {uploading ? 'UPLOADING...' : 'UPLOAD TO GALLERY'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
