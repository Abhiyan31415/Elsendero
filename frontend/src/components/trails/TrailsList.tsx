'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Avatar,
  Box,
  Card,
  CardActionArea,
  CircularProgress,
  Container,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  InputAdornment,
  Rating,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Hiking, Search, StarBorder } from '@mui/icons-material';
import { useValue } from '@/context/ContextProvider';
import { getTrails } from '@/actions/trail';
import { recordId } from '@/types';
import { toImageUrl, trailImages } from '@/utils/imageUrl';
import { formatPrice } from '@/utils/format';
import TrailImage from './TrailImage';

const TrailsList = () => {
  const {
    state: { filteredTrails },
    dispatch,
  } = useValue();
  const [searchQuery, setSearchQuery] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void getTrails(dispatch).finally(() => setLoaded(true));
  }, [dispatch]);

  const q = searchQuery.trim().toLowerCase();
  const visibleTrails = filteredTrails.filter((trail) => trail.title?.toLowerCase().includes(q));

  return (
    <Container sx={{ py: 4, pb: 10 }}>
      <Typography variant="h4" component="h1" color="primary" sx={{ mb: 3, textAlign: 'center' }}>
        Trails
      </Typography>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search trails by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          slotProps={{
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <Search sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            },
            htmlInput: { 'aria-label': 'Search trails by title' },
          }}
          sx={{ maxWidth: 600, '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: '#f9f9f9' } }}
        />
      </Box>

      {!loaded && filteredTrails.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress aria-label="Loading trails" />
        </Box>
      ) : (
        <ImageList
          gap={16}
          sx={{ mb: 6, gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))!important', overflow: 'hidden' }}
        >
          {visibleTrails.map((trail) => {
            const cover = trailImages(trail.images)[0];
            return (
              <Card
                key={recordId(trail)}
                elevation={3}
                sx={{
                  borderRadius: '16px',
                  overflow: 'hidden',
                  height: 380,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': { transform: 'scale(1.03)', boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)' },
                }}
              >
                <CardActionArea component={Link} href={`/trails/${recordId(trail)}`} sx={{ height: '100%' }}>
                  <ImageListItem sx={{ height: '100% !important', position: 'relative', bgcolor: 'grey.200' }}>
                    {cover ? (
                      <TrailImage src={cover} alt={trail.title} sizes="(max-width: 600px) 100vw, 33vw" />
                    ) : (
                      <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Hiking sx={{ fontSize: 64, color: 'grey.500' }} />
                      </Box>
                    )}
                    <ImageListItemBar
                      sx={{
                        background:
                          'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                      }}
                      title={
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff' }}>
                          {formatPrice(trail.price)}
                        </Typography>
                      }
                      actionIcon={
                        <Tooltip title={trail.uName}>
                          <Avatar src={toImageUrl(trail.uPhoto)} alt={trail.uName} sx={{ width: 36, height: 36, mr: 1 }}>
                            {trail.uName?.charAt(0).toUpperCase()}
                          </Avatar>
                        </Tooltip>
                      }
                      position="top"
                    />
                    <ImageListItemBar
                      sx={{ background: 'rgba(0,0,0,0.8)', color: '#fff' }}
                      title={
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600 }}>
                          {trail.title}
                        </Typography>
                      }
                      actionIcon={
                        <Rating
                          sx={{ color: '#ffd700', mr: 1 }}
                          value={trail.rating ?? 3.5}
                          precision={0.5}
                          readOnly
                          emptyIcon={<StarBorder sx={{ color: '#ffd700' }} />}
                        />
                      }
                    />
                  </ImageListItem>
                </CardActionArea>
              </Card>
            );
          })}
        </ImageList>
      )}

      {loaded && visibleTrails.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: 'text.secondary' }}>
          No trails found matching your search.
        </Typography>
      )}
    </Container>
  );
};

export default TrailsList;
