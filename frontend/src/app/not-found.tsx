'use client';

import Link from 'next/link';
import { Box, Button, Container, Typography } from '@mui/material';

export default function NotFound() {
  return (
    <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
      <Typography variant="h2" component="h1" color="primary" gutterBottom>
        404
      </Typography>
      <Typography variant="h5" component="p" gutterBottom>
        This trail went off the map.
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        The page you are looking for doesn&apos;t exist or has been removed.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button variant="contained" component={Link} href="/map">
          Back to the map
        </Button>
        <Button variant="outlined" component={Link} href="/trails">
          Browse trails
        </Button>
      </Box>
    </Container>
  );
}
