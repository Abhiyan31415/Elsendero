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
  components: {
    MuiAvatar: {
      // Google profile photos can refuse requests that carry a Referer header.
      defaultProps: { slotProps: { img: { referrerPolicy: 'no-referrer' } } },
    },
  },
});

export default theme;
