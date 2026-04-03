'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { flushSync } from 'react-dom'; // <-- Required for flawless View Transitions

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  accent: string;
  setAccent: (color: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ACCENTS = [
  { name: 'Blue', value: '#378ADD' },
  { name: 'Purple', value: '#7F77DD' },
  { name: 'Rose', value: '#E24B4A' },
  { name: 'Amber', value: '#EF9F27' },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(true);
  const [accent, setAccent] = useState(ACCENTS[0].value);

  // Directly mutates the DOM so the View Transition captures the exact color change
  const applyThemeToDOM = (dark: boolean, currentAccent: string) => {
    const root = document.documentElement;
    root.style.setProperty('--accent', currentAccent);
    
    if (dark) {
      root.style.setProperty('--bg-base', '#0d0f11');
      root.style.setProperty('--bg-glass', 'rgba(22, 26, 30, 0.55)');
      root.style.setProperty('--text-main', '#e8e6df');
      root.style.setProperty('--border-glass', 'rgba(255, 255, 255, 0.08)');
    } else {
      root.style.setProperty('--bg-base', '#f4f5f7');
      root.style.setProperty('--bg-glass', 'rgba(255, 255, 255, 0.45)');
      root.style.setProperty('--text-main', '#111827');
      root.style.setProperty('--border-glass', 'rgba(0, 0, 0, 0.15)');
    }
  };

  // Set initially on mount
  useEffect(() => {
    applyThemeToDOM(isDark, accent);
  }, []);

  const applyWithSweep = (updateStateCallback: () => void, newDark: boolean, newAccent: string) => {
    if (!document.startViewTransition) {
      updateStateCallback();
      applyThemeToDOM(newDark, newAccent);
      return;
    }

    document.startViewTransition(() => {
      // flushSync forces React to render the component immediately
      flushSync(() => {
        updateStateCallback();
      });
      // Apply the CSS variables instantly for the "after" screenshot
      applyThemeToDOM(newDark, newAccent);
    });
  };

  const toggleTheme = () => applyWithSweep(() => setIsDark(!isDark), !isDark, accent);
  const handleSetAccent = (color: string) => applyWithSweep(() => setAccent(color), isDark, color);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, accent, setAccent: handleSetAccent }}>
      <div style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-main)', minHeight: '100vh' }}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};