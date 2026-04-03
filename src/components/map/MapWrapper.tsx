'use client';

import dynamic from 'next/dynamic';

const DispatchMap = dynamic(() => import('./DispatchMap'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#0d0f11]">
      <p className="text-[#888780] text-sm font-mono animate-pulse">INITIALIZING_MAP_ENGINE...</p>
    </div>
  ),
});

export default function MapWrapper() {
  return <DispatchMap />;
}