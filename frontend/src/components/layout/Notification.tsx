'use client';

import type { SyntheticEvent } from 'react';
import { Alert, Snackbar, type SnackbarCloseReason } from '@mui/material';
import { useValue } from '@/context/ContextProvider';

function Notification() {
  const {
    state: { alert },
    dispatch,
  } = useValue();
  const handleClose = (_event?: SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
    if (reason === 'clickaway') return;
    dispatch({ type: 'UPDATE_ALERT', payload: { ...alert, open: false } });
  };
  return (
    <Snackbar
      open={alert.open}
      autoHideDuration={6000}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert onClose={handleClose} severity={alert.severity} sx={{ width: '100%' }} variant="filled" elevation={6}>
        {alert.message}
      </Alert>
    </Snackbar>
  );
}

export default Notification;
