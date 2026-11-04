/* eslint-disable react/prop-types */
import { Logout, Settings } from '@mui/icons-material';
import { Divider, ListItemIcon, Menu, MenuItem, Typography } from '@mui/material';
import { useValue } from '../../context/ContextProvider';
import { logout } from '../../actions/user';
import Profile from './Profile';

const UserMenu = ({ anchorUserMenu, setAnchorUserMenu }) => {
    const { dispatch, state: { currentUser } } = useValue();

    const handleCloseUserMenu = () => setAnchorUserMenu(null);

    const openProfile = () => {
        dispatch({
            type: 'UPDATE_PROFILE',
            payload: { open: true, file: null, photoURL: currentUser?.photoURL || '' },
        });
    };

    const handleLogout = () => logout(dispatch);

    return (
        <>
            <Menu
                anchorEl={anchorUserMenu}
                open={Boolean(anchorUserMenu)}
                onClose={handleCloseUserMenu}
                onClick={handleCloseUserMenu}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {currentUser && (
                    <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 1 }} component="div">
                        Signed in as <strong>{currentUser.name}</strong>
                    </Typography>
                )}
                <Divider />
                <MenuItem onClick={openProfile}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Log out
                </MenuItem>
            </Menu>
            <Profile />
        </>
    );
};

export default UserMenu;
