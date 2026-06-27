import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  // 2. Query user profile to verify super admin privileges
  const { data: profile } = await supabase
    .from('users')
    .select('name, is_super_admin')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile || profile.is_super_admin !== true) {
    redirect('/')
  }

  const adminName = profile.name || 'Super Admin'

  return (
    <div className="min-h-screen bg-surface flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <AdminSidebar adminName={adminName} />
      
      {/* Main content pane */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
