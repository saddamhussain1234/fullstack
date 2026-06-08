import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        p: 3
      }}
    >
      <Typography variant="h1" sx={{ fontWeight: 800, fontSize: { xs: '6rem', sm: '10rem' }, background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', mb: 2 }}>
        404
      </Typography>
      <Typography variant="h5" sx={{ color: '#f3f4f6', fontWeight: 600, mb: 1 }}>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ color: '#9ca3af', mb: 4, maxWidth: 450 }}>
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </Typography>
      <Button
        variant="contained"
        startIcon={<HomeIcon />}
        onClick={() => navigate('/')}
        sx={{
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          textTransform: 'none', fontWeight: 600, px: 4, py: 1.2, borderRadius: '8px'
        }}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default NotFound;
