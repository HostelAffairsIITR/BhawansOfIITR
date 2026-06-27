'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Option {
  id: string
  content_item_id: string
  option_text: string
  display_order: number
}

interface Vote {
  poll_option_id: string
  content_item_id: string
  user_id?: string
}

export default function PollVoting({
  itemId,
  options,
  initialVotes,
  currentUserId
}: {
  itemId: string
  options: Option[]
  initialVotes: Vote[]
  currentUserId: string | null
}) {
  const supabase = createClient()
  const [votes, setVotes] = useState<Vote[]>(initialVotes)
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkingVote, setCheckingVote] = useState(true)

  // Sort options by display order
  const sortedOptions = [...options].sort((a, b) => a.display_order - b.display_order)

  useEffect(() => {
    async function checkExistingVote() {
      if (!currentUserId) {
        setCheckingVote(false)
        return
      }

      try {
        const { data: existingVote } = await supabase
          .from('poll_votes')
          .select('poll_option_id')
          .eq('content_item_id', itemId)
          .eq('user_id', currentUserId)
          .maybeSingle()

        if (existingVote) {
          setVotedOptionId(existingVote.poll_option_id)
        }
      } catch (err) {
        console.error('Error fetching existing vote:', err)
      } finally {
        setCheckingVote(false)
      }
    }
    checkExistingVote()
  }, [currentUserId, itemId])

  const totalVotes = votes.length

  const handleVote = async (optionId: string) => {
    if (!currentUserId || isSubmitting) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          content_item_id: itemId,
          poll_option_id: optionId,
          user_id: currentUserId
        })

      if (!error) {
        const newVote: Vote = {
          content_item_id: itemId,
          poll_option_id: optionId,
          user_id: currentUserId
        }
        setVotes(prev => [...prev, newVote])
        setVotedOptionId(optionId)
      } else {
        console.error('Error inserting vote:', error.message)
      }
    } catch (err) {
      console.error('Failed to vote:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (checkingVote) {
    return (
      <div className="py-4 text-center">
        <p className="text-xs font-bold text-text-muted animate-pulse">CHECKING VOTE STATUS...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {votedOptionId ? (
        // Voted View (show percentage bars)
        <div className="flex flex-col gap-3">
          {sortedOptions.map(opt => {
            const optionVotes = votes.filter(v => v.poll_option_id === opt.id).length
            const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0
            const isUserVote = votedOptionId === opt.id

            return (
              <div key={opt.id} className="w-full">
                <div className="flex justify-between items-center text-xs font-semibold text-text mb-1">
                  <span className="flex items-center gap-1.5">
                    {opt.option_text}
                    {isUserVote && (
                      <span className="bg-accent/15 text-accent text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        You Voted
                      </span>
                    )}
                  </span>
                  <span className="text-text-muted">{optionVotes} votes ({pct}%)</span>
                </div>
                <div className="w-full h-4 rounded-lg bg-surface-muted relative overflow-hidden">
                  <div 
                    className="absolute inset-y-0 left-0 bg-accent/80 rounded-lg transition-all duration-700" 
                    style={{ width: `${pct}%` }} 
                  />
                </div>
              </div>
            )
          })}
          <p className="text-xs font-bold text-text-muted mt-2 tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
            Total Votes: {totalVotes.toLocaleString()}
          </p>
        </div>
      ) : (
        // Unvoted / Not Logged In View
        <div className="flex flex-col gap-3">
          {sortedOptions.map(opt => (
            <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-muted hover:border-border-strong transition-all duration-150 gap-4">
              <span className="text-xs sm:text-sm font-semibold text-text">{opt.option_text}</span>
              {currentUserId ? (
                <button
                  onClick={() => handleVote(opt.id)}
                  disabled={isSubmitting}
                  className="btn-primary py-2 px-4 rounded-lg text-xs font-bold tracking-wider uppercase cursor-pointer shrink-0"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {isSubmitting ? 'VOTING...' : 'VOTE'}
                </button>
              ) : null}
            </div>
          ))}
          {!currentUserId && (
            <p className="text-[10px] text-accent text-center font-bold tracking-wider uppercase mt-2" style={{ fontFamily: 'var(--font-mono)' }}>
              🔒 Login to vote
            </p>
          )}
        </div>
      )}
    </div>
  )
}
