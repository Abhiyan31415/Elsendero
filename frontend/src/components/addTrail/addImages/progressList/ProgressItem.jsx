import React, { useEffect, useState } from 'react';
import { ImageListItem, Box } from '@mui/material';
import CircularProgressWithLabel from './CircularProgressWithLabel';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import uploadFile from '../../../../firebase/uploadFile';
import { useValue } from '../../../../context/ContextProvider';

const ProgressItem = ({ file, userId, onUploadComplete }) => {
  const [imageURL, setImageURL] = useState(null);
  const [progress, setProgress] = useState(0);
  const {state:{currentUser}}=useValue();
  
  useEffect(() => {
    const uploadImage = async () => {
      try {
        
        const filePath = await uploadFile(file, currentUser.id);
        
        setImageURL(`http://localhost:5000${filePath}`);
        setProgress(100);
        onUploadComplete();
      } catch (error) {
        console.error(error);
      }
    };

    setImageURL(URL.createObjectURL(file));
    uploadImage();
  }, [file, userId, onUploadComplete]);

  return (
    imageURL && (
      <ImageListItem cols={1} rows={1}>
        <img src={imageURL} alt="gallery" loading="lazy" />
        <Box sx={{ position: 'relative' }}>
          {progress < 100 ? (
            <CircularProgressWithLabel value={progress} />
          ) : (
            <CheckCircleOutline
              sx={{ width: 60, height: 60, color: 'lightgreen' }}
            />
          )}
        </Box>
      </ImageListItem>
    )
  );
};

export default ProgressItem;