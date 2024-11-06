import React from 'react';
import {AppBar, IconButton, Typography,Container,Toolbar, Box,Button} from "@mui/material"
import Avatar from '@mui/material/Avatar';
import MenuIconSharp from '@mui/icons-material/MenuSharp';
import LockIcon from '@mui/icons-material/Lock';
import photoUrl from '../assets/usericons/meli.png';
import UserIcons from './user/UserIcons';
import { useValue } from '../context/ContextProvider';
const user={name:'test',photoUrl}
const NavBar=()=>{
    const {state:{currentUser},
    dispatch
}=useValue();
    return(
        <AppBar sx={{backgroundColor:'#06402b'}}>
            <Container maxWidth='lg'>
                <Toolbar disableGutters>
                    <Box sx={{mr:1}}>
                        <IconButton size='large' color='white'>
                            <MenuIconSharp/>
                        </IconButton>
                    </Box>

                    <Typography variant='h6' component='h1' noWrap sx={{flexGrow:1,display:{xs:'none',md:'flex'}}}>
                        Gantabya-Your trail buddy
                    </Typography>

                    <Typography variant='h6' component='h1' noWrap sx={{flexGrow:1,display:{xs:'flex',md:'none'}}}>
                        Gantabya
                    </Typography>
                    {!currentUser?(<Button 
                    color='inherit'
                    startIcon={<LockIcon/>}
                    onClick={()=>dispatch({type:'UPDATE_USER',payload:user})}
                    >
                        Login
                    </Button>):(
                        <UserIcons/>
                    )}
                    
                </Toolbar>
            </Container>
        </AppBar>
    )
}
export default NavBar;