import { notFound, redirect } from 'next/navigation'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase/server'
import EditFormWrapper from '@/components/event/EditFormWrapper'

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/')
  }

  // 2. Fetch the content item
  const { data: item } = await supabase
    .from('content_items')
    .select('*, blogs(*), announcements(*), notices(*, notice_attachments(*)), poll_options(*)')
    .eq('id', id)
    .single()

  if (!item) {
    notFound()
  }

  // 3. Fetch user profile details
  const { data: profile } = await supabase
    .from('users')
    .select('is_super_admin')
    .eq('id', user.id)
    .maybeSingle()

  const isSuperAdmin = profile?.is_super_admin || false

  // 4. Verify permission (only manager or co_manager or super admin can edit)
  if (!isSuperAdmin) {
    const { data: permission } = await supabase
      .from('permissions')
      .select('role')
      .eq('content_item_id', id)
      .eq('user_id', user.id)
      .in('role', ['manager', 'co_manager'])
      .maybeSingle()

    if (!permission) {
      redirect('/dashboard')
    }
  }

  // 5. Fetch bhavans list
  const { data: bhavans } = await supabase
    .from('bhavans')
    .select('id, name')
    .order('name')

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-surface py-10">
        <EditFormWrapper item={item} bhavans={bhavans || []} userId={user.id} />
      </main>
      <Footer />
    </>
  )
}
