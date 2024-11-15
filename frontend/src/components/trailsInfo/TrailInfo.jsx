import { Avatar, Box, Container, Dialog, IconButton, Rating, Stack, Toolbar, Tooltip, Typography } from '@mui/material';
import React, { forwardRef, useEffect, useState } from 'react';
import { useValue } from '../../context/ContextProvider';
import Appbar from '@mui/material/AppBar';
import Slide from '@mui/material/Slide';
import Close from '@mui/icons-material/Close';
import axios from 'axios';

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
    const [diff, setDiff] = useState(null);

    useEffect(() => {
        if (trail) {
            const fetchPlaceNames = async () => {
                const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${trail.sloc[0]},${trail.sloc[1]}.json?access_token=pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g`;
                const url2 = `https://api.mapbox.com/geocoding/v5/mapbox.places/${trail.floc[0]},${trail.floc[1]}.json?access_token=pk.eyJ1IjoiYWJoaXlhbjEyMTIiLCJhIjoiY20zNnQwNWJnMGFsbzJqc2wxMTh2a2JjaCJ9.QY9Xj_GfNoO9yu9nkiMb1g`;

                const [startPlace, finishPlace] = await Promise.all([
                    fetch(url).then((res) => res.json()),
                    fetch(url2).then((res) => res.json())
                ]);

                setSplace(startPlace.features[0]?.place_name);
                setFplace(finishPlace.features[0]?.place_name);
            };

            const getElevation = async (location) => {
                const API_URL = `https://api.open-meteo.com/v1/elevation`;
                try {
                    const response = await axios.get(API_URL, {
                        params: {
                            latitude: location[1],
                            longitude: location[0]
                        }
                    });
                    return response.data.elevation; // Elevation in meters
                } catch (error) {
                    console.error("Error fetching elevation:", error.message);
                    throw new Error("Unable to fetch elevation data.");
                }
            };

            const calculateDistance = (sloc, floc) => {
                const toRad = (value) => (value * Math.PI) / 180;

                const R = 6371; // Radius of the Earth in km
                const dLat = toRad(floc[1] - sloc[1]);
                const dLon = toRad(floc[0] - sloc[0]);

                const a =
                    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(toRad(sloc[1])) *
                    Math.cos(toRad(floc[1])) *
                    Math.sin(dLon / 2) *
                    Math.sin(dLon / 2);

                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                return R * c; // Distance in km
            };

            const calculateDifficulty = async () => {
                try {
                    const [startElevation, finalElevation] = await Promise.all([
                        getElevation(trail.sloc),
                        getElevation(trail.floc)
                    ]);

                    const elevationGained = finalElevation - startElevation;
                    const distance = calculateDistance(trail.sloc, trail.floc);
                    const numericalRating = Math.sqrt(elevationGained * distance * 2) / 1.6;

                    let dif = '';
                    if (numericalRating < 50 && distance < 3) {
                        dif = "Easiest";
                    } else if (numericalRating >= 50 && numericalRating <= 100 && distance >= 3 && distance <= 5) {
                        dif = "Moderate";
                    } else if (numericalRating > 100 && numericalRating <= 150 && distance >= 5 && distance <= 8) {
                        dif = "Moderately Strenuous";
                    } else if (numericalRating > 150 && numericalRating <= 200 && distance >= 7 && distance <= 10) {
                        dif = "Strenuous";
                    } else if (numericalRating > 200 && distance >= 8) {
                        dif = "Very Strenuous";
                    } else {
                        dif = "Not categorized";
                    }
                    setDiff(dif);
                } catch (error) {
                    console.error('Error calculating difficulty:', error);
                }
            };

            fetchPlaceNames();
            calculateDifficulty();
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
                                Difficulty
                            </Typography>
                            <Typography variant='body1'>{diff}</Typography>
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