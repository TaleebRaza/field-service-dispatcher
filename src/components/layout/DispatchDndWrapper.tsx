'use client';

import { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  pointerWithin, 
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';

export default function DispatchDndWrapper({ children }: { children: React.ReactNode }) {
  const [activeJob, setActiveJob] = useState<any | null>(null);

  // 1. THE MOBILE FIX: Configure explicit Touch and Mouse sensors
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 5 }, // Requires 5px of movement to start a drag
  });
  
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 250, // Requires a 250ms "long press" before dragging starts on mobile
      tolerance: 5, // Allows 5px of thumb wiggle room during the press
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveJob(event.active.data.current?.job);
    // THE FIX: Fire a global event when picking up a card
    window.dispatchEvent(new CustomEvent('DRAG_START'));
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveJob(null); 
    // THE FIX: Fire a global event when dropping a card
    window.dispatchEvent(new CustomEvent('DRAG_END'));
    
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

  // Add a cancel handler just in case they drop it where there is no target
  const handleDragCancel = () => {
    setActiveJob(null);
    window.dispatchEvent(new CustomEvent('DRAG_END'));
  };

  return (
    <DndContext 
      sensors={sensors}
      onDragStart={handleDragStart} 
      onDragEnd={handleDragEnd} 
      onDragCancel={handleDragCancel}
      collisionDetection={pointerWithin}
    >
      {children}
      
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