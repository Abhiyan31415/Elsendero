'use client';

import { Box, Drawer, IconButton, Typography, styled } from '@mui/material';
import { ChevronLeft } from '@mui/icons-material';
import { useValue } from '@/context/ContextProvider';
import PriceSlider from './PriceSlider';

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface Props {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar = ({ isOpen, setIsOpen }: Props) => {
  const { containerRef } = useValue();
  return (
    <Drawer variant="persistent" hideBackdrop open={isOpen}>
      <DrawerHeader>
        <Typography>Search the trails here</Typography>
        <IconButton aria-label="Close filters" onClick={() => setIsOpen(false)}>
          <ChevronLeft fontSize="large" />
        </IconButton>
      </DrawerHeader>
      <Box sx={{ width: { xs: '100vw', sm: 400 }, maxWidth: '100vw', p: 3 }}>
        {/* The map page mounts its geocoder input here. */}
        <Box ref={containerRef} />
        <PriceSlider />
      </Box>
    </Drawer>
  );
};

export default Sidebar;
