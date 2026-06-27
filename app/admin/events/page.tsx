'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

interface ContentItem {
  id: string
  type: 'poll' | 'blog' | 'announcement' | 'notice'
  title: string
  status: 'draft' | 'published' | 'archived' | 'deleted'
  bhavan_scope: number | null
  priority: number
  created_at: string
  bhavans?: {
    name: string
  } | null
  permissions?: {
    user_id: string
    role: string
    users?: {
      name: string
    } | null
  }[]
}

interface AuditLog {
  id: string
  content_item_id: string
  title_snapshot: string
  type_snapshot: string
  actor_id: string
  action: string
  created_at: string
  users?: {
    name: string
  } | null
}

export default function AdminEventsPage() {
  const supabase = createClient()
  const [items, setItems] = useState<ContentItem[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  // Drawer
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  // Load items
  const loadItems = async () => {
    try {
      const { data, error } = await supabase
        .from('content_items')
        .select('*, bhavans(name), permissions(user_id, role, users(name))')
        .order('created_at', { ascending: false })

      if (error) throw error
      if (data) setItems(data as ContentItem[])
    } catch (err) {
      console.error('Error fetching admin content:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [])

  // Priority Update
  const handlePriorityBlur = async (id: string, newPriority: number) => {
    try {
      const { error } = await supabase
        .from('content_items')
        .update({ priority: newPriority })
        .eq('id', id)

      if (error) throw error

      setItems(prev => prev.map(item => item.id === id ? { ...item, priority: newPriority } : item))
    } catch (err) {
      console.error('Failed to update priority:', err)
      alert('Failed to update priority.')
    }
  }

  // Archive Item
  const handleArchive = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to archive this event?')
    if (!confirm) return

    try {
      const { error } = await supabase
        .from('content_items')
        .update({ status: 'archived' })
        .eq('id', id)

      if (error) throw error
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'archived' } : item))
    } catch (err) {
      console.error('Failed to archive:', err)
    }
  }

  // Delete Item (Soft Delete)
  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to delete this event? This will mark it as deleted.')
    if (!confirm) return

    try {
      const { error } = await supabase
        .from('content_items')
        .update({ status: 'deleted' })
        .eq('id', id)

      if (error) throw error
      setItems(prev => prev.map(item => item.id === id ? { ...item, status: 'deleted' } : item))
    } catch (err) {
      console.error('Failed to delete:', err)
    }
  }

  // Load audit logs and view panel
  const handleRowClick = async (item: ContentItem) => {
    setSelectedItem(item)
    setLoadingLogs(true)
    try {
      const { data, error } = await supabase
        .from('audit_log')
        .select('*, users(name)')
        .eq('content_item_id', item.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setAuditLogs(data || [])
    } catch (err) {
      console.error('Failed to load logs:', err)
    } finally {
      setLoadingLogs(false)
    }
  }

  // Remove permissions
  const handleRemovePermission = async (userId: string) => {
    if (!selectedItem) return
    const confirm = window.confirm('Are you sure you want to remove this manager/member?')
    if (!confirm) return

    try {
      const { error } = await supabase
        .from('permissions')
        .delete()
        .eq('content_item_id', selectedItem.id)
        .eq('user_id', userId)

      if (error) throw error

      // Update local state
      const updatedPermissions = selectedItem.permissions?.filter(p => p.user_id !== userId) || []
      const updatedItem = { ...selectedItem, permissions: updatedPermissions }
      setSelectedItem(updatedItem)
      setItems(prev => prev.map(item => item.id === selectedItem.id ? updatedItem : item))
    } catch (err) {
      console.error('Failed to remove permission:', err)
    }
  }

  // Filters application
  const filtered = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'All' ? true : item.type === typeFilter.toLowerCase()
    const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter.toLowerCase()
    return matchesSearch && matchesType && matchesStatus
  })

  return (
    <div className="flex gap-6 relative">
      <div className="flex-1">
        {/* Header Block */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-brand uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
              Events Management
            </h2>
            <p className="text-xs text-text-muted mt-1">
              Supervise student activities, polls, blogs, notices, and priorities.
            </p>
          </div>

          {/* New Content Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="btn-primary py-3 px-5 rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 cursor-pointer"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <span>+ New Content</span>
              <span>▼</span>
            </button>
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-surface-raised border border-border rounded-xl shadow-md py-2 z-50">
                <Link href="/create/poll" className="block px-4 py-2 text-xs font-bold text-text hover:bg-surface-muted uppercase">Poll</Link>
                <Link href="/create/blog" className="block px-4 py-2 text-xs font-bold text-text hover:bg-surface-muted uppercase">Blog</Link>
                <Link href="/create/announcement" className="block px-4 py-2 text-xs font-bold text-text hover:bg-surface-muted uppercase">Announcement</Link>
                <Link href="/create/notice" className="block px-4 py-2 text-xs font-bold text-text hover:bg-surface-muted uppercase">Notice</Link>
              </div>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 border border-border bg-surface-raised p-4 rounded-2xl">
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-xs sm:text-sm p-3 rounded-xl border border-border bg-surface focus:outline-none focus:border-accent text-text"
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs sm:text-sm p-3 rounded-xl border border-border bg-surface text-text"
          >
            <option value="All">All Types</option>
            <option value="Poll">Polls</option>
            <option value="Blog">Blogs</option>
            <option value="Announcement">Announcements</option>
            <option value="Notice">Notices</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs sm:text-sm p-3 rounded-xl border border-border bg-surface text-text"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Published">Published</option>
            <option value="Archived">Archived</option>
            <option value="Deleted">Deleted</option>
          </select>
        </div>

        {/* Content Table */}
        {loading ? (
          <p className="text-xs font-bold text-text-muted animate-pulse py-8 text-center uppercase">Loading events...</p>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-text-muted py-8 text-center italic">No content items matching filters found.</p>
        ) : (
          <div className="border border-border bg-surface-raised rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-surface-muted/50 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                  <th className="p-4">Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Scope</th>
                  <th className="p-4">Managers</th>
                  <th className="p-4 w-20">Priority</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filtered.map(item => {
                  const scopeLabel = item.bhavan_scope ? item.bhavans?.name : 'College-wide'
                  const managers = item.permissions?.map(p => p.users?.name).filter(Boolean).join(', ') || 'None'

                  return (
                    <tr key={item.id} className="hover:bg-surface-muted/30 transition-colors text-xs">
                      <td className="p-4">
                        <button
                          onClick={() => handleRowClick(item)}
                          className="font-bold text-text hover:text-brand text-left focus:outline-none cursor-pointer"
                        >
                          {item.title}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="bg-brand/10 text-brand text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                          {item.type}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider
                          ${item.status === 'published' ? 'bg-green-500/10 text-green-600' :
                            item.status === 'draft' ? 'bg-yellow-500/10 text-yellow-600' :
                            item.status === 'archived' ? 'bg-gray-500/10 text-gray-500' :
                            'bg-red-500/10 text-red-500'}`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="p-4 text-text-muted font-medium">{scopeLabel}</td>
                      <td className="p-4 text-text-muted max-w-[120px] truncate" title={managers}>{managers}</td>
                      <td className="p-4">
                        <input
                          type="number"
                          defaultValue={item.priority}
                          onBlur={(e) => handlePriorityBlur(item.id, parseInt(e.target.value) || 0)}
                          className="w-12 text-center p-1 rounded-md border border-border bg-surface text-xs font-semibold focus:outline-none focus:border-brand"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Link href={`/edit/${item.id}`} className="text-accent hover:text-accent-hover font-bold uppercase text-[10px] tracking-wider">
                            Edit
                          </Link>
                          {item.status !== 'archived' && (
                            <button onClick={() => handleArchive(item.id)} className="text-text-muted hover:text-text font-bold uppercase text-[10px] tracking-wider cursor-pointer">
                              Archive
                            </button>
                          )}
                          {item.status !== 'deleted' && (
                            <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 font-bold uppercase text-[10px] tracking-wider cursor-pointer">
                              Delete
                            </button>
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
      </div>

      {/* Detail Drawer Panel */}
      {selectedItem && (
        <div className="w-80 border border-border bg-surface-raised rounded-2xl p-5 shrink-0 flex flex-col shadow-md max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="bg-brand/10 text-brand text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                {selectedItem.type}
              </span>
              <h3 className="text-sm font-extrabold text-text mt-2 leading-snug">{selectedItem.title}</h3>
            </div>
            <button
              onClick={() => setSelectedItem(null)}
              className="text-text-muted hover:text-text text-sm font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Members list */}
          <div className="mb-6">
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
              Managers / Permitted Users
            </h4>
            {selectedItem.permissions && selectedItem.permissions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {selectedItem.permissions.map(perm => (
                  <div key={perm.user_id} className="flex justify-between items-center border border-border p-2 rounded-lg bg-surface text-xs">
                    <div>
                      <span className="font-bold text-text block">{perm.users?.name || 'Unknown'}</span>
                      <span className="text-[9px] text-accent font-bold uppercase tracking-wider">{perm.role}</span>
                    </div>
                    <button
                      onClick={() => handleRemovePermission(perm.user_id)}
                      className="text-red-500 hover:text-red-700 text-[10px] font-bold uppercase cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[10px] text-text-muted italic">No explicit managers assigned.</p>
            )}
          </div>

          {/* Audit Logs */}
          <div>
            <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2" style={{ fontFamily: 'var(--font-mono)' }}>
              Recent Audit Logs (Max 10)
            </h4>
            {loadingLogs ? (
              <p className="text-[10px] text-text-muted animate-pulse uppercase">Loading logs...</p>
            ) : auditLogs.length === 0 ? (
              <p className="text-[10px] text-text-muted italic">No logs recorded for this item.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {auditLogs.map(log => (
                  <div key={log.id} className="border-l-2 border-accent pl-2.5 py-0.5 text-[10px]">
                    <p className="font-semibold text-text">{log.action.toUpperCase()}</p>
                    <p className="text-text-muted mt-0.5">By {log.users?.name || 'Unknown'}</p>
                    <p className="text-[8px] text-text-muted/60 mt-0.5">
                      {new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
