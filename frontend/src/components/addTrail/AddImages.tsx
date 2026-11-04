'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type FileRejection } from 'react-dropzone';
import { Box, LinearProgress, Paper, Typography } from '@mui/material';
import { useValue } from '@/context/ContextProvider';
import { MAX_IMAGE_BYTES, MAX_IMAGE_MB, uploadImage } from '@/actions/upload';
import ImagesList from './ImagesList';

function AddImages() {
  const {
    state: { currentUser },
    dispatch,
  } = useValue();
  const [uploading, setUploading] = useState(0);

  const onDrop = useCallback(
    async (acceptedFiles: File[], rejections: FileRejection[]) => {
      if (rejections.length) {
        dispatch({
          type: 'UPDATE_ALERT',
          payload: {
            open: true,
            severity: 'error',
            message: `${rejections.length} file(s) skipped: only JPEG, PNG or WebP images up to ${MAX_IMAGE_MB} MB are allowed`,
          },
        });
      }
      if (!currentUser?.token || acceptedFiles.length === 0) return;
      setUploading((n) => n + acceptedFiles.length);
      await Promise.all(
        acceptedFiles.map(async (file) => {
          try {
            const url = await uploadImage(file, currentUser.token, dispatch);
            if (url) dispatch({ type: 'UPDATE_IMAGES', payload: url });
          } finally {
            setUploading((n) => n - 1);
          }
        }),
      );
    },
    [currentUser, dispatch],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxSize: MAX_IMAGE_BYTES,
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
        <Box sx={{ p: 2 }} {...getRootProps()}>
          <input {...getInputProps()} aria-label="Upload trail images" />
          {isDragActive ? (
            <Typography color="success.main">Drop the files here ...</Typography>
          ) : (
            <Typography>Drag and drop some files here, or click to select files</Typography>
          )}
          <Typography variant="caption" component="em">
            (JPEG, PNG or WebP, up to {MAX_IMAGE_MB} MB each)
          </Typography>
        </Box>
      </Paper>
      {uploading > 0 && (
        <Box sx={{ my: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Uploading {uploading} image(s)…
          </Typography>
          <LinearProgress />
        </Box>
      )}
      <ImagesList />
    </>
  );
}

export default AddImages;
