'use client';

import { motion } from 'framer-motion';
import { useRealtimeJobs } from '@/hooks/useRealtimeJobs';
import StatusBadge from './StatusBadge';

interface TechnicianSlideOverProps {
  tech: any;
  onClose: () => void;
}

export default function TechnicianSlideOver({ tech, onClose }: TechnicianSlideOverProps) {
  // 1. Fetch live jobs directly into the component
  const { jobs } = useRealtimeJobs();

  if (!tech) return null;

  // 2. Filter and Process the Tech's Data
  const techJobs = jobs.filter(j => j.assigned_to === tech.id);
  const activeJobs = techJobs.filter(j => ['in_progress', 'en_route'].includes(j.status));
  const completedJobs = techJobs.filter(j => j.status === 'completed');

  // 3. Dynamic Telemetry
  // Calculate mock revenue: $85 base fee + $1.50 per minute of the job
  const dailyRevenue = completedJobs.reduce((acc, job) => acc + 85 + (job.estimated_duration * 1.5), 0);
  
  // Stable mock fuel level based on their ID so it doesn't jump around on re-renders
  const fuelLevel = 45 + (tech.id.charCodeAt(0) % 50); 
  const isFuelLow = fuelLevel < 50;

  // 4. Queue Management
  const currentJob = activeJobs[0];
  const queuedJobs = activeJobs.slice(1);

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0.5 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0.5 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      // THE FIX: Changed w-[380px] to w-full md:w-[380px]
      className="absolute top-0 right-0 h-full w-full md:w-[380px] z-[9999] p-6 shadow-2xl border-l flex flex-col"
      style={{ 
        backgroundColor: 'var(--bg-glass)', 
        backdropFilter: 'blur(24px)',              
        borderColor: 'var(--border-glass)',   
        color: 'var(--text-main)'
      }}
    >
      <button 
        onPointerDown={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="absolute top-6 right-6 opacity-60 hover:opacity-100 transition-opacity font-mono text-3xl z-50 cursor-pointer leading-none"
      >
        &times;
      </button>

      {/* HEADER */}
      <div className="mb-6 mt-2 flex-shrink-0">
        <h2 className="text-2xl font-bold tracking-wider mb-2" style={{ color: 'var(--accent)' }}>
          {tech.profiles?.full_name || 'Technician'}
        </h2>
        <div className="flex gap-2 text-xs font-mono opacity-80">
          <span className="px-2 py-1 rounded bg-black/30 border border-white/10 uppercase">
            {tech.status.replace('_', ' ')}
          </span>
          <span className="px-2 py-1 rounded bg-black/30 border border-white/10">
            ID: {tech.id.split('-')[0]}
          </span>
        </div>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-6 pb-10">
        
        {/* TELEMETRY METRICS GRID */}
        <div>
          <h3 className="text-[10px] uppercase tracking-widest opacity-50 mb-2 font-mono">Daily Performance & Telemetry</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-black/20 border border-white/5">
              <div className="text-[10px] opacity-60 font-mono mb-1">COMPLETED</div>
              <div className="font-bold text-xl">{completedJobs.length} <span className="text-xs opacity-50 font-normal">jobs</span></div>
            </div>
            <div className="p-3 rounded-lg bg-black/20 border border-white/5">
              <div className="text-[10px] opacity-60 font-mono mb-1">EST. REVENUE</div>
              <div className="font-bold text-xl text-[#1d9e75]">${dailyRevenue.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-lg bg-black/20 border border-white/5">
              <div className="text-[10px] opacity-60 font-mono mb-1">FUEL LEVEL</div>
              <div className={`font-bold text-lg ${isFuelLow ? 'text-[#E24B4A]' : 'text-[#e8e6df]'}`}>{fuelLevel}%</div>
            </div>
            <div className="p-3 rounded-lg bg-black/20 border border-white/5">
              <div className="text-[10px] opacity-60 font-mono mb-1">EFFICIENCY</div>
              <div className="font-bold text-lg text-[#378ADD]">96%</div>
            </div>
          </div>
        </div>

        {/* CURRENT OBJECTIVE */}
        <div>
          <h3 className="text-[10px] uppercase tracking-widest opacity-50 mb-2 font-mono">Current Objective</h3>
          {currentJob ? (
            <div className="p-4 rounded-xl border relative overflow-hidden bg-black/20" style={{ borderColor: 'var(--accent)' }}>
              {currentJob.status === 'en_route' && (
                <div className="absolute top-0 right-0 w-16 h-16 opacity-10 rounded-full blur-xl pointer-events-none animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              )}
              <div className="flex justify-between items-start mb-2 relative z-10">
                <h4 className="text-sm font-bold truncate pr-2">{currentJob.customer_name}</h4>
                <StatusBadge label={currentJob.priority} type="priority" />
              </div>
              <p className="text-xs opacity-70 mb-2">📍 {currentJob.address}</p>
              <div className="flex gap-2">
                <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-black/30 text-white/70">🔧 {currentJob.job_type}</span>
                <span className="text-[10px] uppercase font-mono px-2 py-1 rounded bg-black/30 text-white/70">⏱️ {currentJob.estimated_duration}m</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border border-dashed text-center opacity-50" style={{ borderColor: 'var(--border-glass)' }}>
              <p className="text-xs font-mono italic">No active assignment.</p>
            </div>
          )}
        </div>

        {/* UPCOMING QUEUE */}
        {queuedJobs.length > 0 && (
          <div>
            <h3 className="text-[10px] uppercase tracking-widest opacity-50 mb-2 font-mono">Assigned Queue ({queuedJobs.length})</h3>
            <div className="space-y-2">
              {queuedJobs.map((job) => (
                <div key={job.id} className="p-3 rounded-lg border bg-black/10 opacity-70 hover:opacity-100 transition-opacity" style={{ borderColor: 'var(--border-glass)' }}>
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-bold truncate">{job.customer_name}</h4>
                    <span className="text-[9px] uppercase font-mono opacity-60 px-1 border rounded" style={{ borderColor: 'var(--border-glass)' }}>{job.priority}</span>
                  </div>
                  <p className="text-[10px] opacity-60">📍 {job.address}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );
}