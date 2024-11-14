import { Avatar, Box, Container, Dialog, IconButton, Rating, Stack, Toolbar, Tooltip, Typography } from '@mui/material'
import React, { forwardRef,useEffect,useState } from 'react'
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
import { StarBorder } from '@mui/icons-material';

const Transition = forwardRef((props, ref) => {
    return <Slide direction="up" ref={ref} {...props} />
})

const TrailInfo = () => {
    const { state: { trail }, dispatch } = useValue();
    console.log(trail)
    const handleClose = () => {
        dispatch({ type: 'UPDATE_TRAIL', payload: null })
    }
    const [splace, setSplace] = useState(null);
    const [fplace, setFplace] = useState(null);
    useEffect(() => {
        if(trail){
            const url=`https://api.mapbox.com/geocoding/v5/mapbox.places/${trail.sloc[0]},${trail.sloc[1]}.json?access_token=pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g`
            fetch(url).then(res=>res.json()).then(data=>{
                setSplace(data.features[0]?.place_name)

            })
            const url2=`https://api.mapbox.com/geocoding/v5/mapbox.places/${trail.floc[0]},${trail.floc[1]}.json?access_token=pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g`
            fetch(url2).then(res=>res.json()).then(data=>{
                setFplace(data.features[0]?.place_name)

            })
        }

    },[trail])

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
                sx={{
                    p: 3,
                    '& > *': { // Add margin to all direct children
                        mb: 3  // margin bottom of 24px (theme.spacing(3))
                    },
                    '& > *:last-child': { // Remove margin from last child
                        mb: 0
                    }



                }}
                spcaing={2}
                
                >
                    <Stack
                    direction='row'
                    sx={{
                        justifyContent:'space-between',
                        flexWrap:'wrap',
                        gap: 2 
                    }}
                    >
                        <Box>
                            <Typography variant='h6' component='span'>
                                {'Approx Cost  '}
                            </Typography>
                            <Typography component='span'>
                                {trail?.price===0?'Free Stay':`$${trail?.price}`}
                            </Typography>
                        </Box>
                        <Box
                        sx={{
                            display:'flex',
                            alignItems:'center'
                        }}
                        >
                            <Typography variant='h6' component='span'>
                                {'Ratings:'}
                            </Typography>
                            <Rating
                            name='room-ratings'
                            defaultValue={3.5}
                            precision={0.5}
                            emptyIcon={<StarBorder/>}
                            />
                        </Box>


                    </Stack>
                    <Stack
                    direction='row'
                    sx={{
                        justifyContent:'space-between',
                        flexWrap:'wrap'
                    }}
                    >
                        <Box>
                            <Typography variant='h6' component='span'>
                                {'Start Location  '}
                            </Typography>
                            <Typography component='span'>
                                {splace}
                            </Typography>
                        </Box>
                        <Box
                        sx={{
                            display:'flex',
                            alignItems:'center'
                        }}
                        >
                            <Typography variant='h6' component='span'>
                                {'Final Location :'}
                            </Typography>
                            <Typography component='span'>
                                {fplace}
                            </Typography>
                        </Box>
                        

                    </Stack>
                    <Stack>
                            <Typography variant='h6' component='span'>
                                {'Description'}
                            </Typography>
                            <Typography>
                                {trail?.description}
                            </Typography>
                        </Stack>
                </Stack>
            </Container>
        </Dialog>
    )
}

export default TrailInfo