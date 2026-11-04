'use client';

import { Box, Button, Drawer, IconButton, Typography, styled } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { useValue } from '@/context/ContextProvider';
import PriceSlider from './PriceSlider';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1, 0, 3),
  ...theme.mixins.toolbar,
}));

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: Props) => {
  const {
    containerRef,
    state: { priceFilter, addressFilter, trails, filteredTrails },
    dispatch,
  } = useValue();
  const active = priceFilter !== null || addressFilter !== null;

  return (
    <Drawer variant="persistent" hideBackdrop open={isOpen}>
      <DrawerHeader>
        <Typography variant="h6" component="h2">
          Filters
        </Typography>
        <IconButton aria-label="Close filters" onClick={() => setIsOpen(false)}>
          <ChevronLeft fontSize="large" />
        </IconButton>
      </DrawerHeader>
      <Box sx={{ width: { xs: '100vw', sm: 360 }, maxWidth: '100vw', px: 3, pb: 3, boxSizing: 'border-box' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Near a place
        </Typography>
        {/* The map page mounts its geocoder input here. */}
        <Box ref={containerRef} sx={{ '& .mapboxgl-ctrl-geocoder': { width: '100%', maxWidth: 'none', boxShadow: 1 } }} />
        <PriceSlider />
        <Box sx={{ mt: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary" aria-live="polite">
            Showing {filteredTrails.length} of {trails.length} trails
          </Typography>
          <Button onClick={() => dispatch({ type: 'RESET_FILTERS' })} disabled={!active}>
            Reset
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
