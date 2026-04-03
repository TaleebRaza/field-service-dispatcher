'use client';

import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export default function HeaderClock() {
  const [time, setTime] = useState<string>('');
  const [is12Hour, setIs12Hour] = useState<boolean>(false);
  const { accent } = useTheme();

  useEffect(() => {
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour12: is12Hour }));
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [is12Hour]); // Re-run effect if the format changes

  return (
    <button 
      onClick={() => setIs12Hour(!is12Hour)}
      className="font-mono ml-2 font-medium tracking-wider transition-all hover:scale-105 cursor-pointer flex items-center justify-center rounded px-1"
      style={{ color: accent, backgroundColor: 'var(--bg-glass)', borderColor: 'var(--border-glass)', borderWidth: '1px' }}
      title="Toggle 12/24 Hour Format"
    >
      [{time || '00:00:00'}]
    </button>
  );
}