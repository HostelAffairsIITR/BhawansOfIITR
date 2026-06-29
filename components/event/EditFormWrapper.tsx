'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { compressImage } from '@/lib/utils/compress-image'
import ReactMarkdown from 'react-markdown'

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\s+/g, '-')        // replace spaces with hyphens
    .replace(/[^a-zA-Z0-9.\-_]/g, '') // remove any other invalid characters
    .toLowerCase()
}

interface EditFormWrapperProps {
  item: any
  bhavans: any[]
  userId: string
}

export default function EditFormWrapper({ item, bhavans, userId }: EditFormWrapperProps) {
  const router = useRouter()
  const supabase = createClient()

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Shared form fields
  const [title, setTitle] = useState(item.title || '')
  const [bhavanScope, setBhavanScope] = useState<string>(
    item.bhavan_scope ? item.bhavan_scope.toString() : 'college-wide'
  )
  const [allowsComments, setAllowsComments] = useState(!!item.allows_comments)

  // 1. Poll specific state
  const sortedInitialOptions = item.poll_options
    ? [...item.poll_options].sort((a, b) => a.display_order - b.display_order).map(o => o.option_text)
    : ['', '']
  const [pollOptions, setPollOptions] = useState<string[]>(sortedInitialOptions)

  // 2. Blog specific state
  const blogData = Array.isArray(item.blogs) ? item.blogs[0] : item.blogs
  const [blogBody, setBlogBody] = useState(blogData?.body || '')
  const [blogExcerpt, setBlogExcerpt] = useState(blogData?.excerpt || '')
  const [blogCoverUrl, setBlogCoverUrl] = useState(blogData?.cover_image_url || '')
  const [originalCoverUrl] = useState(blogData?.cover_image_url || '')
  const [newCoverFile, setNewCoverFile] = useState<File | null>(null)
  const [blogTab, setBlogTab] = useState<'edit' | 'preview'>('edit')
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  // 3. Announcement specific state
  const annData = Array.isArray(item.announcements) ? item.announcements[0] : item.announcements
  const [annBody, setAnnBody] = useState(annData?.body || '')
  const [annImageUrl, setAnnImageUrl] = useState(annData?.image_url || '')
  const [originalAnnImageUrl] = useState(annData?.image_url || '')
  const [newAnnImageFile, setNewAnnImageFile] = useState<File | null>(null)
  const [expiresAt, setExpiresAt] = useState(
    annData?.expires_at ? new Date(annData.expires_at).toISOString().slice(0, 16) : ''
  )

  // 4. Notice specific state
  const noticeData = Array.isArray(item.notices) ? item.notices[0] : item.notices
  const [noticeBody, setNoticeBody] = useState(noticeData?.body || '')
  const [existingAttachments, setExistingAttachments] = useState<any[]>(
    noticeData?.notice_attachments || []
  )
  const [removedAttachmentIds, setRemovedAttachmentIds] = useState<string[]>([])
  const [newNoticeFiles, setNewNoticeFiles] = useState<File[]>([])

  // Helper to extract Supabase Storage path from publicUrl
  const getStoragePathFromUrl = (url: string, bucketName: string) => {
    const parts = url.split(`/public/${bucketName}/`)
    return parts.length > 1 ? parts[1] : null
  }

  const getPathFromUrl = (url: string) => {
    const parts = url.split(`/public/notice-attachments/`)
    return parts.length > 1 ? parts[1] : ''
  }

  // Poll handlers
  const handleAddOption = () => {
    if (pollOptions.length >= 8) return
    setPollOptions([...pollOptions, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length <= 2) return
    setPollOptions(pollOptions.filter((_, i) => i !== index))
  }

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...pollOptions]
    updated[index] = val
    setPollOptions(updated)
  }

  // Blog Markdown Drop handlers
  const handleBlogTextareaDrop = async (e: React.DragEvent<HTMLTextAreaElement>) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      const file = files[0]
      if (!file.type.startsWith('image/')) return

      setIsUploadingImage(true)
      try {
        const compressed = await compressImage(file)
        const safeName = sanitizeFilename(compressed.name)
        const { data, error } = await supabase.storage
          .from('blog-images')
          .upload(`${Date.now()}-${safeName}`, compressed)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from('blog-images')
          .getPublicUrl(data.path)

        const textarea = e.currentTarget
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const textBefore = blogBody.substring(0, start)
        const textAfter = blogBody.substring(end)
        const markdownTag = `![${file.name}](${publicUrl})`

        setBlogBody(textBefore + markdownTag + textAfter)
      } catch (err: any) {
        console.error(err)
        setErrorMsg('Failed to upload dropped image.')
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  // Notice handlers
  const markForRemoval = (attId: string) => {
    setRemovedAttachmentIds(p => [...p, attId])
  }

  const handleAddNewNoticeFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setNewNoticeFiles(prev => [...prev, ...Array.from(files)])
    }
  }

  const handleRemoveNewNoticeFile = (index: number) => {
    setNewNoticeFiles(prev => prev.filter((_, i) => i !== index))
  }

  // Submit Handler
  const handleUpdate = async (status: 'draft' | 'published' | 'archived') => {
    if (status === 'archived') {
      const confirmArchive = window.confirm('Are you sure you want to archive this item? It will be moved to the Past tab.')
      if (!confirmArchive) return
    }

    if (!title.trim()) {
      setErrorMsg('Please specify a title.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    const selectedScope = bhavanScope === 'college-wide' ? null : parseInt(bhavanScope)

    try {
      if (item.type === 'poll') {
        const trimmedOptions = pollOptions.map(o => o.trim()).filter(Boolean)
        if (trimmedOptions.length < 2) {
          throw new Error('Please specify at least 2 non-empty options.')
        }

        // 1. Update content_item
        const { error: itemError } = await supabase
          .from('content_items')
          .update({
            title: title.trim(),
            status,
            bhavan_scope: selectedScope,
            allows_comments: allowsComments
          })
          .eq('id', item.id)

        if (itemError) throw itemError

        // 2. Delete and re-insert options
        const { error: deleteError } = await supabase
          .from('poll_options')
          .delete()
          .eq('content_item_id', item.id)

        if (deleteError) throw deleteError

        const { error: insertError } = await supabase
          .from('poll_options')
          .insert(
            trimmedOptions.map((text, i) => ({
              content_item_id: item.id,
              option_text: text,
              display_order: i
            }))
          )

        if (insertError) throw insertError
      } 
      
      else if (item.type === 'blog') {
        if (!blogExcerpt.trim()) throw new Error('Excerpt is required.')
        if (!blogBody.trim()) throw new Error('Body content is required.')

        let finalCoverUrl = blogCoverUrl

        // If cover image was deleted or replaced, remove original from storage
        if (originalCoverUrl && (blogCoverUrl === '' || newCoverFile)) {
          const path = originalCoverUrl.split('/public/blog-images/')[1]
          if (path) {
            await supabase.storage.from('blog-images').remove([path])
          }
        }

        // 1. Upload new cover image if exists
        if (newCoverFile) {
          const compressed = await compressImage(newCoverFile)
          const safeName = sanitizeFilename(compressed.name)
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(`${Date.now()}-${safeName}`, compressed)

          if (uploadError) throw uploadError

          const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(uploadData.path)

          finalCoverUrl = publicUrl
        }

        // 2. Update content_item
        const { error: itemError } = await supabase
          .from('content_items')
          .update({
            title: title.trim(),
            status,
            bhavan_scope: selectedScope,
            allows_comments: allowsComments
          })
          .eq('id', item.id)

        if (itemError) throw itemError

        // 3. Update blogs table
        const { error: blogError } = await supabase
          .from('blogs')
          .update({
            body: blogBody.trim(),
            cover_image_url: finalCoverUrl || null,
            excerpt: blogExcerpt.trim()
          })
          .eq('content_item_id', item.id)

        if (blogError) throw blogError
      } 
      
      else if (item.type === 'announcement') {
        if (!annBody.trim()) throw new Error('Body content is required.')

        let finalImageUrl = annImageUrl

        // If banner image was deleted or replaced, remove original from storage
        if (originalAnnImageUrl && (annImageUrl === '' || newAnnImageFile)) {
          const path = originalAnnImageUrl.split('/public/blog-images/')[1]
          if (path) {
            await supabase.storage.from('blog-images').remove([path])
          }
        }

        // 1. Upload new image if exists
        if (newAnnImageFile) {
          const compressed = await compressImage(newAnnImageFile)
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

        // 2. Update content_item
        const { error: itemError } = await supabase
          .from('content_items')
          .update({
            title: title.trim(),
            status,
            bhavan_scope: selectedScope,
            allows_comments: allowsComments
          })
          .eq('id', item.id)

        if (itemError) throw itemError

        // 3. Update announcements table
        const { error: annError } = await supabase
          .from('announcements')
          .update({
            body: annBody.trim(),
            image_url: finalImageUrl || null,
            expires_at: expiresAt ? new Date(expiresAt).toISOString() : null
          })
          .eq('content_item_id', item.id)

        if (annError) throw annError
      } 
      
      else if (item.type === 'notice') {
        if (!noticeBody.trim()) throw new Error('Body content is required.')
        if (bhavanScope === 'college-wide') throw new Error('Notices require a specific Bhavan scope.')

        // 1. Delete removed notice attachments from database + storage
        for (const id of removedAttachmentIds) {
          const attachment = existingAttachments.find(a => a.id === id)
          if (attachment) {
            await supabase.storage
              .from('notice-attachments')
              .remove([getPathFromUrl(attachment.file_url)])
          }
          await supabase.from('notice_attachments').delete().eq('id', id)
        }

        // 2. Upload new notice files
        const uploadedNoticeFiles = await Promise.all(
          newNoticeFiles.map(async (file) => {
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

        // 3. Update content_item
        const { error: itemError } = await supabase
          .from('content_items')
          .update({
            title: title.trim(),
            status,
            bhavan_scope: selectedScope
          })
          .eq('id', item.id)

        if (itemError) throw itemError

        // 4. Update notices table
        const { error: noticeError } = await supabase
          .from('notices')
          .update({
            body: noticeBody.trim()
          })
          .eq('content_item_id', item.id)

        if (noticeError) throw noticeError

        // 5. Insert new notice attachments
        if (uploadedNoticeFiles.length > 0) {
          const { error: attInsertError } = await supabase
            .from('notice_attachments')
            .insert(
              uploadedNoticeFiles.map(f => ({
                notice_id: item.id,
                file_url: f.url,
                file_name: f.name,
                file_type: f.type,
                file_size: f.size
              }))
            )

          if (attInsertError) throw attInsertError
        }
      }

      router.push('/dashboard')
    } catch (err: any) {
      console.error('Update failed:', err)
      setErrorMsg(err.message || 'An error occurred while updating the item.')
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'This will permanently delete this content and all associated files. This cannot be undone.'
    )
    if (!confirmed) return

    setSubmitting(true)
    setErrorMsg('')

    try {
      const blogData = Array.isArray(item.blogs) ? item.blogs[0] : item.blogs
      const announcementData = Array.isArray(item.announcements) ? item.announcements[0] : item.announcements
      const noticeData = Array.isArray(item.notices) ? item.notices[0] : item.notices

      // Delete storage files based on type
      if (item.type === 'blog' && blogData?.cover_image_url) {
        const path = blogData.cover_image_url.split('/public/blog-images/')[1]
        if (path) {
          await supabase.storage.from('blog-images').remove([path])
        }
      }

      if (item.type === 'announcement' && announcementData?.image_url) {
        const path = announcementData.image_url.split('/public/blog-images/')[1]
        if (path) {
          await supabase.storage.from('blog-images').remove([path])
        }
      }

      if (item.type === 'notice') {
        const attachments = noticeData?.notice_attachments ?? []
        const paths = attachments.map((a: any) => 
          a.file_url.split('/public/notice-attachments/')[1]
        ).filter(Boolean)
        if (paths.length) {
          await supabase.storage.from('notice-attachments').remove(paths)
        }
      }

      // Hard delete content item (cascades to type tables, comments, permissions, votes)
      const { error: deleteError } = await supabase.from('content_items').delete().eq('id', item.id)
      if (deleteError) throw deleteError

      // Redirect to dashboard after deletion
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Delete failed:', err)
      setErrorMsg(err.message || 'An error occurred while deleting.')
      setSubmitting(false)
    }
  }

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {/* Back Link */}
      <a href="/dashboard" className="inline-flex items-center gap-2 text-text-muted hover:text-brand text-xs font-bold uppercase tracking-wider mb-6 transition-colors">
        ← BACK TO DASHBOARD
      </a>

      {/* Form Card */}
      <div className="bg-surface-raised border border-border rounded-2xl shadow-sm p-6 sm:p-10">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-brand mb-1" style={{ fontFamily: 'var(--font-sans)' }}>
              EDIT {item.type.toUpperCase()}
            </h1>
            <p className="text-xs text-text-muted" style={{ fontFamily: 'var(--font-sans)' }}>
              Modify your existing {item.type} and save or publish changes.
            </p>
          </div>
          <span className="bg-brand-light/10 text-brand text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
            {item.status}
          </span>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
            ⚠️ {errorMsg}
          </div>
        )}

        <div className="flex flex-col gap-6">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
              {capitalize(item.type)} Title / Question *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text"
            />
          </div>

          {/* Type-Specific Fields */}

          {/* POLL FIELDS */}
          {item.type === 'poll' && (
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                Poll Options (Min 2, Max 8)
              </label>
              <div className="flex flex-col gap-3">
                {pollOptions.map((opt, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-[10px] font-bold text-text-muted w-6" style={{ fontFamily: 'var(--font-mono)' }}>#{index + 1}</span>
                    <input
                      type="text"
                      required
                      value={opt}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="flex-1 text-xs sm:text-sm p-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text"
                    />
                    {pollOptions.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        className="p-3 text-red-500 hover:bg-red-500/5 rounded-xl transition-colors"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {pollOptions.length < 8 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:text-accent-hover tracking-wider uppercase py-1"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  + ADD OPTION
                </button>
              )}
            </div>
          )}

          {/* BLOG FIELDS */}
          {item.type === 'blog' && (
            <>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Excerpt *
                </label>
                <input
                  type="text"
                  required
                  value={blogExcerpt}
                  onChange={(e) => setBlogExcerpt(e.target.value)}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Cover Image
                </label>
                <div className="flex flex-col gap-3">
                  {newCoverFile ? (
                    <div className="flex items-center justify-between border border-border bg-surface p-3.5 rounded-xl shadow-xs gap-3">
                      <span className="text-xs font-bold text-text truncate max-w-[200px] sm:max-w-xs">New image: {newCoverFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setNewCoverFile(null)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : blogCoverUrl ? (
                    <div className="flex items-center justify-between border border-border bg-surface p-3.5 rounded-xl shadow-xs gap-3">
                      <div className="flex items-center gap-3">
                        <img src={blogCoverUrl} alt="Cover" className="w-12 h-12 object-cover rounded-lg" />
                        <span className="text-xs font-semibold text-text truncate max-w-[150px] sm:max-w-xs">Current cover image</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setBlogCoverUrl('')}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        Delete Cover
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setNewCoverFile(file)
                      }}
                      className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface text-text file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-light/10 file:text-brand hover:file:bg-brand-light/20 cursor-pointer"
                    />
                  )}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider block" style={{ fontFamily: 'var(--font-sans)' }}>
                    Blog Body (Markdown) *
                  </label>
                  <div className="flex p-0.5 bg-surface-muted border border-border/60 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setBlogTab('edit')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer
                        ${blogTab === 'edit' ? 'bg-surface text-brand shadow-xs' : 'text-text-muted'}`}
                    >
                      EDIT
                    </button>
                    <button
                      type="button"
                      onClick={() => setBlogTab('preview')}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider cursor-pointer
                        ${blogTab === 'preview' ? 'bg-surface text-brand shadow-xs' : 'text-text-muted'}`}
                    >
                      PREVIEW
                    </button>
                  </div>
                </div>

                {blogTab === 'edit' ? (
                  <div className="relative">
                    <textarea
                      required
                      value={blogBody}
                      onChange={(e) => setBlogBody(e.target.value)}
                      onDrop={handleBlogTextareaDrop}
                      onDragOver={(e) => e.preventDefault()}
                      rows={12}
                      className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none text-text"
                    />
                    {isUploadingImage && (
                      <div className="absolute inset-0 bg-surface/70 backdrop-blur-xs flex items-center justify-center rounded-xl border border-border">
                        <span className="text-[10px] font-bold text-accent animate-pulse">UPLOADING DROPPED IMAGE...</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-text leading-relaxed text-sm sm:text-base border border-border rounded-xl bg-surface p-5 min-h-[268px] overflow-y-auto max-h-[400px]">
                    <ReactMarkdown>{blogBody || '*No content*'}</ReactMarkdown>
                  </div>
                )}
              </div>
            </>
          )}

          {/* ANNOUNCEMENT FIELDS */}
          {item.type === 'announcement' && (
            <>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Announcement Body *
                </label>
                <textarea
                  required
                  value={annBody}
                  onChange={(e) => setAnnBody(e.target.value)}
                  rows={6}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none text-text"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Banner Image
                </label>
                <div className="flex flex-col gap-3">
                  {newAnnImageFile ? (
                    <div className="flex items-center justify-between border border-border bg-surface p-3.5 rounded-xl shadow-xs gap-3">
                      <span className="text-xs font-bold text-text truncate max-w-[200px] sm:max-w-xs">New banner: {newAnnImageFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setNewAnnImageFile(null)}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : annImageUrl ? (
                    <div className="flex items-center justify-between border border-border bg-surface p-3.5 rounded-xl shadow-xs gap-3">
                      <div className="flex items-center gap-3">
                        <img src={annImageUrl} alt="Banner" className="w-12 h-12 object-cover rounded-lg" />
                        <span className="text-xs font-semibold text-text truncate max-w-[150px] sm:max-w-xs">Current banner image</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAnnImageUrl('')}
                        className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase tracking-wider cursor-pointer"
                      >
                        Delete Banner
                      </button>
                    </div>
                  ) : (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) setNewAnnImageFile(file)
                      }}
                      className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface text-text file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-light/10 file:text-brand hover:file:bg-brand-light/20 cursor-pointer"
                    />
                  )}
                </div>
              </div>

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
              </div>
            </>
          )}

          {/* NOTICE FIELDS */}
          {item.type === 'notice' && (
            <>
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Notice Content *
                </label>
                <textarea
                  required
                  value={noticeBody}
                  onChange={(e) => setNoticeBody(e.target.value)}
                  rows={6}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none text-text"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Manage Attachments
                </label>
                <div className="flex flex-col gap-4">
                  {/* Existing Attachments */}
                  {existingAttachments.length > 0 && (
                    <div className="flex flex-col gap-2">
                      <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-mono)' }}>Existing Attachments:</p>
                      <div className="flex flex-col gap-2">
                        {existingAttachments
                          .filter(a => !removedAttachmentIds.includes(a.id))
                          .map(att => (
                            <div key={att.id} className="flex items-center justify-between border border-border bg-surface p-3.5 rounded-xl shadow-xs gap-3">
                              <span className="text-xs font-bold text-text truncate max-w-[150px] sm:max-w-xs">{att.file_name}</span>
                              <div className="flex gap-3">
                                <a href={att.file_url} target="_blank" rel="noopener noreferrer" className="text-brand hover:underline text-xs font-semibold uppercase tracking-wider">Preview</a>
                                <button type="button" onClick={() => setRemovedAttachmentIds(p => [...p, att.id])} className="text-red-500 hover:text-red-700 text-xs font-semibold uppercase tracking-wider cursor-pointer">Remove</button>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* New Attachments */}
                  <input
                    type="file"
                    multiple
                    onChange={handleAddNewNoticeFile}
                    className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface text-text file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-brand-light/10 file:text-brand hover:file:bg-brand-light/20 cursor-pointer"
                  />

                  {newNoticeFiles.length > 0 && (
                    <div className="flex flex-col gap-2 mt-2">
                      <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1" style={{ fontFamily: 'var(--font-mono)' }}>New files to upload:</p>
                      {newNoticeFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between border border-border bg-surface p-3.5 rounded-xl shadow-xs gap-3">
                          <span className="text-xs font-bold text-text truncate max-w-[200px] sm:max-w-xs">{file.name}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveNewNoticeFile(idx)}
                            className="text-red-500 hover:text-red-700 text-xs font-semibold px-2 py-1 uppercase tracking-wider cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Bhavan Scope Selector */}
          {item.type !== 'blog' && (
            <div>
              <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                Bhavan Scope {item.type === 'notice' ? '*' : ''}
              </label>
              <select
                value={bhavanScope}
                onChange={(e) => setBhavanScope(e.target.value)}
                className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text"
              >
                {item.type !== 'notice' && (
                  <option value="college-wide">College-wide (All Hostels)</option>
                )}
                {bhavans.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Allows Comments Toggle */}
          {item.type !== 'notice' && (
            <div className="flex items-center justify-between border-t border-border pt-6 mt-2">
              <div>
                <span className="text-xs font-bold text-text mb-0.5 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Allow Comments
                </span>
                <span className="text-[10px] text-text-muted block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Permit students to post comments and discuss this.
                </span>
              </div>
              <input
                type="checkbox"
                checked={allowsComments}
                onChange={(e) => setAllowsComments(e.target.checked)}
                className="w-4 h-4 text-brand focus:ring-brand border-border rounded"
              />
            </div>
          )}

          {/* Buttons Layout */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border mt-4 justify-between items-center w-full">
            <div className="flex gap-4 w-full sm:w-auto">
              <button
                type="button"
                disabled={submitting}
                onClick={handleDelete}
                className="py-3.5 px-6 rounded-xl text-xs font-bold tracking-wider uppercase bg-red-600 hover:bg-red-700 text-white text-center flex-1 sm:flex-none cursor-pointer"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                DELETE
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdate('archived')}
                className="btn-secondary py-3.5 px-6 rounded-xl text-xs font-bold tracking-wider uppercase text-red-500 hover:text-red-700 hover:bg-red-500/5 border border-red-500/20 text-center flex-1 sm:flex-none cursor-pointer"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {submitting ? 'PROCESSING...' : 'ARCHIVE'}
              </button>
            </div>
            <div className="flex gap-4 w-full sm:w-auto sm:flex-1 justify-end">
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdate('draft')}
                className="btn-secondary py-3.5 px-6 rounded-xl text-xs font-bold tracking-wider uppercase flex-1 sm:flex-none sm:min-w-[140px] text-center border border-border bg-surface hover:bg-surface-muted text-text cursor-pointer"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                SAVE AS DRAFT
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => handleUpdate('published')}
                className="btn-primary py-3.5 px-6 rounded-xl text-xs font-bold tracking-wider uppercase flex-1 sm:flex-none sm:min-w-[140px] text-center cursor-pointer"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {submitting ? 'SAVING...' : 'PUBLISH'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
