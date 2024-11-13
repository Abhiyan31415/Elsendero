import { Add, Hiking, LocationOn, Today } from '@mui/icons-material'
import {BottomNavigation, BottomNavigationAction, Box,Paper} from'@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import ClusterMap from './map/ClusterMap'
import EventsAdd from './events/EventsAdd'
import AddTrails from './addTrail/AddTrails'
import ChatComponent from './ChatComponent'
import Protected from './protected/Protected'
const BottomNav = () => {
    const [value,setValue]=useState(0)
    const ref =useRef()
    useEffect(()=>{
        ref.current.ownerDocument.body.scrollTop=0;
    })
    return(
        <Box ref={ref}>
            {{
                0:<ClusterMap/>,
                1:<EventsAdd/>,
                2:<Protected><AddTrails setPage={setValue}/></Protected>,
                3:<ChatComponent/>


            }[value]}
            <Paper
            elevation={3}
            sx={{position:'fixed',bottom:0,left:0,right:0,zIndex:2}}
            >
            <BottomNavigation
            showLabels
            value={value}
            onChange={(e,newValue)=>setValue(newValue)}
            >
                <BottomNavigationAction label='Map' icon={<LocationOn/>}/>
                <BottomNavigationAction label='Event' icon={<Today/>}/>
                <BottomNavigationAction label='Add Trails' icon={<Hiking/>}/>
                <BottomNavigationAction label='Chat' icon={<Add/>}/>
            </BottomNavigation>
            </Paper>
        </Box>
    )
}
export default BottomNav;