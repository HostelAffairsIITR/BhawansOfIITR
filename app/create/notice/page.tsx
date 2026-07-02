'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\s+/g, '-')        // replace spaces with hyphens
    .replace(/[^a-zA-Z0-9.\-_]/g, '') // remove any other invalid characters
    .toLowerCase()
}

export default function CreateNoticePage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [bhavans, setBhavans] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isBhavanScopeRestricted, setIsBhavanScopeRestricted] = useState(false)
  const [allowedBhavanIds, setAllowedBhavanIds] = useState<number[] | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [selectedBhavanId, setSelectedBhavanId] = useState<string>('')
  const [attachmentFiles, setAttachmentFiles] = useState<File[]>([])

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

        const userBhavanIds = roles
          ? roles.map(r => r.bhavan_id).filter((id): id is number => id !== null)
          : []
        const hasGlobalScope = isSuperAdmin || (roles ? roles.some(r => r.bhavan_id === null) : false)

        let allowedIds: number[] | null = null
        if (!hasGlobalScope && userBhavanIds.length > 0) {
          allowedIds = Array.from(new Set(userBhavanIds))
        }

        const { data: bhavansList } = await supabase
          .from('bhavans')
          .select('id, name')
          .order('name')

        if (bhavansList) {
          if (allowedIds) {
            const filtered = bhavansList.filter(b => allowedIds!.includes(b.id))
            setBhavans(filtered)
            setIsBhavanScopeRestricted(true)
            setAllowedBhavanIds(allowedIds)
            if (allowedIds.length > 0) {
              setSelectedBhavanId(allowedIds[0].toString())
            }
          } else {
            setBhavans(bhavansList)
            if (bhavansList.length > 0) {
              setSelectedBhavanId(bhavansList[0].id.toString())
            }
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      setAttachmentFiles(prev => [...prev, ...newFiles])
    }
  }

  const handleRemoveFile = (index: number) => {
    setAttachmentFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      setErrorMsg('Please enter a notice title.')
      return
    }
    if (!body.trim()) {
      setErrorMsg('Please write a notice body.')
      return
    }
    if (!selectedBhavanId) {
      setErrorMsg('Please select a Bhavan scope.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    try {
      // 1. Upload attachments in parallel
      const uploadedFiles = await Promise.all(
        attachmentFiles.map(async (file) => {
          const safeName = sanitizeFilename(file.name)
          const { data, error } = await supabase.storage
            .from('notice-attachments')
            .upload(`${Date.now()}-${safeName}`, file)

          if (error) throw error

          const { data: { publicUrl } } = supabase.storage
            .from('notice-attachments')
            .getPublicUrl(data.path)

          return {
            url: publicUrl,
            name: file.name,
            type: file.type || 'application/octet-stream',
            size: file.size
          }
        })
      )

      // 2. Insert content_item
      const userId = user.id
      const { data: item, error: itemError } = await supabase
        .from('content_items')
        .insert({
          type: 'notice',
          title: title.trim(),
          status,
          bhavan_scope: parseInt(selectedBhavanId),
          allows_comments: false,
          allows_share: false,
          created_by: userId
        })
        .select()
        .single()

      if (itemError) throw itemError

      // 3. Insert notice body
      const { error: noticeError } = await supabase
        .from('notices')
        .insert({
          content_item_id: item.id,
          body: body.trim()
        })

      if (noticeError) throw noticeError

      // 4. Insert permissions row BEFORE attachments
      const { error: permError } = await supabase
        .from('permissions')
        .insert({
          content_item_id: item.id,
          user_id: userId,
          role: 'manager'
        })

      if (permError) throw permError

      // 5. Only now insert attachments
      if (uploadedFiles.length > 0) {
        const { error: attError } = await supabase
          .from('notice_attachments')
          .insert(
            uploadedFiles.map(f => ({
              notice_id: item.id,
              file_url: f.url,
              file_name: f.name,
              file_type: f.type,
              file_size: f.size
            }))
          )

        if (attError) throw attError
      }

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Error creating notice:', err)
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
              MAKE NEW NOTICE
            </h1>
            <p className="text-xs text-text-muted mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
              Publish an official notice for your Bhavan.
            </p>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-6">
              {/* Notice Title */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Notice Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Maintenance schedule for Block A water filters"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text"
                />
              </div>

              {/* Body */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Notice Content *
                </label>
                <textarea
                  required
                  placeholder="Write the details of the notice..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none text-text"
                />
              </div>

              {/* Bhavan Scope Selector */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Bhavan Scope *
                </label>
                <select
                  value={selectedBhavanId}
                  onChange={(e) => setSelectedBhavanId(e.target.value)}
                  disabled={isBhavanScopeRestricted && allowedBhavanIds?.length === 1}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {bhavans.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-text-muted mt-1.5" style={{ fontFamily: 'var(--font-sans)' }}>
                  Hostel notices are required to be scoped to a single Bhavan and will show up on that Bhavan's page.
                </p>
              </div>

              {/* File Attachments */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Notice Attachments (PDFs, Images, Documents)
                </label>
                <div className="flex flex-col gap-3">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none text-text file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-light/10 file:text-brand hover:file:bg-brand-light/20 cursor-pointer"
                  />
                  {attachmentFiles.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Files to upload:</p>
                      {attachmentFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between border border-border bg-surface p-3.5 rounded-xl shadow-xs gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-text truncate">{file.name}</p>
                            <p className="text-[9px] text-text-muted mt-0.5 font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                              {(file.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 uppercase tracking-wider"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
                  {submitting ? 'PUBLISHING...' : 'PUBLISH NOTICE'}
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
