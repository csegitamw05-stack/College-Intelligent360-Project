'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [isDark, setIsDark] = useState<boolean>(false);

  const applyTheme = (selectedTheme: Theme) => {
    const root = document.documentElement;
    let effectiveDark = false;

    if (selectedTheme === 'dark') {
      effectiveDark = true;
    } else if (selectedTheme === 'light') {
      effectiveDark = false;
    } else {
      // system
      effectiveDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (effectiveDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    setIsDark(effectiveDark);
  };

  useEffect(() => {
    const savedTheme = (localStorage.getItem('campus_theme') as Theme) || 'light';
    setThemeState(savedTheme);
    applyTheme(savedTheme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('campus_theme', newTheme);
    applyTheme(newTheme);
  };

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
