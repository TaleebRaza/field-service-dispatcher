'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ThemeProvider, useTheme } from '../layout/ThemeProvider';
import ThemeControls from '../layout/ThemeControls';
import HeaderClock from '../layout/HeaderClock';
import LogoutButton from '../ui/LogoutButton';

// 1. We create an Inner component so we can consume the Theme Context
function TechDashboardInner({ technicianId, fullName }: { technicianId: string, fullName: string }) {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { accent } = useTheme();
  const supabase = createClient();

  useEffect(() => {
    async function fetchMyJobs() {
      const { data } = await supabase
        .from('jobs')
        .select('*')
        .eq('assigned_to', technicianId)
        // We fetch 'completed' now too, so we can calculate daily stats
        .in('status', ['in_progress', 'en_route', 'completed']) 
        .order('updated_at', { ascending: false });
        
      if (data) setJobs(data);
      setLoading(false);
    }
    fetchMyJobs();

    const channel = supabase.channel('my-active-jobs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jobs', filter: `assigned_to=eq.${technicianId}` }, 
        () => fetchMyJobs()
      ).subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [technicianId]);

  const updateJobStatus = async (jobId: string, newStatus: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, status: newStatus } : j));
    await supabase.from('jobs').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', jobId);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-mono text-sm" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-main)' }}>SYNCING_UPLINK...</div>;

  // Separate active queue from completed stats
  const activeJobs = jobs.filter(j => ['in_progress', 'en_route'].includes(j.status));
  const completedJobs = jobs.filter(j => j.status === 'completed');

  // The very first job in the queue becomes the massive "Current Objective"
  const currentObjective = activeJobs[0];
  const upcomingQueue = activeJobs.slice(1);

  return (
    <div className="min-h-screen relative font-sans transition-colors duration-500 overflow-hidden" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-main)' }}>
      
      {/* Background glowing orb tied to the Accent color for depth */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[120%] h-[50%] opacity-20 blur-[100px] pointer-events-none transition-colors duration-1000"
        style={{ backgroundImage: `radial-gradient(ellipse at center, ${accent}, transparent 70%)` }}
      />

      {/* Mobile App Container */}
      <div className="w-full max-w-[450px] mx-auto h-screen flex flex-col relative z-10 shadow-2xl backdrop-blur-3xl border-x" style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)' }}>
        
        {/* Sleek App Header */}
        <header className="p-4 border-b flex justify-between items-start" style={{ borderColor: 'var(--border-glass)' }}>
          <div>
            <h1 className="text-xl font-bold tracking-tight transition-colors" style={{ color: accent }}>FIELD_UNIT</h1>
            <p className="text-xs opacity-60 font-mono mt-1">ID: {fullName}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <HeaderClock />
            <div className="flex items-center gap-2">
              <ThemeControls />
              <LogoutButton />
            </div>
          </div>
        </header>

        {/* Daily Stats Bar */}
        <div className="px-4 py-3 border-b text-xs font-mono flex justify-between opacity-80" style={{ borderColor: 'var(--border-glass)' }}>
          <span>STATUS: <span style={{ color: accent }}>ACTIVE</span></span>
          <span>COMPLETED TODAY: {completedJobs.length}</span>
        </div>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6 pb-10">
          
          {/* CURRENT OBJECTIVE (Massive, thumb-friendly active card) */}
          {currentObjective ? (
            <div className="space-y-2">
              <h2 className="text-xs font-bold tracking-widest uppercase opacity-50 mb-3">Current Objective</h2>
              <div 
                className="rounded-2xl p-5 shadow-2xl border"
                style={{ backgroundColor: 'var(--bg-base)', borderColor: currentObjective.status === 'en_route' ? accent : 'var(--border-glass)' }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{currentObjective.customer_name}</h3>
                  {currentObjective.status === 'en_route' && (
                    <span className="animate-pulse flex h-3 w-3 rounded-full" style={{ backgroundColor: accent }}></span>
                  )}
                </div>
                
                <p className="text-sm opacity-80 mb-1">📍 {currentObjective.address}</p>
                <p className="text-xs opacity-60 capitalize mb-4">🔧 {currentObjective.job_type} • ⏱️ {currentObjective.estimated_duration}m</p>

                <div className="text-xs p-3 rounded-xl border mb-6 opacity-90" style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)' }}>
                  {currentObjective.notes}
                </div>

                {/* Massive Action Buttons */}
                <div className="flex flex-col gap-3">
                  {currentObjective.status === 'in_progress' ? (
                    <button 
                      onClick={() => updateJobStatus(currentObjective.id, 'en_route')}
                      className="w-full py-4 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02] text-white"
                      style={{ backgroundColor: accent }}
                    >
                      MARK EN ROUTE
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateJobStatus(currentObjective.id, 'completed')}
                      className="w-full py-4 rounded-xl text-sm font-bold transition-transform hover:scale-[1.02] text-white shadow-[0_0_20px_rgba(29,158,117,0.4)]"
                      style={{ backgroundColor: '#1d9e75' }} // Always green for complete
                    >
                      COMPLETE MISSION
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
             <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed rounded-2xl opacity-50" style={{ borderColor: 'var(--border-glass)' }}>
               <span className="text-2xl mb-2">📡</span>
               <p className="text-sm font-mono">AWAITING_DISPATCH</p>
             </div>
          )}

          {/* UPCOMING QUEUE */}
          {upcomingQueue.length > 0 && (
            <div className="space-y-3 pt-4">
              <h2 className="text-xs font-bold tracking-widest uppercase opacity-50">Up Next In Queue</h2>
              {upcomingQueue.map(job => (
                <div key={job.id} className="p-4 rounded-xl border opacity-70" style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)' }}>
                  <h3 className="font-semibold text-sm mb-1">{job.customer_name}</h3>
                  <p className="text-xs opacity-70">📍 {job.address}</p>
                </div>
              ))}
            </div>
          )}
        </main>

      </div>
    </div>
  );
}

// 2. We wrap it in the Theme Provider so the Tech can use Dark/Light mode and Accents
export default function TechDashboard(props: { technicianId: string, fullName: string }) {
  return (
    <ThemeProvider>
      <TechDashboardInner {...props} />
    </ThemeProvider>
  );
}