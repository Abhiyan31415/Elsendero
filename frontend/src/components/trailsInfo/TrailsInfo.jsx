import React, { useState } from 'react';
import {
  Avatar,
  Card,
  Container,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Rating,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  Box,
} from '@mui/material';
import { Search, StarBorder } from '@mui/icons-material';
import { useValue } from '../../context/ContextProvider';

const TrailsInfo = () => {
  const {
    state: { filteredTrails },
    dispatch,
  } = useValue();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter trails based on the search query
  const visibleTrails = filteredTrails.filter((trail) =>
    trail.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container sx={{ py: 4 }}>
      {/* Search Bar */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search trails by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Search sx={{ color: '#757575' }} />
              </InputAdornment>
            ),
          }}
          sx={{
            maxWidth: 600,
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px',
              backgroundColor: '#f9f9f9',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
            },
          }}
        />
      </Box>

      {/* Trails List */}
      <ImageList
        gap={16}
        sx={{
          mb: 6,
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))!important',
          overflow: 'hidden',
        }}
      >
        {visibleTrails.map((trail) => (
          <Card
            key={trail._id}
            elevation={3}
            sx={{
              borderRadius: '16px',
              overflow: 'hidden',
              height: 380, // Consistent card height
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.3s, box-shadow 0.3s',
              '&:hover': {
                transform: 'scale(1.05)',
                boxShadow: '0px 10px 20px rgba(0, 0, 0, 0.2)',
              },
            }}
          >
            <ImageListItem
              sx={{
                height: '100%',
                flexGrow: 1, // Ensures the image takes up available space
              }}
            >
              <ImageListItemBar
                sx={{
                  background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
                }}
                title={
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#fff' }}>
                    {trail.price === 0 ? 'Free Stay' : `$${trail.price}`}
                  </Typography>
                }
                actionIcon={
                  <Tooltip title={trail.uName} sx={{ mr: '5px' }}>
                    <Avatar src={trail.uPhoto} sx={{ width: 36, height: 36 }} />
                  </Tooltip>
                }
                position="top"
              />
              <img
                src={trail.images[0][0]}
                alt={trail.title}
                loading="lazy"
                style={{
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover', // Ensures the image covers the container
                }}
                onClick={() => dispatch({ type: 'UPDATE_TRAIL', payload: trail })}
              />
              <ImageListItemBar
                sx={{
                  background: 'rgba(0,0,0,0.8)',
                  color: '#fff',
                }}
                title={
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {trail.title}
                  </Typography>
                }
                actionIcon={
                  <Rating
                    sx={{ color: '#ffd700', mr: '8px' }}
                    name="trail-rating"
                    defaultValue={trail.rating || 3.5}
                    precision={0.5}
                    emptyIcon={<StarBorder sx={{ color: '#ffd700' }} />}
                  />
                }
              />
            </ImageListItem>
          </Card>
        ))}
      </ImageList>

      {/* No Results Message */}
      {visibleTrails.length === 0 && (
        <Typography variant="h6" sx={{ textAlign: 'center', mt: 4, color: '#757575' }}>
          No trails found matching your search.
        </Typography>
      )}
    </Container>
  );
};

export default TrailsInfo;
