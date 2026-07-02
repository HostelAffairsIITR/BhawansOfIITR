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
  currentUserId,
  bhavanRestrictionMessage
}: {
  itemId: string
  options: Option[]
  initialVotes: Vote[]
  currentUserId: string | null
  bhavanRestrictionMessage?: string | null
}) {
  const supabase = createClient()
  const [results, setResults] = useState<{ option_id: string | number; vote_count: number }[]>(() => {
    const initialMap: Record<string, number> = {}
    options.forEach(o => {
      initialMap[String(o.id)] = 0
    })
    initialVotes.forEach(v => {
      const count = (v as any).vote_count !== undefined ? Number((v as any).vote_count) : 1
      const optionIdStr = String(v.poll_option_id)
      initialMap[optionIdStr] = (initialMap[optionIdStr] || 0) + count
    })
    return Object.entries(initialMap).map(([option_id, vote_count]) => ({
      option_id,
      vote_count
    }))
  })
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [checkingVote, setCheckingVote] = useState(true)

  // Sort options by display order
  const sortedOptions = [...options].sort((a, b) => a.display_order - b.display_order)

  const fetchResults = async () => {
    try {
      const { data, error } = await supabase.rpc('get_poll_results', { poll_id: itemId })
      if (!error && data) {
        setResults(data)
      } else {
        console.error('Error fetching poll results via RPC:', error)
      }
    } catch (err) {
      console.error('Failed to fetch poll results:', err)
    }
  }

  useEffect(() => {
    async function checkExistingVote() {
      // Fetch fresh results from RPC (needed for guests/guests-fallback due to RLS)
      await fetchResults()

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

  const totalVotes = results.reduce((sum, r) => sum + Number(r.vote_count), 0)

  const handleVote = async (optionId: string) => {
    if (!currentUserId || isSubmitting || bhavanRestrictionMessage) return

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
        setVotedOptionId(optionId)
        await fetchResults()
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
      {(votedOptionId || !currentUserId || bhavanRestrictionMessage) ? (
        // Voted / Results View (show percentage bars)
        <div className="flex flex-col gap-3">
          {sortedOptions.map(opt => {
            const resultItem = results.find(r => String(r.option_id) === String(opt.id))
            const optionVotes = resultItem ? Number(resultItem.vote_count) : 0
            const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0
            const isUserVote = votedOptionId === opt.id

            return (
              <div key={opt.id} className="w-full">
                <div className="flex justify-between items-center text-xs font-semibold text-text mb-1">
                  <span className="flex items-center gap-1.5 text-left">
                    {opt.option_text}
                    {isUserVote && (
                      <span className="bg-accent/15 text-accent text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        You Voted
                      </span>
                    )}
                  </span>
                  <span className="text-text-muted shrink-0 ml-2">{optionVotes} votes ({pct}%)</span>
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
          <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
            <p className="text-xs font-bold text-text-muted tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              Total Votes: {totalVotes.toLocaleString()}
            </p>
            {bhavanRestrictionMessage ? (
              <p className="text-[10px] text-red-500 font-bold tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                ⚠️ {bhavanRestrictionMessage}
              </p>
            ) : !currentUserId && (
              <p className="text-[10px] text-accent font-bold tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                🔒 Login to vote
              </p>
            )}
          </div>
        </div>
      ) : (
        // Logged In but Unvoted View
        <div className="flex flex-col gap-3">
          {sortedOptions.map(opt => (
            <div key={opt.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface hover:bg-surface-muted hover:border-border-strong transition-all duration-150 gap-4">
              <span className="text-xs sm:text-sm font-semibold text-text text-left">{opt.option_text}</span>
              <button
                onClick={() => handleVote(opt.id)}
                disabled={isSubmitting || !currentUserId}
                className="btn-primary py-2 px-4 rounded-lg text-xs font-bold tracking-wider uppercase cursor-pointer shrink-0"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {isSubmitting ? 'VOTING...' : 'VOTE'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
