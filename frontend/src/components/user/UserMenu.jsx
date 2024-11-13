import { Logout, Settings } from '@mui/icons-material'
import { ListItemIcon, Menu, MenuItem } from '@mui/material'
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useValue } from '../../context/ContextProvider'
import useCheckToken from '../hooks/useCheckToken'
import Profile from './Profile'


const UserMenu = ({ anchorUserMenu, setAnchorUserMenu }) => {
    useCheckToken()
    const navigate = useNavigate() // Add useNavigate
    const { dispatch, state: { currentUser } } = useValue()
    
    const handleCloseUserMenu = () => {
        setAnchorUserMenu(null)
    }

    const handleLogout = () => {
        localStorage.removeItem("currentUser")
        dispatch({ type: 'UPDATE_USER', payload: null })
        // setAnchorUserMenu(null)
        dispatch({ type: 'OPEN_LOGIN' });
        navigate('/login') // Redirect to login page after logout
    }

    return (
        <>
            <Menu anchorEl={anchorUserMenu} open={Boolean(anchorUserMenu)} onClose={handleCloseUserMenu} onClick={handleCloseUserMenu}>
                <MenuItem onClick={() => navigate('/profile')}>
                    <ListItemIcon>
                        <Settings fontSize='small' />
                    </ListItemIcon>
                    Profile
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                        <Logout fontSize='small' />
                    </ListItemIcon>
                    Log Out
                </MenuItem>
            </Menu>
            <Profile />
        </>
    )
}

export default UserMenu
