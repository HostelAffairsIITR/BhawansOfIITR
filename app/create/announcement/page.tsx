'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils/compress-image'

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\s+/g, '-')        // replace spaces with hyphens
    .replace(/[^a-zA-Z0-9.\-_]/g, '') // remove any other invalid characters
    .toLowerCase()
}

export default function CreateAnnouncementPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [bhawans, setBhawans] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isBhawanScopeRestricted, setIsBhawanScopeRestricted] = useState(false)
  const [allowedBhawanIds, setAllowedBhawanIds] = useState<number[] | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('')
  const [bhawanScope, setBhawanScope] = useState<string>('college-wide')
  const [allowsComments, setAllowsComments] = useState(false)
  const [expiresAt, setExpiresAt] = useState('')

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkAuth() {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      if (!currentUser) {
        router.push('/')
        return
      }
      setUser(currentUser)

      try {
        const { data: profile } = await supabase
          .from('users')
          .select('is_super_admin')
          .eq('id', currentUser.id)
          .maybeSingle()

        const { data: roles } = await supabase
          .from('user_roles')
          .select('role, bhavan_id')
          .eq('user_id', currentUser.id)

        const isSuperAdmin = profile?.is_super_admin || false
        const hasManagerRole = roles ? roles.some(r => r.role === 'manager') : false

        if (!isSuperAdmin && !hasManagerRole) {
          router.push('/')
          return
        }

        const userBhawanIds = roles
          ? roles.map(r => r.bhavan_id).filter((id): id is number => id !== null)
          : []
        const hasGlobalScope = isSuperAdmin || (roles ? roles.some(r => r.bhavan_id === null) : false)

        let allowedIds: number[] | null = null
        if (!hasGlobalScope && userBhawanIds.length > 0) {
          allowedIds = Array.from(new Set(userBhawanIds))
        }

        const { data: bhawansList } = await supabase
          .from('bhavans')
          .select('id, name')
          .order('name')

        if (bhawansList) {
          if (allowedIds) {
            const filtered = bhawansList.filter(b => allowedIds!.includes(b.id))
            setBhawans(filtered)
            setIsBhawanScopeRestricted(true)
            setAllowedBhawanIds(allowedIds)
            if (allowedIds.length > 0) {
              setBhawanScope(allowedIds[0].toString())
            }
          } else {
            setBhawans(bhawansList)
          }
        }
      } catch (err) {
        console.error('Auth verification failed:', err)
        router.push('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Please select a valid image file.')
        return
      }
      setImageFile(file)
    }
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      setErrorMsg('Please enter an announcement title.')
      return
    }
    if (!body.trim()) {
      setErrorMsg('Please write an announcement body.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      let finalImageUrl = imageUrl

      // 1. Upload image if selected
      if (imageFile) {
        const compressed = await compressImage(imageFile)
        const safeName = sanitizeFilename(compressed.name)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blog-images')
          .upload(`${Date.now()}-${safeName}`, compressed)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(uploadData.path)

        finalImageUrl = publicUrl
      }

      const selectedScope = bhawanScope === 'college-wide' ? null : parseInt(bhawanScope)

      // 2. Insert content_item
      const { data: item, error: itemError } = await supabase
        .from('content_items')
        .insert({
          type: 'announcement',
          title: title.trim(),
          status,
          bhavan_scope: selectedScope,
          allows_comments: allowsComments,
          allows_share: true,
          created_by: user.id
        })
        .select()
        .single()

      if (itemError) throw itemError

      // 3. Insert announcements
      const { error: annError } = await supabase
        .from('announcements')
        .insert({
          content_item_id: item.id,
          body: body.trim(),
          image_url: finalImageUrl || null,
          expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
        })

      if (annError) throw annError

      // 4. Insert permissions
      const { error: permError } = await supabase
        .from('permissions')
        .insert({
          content_item_id: item.id,
          user_id: user.id,
          role: 'manager'
        })

      if (permError) throw permError

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error creating announcement:', err)
      setErrorMsg(err.message || 'An error occurred during submission. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-surface flex items-center justify-center">
          <p className="text-sm font-bold text-text-muted animate-pulse">LOADING AUTHORIZATION...</p>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface py-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Back Link */}
          <a href="/dashboard" className="inline-flex items-center gap-2 text-text-muted hover:text-brand text-xs font-bold uppercase tracking-wider mb-6 transition-colors">
            ← BACK TO DASHBOARD
          </a>

          {/* Form Card */}
          <div className="bg-surface-raised border border-border rounded-2xl shadow-sm p-6 sm:p-10">
            <h1 className="text-2xl font-extrabold text-brand mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
              MAKE NEW ANNOUNCEMENT
            </h1>
            <p className="text-xs text-text-muted mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
              Post a quick bulletin or update for the students.
            </p>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-6">
              {/* Title */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Announcement Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Guest lecture scheduled at Rajiv Bhawan"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Announcement Body *
                </label>
                <textarea
                  required
                  placeholder="Write the details of the announcement here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none text-text"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Optional Image Banner
                </label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none text-text file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-light/10 file:text-brand hover:file:bg-brand-light/20 cursor-pointer"
                  />
                  {imageFile && (
                    <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                      Selected: {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>
              </div>

              {/* Bhawan Scope */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Bhawan Scope
                </label>
                <select
                  value={bhawanScope}
                  onChange={(e) => setBhawanScope(e.target.value)}
                  disabled={isBhawanScopeRestricted && allowedBhawanIds?.length === 1}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {!isBhawanScopeRestricted && (
                    <option value="college-wide">College-wide (All Hostels)</option>
                  )}
                  {bhawans.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Expires At Date Picker */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Expiration Date / Time (Optional)
                </label>
                <input
                  type="datetime-local"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text"
                />
                <p className="text-[10px] text-text-muted mt-1.5" style={{ fontFamily: 'var(--font-sans)' }}>
                  The announcement will automatically hide after this date and time.
                </p>
              </div>

              {/* Allow Comments */}
              <div className="flex items-center justify-between border-t border-border pt-6 mt-2">
                <div>
                  <span className="text-xs font-bold text-text mb-0.5 block" style={{ fontFamily: 'var(--font-sans)' }}>
                    Allow Comments
                  </span>
                  <span className="text-[10px] text-text-muted block" style={{ fontFamily: 'var(--font-sans)' }}>
                    Permit students to post comments and discuss this announcement.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={allowsComments}
                  onChange={(e) => setAllowsComments(e.target.checked)}
                  className="w-4 h-4 text-brand focus:ring-brand border-border rounded"
                />
              </div>

              {/* Form Buttons */}
              <div className="flex gap-4 pt-6 border-t border-border mt-4">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit('draft')}
                  className="btn-secondary py-3.5 px-6 rounded-xl text-xs font-bold tracking-wider uppercase flex-1 text-center border border-border bg-surface hover:bg-surface-muted text-text cursor-pointer"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  SAVE AS DRAFT
                </button>
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleSubmit('published')}
                  className="btn-primary py-3.5 px-6 rounded-xl text-xs font-bold tracking-wider uppercase flex-1 text-center cursor-pointer"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {submitting ? 'PUBLISHING...' : 'PUBLISH ANNOUNCEMENT'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
