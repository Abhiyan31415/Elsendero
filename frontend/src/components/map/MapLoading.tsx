import { Box, CircularProgress } from '@mui/material';

/** Placeholder while a client-only map chunk loads. */
const MapLoading = ({ height = 400 }: { height?: number | string }) => (
  <Box sx={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100' }}>
    <CircularProgress aria-label="Loading map" />
  </Box>
);

export default MapLoading;
