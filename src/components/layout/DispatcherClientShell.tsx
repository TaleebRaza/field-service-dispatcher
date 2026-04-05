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

    return () => {
      window.removeEventListener('DRAG_START', hideBoard);
      window.removeEventListener('DRAG_END', showBoard);
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

        {/* 1. THE FLOATING OPEN BUTTON ALIGNMENT FIX */}
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
          {/* 2. THE HEADER RESPONSIVE UI FIX */}
          <header className="p-4 border-b flex justify-between items-start gap-2" style={{ borderColor: 'var(--border-glass)' }}>
            
            {/* Left Side: min-w-0 prevents text from pushing the buttons off-screen */}
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
            
            {/* Right Side: shrink-0 ensures the buttons never get squished */}
            <div className="flex flex-col items-end gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <HeaderClock />
                <LogoutButton />
                
                {/* 3. THE UNIVERSAL HIDE BUTTON FIX */}
                <button 
                  onClick={() => setIsBoardOpen(false)}
                  className="px-2 py-1.5 bg-black/20 hover:bg-black/40 border rounded font-mono text-[10px] sm:text-xs opacity-90 transition-all flex items-center gap-1"
                  style={{ borderColor: 'var(--border-glass)' }}
                >
                  <span className="opacity-50">◀</span> HIDE
                </button>
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