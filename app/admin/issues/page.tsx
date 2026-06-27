'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface FlaggedIssue {
  id: number
  user_id: string
  content_item_id: string | null
  issue_type: string
  detected_at: string
  resolved: boolean
  users?: {
    name: string
    enrollment_id: string
  } | null
}

interface AccessDetails {
  userName: string
  enrollmentId: string
  roles: any[]
  permissions: any[]
}

export default function AdminIssuesPage() {
  const supabase = createClient()

  // State
  const [issues, setIssues] = useState<FlaggedIssue[]>([])
  const [loading, setLoading] = useState(true)
  const [showResolved, setShowResolved] = useState(false)

  // Modal State
  const [selectedIssue, setSelectedIssue] = useState<FlaggedIssue | null>(null)
  const [accessDetails, setAccessDetails] = useState<AccessDetails | null>(null)
  const [loadingAccess, setLoadingAccess] = useState(false)

  const loadIssues = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('flagged_issues')
        .select('*, users(name, enrollment_id)')
        .order('detected_at', { ascending: false })

      if (!showResolved) {
        query = query.eq('resolved', false)
      }

      const { data, error } = await query
      if (error) throw error
      setIssues(data as FlaggedIssue[] || [])
    } catch (err) {
      console.error('Failed to load flagged issues:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadIssues()
  }, [showResolved])

  // View Access
  const handleViewAccess = async (issue: FlaggedIssue) => {
    setSelectedIssue(issue)
    setLoadingAccess(true)
    setAccessDetails(null)

    const uName = issue.users?.name || 'Unknown'
    const enrol = issue.users?.enrollment_id || 'N/A'

    try {
      const [rolesRes, permsRes] = await Promise.all([
        supabase
          .from('user_roles')
          .select('*, bhavans(name)')
          .eq('user_id', issue.user_id),
        supabase
          .from('permissions')
          .select('*, content_items(title, type)')
          .eq('user_id', issue.user_id)
      ])

      setAccessDetails({
        userName: uName,
        enrollmentId: enrol,
        roles: rolesRes.data || [],
        permissions: permsRes.data || []
      })
    } catch (err) {
      console.error('Failed to fetch access details:', err)
    } finally {
      setLoadingAccess(false)
    }
  }

  // Revoke All Access
  const handleRevokeAllAccess = async (issue: FlaggedIssue) => {
    const confirm = window.confirm(`Are you sure you want to revoke ALL roles and permissions for user ${issue.users?.name || 'Unknown'}? This will also mark the issue as resolved.`)
    if (!confirm) return

    try {
      // 1. Delete all permissions rows
      await supabase
        .from('permissions')
        .delete()
        .eq('user_id', issue.user_id)

      // 2. Delete all user_roles rows
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', issue.user_id)

      // 3. Mark all issues for this user as resolved
      const { error } = await supabase
        .from('flagged_issues')
        .update({ resolved: true })
        .eq('user_id', issue.user_id)

      if (error) throw error

      // Reload
      loadIssues()
      setSelectedIssue(null)
      setAccessDetails(null)
    } catch (err: any) {
      console.error('Revocation failed:', err)
      alert(err.message || 'Revocation failed.')
    }
  }

  // Mark Resolved Only
  const handleMarkResolved = async (issueId: number) => {
    try {
      const { error } = await supabase
        .from('flagged_issues')
        .update({ resolved: true })
        .eq('id', issueId)

      if (error) throw error

      setIssues(prev => prev.filter(i => i.id !== issueId))
    } catch (err) {
      console.error('Failed to mark resolved:', err)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-extrabold text-brand uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            Flagged Security Issues
          </h2>
          <p className="text-xs text-text-muted mt-1">
            Audit flagged incidents and immediately revoke privileges for compromised accounts.
          </p>
        </div>
        <button
          onClick={() => setShowResolved(!showResolved)}
          className="btn-secondary py-2.5 px-5 rounded-xl border border-border text-xs font-bold uppercase tracking-wider cursor-pointer"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          {showResolved ? 'Hide Resolved' : 'Show Resolved'}
        </button>
      </div>

      {/* Issues Table */}
      {loading ? (
        <p className="text-xs font-bold text-text-muted animate-pulse py-8 text-center uppercase">Loading issues...</p>
      ) : issues.length === 0 ? (
        <p className="text-xs text-text-muted py-8 text-center italic">No flagged security issues found.</p>
      ) : (
        <div className="border border-border bg-surface-raised rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                <th className="p-4">User Name</th>
                <th className="p-4">Enrollment ID</th>
                <th className="p-4">Issue Type</th>
                <th className="p-4">Detected At</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {issues.map(issue => {
                const name = issue.users?.name || 'Unknown'
                const enrol = issue.users?.enrollment_id || 'N/A'
                const date = new Date(issue.detected_at).toLocaleString()

                return (
                  <tr key={issue.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="p-4 font-bold text-text">{name}</td>
                    <td className="p-4 font-mono text-text-muted">{enrol}</td>
                    <td className="p-4">
                      <span className="bg-red-500/10 text-red-500 text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                        {issue.issue_type}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted font-medium">{date}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider
                        ${issue.resolved ? 'bg-green-500/10 text-green-600' : 'bg-yellow-500/10 text-yellow-600'}`}
                      >
                        {issue.resolved ? 'Resolved' : 'Pending Action'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleViewAccess(issue)}
                          className="text-accent hover:text-accent-hover font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                        >
                          View Access
                        </button>
                        {!issue.resolved && (
                          <>
                            <button
                              onClick={() => handleRevokeAllAccess(issue)}
                              className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                            >
                              Revoke All Access
                            </button>
                            <button
                              onClick={() => handleMarkResolved(issue.id)}
                              className="text-text-muted hover:text-text font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                            >
                              Mark Resolved
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal - View Access */}
      {selectedIssue && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-surface-raised border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl flex flex-col max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-base font-extrabold text-brand uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  User Permissions Audit
                </h3>
                <p className="text-[10px] font-bold text-text-muted uppercase mt-1 tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>
                  👤 {accessDetails?.userName || 'Loading...'} ({accessDetails?.enrollmentId || 'N/A'})
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedIssue(null)
                  setAccessDetails(null)
                }}
                className="text-text-muted hover:text-text font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {loadingAccess ? (
              <p className="text-xs font-bold text-text-muted animate-pulse py-8 text-center uppercase">Auditing permissions...</p>
            ) : accessDetails ? (
              <div className="flex flex-col gap-6 text-xs">
                {/* Global & Bhavan Roles */}
                <div>
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 border-b border-border pb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    🏢 Global & Bhavan Roles
                  </h4>
                  {accessDetails.roles.length === 0 ? (
                    <p className="text-xs text-text-muted/60 italic">No assigned global user roles.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {accessDetails.roles.map(role => (
                        <div key={role.id} className="border border-border p-2.5 rounded-xl bg-surface flex justify-between items-center">
                          <span className="font-bold text-brand uppercase tracking-wider text-[10px]">{role.role}</span>
                          <span className="text-[10px] text-text-muted font-medium">Scope: {role.bhavan_id ? role.bhavans?.name : 'College-wide'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Specific Event Permissions */}
                <div>
                  <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 border-b border-border pb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                    📝 Event Manager Assignments
                  </h4>
                  {accessDetails.permissions.length === 0 ? (
                    <p className="text-xs text-text-muted/60 italic">No explicit event permissions.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {accessDetails.permissions.map(perm => (
                        <div key={perm.id} className="border border-border p-2.5 rounded-xl bg-surface">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-text truncate max-w-[200px]">{perm.content_items?.title || 'Unknown Event'}</span>
                            <span className="bg-brand/10 text-brand text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">{perm.role}</span>
                          </div>
                          <span className="text-[8px] text-text-muted font-bold uppercase tracking-wider" style={{ fontFamily: 'var(--font-mono)' }}>Type: {perm.content_items?.type}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Immediate Revocation Controls */}
                {!selectedIssue.resolved && (
                  <div className="border-t border-border pt-4 mt-2 flex justify-end gap-3">
                    <button
                      onClick={() => handleRevokeAllAccess(selectedIssue)}
                      className="btn-primary bg-red-600 hover:bg-red-700 py-2.5 px-5 rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer"
                    >
                      ⚠️ Revoke All Access
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}
