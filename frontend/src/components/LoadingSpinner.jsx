import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        width: '100%',
        gap: 2,
        backdropFilter: 'blur(4px)',
      }}
    >
      <CircularProgress 
        thickness={4} 
        size={50}
        sx={{
          color: '#6366f1', // Glowing indigo
        }}
      />
      <Typography variant="body1" sx={{ color: '#9ca3af', fontWeight: 500 }}>
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingSpinner;
