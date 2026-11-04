import { Alert, Box } from '@mui/material';

/** Shown instead of a map when NEXT_PUBLIC_MAPBOX_TOKEN is not configured. */
const MissingTokenNotice = () => (
  <Box sx={{ p: 3 }}>
    <Alert severity="warning">
      The map is unavailable: <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> is not configured.
    </Alert>
  </Box>
);

export default MissingTokenNotice;
