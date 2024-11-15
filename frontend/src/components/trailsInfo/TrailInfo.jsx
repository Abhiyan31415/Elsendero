import { Avatar, Box, Container, Dialog, IconButton, Rating, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import React, { forwardRef, useEffect, useState } from 'react';
import { useValue } from '../../context/ContextProvider';
import Appbar from '@mui/material/AppBar';
import Slide from '@mui/material/Slide';
import Close from '@mui/icons-material/Close';

// Fix 1: Import modules from swiper/modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, EffectCoverflow, Virtual, Zoom } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import 'swiper/css/zoom';
import './swiper.css';
import { StarBorder } from '@mui/icons-material';

const Transition = forwardRef((props, ref) => {
    return <Slide direction="up" ref={ref} {...props} />;
});

const TrailInfo = () => {
    const { state: { trail }, dispatch } = useValue();
    const handleClose = () => {
        dispatch({ type: 'UPDATE_TRAIL', payload: null });
    };
    const [splace, setSplace] = useState(null);
    const [fplace, setFplace] = useState(null);

    useEffect(() => {
        if (trail) {
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${trail.sloc[0]},${trail.sloc[1]}.json?access_token=pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g`;
            fetch(url)
                .then((res) => res.json())
                .then((data) => {
                    setSplace(data.features[0]?.place_name);
                });
            const url2 = `https://api.mapbox.com/geocoding/v5/mapbox.places/${trail.floc[0]},${trail.floc[1]}.json?access_token=pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g`;
            fetch(url2)
                .then((res) => res.json())
                .then((data) => {
                    setFplace(data.features[0]?.place_name);
                });
        }
    }, [trail]);

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
                        sx={{ ml: 2, flex: 1, color: '#FFF', fontWeight: 700 }}
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
                    modules={[Navigation, Autoplay, EffectCoverflow, Virtual, Zoom]}
                    centeredSlides={true}
                    slidesPerView={1}
                    grabCursor={true}
                    navigation={true}
                    autoplay={{
                        delay: 2500,
                        disableOnInteraction: false,
                    }}
                    zoom={true}
                    effect='coverflow'
                    coverflowEffect={{
                        rotate: 50,
                        stretch: 0,
                        depth: 100,
                        modifier: 1,
                        slideShadows: true,
                    }}
                >
                    {trail?.images[0]?.map((url) => (
                        <SwiperSlide key={url}>
                            <div className="swiper-zoom-container">
                                <img
                                    src={url}
                                    alt={trail.title}
                                    style={{
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'cover',
                                        borderRadius: '12px',
                                    }}
                                />
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                <Stack
                    sx={{
                        p: 3,
                        gap: 3,
                        bgcolor: '#F9F9F9',
                        borderRadius: '12px',
                        boxShadow: '0px 4px 10px rgba(0,0,0,0.1)',
                        mt: 3,
                    }}
                >
                    <Stack direction='row' justifyContent='space-between' flexWrap='wrap' gap={2}>
                        <Box>
                            <Typography variant='subtitle1' fontWeight={700} color="#06402b">
                                Approx Cost:
                            </Typography>
                            <Typography variant='body1'>
                                {trail?.price === 0 ? 'Free Stay' : `$${trail?.price}`}
                            </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant='subtitle1' fontWeight={700} color="#06402b">
                                Ratings:
                            </Typography>
                            <Rating
                                name='room-ratings'
                                defaultValue={trail?.rating || 3.5}
                                precision={0.5}
                                emptyIcon={<StarBorder />}
                            />
                        </Box>
                    </Stack>
                    <Stack direction='row' justifyContent='space-between' flexWrap='wrap' gap={2}>
                        <Box>
                            <Typography variant='subtitle1' fontWeight={700} color="#06402b">
                                Start Location:
                            </Typography>
                            <Typography variant='body1'>{splace}</Typography>
                        </Box>
                        <Box>
                            <Typography variant='subtitle1' fontWeight={700} color="#06402b">
                                Final Location:
                            </Typography>
                            <Typography variant='body1'>{fplace}</Typography>
                        </Box>
                    </Stack>
                    <Box>
                        <Typography variant='subtitle1' fontWeight={700} color="#06402b">
                            Description:
                        </Typography>
                        <Typography variant='body2' sx={{ color: '#555' }}>
                            {trail?.description}
                        </Typography>
                    </Box>
                </Stack>
            </Container>
        </Dialog>
    );
};

export default TrailInfo;
