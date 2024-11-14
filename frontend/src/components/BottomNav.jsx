import { Add, Hiking, LocationOn, Today } from '@mui/icons-material'
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import { BottomNavigation, BottomNavigationAction, Box, Paper } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const BottomNav = () => {
    const [value, setValue] = useState(0)
    const ref = useRef()
    const navigate = useNavigate()

    useEffect(() => {
        ref.current.ownerDocument.body.scrollTop = 0
    }, [value])

    const handleNavigation = (newValue) => {
        setValue(newValue)
        switch (newValue) {
            case 0:
                navigate("/map")
                break
            case 1:
                navigate("/events")
                break
            case 2:
                navigate("/trail")
                break
            case 3:
                navigate("/add-trails")
                break
            case 4:
                navigate("/chat")
                break
            default:
                break
        }
    }

    return (
        <Box ref={ref}>
            <Paper elevation={3} sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 2 }}>
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(e, newValue) => handleNavigation(newValue)}
                >
                    <BottomNavigationAction label='Map' icon={<LocationOn />} />
                    <BottomNavigationAction label='Event' icon={<Today />} />
                    <BottomNavigationAction label='Trail' icon={<Hiking />} />
                    <BottomNavigationAction label='Add Trails' icon={<AddLocationAltIcon  />} />
                    <BottomNavigationAction label='Chat' icon={<Add />} />
                </BottomNavigation>
            </Paper>
        </Box>
    )
}

export default BottomNav