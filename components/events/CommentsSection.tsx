'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  body: string
  created_at: string
  user_id: string
  users: {
    name: string
    image_url: string | null
  } | null
}

interface CommentsSectionProps {
  contentItemId: string
  initialComments: any[]
  currentUserId: string | null
}

export default function CommentsSection({
  contentItemId,
  initialComments,
  currentUserId
}: CommentsSectionProps) {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentBody, setCommentBody] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [canDeleteAll, setCanDeleteAll] = useState(false)

  // Relative time helper
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  };

  useEffect(() => {
    async function checkAdminStatus() {
      if (!currentUserId) return

      try {
        // Check super_admin status
        const { data: profile } = await supabase
          .from('users')
          .select('is_super_admin')
          .eq('id', currentUserId)
          .maybeSingle()

        if (profile?.is_super_admin) {
          setCanDeleteAll(true)
          return
        }

        // Check if user has manager or co_manager permission for this item
        const { data: perm } = await supabase
          .from('permissions')
          .select('role')
          .eq('content_item_id', contentItemId)
          .eq('user_id', currentUserId)
          .in('role', ['manager', 'co_manager'])
          .maybeSingle()

        if (perm) {
          setCanDeleteAll(true)
        }
      } catch (err) {
        console.error('Error fetching permission for comment deleting:', err)
      }
    }

    checkAdminStatus()
  }, [currentUserId, contentItemId])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim() || !currentUserId || isSubmitting) return

    setIsSubmitting(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content_item_id: contentItemId,
          user_id: currentUserId,
          body: commentBody.trim()
        })
        .select('*, users(name, image_url)')
        .single()

      if (error) throw error

      if (data) {
        setComments(prev => [...prev, data as Comment])
        setCommentBody('')
      }
    } catch (err: any) {
      console.error('Failed to submit comment:', err)
      setErrorMsg(err.message || 'Failed to submit comment. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCommentDelete = async (commentId: string) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this comment?')
    if (!confirmDelete) return

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)

      if (error) throw error

      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (err: any) {
      console.error('Failed to delete comment:', err)
      alert(err.message || 'Failed to delete comment.')
    }
  }

  return (
    <div className="border-t border-border pt-10 mt-10">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
        COMMENTS ({comments.length})
      </h3>

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Comments List */}
      <div className="flex flex-col gap-5 mb-8">
        {comments.length === 0 ? (
          <p className="text-text-muted text-xs italic" style={{ fontFamily: 'var(--font-sans)' }}>
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map(c => {
            const authorName = c.users?.name || 'Anonymous User'
            const avatarLetter = authorName.charAt(0).toUpperCase()
            const timeStr = formatRelativeTime(c.created_at)
            const canDelete = c.user_id === currentUserId || canDeleteAll

            return (
              <div key={c.id} className="flex gap-4 border border-border bg-surface-raised p-4 rounded-2xl shadow-xs">
                {/* Avatar */}
                {c.users?.image_url ? (
                  <img 
                    src={c.users.image_url} 
                    alt={authorName} 
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-border"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-light/10 text-brand text-xs font-extrabold shrink-0 border border-border">
                    {avatarLetter}
                  </div>
                )}

                {/* Comment Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1.5">
                      <span className="text-xs font-extrabold text-text">{authorName}</span>
                      <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>{timeStr}</span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleCommentDelete(c.id)}
                        className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase tracking-wider cursor-pointer"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-text leading-relaxed whitespace-pre-wrap">{c.body}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Comment Input */}
      <div className="border border-border bg-surface-raised p-5 rounded-2xl shadow-xs">
        {currentUserId ? (
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
            <textarea
              value={commentBody}
              onChange={(e) => setCommentBody(e.target.value)}
              placeholder="Add your comment..."
              rows={3}
              required
              className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none text-text"
            />
            <button
              type="submit"
              disabled={!commentBody.trim() || isSubmitting}
              className={`w-fit self-end py-2.5 px-6 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors
                ${commentBody.trim() && !isSubmitting
                  ? 'btn-primary cursor-pointer'
                  : 'bg-surface-muted text-text-muted border border-border cursor-not-allowed'
                }`}
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              {isSubmitting ? 'SUBMITTING...' : 'ADD COMMENT'}
            </button>
          </form>
        ) : (
          <div className="text-center py-4 flex flex-col items-center">
            <p className="text-text-muted text-xs font-medium mb-3" style={{ fontFamily: 'var(--font-sans)' }}>
              🔒 Please login to join the discussion and post comments.
            </p>
            <button 
              disabled 
              className="btn-primary py-2 px-6 text-xs tracking-wider opacity-50 cursor-not-allowed"
            >
              ADD COMMENT
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
