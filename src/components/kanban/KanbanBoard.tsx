'use client';

import JobCard from './JobCard';
import JobCardSkeleton from '../ui/JobCardSkeleton';
import { useRealtimeJobs } from '@/hooks/useRealtimeJobs';

export default function KanbanBoard() {
  const { jobs, loading } = useRealtimeJobs();

  if (loading) {
    return (
      <div className="h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
        <div className="bg-transparent">
          <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: 'var(--border-glass)' }}>
            <h2 className="text-xs font-mono opacity-60">INITIALIZING_UPLINK...</h2>
          </div>
          <div className="flex flex-col opacity-50">
            <JobCardSkeleton />
            <JobCardSkeleton />
            <JobCardSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const unassigned = jobs.filter(j => j.status === 'unassigned');
  const active = jobs.filter(j => ['in_progress', 'en_route'].includes(j.status));
  const completed = jobs.filter(j => j.status === 'completed');

  return (
    <div className="h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-20">
      
      {/* 1. UNASSIGNED SECTION */}
      {/* Removed bg-[#161a1e] so the glassmorphism shines through! */}
      <div className="bg-transparent">
        <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: 'var(--border-glass)' }}>
          <h2 className="text-xs font-mono opacity-60">UNASSIGNED ({unassigned.length})</h2>
        </div>
        <div className="flex flex-col">
          {unassigned.map(job => <JobCard key={job.id} job={job} />)}
          {unassigned.length === 0 && (
            <p className="text-xs opacity-50 italic text-center py-4 border border-dashed rounded-md" style={{ borderColor: 'var(--border-glass)' }}>No unassigned jobs.</p>
          )}
        </div>
      </div>

      {/* 2. ACTIVE / EN ROUTE SECTION */}
      <div className="bg-transparent">
        <div className="flex items-center justify-between mb-3 border-b pb-2" style={{ borderColor: 'var(--accent)' }}>
          <h2 className="text-xs font-mono transition-colors" style={{ color: 'var(--accent)' }}>ACTIVE FIELD UNITS ({active.length})</h2>
        </div>
        {/* REMOVED pointer-events-none */}
        <div className="flex flex-col opacity-80">
          {active.map(job => <JobCard key={job.id} job={job} />)}
          {active.length === 0 && (
            <p className="text-xs opacity-50 italic text-center py-4">No active dispatches.</p>
          )}
        </div>
      </div>

      {/* 3. COMPLETED SECTION */}
      <div className="bg-transparent">
        <div className="flex items-center justify-between mb-3 border-b border-[#1d9e75]/30 pb-2" style={{ borderColor: 'rgba(29, 158, 117, 0.4)' }}>
          <h2 className="text-xs font-mono text-[#1d9e75]">COMPLETED ({completed.length})</h2>
        </div>
        {/* REMOVED pointer-events-none */}
        <div className="flex flex-col opacity-50 grayscale">
          {completed.map(job => <JobCard key={job.id} job={job} />)}
          {completed.length === 0 && (
            <p className="text-xs opacity-50 italic text-center py-4">No completed jobs yet.</p>
          )}
        </div>
      </div>

    </div>
  );
}