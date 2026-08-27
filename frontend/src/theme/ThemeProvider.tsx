'use client';

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  ThemeProvider as MUIThemeProvider,
  createTheme,
  CssBaseline,
} from '@mui/material';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';
import { getThemeOptions } from './theme';

type ColorMode = 'light' | 'dark';

interface ColorModeContextType {
  mode: ColorMode;
  toggleColorMode: () => void;
}

const ColorModeContext = createContext<ColorModeContextType>({
  mode: 'dark',
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ColorMode>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('budgely_theme') as ColorMode | null;
    if (saved) {
      setMode(saved);
    } else if (
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
    ) {
      setMode('light');
    }
  }, []);

  const colorMode = useMemo(
    () => ({
      mode,
      toggleColorMode: () => {
        setMode((prev) => {
          const next = prev === 'light' ? 'dark' : 'light';
          localStorage.setItem('budgely_theme', next);
          return next;
        });
      },
    }),
    [mode],
  );

  const theme = useMemo(() => createTheme(getThemeOptions(mode)), [mode]);

  if (!mounted) {
    return null;
  }

  return (
    <AppRouterCacheProvider>
      <ColorModeContext.Provider value={colorMode}>
        <MUIThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </MUIThemeProvider>
      </ColorModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
