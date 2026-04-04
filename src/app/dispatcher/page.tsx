import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import DispatcherClientShell from '@/components/layout/DispatcherClientShell';

export default async function DispatcherDashboard() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'dispatcher') redirect('/login');

  return (
    <ThemeProvider>
      <DispatcherClientShell userEmail={user?.email} />
    </ThemeProvider>
  );
}