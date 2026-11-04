'use client';

import { useState } from 'react';
import { Avatar, Box, IconButton, Tooltip } from '@mui/material';
import { useValue } from '@/context/ContextProvider';
import { toImageUrl } from '@/utils/imageUrl';
import UserMenu from './UserMenu';

const UserIcons = () => {
  const {
    state: { currentUser },
  } = useValue();
  const [anchorUserMenu, setAnchorUserMenu] = useState<HTMLElement | null>(null);
  if (!currentUser) return null;
  return (
    <Box>
      <Tooltip title="Account">
        <IconButton
          size="large"
          color="inherit"
          aria-label="Open account menu"
          onClick={(e) => setAnchorUserMenu(e.currentTarget)}
        >
          <Avatar src={toImageUrl(currentUser.photoURL)} alt={currentUser.name}>
            {currentUser.name?.charAt(0).toUpperCase()}
          </Avatar>
        </IconButton>
      </Tooltip>
      <UserMenu anchorUserMenu={anchorUserMenu} setAnchorUserMenu={setAnchorUserMenu} />
    </Box>
  );
};

export default UserIcons;
