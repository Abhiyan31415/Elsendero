'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Box, Button, CircularProgress, Container, Typography } from '@mui/material';
import { CheckCircleOutline, ErrorOutline } from '@mui/icons-material';
import { verifyEmail } from '@/actions/user';
import { useValue } from '@/context/ContextProvider';

type Status = 'working' | 'done' | 'failed';

export default function VerifyEmail() {
  const token = useSearchParams().get('token') ?? '';
  const { dispatch } = useValue();
  const [status, setStatus] = useState<Status>(token ? 'working' : 'failed');
  // The token is single-use; don't send it twice (React strict mode runs effects twice in dev).
  const sent = useRef(false);

  useEffect(() => {
    if (!token || sent.current) return;
    sent.current = true;
    void verifyEmail(token, dispatch).then((ok) => setStatus(ok ? 'done' : 'failed'));
  }, [token, dispatch]);

  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      {status === 'working' && (
        <>
          <CircularProgress aria-label="Verifying" sx={{ mb: 3 }} />
          <Typography variant="h5" component="h1">
            Verifying your email…
          </Typography>
        </>
      )}
      {status === 'done' && (
        <>
          <CheckCircleOutline color="success" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            Your email is verified
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            You&apos;re logged in and ready to go.
          </Typography>
          <Button variant="contained" component={Link} href="/map">
            Explore trails
          </Button>
        </>
      )}
      {status === 'failed' && (
        <>
          <ErrorOutline color="error" sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            This link didn&apos;t work
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4 }}>
            It may have expired or already been used. Try logging in: if your email still needs verifying, you can
            send yourself a new link from there.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button variant="contained" onClick={() => dispatch({ type: 'OPEN_LOGIN' })}>
              Log in
            </Button>
            <Button variant="outlined" component={Link} href="/map">
              Back to the map
            </Button>
          </Box>
        </>
      )}
    </Container>
  );
}
