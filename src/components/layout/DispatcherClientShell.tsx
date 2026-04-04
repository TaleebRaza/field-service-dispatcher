'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import KanbanBoard from '@/components/kanban/KanbanBoard';
import MapWrapper from '@/components/map/MapWrapper';
import DispatchDndWrapper from '@/components/layout/DispatchDndWrapper';
import SmsToastProvider from '@/components/ui/SmsToastProvider';
import HeaderClock from '@/components/layout/HeaderClock';
import ThemeControls from '@/components/layout/ThemeControls';
import LogoutButton from '@/components/ui/LogoutButton';
import DevTools from '@/components/layout/DevTools';
import TechnicianSlideOver from '@/components/ui/TechnicianSlideOver';

export default function DispatcherClientShell({ userEmail }: { userEmail: string | undefined }) {
  // THE NEW STATE: Tracks which technician is currently selected
  const [selectedTech, setSelectedTech] = useState<any | null>(null);

  return (
    <div className="flex h-screen w-full overflow-hidden relative font-sans text-[var(--text-main)]">
      <SmsToastProvider />

      {/* THE FIX: AnimatePresence wraps the conditional render for smooth exits */}
      <AnimatePresence>
        {selectedTech && (
          <TechnicianSlideOver 
            key="tech-slideover" 
            tech={selectedTech} 
            onClose={() => setSelectedTech(null)} 
          />
        )}
      </AnimatePresence>

      <DispatchDndWrapper>
        <main className="absolute inset-0 z-0">
          {/* We pass the setter down to the Map */}
          <MapWrapper setSelectedTech={setSelectedTech} />
        </main>

        <aside 
          className="w-[30%] min-w-[350px] max-w-[450px] h-full flex flex-col relative z-20 shadow-[8px_0_30px_rgba(0,0,0,0.2)] border-r backdrop-blur-2xl transition-colors duration-500"
          style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)' }}
        >
          <header className="p-4 border-b flex justify-between items-start" style={{ borderColor: 'var(--border-glass)' }}>
            <div>
              <h1 className="text-lg font-bold tracking-wide transition-colors" style={{ color: 'var(--accent)' }}>DISPATCH_CONTROL</h1>
              <p className="text-xs opacity-60 font-mono mt-1">ONLINE | {userEmail}</p>
              <div className="mt-2">
                <DevTools />
              </div>
            </div>
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
  );
}