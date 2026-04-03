'use client';

import { useTheme, ACCENTS } from './ThemeProvider';

export default function ThemeControls() {
  const { isDark, toggleTheme, accent, setAccent } = useTheme();

  return (
    <div className="flex items-center gap-3">
      {/* Accent Color Selectors */}
      <div className="flex gap-1">
        {ACCENTS.map((c) => (
          <button
            key={c.name}
            onClick={() => setAccent(c.value)}
            className={`w-4 h-4 rounded-full transition-transform hover:scale-110 ${accent === c.value ? 'ring-2 ring-offset-1 ring-offset-transparent' : ''}`}
            style={{ backgroundColor: c.value, '--tw-ring-color': c.value } as React.CSSProperties}
            title={c.name}
          />
        ))}
      </div>
      
      {/* Light/Dark Toggle */}
      <button 
        onClick={toggleTheme}
        className="text-xs font-mono opacity-60 hover:opacity-100 transition-opacity flex items-center justify-center w-6 h-6 rounded-full border border-current"
        title="Toggle Theme"
      >
        {isDark ? '🌙' : '☀️'}
      </button>
    </div>
  );
}