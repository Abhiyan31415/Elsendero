import React, { useState, useRef, useEffect } from 'react';
import { login, register } from "../../actions/user.js";
import Dialog from '@mui/material/Dialog';
import { useValue } from '../../context/ContextProvider';
import { DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import PasswordField from './PasswordField';
import { Close, Send } from '@mui/icons-material';
import { Button, Icon, DialogActions, IconButton, TextField } from '@mui/material';
import { useNavigate } from 'react-router-dom';  // Import useNavigate

function Login() {
    const { state: { openLogin }, dispatch } = useValue();
    const [title, setTitle] = useState('Login');
    const [isRegister, setIsRegister] = useState(false);
    const nameRef = useRef();
    const emailRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();

    const navigate = useNavigate();  // Initialize useNavigate

    const handleClose = () => {
        dispatch({ type: 'CLOSE_LOGIN' });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const email = emailRef.current.value;
        const password = passwordRef.current.value;

        if (!isRegister) {
            // Login logic
            login({ email, password }, dispatch).then(() => {
                // Redirect to homepage after successful login
                navigate('/');
            });
        } else {
            // Registration logic
            const name = nameRef.current.value;
            const confirmPassword = confirmPasswordRef.current.value;

            if (password !== confirmPassword) {
                return dispatch({
                    type: 'UPDATE_ALERT',
                    payload: { open: true, message: 'Passwords do not match', severity: 'error' }
                });
            }

            register({ name, email, password }, dispatch).then(() => {
                // Redirect to homepage after successful registration
                navigate('/');
            });
        }
    };

    useEffect(() => {
        isRegister ? setTitle('Register') : setTitle('Login');
    }, [isRegister]);

    return (
        <Dialog open={openLogin} onClose={handleClose}>
            <DialogTitle>
                {title}
                <IconButton sx={{ position: 'absolute', top: 8, right: 8, color: (theme) => theme.palette.grey[500] }} onClick={handleClose}>
                    <Close />
                </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <DialogContentText dividers>
                        Please Fill Your Information In the Fields Below
                    </DialogContentText>
                    {isRegister &&
                        <TextField
                            autoFocus
                            margin="normal"
                            variant="standard"
                            id="name"
                            label="Name"
                            type="text"
                            fullWidth
                            inputRef={nameRef}
                            inputProps={{ minLength: 3 }}
                            required
                        />}
                    <TextField
                        autoFocus={!isRegister}
                        margin="normal"
                        variant="standard"
                        id="email"
                        label="Email"
                        type="email"
                        fullWidth
                        inputRef={emailRef}
                        inputProps={{ minLength: 3 }}
                        required
                    />
                    <PasswordField {...{ passwordRef }} />
                    {isRegister &&
                        <PasswordField passwordRef={confirmPasswordRef} id="confirmPassword" label="Confirm Password" />
                    }
                </DialogContent>
                <DialogActions>
                    <Button type="submit" variant="contained" endIcon={<Send />}></Button>
                </DialogActions>
            </form>
            <DialogActions sx={{ justifyContent: 'left', p: '5px 24px' }}>
                {isRegister ? 'Do you have an account?' : "Don't have an account?"}
                <Button onClick={() => setIsRegister(!isRegister)}>
                    {isRegister ? 'Sign in' : 'Register'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default Login;
