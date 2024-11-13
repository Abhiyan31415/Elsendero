import { Paper } from '@mui/material';
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import ProgressList from './progressList/ProgressList';
import ImagesList from './ImagesList';
import { useValue } from '../../../context/ContextProvider';

function AddImages({ userId }) {
  const [files, setFiles] = useState([]);
  const { state:{images},dispatch } = useValue();
  const onDrop = useCallback((acceptedFiles) => {
    setFiles(acceptedFiles);
    const fileNames = acceptedFiles.map(file => file.name);
    dispatch({ type: 'UPDATE_IMAGES', payload: fileNames });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },

  });

  const handleUploadComplete = () => {
    setFiles([]);
    
  };

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
      <ProgressList files={files} userId={userId} onUploadComplete={handleUploadComplete} />
      <ImagesList />
    </>
  );
}

export default AddImages;