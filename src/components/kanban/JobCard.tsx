'use client';

import { useDraggable } from '@dnd-kit/core';
import StatusBadge from '../ui/StatusBadge';

export default function JobCard({ job }: { job: any }) {
  // 1. THE FIX: Check if the job is completed
  const isCompleted = job.status === 'completed';

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: job.id,
    data: { job },
    disabled: isCompleted, // 2. THE FIX: Native dnd-kit disable
  });

  const priorityColor = 
    job.priority === 'urgent' ? '#E24B4A' : 
    job.priority === 'medium' ? '#EF9F27' : '#378ADD';

  const style = {
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      // 3. THE FIX: Only attach the invisible drag handles if it's not completed
      {...(isCompleted ? {} : listeners)} 
      {...(isCompleted ? {} : attributes)}
      className={`
        relative overflow-hidden rounded-xl p-4 mb-3 shadow-lg backdrop-blur-md 
        transition-all duration-300 
        ${isCompleted ? 'cursor-default opacity-60' : 'cursor-grab active:cursor-grabbing hover:-translate-y-1 hover:shadow-xl'}
        ${isDragging ? 'border-dashed border-[var(--accent)]' : ''}
      `}
      style={{ 
        ...style,
        backgroundColor: 'var(--bg-glass)', 
        borderColor: 'var(--border-glass)',
        borderWidth: '1px',
        borderLeftColor: priorityColor,
        borderLeftWidth: '4px'
      }}
    >
      <div className="absolute top-0 right-0 w-16 h-16 opacity-10 rounded-full blur-xl pointer-events-none" style={{ backgroundColor: priorityColor }} />

      <div className="flex justify-between items-start mb-2 relative z-10">
        <h3 className="text-sm font-semibold truncate pr-2">{job.customer_name}</h3>
        <StatusBadge label={job.priority} type="priority" />
      </div>
      
      <div className="space-y-1 mb-3 relative z-10">
        <p className="text-xs opacity-70 truncate" title={job.address}>📍 {job.address}</p>
        <p className="text-xs opacity-70 capitalize">🔧 {job.job_type} • ⏱️ {job.estimated_duration}m</p>
      </div>

      <div 
        className="text-[11px] opacity-80 p-2 rounded-lg border line-clamp-2 relative z-10"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)', borderColor: 'var(--border-glass)' }}
      >
        {job.notes}
      </div>

      {/* THE SIMULATION TRIGGER */}
      {job.status === 'in_progress' && (
        <button
          onPointerDown={(e) => e.stopPropagation()} // Stop DND-kit from stealing the click
          onClick={() => {
            console.log("🚀 Firing Simulation Event for:", job.customer_name);
            window.dispatchEvent(new CustomEvent('START_SIMULATION', { detail: { id: job.id } }));
          }}
          className="relative z-20 mt-3 w-full py-2 text-xs font-mono font-bold rounded text-white shadow-lg transition-all hover:scale-[1.02]"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          ▶ INITIATE SIMULATION
        </button>
      )}
    </div>
  );
}