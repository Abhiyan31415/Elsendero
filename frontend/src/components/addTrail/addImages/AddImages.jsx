import { Paper } from '@mui/material';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import ImagesList from './ImagesList';
import { useValue } from '../../../context/ContextProvider';
import uploadFile from '../../../firebase/uploadFile';
function AddImages() {
  const { state:{currentUser},dispatch } = useValue();
  const onDrop = useCallback((acceptedFiles) => {
    const uploadPromises = acceptedFiles.map(async (file) => {
      try {
        const imageUrl = await uploadFile(file, `trails/${currentUser?.id}`);
        dispatch({ type: 'UPDATE_IMAGES', payload: imageUrl });
      } catch (error) {
        console.error(error);
        dispatch({
          type: 'UPDATE_ALERT',
          payload: { open: true, severity: 'error', message: error.message || 'Image upload failed' },
        });
      }
    });

    Promise.all(uploadPromises)
      .then(() => {
        console.log('All files uploaded successfully');
      })
      .catch((error) => {
        console.error('Error uploading files:', error);
      });
  }, [currentUser, dispatch]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },

  });

  return (
    <>
      <Paper
        sx={{
          cursor: 'pointer',
          background: '#fafafa',
          color: '#333',
          border: '1px dashed #ccc',
          '&:hover': { border: '1px solid #ccc' },
        }}
      >
        <div style={{ padding: '16px' }} {...getRootProps()}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p style={{ color: 'green' }}>Drop the files here ...</p>
          ) : (
            <p>Drag and drop some files here, or click to select files</p>
          )}
          <em>(images with .jpg, .png , .jpeg will be accepted)</em>
        </div>
      </Paper>
      <ImagesList />
    </>
  );
}

export default AddImages;