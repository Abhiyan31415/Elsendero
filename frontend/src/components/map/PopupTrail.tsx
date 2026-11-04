'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { Box, Button, Card, ImageListItem, ImageListItemBar } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { useValue } from '@/context/ContextProvider';
import { recordId, type Trail } from '@/types';
import { trailImages } from '@/utils/imageUrl';
import { formatPrice } from '@/utils/format';

const PopupTrail = ({ trail }: { trail: Trail }) => {
  const { dispatch } = useValue();
  const { title, description, price, images } = trail;
  const urls = trailImages(images);

  return (
    <Card sx={{ maxWidth: 400 }}>
      <ImageListItem sx={{ display: 'block' }}>
        <ImageListItemBar
          sx={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.7)0%, rgba(0,0,0,0.3)70%, rgba(0,0,0,0)100%)',
            zIndex: 2,
          }}
          title={formatPrice(price)}
          position="top"
        />
        <ImageListItemBar
          title={title}
          subtitle={description.length > 30 ? `${description.slice(0, 30)}...` : description}
          sx={{ zIndex: 2 }}
          actionIcon={
            <Button
              component={Link}
              href={`/trails/${recordId(trail)}`}
              size="small"
              sx={{ color: 'white', mr: 1 }}
            >
              Details
            </Button>
          }
        />
        <Swiper
          modules={[Pagination, Autoplay]}
          autoplay={{ delay: 2000 }}
          pagination={{ clickable: true }}
          style={
            {
              '--swiper-pagination-color': 'rgba(255,255,255,0.8)',
              '--swiper-pagination-bullet-inactive-color': '#fff',
              '--swiper-pagination-bullet-inactive-opacity': '0.5',
              zIndex: 1,
            } as CSSProperties
          }
        >
          {urls.map((url) => (
            <SwiperSlide key={url}>
              <Box
                component="img"
                src={url}
                alt={title}
                sx={{ height: 255, display: 'block', width: '100%', overflow: 'hidden', cursor: 'pointer', objectFit: 'cover' }}
                onClick={() => dispatch({ type: 'UPDATE_TRAIL', payload: trail })}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </ImageListItem>
    </Card>
  );
};

export default PopupTrail;
