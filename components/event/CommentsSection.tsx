'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Comment {
  id: string
  content_item_id: string
  user_id: string
  body: string
  created_at: string
  users?: {
    name: string
    image_url?: string
  } | null
}

export default function CommentsSection({
  itemId,
  initialComments
}: {
  itemId: string
  initialComments: Comment[]
}) {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>(initialComments)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getSession()
  }, [])

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !user || isSubmitting) return

    setIsSubmitting(true)
    try {
      const { data, error } = await supabase
        .from('comments')
        .insert({
          content_item_id: itemId,
          user_id: user.id,
          body: commentText.trim()
        })
        .select('*, users(name, image_url)')
        .single()

      if (!error && data) {
        setComments(prev => [...prev, data])
        setCommentText('')
      } else if (error) {
        console.error('Error inserting comment:', error.message)
        // Fallback: manually fetch comments list if single select fails due to RLS/joins
        const { data: freshComments } = await supabase
          .from('comments')
          .select('*, users(name, image_url)')
          .eq('content_item_id', itemId)
          .order('created_at', { ascending: true })
        if (freshComments) {
          setComments(freshComments)
          setCommentText('')
        }
      }
    } catch (err) {
      console.error('Failed to submit comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border-t border-border pt-10 mt-10">
      <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-6" style={{ fontFamily: 'var(--font-mono)' }}>
        COMMENTS ({comments.length})
      </h3>

      {/* Comments List */}
      <div className="flex flex-col gap-5 mb-8">
        {comments.length === 0 ? (
          <p className="text-text-muted text-xs italic" style={{ fontFamily: 'var(--font-sans)' }}>
            No comments yet. Be the first to share your thoughts!
          </p>
        ) : (
          comments.map(c => {
            const author = c.users?.name || 'Anonymous User'
            const avatarLetter = author.charAt(0).toUpperCase()
            const dateStr = new Date(c.created_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })

            return (
              <div key={c.id} className="flex gap-4 border border-border bg-surface-raised p-4 rounded-2xl shadow-xs">
                {/* Avatar */}
                {c.users?.image_url ? (
                  <img 
                    src={c.users.image_url} 
                    alt={author} 
                    className="w-9 h-9 rounded-full object-cover shrink-0 border border-border"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center bg-brand-light/10 text-brand text-xs font-extrabold shrink-0 border border-border">
                    {avatarLetter}
                  </div>
                )}

                {/* Comment Body */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-1.5">
                    <span className="text-xs font-extrabold text-text">{author}</span>
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>{dateStr}</span>
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
        {user ? (
          <form onSubmit={handleCommentSubmit} className="flex flex-col gap-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Add your comment..."
              rows={3}
              required
              className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none text-text"
            />
            <button
              type="submit"
              disabled={!commentText.trim() || isSubmitting}
              className={`w-fit self-end py-2.5 px-6 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors
                ${commentText.trim() && !isSubmitting
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
