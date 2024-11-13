import React,{useState} from 'react';
import {AppBar, IconButton, Typography,Container,Toolbar, Box,Button} from "@mui/material"
// import Avatar from '@mui/material/Avatar';
import MenuIconSharp from '@mui/icons-material/MenuSharp';
import LockIcon from '@mui/icons-material/Lock';

import UserIcons from './user/UserIcons';
import { useValue } from '../context/ContextProvider';
import Sidebar from './sidebar/Sidebar';

const NavBar=()=>{
    
    const {state:{currentUser},
    dispatch
}=useValue();
const [isOpen,setIsOpen]=useState(false)
    return(
        <>
        <AppBar sx={{backgroundColor:'#06402b'}}>
            <Container maxWidth='lg'>
                <Toolbar disableGutters>
                    <Box sx={{mr:1}}>
                        <IconButton size='large' color='inherit' onClick={()=>setIsOpen(true)}>
                            <MenuIconSharp/>
                        </IconButton>
                    </Box>

                    <Typography variant='h6' component='h1' noWrap sx={{flexGrow:1,display:{xs:'none',md:'flex'}}}>
                        Gantabya
                    </Typography>

                    <Typography variant='h6' component='h1' noWrap sx={{flexGrow:1,display:{xs:'flex',md:'none'}}}>
                        Gantabya
                    </Typography>
                    {!currentUser?(<Button 
                    color='inherit'
                    startIcon={<LockIcon/>}
                    onClick={()=>dispatch({type:'OPEN_LOGIN'})}
                    >
                        Login
                    </Button>):(
                        <UserIcons/>
                    )}
                    
                </Toolbar>
            </Container>
        </AppBar>
        <Toolbar/>
        <Sidebar {...{isOpen,setIsOpen}}/>
        </>
    )
}
export default NavBar;