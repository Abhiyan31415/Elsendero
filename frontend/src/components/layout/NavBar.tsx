'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AppBar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import MenuIconSharp from '@mui/icons-material/MenuSharp';
import LockIcon from '@mui/icons-material/Lock';
import { useValue } from '@/context/ContextProvider';
import UserIcons from '../user/UserIcons';
import Sidebar from '../sidebar/Sidebar';

const NavBar = () => {
  const {
    state: { currentUser, authReady },
    dispatch,
  } = useValue();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <AppBar color="primary">
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box sx={{ mr: 1 }}>
              <IconButton size="large" color="inherit" aria-label="Open filters" onClick={() => setIsOpen(true)}>
                <MenuIconSharp />
              </IconButton>
            </Box>
            <Typography
              variant="h5"
              component={Link}
              href="/map"
              noWrap
              sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}
            >
              गन्तव्य
            </Typography>
            {!authReady ? null : !currentUser ? (
              <Button color="inherit" startIcon={<LockIcon />} onClick={() => dispatch({ type: 'OPEN_LOGIN' })}>
                Login
              </Button>
            ) : (
              <UserIcons />
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Toolbar />
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
    </>
  );
};

export default NavBar;
