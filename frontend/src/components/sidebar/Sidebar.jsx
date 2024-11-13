import React from 'react'
import { Box, Drawer, IconButton, Typography ,styled} from '@mui/material'
import { ChevronLeft } from '@mui/icons-material'

const DrawerHeader=styled('div')(({theme})=>({
    display:'flex',
    alignItems:'center',
    justifyContent:'space-between',
    padding:theme.spacing(0,1),
    ...theme.mixins.toolbar
}))

const Sidebar = ({isOpen,setIsOpen}) => {
  return (
    <Drawer
    variant='persistent'
    hideBackdrop={true}
    open={isOpen}
    >
        <DrawerHeader>
            <Typography>
                Search the trails here
            </Typography>
            <IconButton onClick={()=>setIsOpen(false)}>
                <ChevronLeft fontSize='large'/>
            </IconButton>
        </DrawerHeader>
    <Box
    sx={{width:240,p:3}}
    >

    </Box>
    </Drawer>
  )
}

export default Sidebar