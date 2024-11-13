import {
    Avatar,
    Card,
    Container,
    ImageList,
    ImageListItem,
    ImageListItemBar,
    Rating,
    Tooltip,
  } from '@mui/material';
  import { useValue } from '../../context/ContextProvider';
  import { StarBorder } from '@mui/icons-material';
  import path from 'path';
  
  const TrailsInfo = () => {
    const {
      state: { filteredTrails },
    } = useValue();
    return (
      <Container>
        <ImageList
          gap={12}
          sx={{
            mb: 8,
            gridTemplateColumns:
              'repeat(auto-fill, minmax(280px, 1fr))!important',
          }}
        >
          {filteredTrails.map((trail) => (
            console.log(`${root}${trail.images[0][0]}`),
            <Card key={trail._id}>
              <ImageListItem sx={{ height: '100% !important', minHeight:'200px' }}>
                <ImageListItemBar
                  sx={{
                    background:
                      'linear-gradient(to bottom, rgba(0,0,0,0.7)0%, rgba(0,0,0,0.3)70%, rgba(0,0,0,0)100%)',
                  }}
                  title={trail.price === 0 ? 'Free Stay' : '$' + trail.price}
                  actionIcon={
                    <Tooltip title={trail.uName} sx={{ mr: '5px' }}>
                      <Avatar src={trail.uPhoto} />
                    </Tooltip>
                  }
                  position="top"
                />
                
                <img
                  src={`/api/images/${trail.images[0][0]}`}
                  alt={trail.title}
                  loading="lazy"
                  style={{ cursor: 'pointer' }}
                />
                <ImageListItemBar
                  title={trail.title}
                  actionIcon={
                    <Rating
                      sx={{ color: 'rgba(255,255,255, 0.8)', mr: '5px' }}
                      name="trail-rating"
                      defaultValue={3.5}
                      precision={0.5}
                      emptyIcon={
                        <StarBorder sx={{ color: 'rgba(255,255,255, 0.8)' }} />
                      }
                    />
                  }
                />
              </ImageListItem>
            </Card>
          ))}
        </ImageList>
      </Container>
    );
  };
  
  export default TrailsInfo;