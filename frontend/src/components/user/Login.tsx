'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Link as MuiLink,
  TextField,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { forgotPassword, login, register, resendVerification } from '@/actions/user';
import { useValue } from '@/context/ContextProvider';
import PasswordField from './PasswordField';
import { validateAuthForm, validateEmail, type AuthFormErrors, type AuthFormValues } from './validation';

const EMPTY: AuthFormValues = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
};

/** 'checkEmail' = verification link sent; 'resetSent' = password reset link sent. */
type Notice = { kind: 'checkEmail' | 'resetSent'; email: string } | null;

function Login() {
  const {
    state: { openLogin },
    dispatch,
  } = useValue();
  const [isRegister, setIsRegister] = useState(false);
  const [values, setValues] = useState<AuthFormValues>(EMPTY);
  const [errors, setErrors] = useState<AuthFormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [resent, setResent] = useState(false);

  const resetForm = () => {
    setValues(EMPTY);
    setErrors({});
    setSubmitted(false);
  };

  const resetAll = () => {
    resetForm();
    setIsRegister(false);
    setForgot(false);
    setNotice(null);
    setResent(false);
  };

  const backToLogin = (email = values.email) => {
    resetForm();
    setValues({ ...EMPTY, email });
    setIsRegister(false);
    setForgot(false);
    setNotice(null);
    setResent(false);
  };

  const handleResend = async () => {
    if (!notice || submitting) return;
    setSubmitting(true);
    const ok = await resendVerification(notice.email, dispatch);
    setSubmitting(false);
    if (ok) setResent(true);
  };

  const handleForgotSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    const emailError = validateEmail(values.email);
    setErrors(emailError ? { email: emailError } : {});
    if (emailError) return;
    const email = values.email.trim().toLowerCase();
    setSubmitting(true);
    const ok = await forgotPassword(email, dispatch);
    setSubmitting(false);
    if (ok) setNotice({ kind: 'resetSent', email });
  };

  const handleClose = () => {
    if (submitting) return;
    dispatch({ type: 'CLOSE_LOGIN' });
  };

  const toggleMode = () => {
    resetForm();
    setIsRegister((r) => !r);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const next = { ...values, [name]: value };
    setValues(next);
    // After the first submit attempt, re-validate live so errors clear as the user fixes them.
    if (submitted) setErrors(validateAuthForm(next, isRegister));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitted(true);
    const found = validateAuthForm(values, isRegister);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSubmitting(true);
    const email = values.email.trim().toLowerCase();
    if (isRegister) {
      const created = await register({ name: values.name.trim(), email, password: values.password }, dispatch);
      setSubmitting(false);
      if (created) {
        resetForm();
        setNotice({ kind: 'checkEmail', email });
        return;
      }
    } else {
      const outcome = await login({ email, password: values.password }, dispatch);
      setSubmitting(false);
      if (outcome === 'ok') {
        resetAll();
        return;
      }
      if (outcome === 'unverified') {
        resetForm();
        setNotice({ kind: 'checkEmail', email });
        return;
      }
    }
    // Keep email/name, clear password fields after a failed attempt.
    setValues((v) => ({ ...v, password: '', confirmPassword: '' }));
    setSubmitted(false);
  };

  const fieldProps = (name: keyof AuthFormValues) => ({
    name,
    id: name,
    value: values[name],
    onChange: handleChange,
    error: Boolean(errors[name]),
    helperText: errors[name] || ' ',
    disabled: submitting,
  });

  const title = notice ? 'Check your email' : forgot ? 'Reset your password' : isRegister ? 'Create account' : 'Log in';

  const closeButton = (
    <IconButton
      aria-label="Close"
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        color: (theme) => theme.palette.grey[500],
      }}
      onClick={handleClose}
      disabled={submitting}
    >
      <Close />
    </IconButton>
  );

  const body = notice ? (
    <>
      <DialogContent sx={{ pt: 0 }}>
        <DialogContentText>
          {notice.kind === 'checkEmail' ? (
            <>
              We sent a verification link to <strong>{notice.email}</strong>. Open it to activate your account, then log
              in. The link expires in 24 hours.
            </>
          ) : (
            <>
              If an account exists for <strong>{notice.email}</strong>, we sent it a link to reset your password. The
              link expires in 1 hour.
            </>
          )}
        </DialogContentText>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Can&apos;t find it? Check your spam folder.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}>
        {notice.kind === 'checkEmail' && (
          <Button
            variant="outlined"
            fullWidth
            onClick={handleResend}
            disabled={submitting || resent}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
          >
            {resent ? 'Link sent' : 'Resend verification email'}
          </Button>
        )}
        <Button variant="contained" fullWidth onClick={() => backToLogin(notice.email)} disabled={submitting}>
          Back to log in
        </Button>
      </DialogActions>
    </>
  ) : forgot ? (
    <form onSubmit={handleForgotSubmit} noValidate>
      <DialogContent sx={{ pt: 0 }}>
        <DialogContentText>
          Enter your account email and we&apos;ll send you a link to choose a new password.
        </DialogContentText>
        <TextField
          {...fieldProps('email')}
          key="email-forgot"
          autoFocus
          margin="dense"
          variant="standard"
          label="Email"
          type="email"
          autoComplete="email"
          fullWidth
          required
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, flexDirection: 'column', gap: 1 }}>
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={submitting}
          startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {submitting ? 'Sending…' : 'Send reset link'}
        </Button>
        <Button onClick={() => backToLogin()} disabled={submitting} size="small">
          Back to log in
        </Button>
      </DialogActions>
    </form>
  ) : null;

  return (
    <Dialog
      open={openLogin}
      onClose={handleClose}
      fullWidth
      maxWidth="xs"
      slotProps={{
        transition: {
          onExited: resetAll,
        },
      }}
    >
      <DialogTitle>
        {title}
        {closeButton}
      </DialogTitle>
      {body ?? (
        <>
          <form onSubmit={handleSubmit} noValidate>
            <DialogContent sx={{ pt: 0 }}>
              <DialogContentText>
                {isRegister
                  ? 'Fill in your details to create an account.'
                  : 'Welcome back! Log in with your email and password.'}
              </DialogContentText>
              {isRegister && (
                <TextField
                  {...fieldProps('name')}
                  key="name"
                  autoFocus
                  margin="dense"
                  variant="standard"
                  label="Name"
                  type="text"
                  autoComplete="name"
                  fullWidth
                  required
                />
              )}
              <TextField
                {...fieldProps('email')}
                key={isRegister ? 'email-register' : 'email-login'}
                autoFocus={!isRegister}
                margin="dense"
                variant="standard"
                label="Email"
                type="email"
                autoComplete="email"
                fullWidth
                required
              />
              <PasswordField
                {...fieldProps('password')}
                margin="dense"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              {!isRegister && (
                <MuiLink
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => {
                    setErrors({});
                    setSubmitted(false);
                    setForgot(true);
                  }}
                  disabled={submitting}
                >
                  Forgot password?
                </MuiLink>
              )}
              {isRegister && (
                <PasswordField
                  {...fieldProps('confirmPassword')}
                  margin="dense"
                  label="Confirm password"
                  autoComplete="new-password"
                />
              )}
              {isRegister && (
                <Typography variant="caption" color="text.secondary">
                  At least 8 characters, including a letter and a number.
                </Typography>
              )}
            </DialogContent>
            <DialogActions sx={{ px: 3 }}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {submitting
                  ? isRegister
                    ? 'Creating account…'
                    : 'Logging in…'
                  : isRegister
                    ? 'Create account'
                    : 'Log in'}
              </Button>
            </DialogActions>
          </form>
          <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
            <Typography variant="body2">
              {isRegister ? 'Already have an account?' : "Don't have an account?"}
            </Typography>
            <Button onClick={toggleMode} disabled={submitting} size="small">
              {isRegister ? 'Log in' : 'Register'}
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}

export default Login;
