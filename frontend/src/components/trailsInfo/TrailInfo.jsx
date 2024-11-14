import { Avatar, Container, Dialog, IconButton, Stack, Toolbar, Tooltip, Typography } from '@mui/material'
import React, { forwardRef } from 'react'
import { useValue } from '../../context/ContextProvider';
import Appbar from '@mui/material/AppBar';
import Slide from '@mui/material/Slide';
import Close from '@mui/icons-material/Close';

// Fix 1: Import modules from swiper/modules
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay, EffectCoverflow, Virtual, Zoom } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/effect-coverflow'
import 'swiper/css/zoom'
import './swiper.css'

const Transition = forwardRef((props, ref) => {
    return <Slide direction="up" ref={ref} {...props} />
})

const TrailInfo = () => {
    const { state: { trail }, dispatch } = useValue();
    console.log(trail)
    const handleClose = () => {
        dispatch({ type: 'UPDATE_TRAIL', payload: null })
    }

    return (
        <Dialog
            fullScreen
            open={Boolean(trail)}
            onClose={handleClose}
            TransitionComponent={Transition}
        >
            <Appbar position='relative' sx={{ background: '#06402B' }}>
                <Toolbar>
                    <Typography
                        variant='h6'
                        component='h3'
                        sx={{ ml: 2, flex: 1 }}
                    >
                        {trail?.title}
                    </Typography>
                    <IconButton color="inherit" onClick={handleClose}>
                        <Close />
                    </IconButton>
                </Toolbar>
            </Appbar>
            <Container sx={{ pt: 5 }}>
                <Swiper
                    // Fix 2: Modules should be an array, not an object
                    modules={[Navigation, Autoplay, EffectCoverflow, Virtual, Zoom]}
                    centeredSlides={true}
                    slidesPerView={2}
                    grabCursor={true}
                    navigation={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    // Fix 3: Remove lazy prop since we're not using it
                    zoom={true}
                    effect='coverflow'
                    coverflowEffect={{
                        rotate: 50,
                        stretch: 0,
                        depth: 100,
                        modifier: 1,
                        slideShadows: true
                    }}
                >
                    {/* Fix 4: Add return statement in map function */}
                    {trail?.images[0]?.map(url => (
                        <SwiperSlide key={url}>
                            <div className="swiper-zoom-container">
                                {/* Fix 5: Add proper image styling */}
                                <img 
                                    src={url} 
                                    alt={trail.title}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'cover'
                                    }}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                     <Tooltip title={trail?.title}
                    sx={{
                        position: 'absolute',
                        bottom:'8px',
                        left:'2px',
                        zIndex:2

                    }}
                    >
                        <Avatar src={trail?.uPhoto}/>

                    </Tooltip> 
                </Swiper>
                <Stack
                sx={{p:3}}
                spcaing={2}
                >

                </Stack>
            </Container>
        </Dialog>
    )
}

export default TrailInfo