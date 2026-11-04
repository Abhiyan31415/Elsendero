'use client';

import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Avatar, InputAdornment, TextField, type TextFieldProps } from '@mui/material';
import { Check } from '@mui/icons-material';
import { useValue } from '@/context/ContextProvider';

interface Props {
  name: 'title' | 'description';
  label: string;
  value: string;
  minLength: number;
  optionalProps?: Partial<TextFieldProps>;
}

/** Text field that validates its length shortly after the user stops typing. */
function InfoField({ name, label, value, minLength, optionalProps = {} }: Props) {
  const { dispatch } = useValue();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const next = e.target.value;
    dispatch({ type: 'UPDATE_DETAILS', payload: { [name]: next } });
    setEditing(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setEditing(false);
      const ok = next.length >= minLength;
      setError(!ok);
      setSuccess(ok);
    }, 1000);
  };

  return (
    <TextField
      name={name}
      label={label}
      value={value}
      {...optionalProps}
      error={error}
      helperText={error ? `This field must be ${minLength} characters or more` : undefined}
      color={success ? 'success' : 'primary'}
      variant="outlined"
      onChange={handleChange}
      required
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              {editing ? (
                <Avatar src="/icons/progress.svg" alt="" sx={{ height: 40, width: 40, bgcolor: 'transparent' }} />
              ) : (
                success && <Check color="success" />
              )}
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export default InfoField;
