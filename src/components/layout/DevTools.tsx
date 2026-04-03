'use client';

import { useState } from 'react';

export default function DevTools() {
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    await fetch('/api/jobs/seed', { method: 'POST' });
    setLoading(false);
  };

  const handleClear = async () => {
    if(!confirm("Are you sure you want to delete all jobs?")) return;
    setLoading(true);
    await fetch('/api/jobs/clear', { method: 'DELETE' });
    setLoading(false);
  };

  return (
    <div className="flex gap-2 text-xs font-mono">
      <button 
        onClick={handleSeed}
        disabled={loading}
        className="px-2 py-1 rounded border opacity-60 hover:opacity-100 transition-opacity"
        style={{ borderColor: 'var(--border-glass)', color: 'var(--text-main)', backgroundColor: 'var(--bg-glass)' }}
      >
        + SEED
      </button>
      <button 
        onClick={handleClear}
        disabled={loading}
        className="px-2 py-1 rounded border opacity-60 hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/50"
        style={{ borderColor: 'var(--border-glass)', color: 'var(--text-main)', backgroundColor: 'var(--bg-glass)' }}
      >
        - CLEAR
      </button>
    </div>
  );
}