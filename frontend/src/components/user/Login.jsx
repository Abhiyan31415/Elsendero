import { useState } from 'react';
import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    TextField,
    Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { login, register } from '../../actions/user.js';
import { useValue } from '../../context/ContextProvider';
import PasswordField from './PasswordField';
import { validateAuthForm } from './validation';

const EMPTY = { name: '', email: '', password: '', confirmPassword: '' };

function Login() {
    const { state: { openLogin }, dispatch } = useValue();
    const [isRegister, setIsRegister] = useState(false);
    const [values, setValues] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const resetForm = () => {
        setValues(EMPTY);
        setErrors({});
        setSubmitted(false);
    };

    const handleClose = () => {
        if (submitting) return;
        dispatch({ type: 'CLOSE_LOGIN' });
    };

    const toggleMode = () => {
        resetForm();
        setIsRegister((r) => !r);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const next = { ...values, [name]: value };
        setValues(next);
        // After the first submit attempt, re-validate live so errors clear as the user fixes them.
        if (submitted) setErrors(validateAuthForm(next, isRegister));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitted(true);
        const found = validateAuthForm(values, isRegister);
        setErrors(found);
        if (Object.keys(found).length) return;

        setSubmitting(true);
        const email = values.email.trim().toLowerCase();
        const ok = isRegister
            ? await register({ name: values.name.trim(), email, password: values.password }, dispatch)
            : await login({ email, password: values.password }, dispatch);
        setSubmitting(false);
        if (ok) {
            resetForm();
            setIsRegister(false);
        } else {
            // Keep email/name, clear password fields after a failed attempt.
            setValues((v) => ({ ...v, password: '', confirmPassword: '' }));
            setSubmitted(false);
        }
    };

    const fieldProps = (name) => ({
        name,
        id: name,
        value: values[name],
        onChange: handleChange,
        error: Boolean(errors[name]),
        helperText: errors[name] || ' ',
        disabled: submitting,
    });

    const title = isRegister ? 'Create account' : 'Log in';

    return (
        <Dialog
            open={openLogin}
            onClose={handleClose}
            fullWidth
            maxWidth="xs"
            TransitionProps={{ onExited: () => { resetForm(); setIsRegister(false); } }}
        >
            <DialogTitle>
                {title}
                <IconButton
                    aria-label="Close"
                    sx={{ position: 'absolute', top: 8, right: 8, color: (theme) => theme.palette.grey[500] }}
                    onClick={handleClose}
                    disabled={submitting}
                >
                    <Close />
                </IconButton>
            </DialogTitle>
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
                            ? isRegister ? 'Creating account…' : 'Logging in…'
                            : isRegister ? 'Create account' : 'Log in'}
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
        </Dialog>
    );
}

export default Login;
