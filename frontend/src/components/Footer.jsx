import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        background: 'transparent',
        borderTop: '1px solid rgba(255, 255, 255, 0.03)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1
      }}
    >
      <Typography variant="body2" sx={{ color: '#6b7280' }}>
        © {new Date().getFullYear()} Office Record Manager Pro. All rights reserved.
      </Typography>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <Link href="#" underline="none" sx={{ color: '#6b7280', '&:hover': { color: '#6366f1' }, fontSize: '0.875rem' }}>
          Privacy Policy
        </Link>
        <Link href="#" underline="none" sx={{ color: '#6b7280', '&:hover': { color: '#6366f1' }, fontSize: '0.875rem' }}>
          Terms of Service
        </Link>
        <Link href="#" underline="none" sx={{ color: '#6b7280', '&:hover': { color: '#6366f1' }, fontSize: '0.875rem' }}>
          Support
        </Link>
      </Box>
    </Box>
  );
};

export default Footer;
