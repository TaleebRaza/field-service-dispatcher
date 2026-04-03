import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import TechDashboard from '@/components/technician/TechDashboard';

export default async function TechnicianPage() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) redirect('/login');

  // Fetch profile to verify role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'technician') redirect('/login');

  // Fetch the internal technician ID
  const { data: tech } = await supabase
    .from('technicians')
    .select('id')
    .eq('profile_id', user.id)
    .single();

  if (!tech) {
    return <div className="p-8 text-[#e8e6df]">Error: Technician database record not found.</div>;
  }

  return <TechDashboard technicianId={tech.id} fullName={profile.full_name} />;
}