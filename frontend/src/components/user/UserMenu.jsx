import { Logout, Settings } from '@mui/icons-material'
import {List, ListItemIcon, Menu, MenuItem} from '@mui/material'
import React from 'react'
import { useValue } from '../../context/ContextProvider'
import useCheckToken from '../hooks/useCheckToken'
import Profile from './Profile'
const UserMenu = ({anchorUserMenu,setAnchorUserMenu}) => {
    useCheckToken()

    const {dispatch,state:{currentUser}}=useValue()
    const handleCloseUserMenu=()=>{
        setAnchorUserMenu(null)
    }

    const handleLogout = () => {
        localStorage.removeItem("currentUser");
        dispatch({ type: 'UPDATE_USER', payload:null });
        setAnchorUserMenu(null);
        // window.location.reload();
    };
    

    return (
        <>
        <Menu anchorEl={anchorUserMenu} open={Boolean(anchorUserMenu)} onClose={handleCloseUserMenu} onClick={handleCloseUserMenu}>
            <MenuItem onClick={handleLogout}>
            <ListItemIcon>
                <Settings fontSize='small'/>

            </ListItemIcon>
            Profile
            </MenuItem>
            <MenuItem onClick={()=>dispatch({type:'UPDATE_USER',payload:null})}>
            <ListItemIcon>
                <Logout fontSize='small'/>

            </ListItemIcon>
            Log Out
            </MenuItem>
        </Menu>
        <Profile/>
        </>
    )
}

export default UserMenu;