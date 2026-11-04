'use client';

import { useState } from 'react';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField, type TextFieldProps } from '@mui/material';

type Props = Omit<TextFieldProps, 'type' | 'variant'> & { id?: string; label?: string };

/** MUI TextField for passwords with a show/hide toggle. Extra props go to TextField. */
function PasswordField({ id = 'password', label = 'Password', autoComplete = 'current-password', ...props }: Props) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <TextField
      margin="normal"
      variant="standard"
      fullWidth
      required
      {...props}
      id={id}
      name={id}
      label={label}
      autoComplete={autoComplete}
      type={showPassword ? 'text' : 'password'}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword((s) => !s)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
                tabIndex={-1}
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export default PasswordField;
