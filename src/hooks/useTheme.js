import { useState, useEffect } from 'react';

const THEMES = ['dark', 'neon', 'light'];

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mq_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mq_theme', theme);
  }, [theme]);

  const cycleTheme = () => {
    setTheme(prev => {
      const idx = THEMES.indexOf(prev);
      return THEMES[(idx + 1) % THEMES.length];
    });
  };

  return { theme, cycleTheme };
}
