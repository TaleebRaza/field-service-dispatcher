import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import MapWrapper from '@/components/map/MapWrapper';
import DispatchDndWrapper from '@/components/layout/DispatchDndWrapper';
import SmsToastProvider from '@/components/ui/SmsToastProvider';
import HeaderClock from '@/components/layout/HeaderClock';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import ThemeControls from '@/components/layout/ThemeControls';
import LogoutButton from '@/components/ui/LogoutButton';
import DevTools from '@/components/layout/DevTools';

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
      <div className="flex h-screen w-full overflow-hidden relative font-sans text-[var(--text-main)]">
        <SmsToastProvider />

        <DispatchDndWrapper>
          
          {/* MAP IN BACKGROUND */}
          <main className="absolute inset-0 z-0">
            <MapWrapper />
          </main>

          {/* SIDEBAR OVERLAY */}
          <aside 
            className="w-[30%] min-w-[350px] max-w-[450px] h-full flex flex-col relative z-20 shadow-[8px_0_30px_rgba(0,0,0,0.2)] border-r backdrop-blur-2xl transition-colors duration-500"
            style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)' }}
          >
            <header className="p-4 border-b flex justify-between items-start" style={{ borderColor: 'var(--border-glass)' }}>
              {/* LEFT COLUMN: Title, email, and DevTools */}
              <div>
                <h1 className="text-lg font-bold tracking-wide transition-colors" style={{ color: 'var(--accent)' }}>DISPATCH_CONTROL</h1>
                <p className="text-xs opacity-60 font-mono mt-1">ONLINE | {user.email}</p>
                <div className="mt-2">
                  <DevTools />
                </div>
              </div>
              
              {/* RIGHT COLUMN: Clock, Logout, and Theme Controls */}
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2">
                  <HeaderClock />
                  <LogoutButton />
                </div>
                <ThemeControls />
              </div>
            </header>
            
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              <KanbanBoard />
            </div>
          </aside>

        </DispatchDndWrapper>
      </div>
    </ThemeProvider>
  );
}