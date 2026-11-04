'use client';

import { Box, Button, Container, Paper, Typography } from '@mui/material';
import { Lock } from '@mui/icons-material';
import { useValue } from '@/context/ContextProvider';

const AccessMessage = () => {
  const { dispatch } = useValue();
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ color: 'text.secondary', mb: 1 }}>
          <Lock fontSize="large" />
        </Box>
        <Typography variant="h6" gutterBottom>
          Log in to continue
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          You need an account to use this page. Log in or create a free account — it only takes a minute.
        </Typography>
        <Button variant="contained" startIcon={<Lock />} onClick={() => dispatch({ type: 'OPEN_LOGIN' })}>
          Log in / Register
        </Button>
      </Paper>
    </Container>
  );
};

export default AccessMessage;
