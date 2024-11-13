// src/utils/uploadFile.js

const uploadFile = async (file, userId) => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('userId', userId);

  const response = await fetch('http://localhost:5000/upload', {
    method: 'POST',
    body: formData,
  });
  

  if (!response.ok) {
    throw new Error('Failed to upload file');
  }

  const data = await response.json();
  return data.filePath;
};

export default uploadFile;