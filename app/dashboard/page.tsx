import { redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()

  // Verify auth session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  // Fetch permissions (events managed/volunteered)
  const { data: permissions } = await supabase
    .from('permissions')
    .select('*, content_items(*, blogs(*), announcements(*), notices(*), poll_options(*))')
    .eq('user_id', user.id)

  // Check user_roles (for global manager checks)
  const { data: roles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  // Check users profile for super admin flag
  const { data: profile } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .maybeSingle()

  const isSuperAdmin = profile?.is_super_admin || false
  const hasManagerRole = roles ? roles.some(r => r.role === 'manager') : false
  const canCreate = isSuperAdmin || hasManagerRole

  const listPermissions = permissions || []
  const managing = listPermissions.filter(p => (p.role === 'manager' || p.role === 'co_manager') && p.content_items)
  const volunteering = listPermissions.filter(p => p.role === 'volunteer' && p.content_items)

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="border-b border-border pb-6 mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-text" style={{ fontFamily: 'var(--font-sans)' }}>
              DASHBOARD
            </h1>
            <p className="text-xs sm:text-sm text-text-muted mt-1" style={{ fontFamily: 'var(--font-sans)' }}>
              Manage your hostel event permissions, notices, polls, and announcements.
            </p>
          </div>

          {/* Section: Create New */}
          {canCreate && (
            <section className="mb-12">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
                CREATE NEW
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Link 
                  href="/create/poll" 
                  className="border border-dashed border-border hover:border-accent bg-surface hover:bg-surface-muted p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer h-[130px] shadow-xs group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📊</span>
                  <span className="text-xs font-bold text-text" style={{ fontFamily: 'var(--font-sans)' }}>Make Poll</span>
                </Link>
                <Link 
                  href="/create/blog" 
                  className="border border-dashed border-border hover:border-brand bg-surface hover:bg-surface-muted p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer h-[130px] shadow-xs group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">✍️</span>
                  <span className="text-xs font-bold text-text" style={{ fontFamily: 'var(--font-sans)' }}>Write Blog</span>
                </Link>
                <Link 
                  href="/create/announcement" 
                  className="border border-dashed border-border hover:border-blue-500 bg-surface hover:bg-surface-muted p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer h-[130px] shadow-xs group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📢</span>
                  <span className="text-xs font-bold text-text" style={{ fontFamily: 'var(--font-sans)' }}>Make Announcement</span>
                </Link>
                <Link 
                  href="/create/notice" 
                  className="border border-dashed border-border hover:border-amber-500 bg-surface hover:bg-surface-muted p-6 rounded-2xl flex flex-col items-center justify-center text-center transition-all cursor-pointer h-[130px] shadow-xs group"
                >
                  <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📝</span>
                  <span className="text-xs font-bold text-text" style={{ fontFamily: 'var(--font-sans)' }}>Make Notice</span>
                </Link>
              </div>
            </section>
          )}

          {/* Section: Managing */}
          <section className="mb-12">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
              MANAGING ({managing.length})
            </h2>
            {managing.length === 0 ? (
              <div className="border border-border bg-surface-raised p-8 rounded-2xl text-center shadow-xs">
                <p className="text-xs text-text-muted italic" style={{ fontFamily: 'var(--font-sans)' }}>
                  You are not currently managing or co-managing any events.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {managing.map(item => {
                  const content = item.content_items
                  if (!content) return null

                  const statusColor = 
                    content.status === 'published' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' :
                    content.status === 'archived' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' :
                    'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'

                  return (
                    <div key={item.id} className="border border-border bg-surface-raised p-5 rounded-2xl flex flex-col justify-between shadow-xs min-h-[170px] hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-brand-light/10 text-brand text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                            {content.type}
                          </span>
                          <span className={`border text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase ${statusColor}`} style={{ fontFamily: 'var(--font-mono)' }}>
                            {content.status}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-text leading-snug line-clamp-2" style={{ fontFamily: 'var(--font-sans)' }}>
                          {content.title}
                        </h3>
                      </div>
                      <div className="flex gap-2.5 mt-4">
                        <Link 
                          href={`/events/${content.id}`} 
                          className="btn-secondary py-2 px-4 text-[10px] font-bold tracking-wider text-center flex-1 uppercase rounded-lg border border-border"
                        >
                          View Live
                        </Link>
                        <Link 
                          href={`/edit/${content.id}`} 
                          className="btn-primary py-2 px-4 text-[10px] font-bold tracking-wider text-center flex-1 uppercase rounded-lg"
                        >
                          Edit
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Section: Volunteering */}
          <section>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-text-muted mb-4" style={{ fontFamily: 'var(--font-mono)' }}>
              VOLUNTEERING ({volunteering.length})
            </h2>
            {volunteering.length === 0 ? (
              <div className="border border-border bg-surface-raised p-8 rounded-2xl text-center shadow-xs">
                <p className="text-xs text-text-muted italic" style={{ fontFamily: 'var(--font-sans)' }}>
                  You are not currently volunteering for any events.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {volunteering.map(item => {
                  const content = item.content_items
                  if (!content) return null

                  const statusColor = 
                    content.status === 'published' ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' :
                    content.status === 'archived' ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' :
                    'bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20'

                  return (
                    <div key={item.id} className="border border-border bg-surface-raised p-5 rounded-2xl flex flex-col justify-between shadow-xs min-h-[170px] hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="bg-brand-light/10 text-brand text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase" style={{ fontFamily: 'var(--font-mono)' }}>
                            {content.type}
                          </span>
                          <span className={`border text-[9px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase ${statusColor}`} style={{ fontFamily: 'var(--font-mono)' }}>
                            {content.status}
                          </span>
                        </div>
                        <h3 className="text-xs sm:text-sm font-bold text-text leading-snug line-clamp-2" style={{ fontFamily: 'var(--font-sans)' }}>
                          {content.title}
                        </h3>
                      </div>
                      <div className="flex gap-2.5 mt-4">
                        <Link 
                          href={`/events/${content.id}`} 
                          className="btn-primary py-2 px-4 text-[10px] font-bold tracking-wider text-center flex-1 uppercase rounded-lg"
                        >
                          View Live
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
