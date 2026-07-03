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

interface CouncilTerm {
  id: number
  label: string
  start_date: string
  end_date: string
  is_current: boolean
}

interface Member {
  id: number
  council_term_id: number
  enrollment_id: string
  name: string
  image_url: string | null
  title: string
  group_type: 'bhawan_council' | 'hostel_affairs'
  bhavan_id: number | null
  vertical: string | null
  display_order: number
}

interface Bhawan {
  id: number
  name: string
}

export default function AdminMembersPage() {
  const supabase = createClient()
  
  // Data State
  const [terms, setTerms] = useState<CouncilTerm[]>([])
  const [selectedTermId, setSelectedTermId] = useState<number | ''>('')
  const [members, setMembers] = useState<Member[]>([])
  const [bhawans, setBhawans] = useState<Bhawan[]>([])
  const [loading, setLoading] = useState(true)

  // Council Term Form State
  const [termLabel, setTermLabel] = useState('')
  const [termStart, setTermStart] = useState('')
  const [termEnd, setTermEnd] = useState('')
  const [termIsCurrent, setTermIsCurrent] = useState(false)
  const [termSubmitting, setTermSubmitting] = useState(false)

  // Member Form State
  const [memberEnrollment, setMemberEnrollment] = useState('')
  const [memberName, setMemberName] = useState('')
  const [memberImage, setMemberImage] = useState<string | null>(null)
  const [memberTitle, setMemberTitle] = useState('')
  const [memberGroupType, setMemberGroupType] = useState<'bhawan_council' | 'hostel_affairs'>('bhawan_council')
  const [memberBhawanId, setMemberBhawanId] = useState('')
  const [memberVertical, setMemberVertical] = useState('')
  const [memberDisplayOrder, setMemberDisplayOrder] = useState('0')
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null)
  const [fetchingUser, setFetchingUser] = useState(false)
  const [memberSubmitting, setMemberSubmitting] = useState(false)
  const [memberErrorMsg, setMemberErrorMsg] = useState('')

  // Inline Edit State
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDisplayOrder, setEditDisplayOrder] = useState(0)
  const [editVertical, setEditVertical] = useState('')

  const loadData = async () => {
    try {
      // 1. Fetch terms
      const { data: termsData } = await supabase
        .from('council_terms')
        .select('*')
        .order('start_date', { ascending: false })

      if (termsData) {
        setTerms(termsData as CouncilTerm[])
        const current = termsData.find(t => t.is_current)
        if (current) {
          setSelectedTermId(current.id)
        } else if (termsData.length > 0) {
          setSelectedTermId(termsData[0].id)
        }
      }

      // 2. Fetch bhawans
      const { data: bhData } = await supabase
        .from('bhavans')
        .select('id, name')
        .order('name')

      if (bhData) setBhawans(bhData as Bhawan[])
    } catch (err) {
      console.error('Error fetching baseline data:', err)
    } finally {
      setLoading(false)
    }
  }

  const loadMembers = async () => {
    if (!selectedTermId) return

    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('council_term_id', selectedTermId)
        .order('group_type, bhavan_id, display_order')

      if (error) throw error
      setMembers(data as Member[] || [])
    } catch (err) {
      console.error('Error fetching members:', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadMembers()
  }, [selectedTermId])

  // Term Submit
  const handleCreateTerm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!termLabel.trim() || termSubmitting) return

    setTermSubmitting(true)
    try {
      if (termIsCurrent) {
        // Reset all other terms is_current flag
        await supabase
          .from('council_terms')
          .update({ is_current: false })
          .neq('id', -1) // all rows
      }

      const { data, error } = await supabase
        .from('council_terms')
        .insert({
          label: termLabel.trim(),
          start_date: termStart,
          end_date: termEnd,
          is_current: termIsCurrent
        })
        .select()
        .single()

      if (error) throw error

      if (data) {
        setTerms(prev => [data as CouncilTerm, ...prev.map(t => termIsCurrent ? { ...t, is_current: false } : t)])
        if (termIsCurrent || !selectedTermId) {
          setSelectedTermId(data.id)
        }
      }

      setTermLabel('')
      setTermStart('')
      setTermEnd('')
      setTermIsCurrent(false)
    } catch (err) {
      console.error('Error creating term:', err)
    } finally {
      setTermSubmitting(false)
    }
  }

  // Set Term as Current
  const handleSetTermCurrent = async (termId: number) => {
    try {
      // 1. Reset all
      await supabase
        .from('council_terms')
        .update({ is_current: false })
        .neq('id', -1)

      // 2. Set active
      const { error } = await supabase
        .from('council_terms')
        .update({ is_current: true })
        .eq('id', termId)

      if (error) throw error

      setTerms(prev => prev.map(t => t.id === termId ? { ...t, is_current: true } : { ...t, is_current: false }))
      setSelectedTermId(termId)
    } catch (err) {
      console.error('Error setting current term:', err)
    }
  }

  // Fetch Member details from users table (Channel I fallback)
  const handleFetchMember = async () => {
    if (!memberEnrollment.trim()) return

    setFetchingUser(true)
    setMemberErrorMsg('')

    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, image_url')
        .eq('enrollment_id', memberEnrollment.trim().toUpperCase())
        .maybeSingle()

      if (error) throw error

      if (data) {
        setMemberName(data.name)
        setMemberImage(data.image_url)
      } else {
        setMemberErrorMsg('User not found in local system. Please type details manually.')
      }
    } catch (err) {
      console.error('Failed to fetch user:', err)
    } finally {
      setFetchingUser(false)
    }
  }

  // Add Member Submit
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTermId || !memberName.trim() || memberSubmitting) return

    setMemberSubmitting(true)
    setMemberErrorMsg('')

    try {
      let finalImageUrl = memberImage

      // 1. Upload photo if provided
      if (newPhotoFile) {
        const compressed = await compressImage(newPhotoFile)
        const safeName = sanitizeFilename(compressed.name)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('member-photos')
          .upload(`${Date.now()}-${safeName}`, compressed)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('member-photos')
          .getPublicUrl(uploadData.path)

        finalImageUrl = publicUrl
      }

      // 2. Insert member record
      const { error } = await supabase
        .from('members')
        .insert({
          council_term_id: selectedTermId,
          enrollment_id: memberEnrollment.trim().toUpperCase() || 'N/A',
          name: memberName.trim(),
          image_url: finalImageUrl || null,
          title: memberTitle.trim(),
          group_type: memberGroupType,
          bhavan_id: memberGroupType === 'bhawan_council' ? parseInt(memberBhawanId) : null,
          vertical: memberGroupType === 'hostel_affairs' ? (memberVertical.trim() || 'General') : null,
          display_order: parseInt(memberDisplayOrder) || 0
        })

      if (error) throw error

      // Reload
      loadMembers()

      // Reset form
      setMemberEnrollment('')
      setMemberName('')
      setMemberImage(null)
      setMemberTitle('')
      setMemberBhawanId('')
      setMemberVertical('')
      setMemberDisplayOrder('0')
      setNewPhotoFile(null)
    } catch (err: any) {
      console.error('Failed to add member:', err)
      setMemberErrorMsg(err.message || 'Failed to insert member.')
    } finally {
      setMemberSubmitting(false)
    }
  }

  // Delete Member
  const handleDeleteMember = async (memberId: number) => {
    const confirm = window.confirm('Are you sure you want to remove this member?')
    if (!confirm) return

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

      if (error) throw error
      setMembers(prev => prev.filter(m => m.id !== memberId))
    } catch (err) {
      console.error('Failed to delete member:', err)
    }
  }

  // Inline Edit Save
  const handleSaveInlineEdit = async (memberId: number) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({
          title: editTitle.trim(),
          display_order: editDisplayOrder,
          vertical: editVertical.trim() || null
        })
        .eq('id', memberId)

      if (error) throw error

      setMembers(prev => prev.map(m => m.id === memberId 
        ? { ...m, title: editTitle, display_order: editDisplayOrder, vertical: editVertical || null } 
        : m
      ))
      setEditingId(null)
    } catch (err) {
      console.error('Failed to save edit:', err)
    }
  }

  const startEditing = (member: Member) => {
    setEditingId(member.id)
    setEditTitle(member.title)
    setEditDisplayOrder(member.display_order)
    setEditVertical(member.vertical || '')
  }

  // Group members dynamically
  const bhawanCouncil = members.filter(m => m.group_type === 'bhawan_council')
  const hostelAffairs = members.filter(m => m.group_type === 'hostel_affairs')

  // Bhawan mapping
  const getBhawanName = (id: number | null) => {
    if (!id) return ''
    return bhawans.find(b => b.id === id)?.name || `Bhawan ID ${id}`
  }

  // Group Bhawan Council by Bhawan ID
  const bhawanGroups = bhawanCouncil.reduce((acc, member) => {
    const key = member.bhavan_id || 0
    if (!acc[key]) acc[key] = []
    acc[key].push(member)
    return acc
  }, {} as Record<number, Member[]>)

  // Group Hostel Affairs by Vertical
  const verticalGroups = hostelAffairs.reduce((acc, member) => {
    const key = member.vertical || 'General'
    if (!acc[key]) acc[key] = []
    acc[key].push(member)
    return acc
  }, {} as Record<string, Member[]>)

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-brand uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
          Council Members Management
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Maintain active council terms and student members of the Bhawan Councils and Hostel Affairs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Council Terms */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="border border-border bg-surface-raised p-5 rounded-2xl shadow-xs">
            <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
              ➕ Create New Term
            </h3>
            <form onSubmit={handleCreateTerm} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Label / Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026-27"
                  value={termLabel}
                  onChange={(e) => setTermLabel(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-surface text-text"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Start Date</label>
                  <input
                    type="date"
                    value={termStart}
                    onChange={(e) => setTermStart(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-surface text-text"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">End Date</label>
                  <input
                    type="date"
                    value={termEnd}
                    onChange={(e) => setTermEnd(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-surface text-text"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={termIsCurrent}
                  onChange={(e) => setTermIsCurrent(e.target.checked)}
                  className="w-4 h-4 rounded text-brand focus:ring-brand"
                />
                <span className="font-bold text-text">Mark as Current Term</span>
              </div>

              <button
                type="submit"
                disabled={!termLabel.trim() || termSubmitting}
                className="btn-primary py-3 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {termSubmitting ? 'CREATING...' : 'CREATE TERM'}
              </button>
            </form>
          </div>

          {/* List of Terms */}
          <div className="border border-border bg-surface-raised p-5 rounded-2xl shadow-xs">
            <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
              📅 Roster Terms
            </h3>
            {loading ? (
              <p className="text-xs font-bold text-text-muted animate-pulse">Loading terms...</p>
            ) : terms.length === 0 ? (
              <p className="text-xs text-text-muted italic">No terms configured yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {terms.map(term => (
                  <div
                    key={term.id}
                    onClick={() => setSelectedTermId(term.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center
                      ${selectedTermId === term.id
                        ? 'border-brand bg-brand-light/5 shadow-xs'
                        : 'border-border bg-surface hover:bg-surface-muted'
                      }`}
                  >
                    <div>
                      <span className="font-extrabold text-text block">{term.label}</span>
                      <span className="text-[10px] text-text-muted mt-0.5 block">
                        {term.start_date ? new Date(term.start_date).toLocaleDateString() : 'N/A'} - {term.end_date ? new Date(term.end_date).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {term.is_current && (
                        <span className="bg-green-500/10 text-green-600 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                          Active
                        </span>
                      )}
                      {!term.is_current && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSetTermCurrent(term.id)
                          }}
                          className="text-accent hover:text-accent-hover text-[9px] font-bold uppercase tracking-wider"
                        >
                          Make Active
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Members lists */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Add Member Form */}
          <div className="border border-border bg-surface-raised p-6 rounded-2xl shadow-xs">
            <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
              👤 Add Member to Current Term
            </h3>

            {memberErrorMsg && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
                ⚠️ {memberErrorMsg}
              </div>
            )}

            <form onSubmit={handleAddMember} className="flex flex-col gap-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block">Enrollment ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 21114002"
                    value={memberEnrollment}
                    onChange={(e) => setMemberEnrollment(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-surface text-text"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleFetchMember}
                  disabled={!memberEnrollment.trim() || fetchingUser}
                  className="btn-secondary py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer border border-border"
                >
                  {fetchingUser ? 'FETCHING...' : 'FETCH PROFILE'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priyanshu Sharma"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-surface text-text"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Member Title / Post *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sports Secretary"
                    value={memberTitle}
                    onChange={(e) => setMemberTitle(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-surface text-text"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Group Type *</label>
                  <select
                    value={memberGroupType}
                    onChange={(e) => setMemberGroupType(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-border bg-surface text-text"
                  >
                    <option value="bhawan_council">Bhawan Council</option>
                    <option value="hostel_affairs">Hostel Affairs</option>
                  </select>
                </div>
                <div>
                  {memberGroupType === 'bhawan_council' ? (
                    <>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Bhawan Scope *</label>
                      <select
                        required
                        value={memberBhawanId}
                        onChange={(e) => setMemberBhawanId(e.target.value)}
                        className="w-full p-3 rounded-xl border border-border bg-surface text-text"
                      >
                        <option value="">Select Bhawan...</option>
                        {bhawans.map(bh => (
                          <option key={bh.id} value={bh.id}>{bh.name}</option>
                        ))}
                      </select>
                    </>
                  ) : (
                    <>
                      <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Vertical / Division *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Web Development"
                        value={memberVertical}
                        onChange={(e) => setMemberVertical(e.target.value)}
                        className="w-full p-3 rounded-xl border border-border bg-surface text-text"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Display Order</label>
                  <input
                    type="number"
                    value={memberDisplayOrder}
                    onChange={(e) => setMemberDisplayOrder(e.target.value)}
                    className="w-full p-3 rounded-xl border border-border bg-surface text-text"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1 block">Upload New Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) setNewPhotoFile(file)
                    }}
                    className="w-full p-3 rounded-xl border border-border bg-surface text-text cursor-pointer file:border-0 file:bg-brand-light/10 file:text-brand file:font-bold file:rounded-xl file:px-3 file:py-1 file:mr-3"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!selectedTermId || !memberName.trim() || memberSubmitting}
                className="btn-primary py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                {memberSubmitting ? 'ADDING MEMBER...' : 'ADD MEMBER'}
              </button>
            </form>
          </div>

          {/* Members Groups Display */}
          <div className="flex flex-col gap-6">
            {/* BHAWAN COUNCILS */}
            <div>
              <h3 className="text-sm font-extrabold text-brand uppercase tracking-wider mb-4 border-b border-border pb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                🏫 Bhawan Councils
              </h3>

              {Object.keys(bhawanGroups).length === 0 ? (
                <p className="text-xs text-text-muted italic">No Bhawan Council members in this term.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {Object.keys(bhawanGroups).map(bhawanIdStr => {
                    const bhId = parseInt(bhawanIdStr)
                    const name = getBhawanName(bhId)
                    const grpMembers = bhawanGroups[bhId]

                    return (
                      <div key={bhId} className="border border-border bg-surface-raised p-4 rounded-2xl">
                        <h4 className="text-xs font-bold text-text uppercase mb-3 pl-2 border-l-2 border-brand">
                          {name} Council
                        </h4>
                        <div className="flex flex-col gap-2">
                          {grpMembers.map(m => (
                            <div key={m.id} className="flex items-center justify-between border border-border/60 bg-surface p-3 rounded-xl gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                {m.image_url ? (
                                  <img src={m.image_url} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0">
                                    {m.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-text truncate">{m.name}</p>
                                  {editingId === m.id ? (
                                    <div className="flex flex-col gap-1.5 mt-1.5">
                                      <input 
                                        type="text" 
                                        value={editTitle} 
                                        onChange={(e) => setEditTitle(e.target.value)} 
                                        className="p-1 border border-border rounded text-[10px] bg-surface text-text w-full focus:outline-none"
                                        placeholder="Title"
                                      />
                                      <input 
                                        type="number" 
                                        value={editDisplayOrder} 
                                        onChange={(e) => setEditDisplayOrder(parseInt(e.target.value) || 0)} 
                                        className="p-1 border border-border rounded text-[10px] bg-surface text-text w-16 focus:outline-none"
                                        placeholder="Order"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-text-muted mt-0.5 font-medium">{m.title} · Order #{m.display_order}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {editingId === m.id ? (
                                  <>
                                    <button onClick={() => handleSaveInlineEdit(m.id)} className="text-green-600 hover:text-green-800 text-[10px] font-bold uppercase cursor-pointer">Save</button>
                                    <button onClick={() => setEditingId(null)} className="text-text-muted hover:text-text text-[10px] font-bold uppercase cursor-pointer">Cancel</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => startEditing(m)} className="text-accent hover:text-accent-hover text-[10px] font-bold uppercase cursor-pointer">Edit</button>
                                    <button onClick={() => handleDeleteMember(m.id)} className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase cursor-pointer">Remove</button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* HOSTEL AFFAIRS */}
            <div>
              <h3 className="text-sm font-extrabold text-brand uppercase tracking-wider mb-4 border-b border-border pb-2" style={{ fontFamily: 'var(--font-mono)' }}>
                🏛️ Hostel Affairs Team
              </h3>

              {Object.keys(verticalGroups).length === 0 ? (
                <p className="text-xs text-text-muted italic">No Hostel Affairs members in this term.</p>
              ) : (
                <div className="flex flex-col gap-6">
                  {Object.keys(verticalGroups).map(vert => {
                    const grpMembers = verticalGroups[vert]

                    return (
                      <div key={vert} className="border border-border bg-surface-raised p-4 rounded-2xl">
                        <h4 className="text-xs font-bold text-text uppercase mb-3 pl-2 border-l-2 border-brand">
                          {vert} Division
                        </h4>
                        <div className="flex flex-col gap-2">
                          {grpMembers.map(m => (
                            <div key={m.id} className="flex items-center justify-between border border-border/60 bg-surface p-3 rounded-xl gap-4">
                              <div className="flex items-center gap-3 min-w-0">
                                {m.image_url ? (
                                  <img src={m.image_url} alt={m.name} className="w-8 h-8 rounded-full object-cover border border-border shrink-0" />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-brand/10 text-brand text-xs font-bold flex items-center justify-center shrink-0">
                                    {m.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-bold text-text truncate">{m.name}</p>
                                  {editingId === m.id ? (
                                    <div className="flex flex-col gap-1.5 mt-1.5">
                                      <input 
                                        type="text" 
                                        value={editTitle} 
                                        onChange={(e) => setEditTitle(e.target.value)} 
                                        className="p-1 border border-border rounded text-[10px] bg-surface text-text w-full focus:outline-none"
                                        placeholder="Title"
                                      />
                                      <input 
                                        type="text" 
                                        value={editVertical} 
                                        onChange={(e) => setEditVertical(e.target.value)} 
                                        className="p-1 border border-border rounded text-[10px] bg-surface text-text w-full focus:outline-none"
                                        placeholder="Vertical"
                                      />
                                      <input 
                                        type="number" 
                                        value={editDisplayOrder} 
                                        onChange={(e) => setEditDisplayOrder(parseInt(e.target.value) || 0)} 
                                        className="p-1 border border-border rounded text-[10px] bg-surface text-text w-16 focus:outline-none"
                                        placeholder="Order"
                                      />
                                    </div>
                                  ) : (
                                    <p className="text-[10px] text-text-muted mt-0.5 font-medium">{m.title} · Order #{m.display_order}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                {editingId === m.id ? (
                                  <>
                                    <button onClick={() => handleSaveInlineEdit(m.id)} className="text-green-600 hover:text-green-800 text-[10px] font-bold uppercase cursor-pointer">Save</button>
                                    <button onClick={() => setEditingId(null)} className="text-text-muted hover:text-text text-[10px] font-bold uppercase cursor-pointer">Cancel</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => startEditing(m)} className="text-accent hover:text-accent-hover text-[10px] font-bold uppercase cursor-pointer">Edit</button>
                                    <button onClick={() => handleDeleteMember(m.id)} className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase cursor-pointer">Remove</button>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
