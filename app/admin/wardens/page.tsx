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

interface Warden {
  id: number
  name: string
  image_url: string | null
  title: string
  bhavan_id: number | null
  is_active: boolean
  display_order: number
  bhavans?: {
    name: string
  } | null
}

interface Bhavan {
  id: number
  name: string
}

export default function AdminWardensPage() {
  const supabase = createClient()

  // State
  const [wardens, setWardens] = useState<Warden[]>([])
  const [bhavans, setBhavans] = useState<Bhavan[]>([])
  const [loading, setLoading] = useState(true)
  const [showInactive, setShowInactive] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [bhavanId, setBhavanId] = useState('')
  const [displayOrder, setDisplayOrder] = useState('0')
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Inline Edit State
  const [editingWardenId, setEditingWardenId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [editDisplayOrder, setEditDisplayOrder] = useState(0)
  const [editPhotoFile, setEditPhotoFile] = useState<File | null>(null)
  const [editSubmitting, setEditSubmitting] = useState(false)

  const loadData = async () => {
    try {
      // 1. Fetch wardens
      const { data: wardensData, error: wardensError } = await supabase
        .from('wardens')
        .select('*, bhavans(name)')
        .order('bhavan_id, display_order')

      if (wardensError) throw wardensError
      if (wardensData) setWardens(wardensData as Warden[])

      // 2. Fetch bhavans
      const { data: bhavansData, error: bhError } = await supabase
        .from('bhavans')
        .select('id, name')
        .order('name')

      if (bhError) throw bhError
      if (bhavansData) setBhavans(bhavansData as Bhavan[])
    } catch (err) {
      console.error('Failed to load wardens content:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Add Warden Submit
  const handleAddWarden = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || formSubmitting) return

    setFormSubmitting(true)
    setErrorMsg('')

    try {
      let finalImageUrl = null

      // Upload photo to warden-photos bucket
      if (photoFile) {
        const compressed = await compressImage(photoFile)
        const safeName = sanitizeFilename(compressed.name)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('warden-photos')
          .upload(`${Date.now()}-${safeName}`, compressed)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('warden-photos')
          .getPublicUrl(uploadData.path)

        finalImageUrl = publicUrl
      }

      const selectedBhavanId = bhavanId ? parseInt(bhavanId) : null

      const { error: insertError } = await supabase
        .from('wardens')
        .insert({
          name: name.trim(),
          title: title.trim(),
          bhavan_id: selectedBhavanId,
          image_url: finalImageUrl || null,
          display_order: parseInt(displayOrder) || 0,
          is_active: true
        })

      if (insertError) throw insertError

      // Reset Form & Reload List
      setName('')
      setTitle('')
      setBhavanId('')
      setDisplayOrder('0')
      setPhotoFile(null)

      loadData()
    } catch (err: any) {
      console.error('Error adding warden:', err)
      setErrorMsg(err.message || 'Failed to add warden.')
    } finally {
      setFormSubmitting(false)
    }
  }

  // Deactivate / Activate Warden
  const handleToggleActive = async (warden: Warden) => {
    try {
      const { error } = await supabase
        .from('wardens')
        .update({ is_active: !warden.is_active })
        .eq('id', warden.id)

      if (error) throw error

      setWardens(prev => prev.map(w => w.id === warden.id ? { ...w, is_active: !w.is_active } : w))
    } catch (err) {
      console.error('Failed to toggle active status:', err)
    }
  }

  // Inline Edit Save
  const handleSaveEdit = async (wardenId: number, currentImageUrl: string | null) => {
    setEditSubmitting(true)
    try {
      let finalImageUrl = currentImageUrl

      // Upload edit photo if selected
      if (editPhotoFile) {
        const compressed = await compressImage(editPhotoFile)
        const safeName = sanitizeFilename(compressed.name)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('warden-photos')
          .upload(`${Date.now()}-${safeName}`, compressed)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('warden-photos')
          .getPublicUrl(uploadData.path)

        finalImageUrl = publicUrl
      }

      const { error } = await supabase
        .from('wardens')
        .update({
          name: editName.trim(),
          title: editTitle.trim(),
          display_order: editDisplayOrder,
          image_url: finalImageUrl
        })
        .eq('id', wardenId)

      if (error) throw error

      setWardens(prev => prev.map(w => w.id === wardenId ? {
        ...w,
        name: editName,
        title: editTitle,
        display_order: editDisplayOrder,
        image_url: finalImageUrl
      } : w))

      setEditingWardenId(null)
      setEditPhotoFile(null)
    } catch (err) {
      console.error('Failed to update warden details:', err)
    } finally {
      setEditSubmitting(false)
    }
  }

  const startEditing = (w: Warden) => {
    setEditingWardenId(w.id)
    setEditName(w.name)
    setEditTitle(w.title)
    setEditDisplayOrder(w.display_order)
  }

  // Filtering wardens based on active status toggle
  const filteredWardens = showInactive ? wardens : wardens.filter(w => w.is_active)

  // Separating DOSW and Bhavan Wardens
  const doswList = filteredWardens.filter(w => w.bhavan_id === null)
  const bhavanList = filteredWardens.filter(w => w.bhavan_id !== null)

  // Group bhavan wardens by bhavan
  const groupedBhavanWardens = bhavanList.reduce((acc, w) => {
    const bhName = w.bhavans?.name || 'Unassigned Bhavan'
    if (!acc[bhName]) acc[bhName] = []
    acc[bhName].push(w)
    return acc
  }, {} as Record<string, Warden[]>)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Wardens List (Left/Main Column) */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h2 className="text-2xl font-extrabold text-brand uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              Wardens Management
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Configure hostel wardens and Dean of Student Welfare (DOSW).
            </p>
          </div>
          <button
            onClick={() => setShowInactive(!showInactive)}
            className="btn-secondary py-2 px-4 rounded-xl text-xs font-bold tracking-wider border border-border uppercase cursor-pointer"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {showInactive ? 'Hide Inactive' : 'Show Inactive'}
          </button>
        </div>

        {loading ? (
          <p className="text-xs font-bold text-text-muted animate-pulse py-8 text-center uppercase">Loading wardens...</p>
        ) : (
          <div className="flex flex-col gap-6">
            {/* DOSW Section */}
            <div>
              <h3 className="text-xs font-extrabold text-brand uppercase tracking-wider mb-3 border-b border-border pb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                ⭐ Dean of Student Welfare (DOSW)
              </h3>
              {doswList.length === 0 ? (
                <p className="text-xs text-text-muted italic">No active DOSW configured.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {doswList.map(w => renderWardenCard(w))}
                </div>
              )}
            </div>

            {/* Bhavan Wardens */}
            <div>
              <h3 className="text-xs font-extrabold text-brand uppercase tracking-wider mb-3 border-b border-border pb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                🏫 Hostel / Bhavan Wardens
              </h3>
              {Object.keys(groupedBhavanWardens).length === 0 ? (
                <p className="text-xs text-text-muted italic">No Bhavan wardens configured.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {Object.keys(groupedBhavanWardens).map(bhName => (
                    <div key={bhName} className="border border-border bg-surface-raised p-4 rounded-2xl">
                      <h4 className="text-xs font-bold text-text uppercase mb-3 pl-2 border-l-2 border-brand">
                        {bhName}
                      </h4>
                      <div className="flex flex-col gap-3">
                        {groupedBhavanWardens[bhName].map(w => renderWardenCard(w))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Warden Form (Right Column) */}
      <div className="lg:col-span-1">
        <div className="border border-border bg-surface-raised p-6 rounded-2xl shadow-xs">
          <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
            🛡️ Configure New Warden
          </h3>

          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleAddWarden} className="flex flex-col gap-4 text-xs">
            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Full Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Prof. R. K. Singh"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-border bg-surface text-text"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Title / Position *</label>
              <input
                type="text"
                required
                placeholder="e.g. Chief Warden / Dean"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-border bg-surface text-text"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Bhavan (Leave null for DOSW)</label>
              <select
                value={bhavanId}
                onChange={(e) => setBhavanId(e.target.value)}
                className="w-full p-3.5 rounded-xl border border-border bg-surface text-text"
              >
                <option value="">Dean of Student Welfare (DOSW)</option>
                {bhavans.map(bh => (
                  <option key={bh.id} value={bh.id}>{bh.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Display Order</label>
                <input
                  type="number"
                  value={displayOrder}
                  onChange={(e) => setDisplayOrder(e.target.value)}
                  className="w-full p-3.5 rounded-xl border border-border bg-surface text-text"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) setPhotoFile(file)
                  }}
                  className="w-full p-3 border border-border bg-surface rounded-xl cursor-pointer file:border-0 file:bg-brand-light/10 file:text-brand file:font-bold file:rounded-xl file:px-2 file:py-0.5 file:text-[10px]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim() || formSubmitting}
              className="btn-primary py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              {formSubmitting ? 'ADDING...' : 'ADD WARDEN'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )

  // Card Rendering Helper
  function renderWardenCard(w: Warden) {
    const isEditing = editingWardenId === w.id
    const initials = w.name.replace('Prof. ', '').replace('Dr. ', '').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

    return (
      <div key={w.id} className={`flex items-center justify-between border border-border/60 bg-surface p-4 rounded-2xl gap-4 transition-all
        ${w.is_active ? 'opacity-100' : 'opacity-65 border-dashed bg-surface/40'}`}>
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {/* Photo */}
          <div className="w-14 h-14 rounded-full border border-border bg-surface flex items-center justify-center overflow-hidden shrink-0 relative">
            {w.image_url ? (
              <img src={w.image_url} alt={w.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xl font-extrabold text-brand-muted">{initials}</span>
            )}
          </div>

          {/* Details */}
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <div className="flex flex-col gap-2 max-w-sm mt-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="p-1.5 border border-border rounded text-xs bg-surface text-text focus:outline-none"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="p-1.5 border border-border rounded text-xs bg-surface text-text focus:outline-none"
                  placeholder="Title"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={editDisplayOrder}
                    onChange={(e) => setEditDisplayOrder(parseInt(e.target.value) || 0)}
                    className="p-1.5 border border-border rounded text-xs bg-surface text-text focus:outline-none"
                    placeholder="Order"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setEditPhotoFile(file)
                    }}
                    className="p-1 border border-border bg-surface rounded text-[10px] cursor-pointer"
                  />
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm font-extrabold text-text flex items-center gap-2">
                  {w.name}
                  {!w.is_active && (
                    <span className="bg-red-500/10 text-red-500 text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      Inactive
                    </span>
                  )}
                </p>
                <p className="text-xs text-text-muted mt-0.5 font-medium">{w.title} · Order #{w.display_order}</p>
              </>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <button
                disabled={editSubmitting}
                onClick={() => handleSaveEdit(w.id, w.image_url)}
                className="text-green-600 hover:text-green-800 text-xs font-bold uppercase cursor-pointer"
              >
                {editSubmitting ? 'Saving' : 'Save'}
              </button>
              <button
                disabled={editSubmitting}
                onClick={() => {
                  setEditingWardenId(null)
                  setEditPhotoFile(null)
                }}
                className="text-text-muted hover:text-text text-xs font-bold uppercase cursor-pointer"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => startEditing(w)}
                className="text-accent hover:text-accent-hover text-xs font-bold uppercase cursor-pointer"
              >
                Edit
              </button>
              <button
                onClick={() => handleToggleActive(w)}
                className={`text-xs font-bold uppercase cursor-pointer
                  ${w.is_active ? 'text-red-500 hover:text-red-700' : 'text-green-600 hover:text-green-800'}`}
              >
                {w.is_active ? 'Deactivate' : 'Activate'}
              </button>
            </>
          )}
        </div>
      </div>
    )
  }
}
