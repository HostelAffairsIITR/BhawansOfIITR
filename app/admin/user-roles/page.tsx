'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UserRole {
  id: number
  user_id: string
  role: string
  bhavan_id: number | null
  assigned_by: string | null
  assigned_at: string
  users?: {
    name: string
    enrollment_id: string
    image_url: string | null
  } | null
  bhawans?: {
    name: string
  } | null
}

interface Bhawan {
  id: number
  name: string
}

export default function AdminUserRolesPage() {
  const supabase = createClient()
  const [roles, setRoles] = useState<UserRole[]>([])
  const [bhawans, setBhawans] = useState<Bhawan[]>([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [enrollmentId, setEnrollmentId] = useState('')
  const [selectedRole, setSelectedRole] = useState('manager')
  const [selectedBhawanId, setSelectedBhawanId] = useState('')
  const [submitLoading, setSubmitLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const loadData = async () => {
    try {
      // 1. Fetch user session
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }

      // 2. Fetch user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('*, users!user_roles_user_id_fkey(name, enrollment_id, image_url), bhawans(name)')
        .order('assigned_at', { ascending: false })

      if (rolesError) throw rolesError
      if (rolesData) setRoles(rolesData as UserRole[])

      // 3. Fetch bhawans list
      const { data: bhawansData, error: bhError } = await supabase
        .from('bhavans')
        .select('id, name')
        .order('name')

      if (bhError) throw bhError
      if (bhawansData) setBhawans(bhawansData as Bhawan[])
    } catch (err) {
      console.error('Failed to load user roles data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  // Remove Role
  const handleRemoveRole = async (roleId: number, userId: string, roleName: string) => {
    const confirm = window.confirm('Are you sure you want to remove this user role?')
    if (!confirm) return

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('id', roleId)

      if (error) throw error

      // If they were super_admin, update users table is_super_admin to false
      if (roleName === 'super_admin') {
        await supabase
          .from('users')
          .update({ is_super_admin: false })
          .eq('id', userId)
      }

      setRoles(prev => prev.filter(r => r.id !== roleId))
    } catch (err: any) {
      console.error('Failed to remove role:', err)
      alert(err.message || 'Failed to remove role.')
    }
  }

  // Assign Role Submit
  const handleAssignRole = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!enrollmentId.trim() || submitLoading) return

    setSubmitLoading(true)
    setErrorMsg('')

    try {
      // 1. Find user by enrollment_id
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('enrollment_id', enrollmentId.trim().toUpperCase())
        .maybeSingle()

      if (userError) throw userError
      if (!user) {
        throw new Error(`User with Enrollment ID "${enrollmentId.toUpperCase()}" not found. Make sure they have logged in at least once.`)
      }

      const bhawanId = selectedBhawanId ? parseInt(selectedBhawanId) : null

      // 2. Insert into user_roles
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: user.id,
          role: selectedRole,
          bhavan_id: bhawanId,
          assigned_by: currentUserId
        })

      if (insertError) throw insertError

      // 3. Sync super admin flag on users table if selected
      if (selectedRole === 'super_admin') {
        await supabase
          .from('users')
          .update({ is_super_admin: true })
          .eq('id', user.id)
      }

      // Reload roles list
      const { data: freshRoles } = await supabase
        .from('user_roles')
        .select('*, users!user_roles_user_id_fkey(name, enrollment_id, image_url), bhawans(name)')
        .order('assigned_at', { ascending: false })

      if (freshRoles) {
        setRoles(freshRoles as UserRole[])
      }

      setEnrollmentId('')
      setSelectedBhawanId('')
    } catch (err: any) {
      console.error('Error assigning role:', err)
      setErrorMsg(err.message || 'An error occurred during role assignment.')
    } finally {
      setSubmitLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold text-brand uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
          User Roles Management
        </h2>
        <p className="text-xs text-text-muted mt-1">
          Assign role privileges (Manager / Super Admin) to student enrollment accounts.
        </p>
      </div>

      {/* Assign Role Form */}
      <div className="border border-border bg-surface-raised p-6 rounded-2xl mb-8 shadow-xs">
        <h3 className="text-xs font-extrabold text-text-muted uppercase tracking-wider mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
          ➕ Assign New Role
        </h3>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl text-xs font-semibold mb-6">
            ⚠️ {errorMsg}
          </div>
        )}

        <form onSubmit={handleAssignRole} className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
              Enrollment ID *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 21114002"
              value={enrollmentId}
              onChange={(e) => setEnrollmentId(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-border bg-surface text-text focus:outline-none focus:border-brand"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
              Select Role *
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-border bg-surface text-text"
            >
              <option value="manager">Manager</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2 block" style={{ fontFamily: 'var(--font-mono)' }}>
              Bhawan Scope (Optional)
            </label>
            <select
              value={selectedBhawanId}
              onChange={(e) => setSelectedBhawanId(e.target.value)}
              className="w-full text-xs p-3.5 rounded-xl border border-border bg-surface text-text"
            >
              <option value="">College-wide (All Hostels)</option>
              {bhawans.map(bh => (
                <option key={bh.id} value={bh.id}>{bh.name}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!enrollmentId.trim() || submitLoading}
            className="btn-primary py-3.5 rounded-xl text-xs font-bold tracking-wider uppercase cursor-pointer"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            {submitLoading ? 'ASSIGNING...' : 'ASSIGN PRIVILEGE'}
          </button>
        </form>
      </div>

      {/* User Roles List */}
      {loading ? (
        <p className="text-xs font-bold text-text-muted animate-pulse py-8 text-center uppercase">Loading roles...</p>
      ) : roles.length === 0 ? (
        <p className="text-xs text-text-muted py-8 text-center italic">No roles assigned yet.</p>
      ) : (
        <div className="border border-border bg-surface-raised rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-surface-muted/50 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                <th className="p-4">Name</th>
                <th className="p-4">Enrollment ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Bhawan Scope</th>
                <th className="p-4">Assigned At</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-xs">
              {roles.map(role => {
                const name = role.users?.name || 'Unknown User'
                const enrol = role.users?.enrollment_id || 'N/A'
                const scope = role.bhavan_id ? role.bhawans?.name : 'College-wide'
                const date = new Date(role.assigned_at).toLocaleDateString()

                return (
                  <tr key={role.id} className="hover:bg-surface-muted/30 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {role.users?.image_url ? (
                        <img src={role.users.image_url} alt={name} className="w-7 h-7 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-brand-light/10 text-brand text-[10px] font-extrabold flex items-center justify-center border border-border">
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="font-bold text-text">{name}</span>
                    </td>
                    <td className="p-4 text-text-muted font-mono">{enrol}</td>
                    <td className="p-4">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider
                        ${role.role === 'super_admin' ? 'bg-red-500/10 text-red-500' : 'bg-brand/10 text-brand'}`}
                      >
                        {role.role}
                      </span>
                    </td>
                    <td className="p-4 text-text-muted font-medium">{scope}</td>
                    <td className="p-4 text-text-muted font-medium">{date}</td>
                    <td className="p-4">
                      <button
                        onClick={() => handleRemoveRole(role.id, role.user_id, role.role)}
                        className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
