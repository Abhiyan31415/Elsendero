'use client';

import type { ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { useValue } from '@/context/ContextProvider';
import AccessMessage from './AccessMessage';

/** Renders children only for logged-in users. Waits for the stored session to be restored first. */
const Protected = ({ children }: { children: ReactNode }) => {
  const {
    state: { currentUser, authReady },
  } = useValue();
  if (!authReady) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress aria-label="Checking your session" />
      </Box>
    );
  }
  return currentUser ? <>{children}</> : <AccessMessage />;
};

export default Protected;
