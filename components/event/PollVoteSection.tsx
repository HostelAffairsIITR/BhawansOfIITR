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

export default function PollVoteSection({
  itemId,
  options,
  initialVotes,
  status
}: {
  itemId: string
  options: Option[]
  initialVotes: Vote[]
  status: string
}) {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [votes, setVotes] = useState<Vote[]>(initialVotes)
  const [hasVoted, setHasVoted] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Sort options by display order
  const sortedOptions = [...options].sort((a, b) => a.display_order - b.display_order)

  useEffect(() => {
    async function getSession() {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      // Check if user has already voted by matching user_id in the votes array
      const localVoted = localStorage.getItem(`voted_poll_${itemId}`) === 'true'
      const dbVoted = user ? votes.some(v => v.user_id === user.id) : false

      if (localVoted || dbVoted) {
        setHasVoted(true)
      }
    }
    getSession()
  }, [votes])

  const totalVotes = votes.length

  const handleVoteSubmit = async () => {
    if (!selectedOption || !user || isSubmitting) return

    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from('poll_votes')
        .insert({
          content_item_id: itemId,
          poll_option_id: selectedOption,
          user_id: user.id
        })

      if (!error) {
        // Optimistically update votes list
        const newVote: Vote = {
          content_item_id: itemId,
          poll_option_id: selectedOption,
          user_id: user.id
        }
        setVotes(prev => [...prev, newVote])
        setHasVoted(true)
        localStorage.setItem(`voted_poll_${itemId}`, 'true')
      } else {
        console.error('Error casting vote:', error.message)
      }
    } catch (err) {
      console.error('Vote failed:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  // If user has voted or the poll is closed, display the percentages and options as static bars
  if (hasVoted || status === 'closed') {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          {sortedOptions.map(opt => {
            const optionVotes = votes.filter(v => v.poll_option_id === opt.id).length
            const pct = totalVotes > 0 ? Math.round((optionVotes / totalVotes) * 100) : 0

            return (
              <div key={opt.id} className="w-full">
                <div className="flex justify-between items-center text-xs font-semibold text-text mb-1">
                  <span>{opt.option_text}</span>
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
        </div>
        <p className="text-xs font-bold text-text-muted mt-2 tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
          Total Votes: {totalVotes.toLocaleString()} {status === 'closed' ? '· POLL CLOSED' : ''}
        </p>
      </div>
    )
  }

  // Otherwise, display voting options
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2.5">
        {sortedOptions.map(opt => (
          <button
            key={opt.id}
            onClick={() => setSelectedOption(opt.id)}
            className={`w-full text-left p-4 rounded-xl border transition-all duration-150 flex items-center gap-3 cursor-pointer
              ${selectedOption === opt.id
                ? 'border-accent bg-accent/5 ring-1 ring-accent'
                : 'border-border bg-surface hover:bg-surface-muted hover:border-border-strong'
              }`}
          >
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0
              ${selectedOption === opt.id ? 'border-accent' : 'border-border'}`}>
              {selectedOption === opt.id && <div className="w-2 h-2 rounded-full bg-accent" />}
            </div>
            <span className="text-xs sm:text-sm font-semibold text-text">{opt.option_text}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {user ? (
          <button
            onClick={handleVoteSubmit}
            disabled={!selectedOption || isSubmitting}
            className={`w-full py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase transition-colors
              ${selectedOption && !isSubmitting
                ? 'btn-primary cursor-pointer'
                : 'bg-surface-muted text-text-muted border border-border cursor-not-allowed'
              }`}
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {isSubmitting ? 'VOTING...' : 'VOTE NOW'}
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              disabled
              className="w-full py-3.5 bg-surface-muted text-text-muted border border-border rounded-xl text-xs font-bold tracking-wider uppercase cursor-not-allowed"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              VOTE NOW
            </button>
            <p className="text-[10px] text-accent text-center font-bold tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
              🔒 Login to vote
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
