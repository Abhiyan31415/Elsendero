'use client';

import { Cancel } from '@mui/icons-material';
import { IconButton, ImageList, ImageListItem, ImageListItemBar } from '@mui/material';
import { useValue } from '@/context/ContextProvider';
import { toImageUrl } from '@/utils/imageUrl';

function ImagesList() {
  const {
    state: { images },
    dispatch,
  } = useValue();

  return (
    <ImageList
      rowHeight={250}
      sx={{ '&.MuiImageList-root': { gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))!important' } }}
    >
      {images.map((image) => (
        <ImageListItem key={image} cols={1} rows={1}>
          {/* eslint-disable-next-line @next/next/no-img-element -- just-uploaded preview from any host */}
          <img src={toImageUrl(image)} alt="Trail upload" loading="lazy" style={{ height: '100%', objectFit: 'cover' }} />
          <ImageListItemBar
            position="top"
            sx={{
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)',
            }}
            actionIcon={
              <IconButton
                aria-label="Remove image"
                sx={{ color: 'white' }}
                onClick={() => dispatch({ type: 'DELETE_IMAGE', payload: image })}
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
