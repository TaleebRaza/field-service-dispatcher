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

// THE FIX: Accept the setter prop and pass it to the dynamic map
export default function MapWrapper({ setSelectedTech }: { setSelectedTech: (tech: any) => void }) {
  return <DispatchMap setSelectedTech={setSelectedTech} />;
}