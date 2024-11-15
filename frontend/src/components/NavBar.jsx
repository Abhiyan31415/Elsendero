import React, { useState } from 'react';
import { AppBar, IconButton, Typography, Container, Toolbar, Box, Button } from "@mui/material";
import MenuIconSharp from '@mui/icons-material/MenuSharp';
import LockIcon from '@mui/icons-material/Lock';
import { useNavigate } from 'react-router-dom';

import UserIcons from './user/UserIcons';
import { useValue } from '../context/ContextProvider';
import Sidebar from './sidebar/Sidebar';

const NavBar = () => {
    const { state: { currentUser }, dispatch } = useValue();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();  // Call useNavigate here, not inside the function

    const handleLoginClick = () => {
        dispatch({ type: 'OPEN_LOGIN' });
        navigate('/login'); // Redirect to login page
    };

    return (
        <>
            <AppBar sx={{ backgroundColor: '#06402b' }}>
                <Container maxWidth='lg'>
                    <Toolbar disableGutters>
                        <Box sx={{ mr: 1 }}>
                            <IconButton size='large' color='inherit' onClick={() => setIsOpen(true)}>
                                <MenuIconSharp />
                            </IconButton>
                        </Box>

                        <Typography variant='h5'  component='h1' noWrap sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
                        गन्तव्य 
                        </Typography>

                        <Typography variant='h5' component='h1' noWrap sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
                        गन्तव्य 
                        </Typography>
                        {!currentUser ? (
                            <Button
                                color='inherit'
                                startIcon={<LockIcon />}
                                onClick={handleLoginClick}
                            >
                                Login
                            </Button>
                        ) : (
                            <UserIcons />
                        )}
                    </Toolbar>
                </Container>
            </AppBar>
            <Toolbar />
            <Sidebar {...{ isOpen, setIsOpen }} />
        </>
    );
};

export default NavBar;
