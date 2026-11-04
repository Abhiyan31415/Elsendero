'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, CircularProgress, Container, Paper, Typography } from '@mui/material';
import { resetPassword } from '@/actions/user';
import { useValue } from '@/context/ContextProvider';
import PasswordField from '@/components/user/PasswordField';
import { validatePassword } from '@/components/user/validation';

export default function ResetPassword() {
  const token = useSearchParams().get('token') ?? '';
  const router = useRouter();
  const { dispatch } = useValue();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" component="h1" gutterBottom>
          This reset link is incomplete
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Open the link from your email again, or request a new one from the log in screen.
        </Typography>
        <Button variant="contained" onClick={() => dispatch({ type: 'OPEN_LOGIN' })}>
          Log in
        </Button>
      </Container>
    );
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const found = {
      password: validatePassword(password, { strict: true }) || undefined,
      confirm: !confirm ? 'Please confirm your password' : confirm !== password ? 'Passwords do not match' : undefined,
    };
    setErrors(found);
    if (found.password || found.confirm) return;
    setSubmitting(true);
    const ok = await resetPassword(token, password, dispatch);
    setSubmitting(false);
    if (ok) router.push('/map');
  };

  return (
    <Container maxWidth="xs" sx={{ py: 8 }}>
      <Paper sx={{ p: 4 }} elevation={3}>
        <Typography variant="h5" component="h1" gutterBottom>
          Choose a new password
        </Typography>
        <Typography variant="body2" color="text.secondary">
          At least 8 characters, including a letter and a number.
        </Typography>
        <form onSubmit={handleSubmit} noValidate>
          <PasswordField
            id="password"
            label="New password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={Boolean(errors.password)}
            helperText={errors.password || ' '}
            disabled={submitting}
            autoFocus
          />
          <PasswordField
            id="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={Boolean(errors.confirm)}
            helperText={errors.confirm || ' '}
            disabled={submitting}
          />
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {submitting ? 'Saving…' : 'Set new password'}
          </Button>
        </form>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button component={Link} href="/map" size="small">
            Cancel
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
