'use client';

import { useState } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, pointerWithin, DragOverlay } from '@dnd-kit/core';

export default function DispatchDndWrapper({ children }: { children: React.ReactNode }) {
  // State to track which job is currently being dragged for the overlay
  const [activeJob, setActiveJob] = useState<any | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveJob(event.active.data.current?.job);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveJob(null); // Clear the overlay
    
    const { active, over } = event;
    if (!over) return;

    const jobId = active.id;
    const technicianId = over.id;

    window.dispatchEvent(new CustomEvent('job-assigned', {
      detail: { jobId, technicianId, jobData: active.data.current?.job }
    }));

    try {
      await fetch('/api/jobs/assign', {
        method: 'PUT',
        body: JSON.stringify({ jobId, technicianId }),
        headers: { 'Content-Type': 'application/json' }
      });
    } catch (error) {
      console.error("Assignment failed:", error);
    }
  };

  return (
    <DndContext 
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd} 
      collisionDetection={pointerWithin}
    >
      {children}
      
      {/* The floating overlay that escapes the scrolling sidebar */}
      <DragOverlay dropAnimation={{ duration: 250, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeJob ? (
          <div 
            className="rounded-xl p-4 w-[320px] shadow-2xl backdrop-blur-2xl cursor-grabbing rotate-3 border"
            style={{ 
              backgroundColor: 'var(--bg-glass)', 
              borderColor: 'var(--accent)',
              borderWidth: '2px',
              borderLeftColor: activeJob.priority === 'urgent' ? '#E24B4A' : activeJob.priority === 'medium' ? '#EF9F27' : '#378ADD',
              borderLeftWidth: '6px'
            }}
          >
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-main)' }}>{activeJob.customer_name}</h3>
            <p className="text-xs opacity-70 mt-1 truncate" style={{ color: 'var(--text-main)' }}>📍 {activeJob.address}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}