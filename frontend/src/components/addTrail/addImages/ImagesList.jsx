import React from 'react';
import { Cancel } from '@mui/icons-material';
import { IconButton, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import { useValue } from '../../../context/ContextProvider';

function ImagesList() {
  const { state: { images, currentUser }, dispatch } = useValue();

  const handleDelete = (image) => {
    // Implement delete functionality
  };

  return (
    <ImageList
      rowHeight={250}
      sx={{
        '&.MuiImageList-root': {
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))!important',
        },
      }}
    >
      {images.map((image, index) => (
        <ImageListItem key={index} cols={1} rows={1}>
          <img src={image} alt='rooms' loading='lazy' style={{ height: '100%' }} />
          <ImageListItemBar
            position='top'
            sx={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
            }}
            actionIcon={
              <IconButton
                sx={{ color: 'white' }}
                onClick={() => handleDelete(image)}
              >
                <Cancel />
              </IconButton>
            }
          />
        </ImageListItem>
      ))}
    </ImageList>
  );
}

export default ImagesList;