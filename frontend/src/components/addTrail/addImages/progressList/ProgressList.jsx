import { ImageList } from '@mui/material';
import React from 'react';
import ProgressItem from './ProgressItem';

const ProgressList = ({ files, userId, onUploadComplete }) => {
  return (
    <ImageList
      rowHeight={250}
      sx={{
        '&.MuiImageList-root': {
          gridTemplateColumns:
            'repeat(auto-fill, minmax(250px, 1fr))!important',
        },
      }}
    >
      {files.map((file, index) => (
        <ProgressItem file={file} key={index} userId={userId}/>
      ))}
    </ImageList>
  );
};

export default ProgressList;