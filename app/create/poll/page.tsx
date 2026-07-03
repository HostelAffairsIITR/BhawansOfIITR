'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/client'

export default function CreatePollPage() {
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [bhawans, setBhawans] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isBhawanScopeRestricted, setIsBhawanScopeRestricted] = useState(false)
  const [allowedBhawanIds, setAllowedBhawanIds] = useState<number[] | null>(null)

  // Form states
  const [title, setTitle] = useState('')
  const [pollOptions, setPollOptions] = useState<string[]>(['', ''])
  const [bhawanScope, setBhawanScope] = useState<string>('college-wide')
  const [allowsComments, setAllowsComments] = useState(true)

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
        // Fetch user profile
        const { data: profile } = await supabase
          .from('users')
          .select('is_super_admin')
          .eq('id', currentUser.id)
          .maybeSingle()

        // Fetch roles
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

        // Fetch bhawans
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

  const handleAddOption = () => {
    if (pollOptions.length >= 8) return
    setPollOptions([...pollOptions, ''])
  }

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length <= 2) return
    const updated = pollOptions.filter((_, i) => i !== index)
    setPollOptions(updated)
  }

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...pollOptions]
    updated[index] = val
    setPollOptions(updated)
  }

  const handleSubmit = async (status: 'draft' | 'published') => {
    if (!title.trim()) {
      setErrorMsg('Please enter a poll title.')
      return
    }

    const trimmedOptions = pollOptions.map(o => o.trim()).filter(Boolean)
    if (trimmedOptions.length < 2) {
      setErrorMsg('Please specify at least 2 non-empty options.')
      return
    }

    setSubmitting(true)
    setErrorMsg('')

    const selectedScope = bhawanScope === 'college-wide' ? null : parseInt(bhawanScope)

    try {
      // 1. Insert content_item
      const { data: item, error: itemError } = await supabase
        .from('content_items')
        .insert({
          type: 'poll',
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

      // 2. Insert poll_options
      const { error: optionsError } = await supabase
        .from('poll_options')
        .insert(
          trimmedOptions.map((text, i) => ({
            content_item_id: item.id,
            option_text: text,
            display_order: i
          }))
        )

      if (optionsError) throw optionsError

      // 3. Insert permissions
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
      console.error('Error creating poll:', err)
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
              MAKE NEW POLL
            </h1>
            <p className="text-xs text-text-muted mb-8" style={{ fontFamily: 'var(--font-sans)' }}>
              Create an interactive voting poll for students.
            </p>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
                ⚠️ {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-6">
              {/* Poll Title */}
              <div>
                <label className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-sans)' }}>
                  Poll Question / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Should we install a new vending machine in the lobby?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm p-4 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text"
                />
              </div>

              {/* Poll Options */}
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
                        placeholder={`Option ${index + 1}`}
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 text-xs sm:text-sm p-3.5 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-text"
                      />
                      {pollOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="p-3 text-red-500 hover:bg-red-500/5 rounded-xl border border-transparent hover:border-red-500/10 transition-colors"
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
                <p className="text-[10px] text-text-muted mt-1.5" style={{ fontFamily: 'var(--font-sans)' }}>
                  Restrict this poll to a specific Bhawan, or show it to all residents college-wide.
                </p>
              </div>

              {/* Allow Comments */}
              <div className="flex items-center justify-between border-t border-border pt-6 mt-2">
                <div>
                  <span className="text-xs font-bold text-text mb-0.5 block" style={{ fontFamily: 'var(--font-sans)' }}>
                    Allow Comments
                  </span>
                  <span className="text-[10px] text-text-muted block" style={{ fontFamily: 'var(--font-sans)' }}>
                    Permit students to post comments and discuss this poll topic.
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
                  {submitting ? 'CREATING...' : 'PUBLISH POLL'}
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
