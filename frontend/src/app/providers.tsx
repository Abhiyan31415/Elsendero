'use client';

import type { ReactNode } from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { CssBaseline, ThemeProvider } from '@mui/material';
import ContextProvider from '@/context/ContextProvider';
import theme from '@/theme';

/** Client-side providers: Emotion cache for the App Router, MUI theme and the app state. */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: 'mui' }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ContextProvider>{children}</ContextProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
