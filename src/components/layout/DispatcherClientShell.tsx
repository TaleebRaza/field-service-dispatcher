'use client';

import { useState, useEffect } from 'react';
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
  const [selectedTech, setSelectedTech] = useState<any | null>(null);
  const [isBoardOpen, setIsBoardOpen] = useState(true);

  useEffect(() => {
    const hideBoard = () => setIsBoardOpen(false);
    const showBoard = () => setIsBoardOpen(true);

    window.addEventListener('DRAG_START', hideBoard);
    window.addEventListener('DRAG_END', showBoard);
    window.addEventListener('HIDE_BOARD', hideBoard); // <-- LISTEN FOR THE MAP TOUCH

    return () => {
      window.removeEventListener('DRAG_START', hideBoard);
      window.removeEventListener('DRAG_END', showBoard);
      window.removeEventListener('HIDE_BOARD', hideBoard);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden relative font-sans text-[var(--text-main)]">
      <SmsToastProvider />

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
          <MapWrapper setSelectedTech={setSelectedTech} />
        </main>

        {!isBoardOpen && (
          <button
            onClick={() => setIsBoardOpen(true)}
            className="absolute top-4 left-4 z-[9999] px-5 py-3 rounded-full shadow-2xl font-bold tracking-wider text-xs transition-transform hover:scale-105 border backdrop-blur-md flex items-center gap-2"
            style={{ backgroundColor: 'var(--bg-glass)', color: 'var(--accent)', borderColor: 'var(--accent)' }}
          >
            <span className="text-lg leading-none">☰</span> OPEN DISPATCH BOARD
          </button>
        )}

        <aside 
          className={`absolute md:relative top-0 left-0 h-full w-[85%] md:w-[30%] min-w-[320px] max-w-[450px] flex flex-col z-40 shadow-[8px_0_30px_rgba(0,0,0,0.2)] border-r backdrop-blur-2xl transition-transform duration-500 ${isBoardOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)' }}
        >
          {/* 1. CLEANED HEADER: The inline hide button is completely gone! */}
          <header className="p-4 border-b flex justify-between items-start gap-2 shrink-0" style={{ borderColor: 'var(--border-glass)' }}>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-bold tracking-wide transition-colors truncate" style={{ color: 'var(--accent)' }}>
                DISPATCH_CONTROL
              </h1>
              <p className="text-[10px] sm:text-xs opacity-60 font-mono mt-1 truncate">
                ONLINE | {userEmail}
              </p>
              <div className="mt-2">
                <DevTools />
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <HeaderClock />
                <LogoutButton />
              </div>
              <ThemeControls />
            </div>
          </header>
          
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
            <KanbanBoard />
          </div>

          {/* 2. THE FLOATING HIDE PILL (Bottom Center of the Board) */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
            <button 
              onClick={() => setIsBoardOpen(false)}
              className="px-6 py-3 rounded-full shadow-2xl border font-bold text-xs tracking-widest backdrop-blur-xl transition-all hover:scale-105 flex items-center gap-2"
              style={{ 
                backgroundColor: 'rgba(0,0,0,0.85)', 
                borderColor: 'var(--border-glass)', 
                color: 'var(--text-main)' 
              }}
            >
              <span className="opacity-60">◀</span> HIDE BOARD
            </button>
          </div>

        </aside>
      </DispatchDndWrapper>
    </div>
  );
}