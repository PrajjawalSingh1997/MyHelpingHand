import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { TopBar } from '@/components/layout/top-bar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user profile + enabled modules in parallel
  const [profileRes, modulesRes] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', user.id).single(),
    supabase
      .from('user_module_settings')
      .select('is_enabled, modules(id, name, slug, icon, sort_order)')
      .eq('user_id', user.id)
      .eq('is_enabled', true)
      .order('modules(sort_order)'),
  ])

  const profile = profileRes.data as { display_name: string | null; role: string } | null
  const enabledModules = (modulesRes.data ?? [])
    .map((row: any) => row.modules)
    .filter(Boolean)
    .sort((a: any, b: any) => a.sort_order - b.sort_order)

  return (
    <div className="flex min-h-screen">
      <Sidebar
        modules={enabledModules}
        displayName={profile?.display_name ?? user.email ?? 'User'}
        isAdmin={profile?.role === 'super_admin'}
      />
      <main className="ml-[240px] flex-1">
        <TopBar userId={user.id} displayName={profile?.display_name ?? ''} />
        <div className="p-6">{children}</div>
      </main>
    </div>
  )
}
