import { Card, Container, ImageList } from '@mui/material'
import React from 'react'
import { useValue } from '../../context/ContextProvider'

const TrailsInfo = () => {
    
    const {state:{filteredTrails}}=useValue()
  return (
    <Container>
        <ImageList
        gap={12}
        sx={{
            mb:8,

        }}
        >
            {
                filteredRooms.map(room=>(
                    <Card
                    key={room._id}
                    ></Card>
                ))
            }

        </ImageList>
    </Container>
  )
}

export default TrailsInfo