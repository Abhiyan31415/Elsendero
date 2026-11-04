'use client';

import { createTheme } from '@mui/material/styles';

export const BRAND_GREEN = '#06402b';

const theme = createTheme({
  palette: {
    primary: { main: BRAND_GREEN, contrastText: '#ffffff' },
    secondary: { main: '#c27c0e' },
  },
  typography: {
    fontFamily: 'Roboto, "Helvetica Neue", Arial, "Noto Sans Devanagari", sans-serif',
  },
  shape: { borderRadius: 8 },
});

export default theme;
