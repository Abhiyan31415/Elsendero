'use client';

import { forwardRef, useEffect, useState, type ReactElement, type Ref } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Box,
  Button,
  Container,
  Dialog,
  IconButton,
  Rating,
  Slide,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';
import type { TransitionProps } from '@mui/material/transitions';
import { Close, OpenInNew, StarBorder } from '@mui/icons-material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Navigation, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import 'swiper/css/zoom';
import { useValue } from '@/context/ContextProvider';
import { recordId } from '@/types';
import { trailImages } from '@/utils/imageUrl';
import { formatPrice } from '@/utils/format';
import { reverseGeocode } from '@/utils/mapbox';

const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: ReactElement },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

/** Full-screen quick view of the trail selected on the map; links to the shareable /trails/[id] page. */
const TrailInfo = () => {
  const {
    state: { trail },
    dispatch,
  } = useValue();
  const [splace, setSplace] = useState<string | null>(null);
  const [fplace, setFplace] = useState<string | null>(null);

  const handleClose = () => dispatch({ type: 'UPDATE_TRAIL', payload: null });

  useEffect(() => {
    if (!trail) return undefined;
    const controller = new AbortController();
    void reverseGeocode(trail.sloc, controller.signal).then((p) => !controller.signal.aborted && setSplace(p));
    void reverseGeocode(trail.floc, controller.signal).then((p) => !controller.signal.aborted && setFplace(p));
    return () => controller.abort();
  }, [trail]);

  return (
    <Dialog fullScreen open={Boolean(trail)} onClose={handleClose} slots={{ transition: Transition }}>
      <AppBar position="relative" color="primary">
        <Toolbar>
          <Typography variant="h6" component="h3" sx={{ ml: 2, flex: 1, fontWeight: 700 }}>
            {trail?.title}
          </Typography>
          {trail && (
            <Button
              color="inherit"
              component={Link}
              href={`/trails/${recordId(trail)}`}
              onClick={handleClose}
              endIcon={<OpenInNew />}
              sx={{ mr: 1 }}
            >
              Full page
            </Button>
          )}
          <IconButton color="inherit" aria-label="Close" onClick={handleClose}>
            <Close />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container sx={{ pt: 5, pb: 10 }}>
        <Swiper
          modules={[Navigation, Autoplay, EffectCoverflow, Zoom]}
          centeredSlides
          slidesPerView={1}
          grabCursor
          navigation
          autoplay={{ delay: 2500, disableOnInteraction: false }}
          zoom
          effect="coverflow"
          coverflowEffect={{ rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
          className="trail-swiper"
        >
          {trailImages(trail?.images).map((url) => (
            <SwiperSlide key={url}>
              <div className="swiper-zoom-container">
                {/* eslint-disable-next-line @next/next/no-img-element -- swiper zoom needs a plain img */}
                <img src={url} alt={trail?.title ?? ''} style={{ width: '100%', height: 'auto', objectFit: 'cover', borderRadius: 12 }} />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        <Stack sx={{ p: 3, gap: 3, bgcolor: '#F9F9F9', borderRadius: '12px', boxShadow: '0px 4px 10px rgba(0,0,0,0.1)', mt: 3 }}>
          <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="primary">
                Approx Cost:
              </Typography>
              <Typography variant="body1">{formatPrice(trail?.price)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={700} color="primary">
                Ratings:
              </Typography>
              <Rating value={trail?.rating ?? 3.5} precision={0.5} readOnly emptyIcon={<StarBorder />} />
            </Box>
          </Stack>
          <Stack direction="row" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="primary">
                Start Location:
              </Typography>
              <Typography variant="body1">{splace}</Typography>
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} color="primary">
                Final Location:
              </Typography>
              <Typography variant="body1">{fplace}</Typography>
            </Box>
          </Stack>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} color="primary">
              Description:
            </Typography>
            <Typography variant="body2" sx={{ color: '#555', whiteSpace: 'pre-line' }}>
              {trail?.description}
            </Typography>
          </Box>
        </Stack>
      </Container>
    </Dialog>
  );
};

export default TrailInfo;
