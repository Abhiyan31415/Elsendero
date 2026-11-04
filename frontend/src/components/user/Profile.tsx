'use client';

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { Close, PhotoCamera } from '@mui/icons-material';
import { updateProfile } from '@/actions/user';
import { checkImageFile } from '@/actions/upload';
import { useValue } from '@/context/ContextProvider';
import { toImageUrl } from '@/utils/imageUrl';
import { validateName } from './validation';

function Profile() {
  const {
    state: { profile, currentUser, loading },
    dispatch,
  } = useValue();
  const [name, setName] = useState(currentUser?.name || '');
  const [nameError, setNameError] = useState('');
  const [fileError, setFileError] = useState('');

  // Reset the form each time the dialog opens.
  useEffect(() => {
    if (profile.open) {
      setName(currentUser?.name || '');
      setNameError('');
      setFileError('');
    }
  }, [profile.open, currentUser?.name]);

  // Free object URLs created for previews.
  useEffect(() => {
    const url = profile.photoURL;
    return () => {
      if (url?.startsWith('blob:')) URL.revokeObjectURL(url);
    };
  }, [profile.photoURL]);

  if (!currentUser) return null;

  const handleClose = () => {
    if (loading) return;
    dispatch({ type: 'UPDATE_PROFILE', payload: { open: false, file: null, photoURL: currentUser.photoURL || '' } });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const err = checkImageFile(file);
    if (err) {
      setFileError(err);
      return;
    }
    setFileError('');
    dispatch({ type: 'UPDATE_PROFILE', payload: { ...profile, file, photoURL: URL.createObjectURL(file) } });
  };

  const trimmed = name.trim();
  const unchanged = trimmed === currentUser.name && !profile.file;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validateName(name);
    setNameError(err);
    if (err || unchanged) return;
    void updateProfile(currentUser, { name: trimmed, file: profile.file }, dispatch);
  };

  return (
    <Dialog open={profile.open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>
        Profile
        <IconButton
          aria-label="Close"
          sx={{ position: 'absolute', top: 8, right: 8, color: (theme) => theme.palette.grey[500] }}
          onClick={handleClose}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <form onSubmit={handleSubmit} noValidate>
        <DialogContent sx={{ pt: 0 }}>
          <DialogContentText>Update your name or profile photo.</DialogContentText>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', my: 2 }}>
            <label htmlFor="profilePhoto" style={{ cursor: 'pointer', position: 'relative' }}>
              <input
                accept="image/jpeg,image/png,image/webp"
                id="profilePhoto"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <Avatar src={toImageUrl(profile.photoURL || currentUser.photoURL)} sx={{ width: 80, height: 80 }}>
                {currentUser.name?.charAt(0).toUpperCase()}
              </Avatar>
              <PhotoCamera
                fontSize="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'background.paper',
                  borderRadius: '50%',
                  p: '2px',
                  boxShadow: 1,
                }}
              />
            </label>
            <Typography variant="caption" color={fileError ? 'error' : 'text.secondary'} sx={{ mt: 1 }}>
              {fileError || 'Click the photo to change it'}
            </Typography>
          </Box>
          <TextField
            autoFocus
            margin="dense"
            variant="standard"
            id="name"
            name="name"
            label="Name"
            autoComplete="name"
            fullWidth
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError(validateName(e.target.value));
            }}
            error={Boolean(nameError)}
            helperText={nameError || ' '}
          />
          <TextField margin="dense" variant="standard" label="Email" fullWidth value={currentUser.email || ''} disabled />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading || unchanged}>
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default Profile;
