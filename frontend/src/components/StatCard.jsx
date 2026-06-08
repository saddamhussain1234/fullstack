import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';

const StatCard = ({ title, value, icon, color = '#6366f1', trend }) => {
  return (
    <Card
      className="glass-card"
      sx={{
        overflow: 'visible',
        height: '100%',
        position: 'relative',
        background: 'rgba(23, 27, 34, 0.4)',
        borderColor: 'rgba(255, 255, 255, 0.04)',
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="subtitle2" sx={{ color: '#9ca3af', fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color: '#f3f4f6', fontWeight: 700, mb: 1 }}>
              {value}
            </Typography>
            {trend && (
              <Typography variant="caption" sx={{ color: trend.startsWith('-') ? '#f43f5e' : '#10b981', fontWeight: 600 }}>
                {trend} <span style={{ color: '#6b7280', fontWeight: 400 }}>vs last month</span>
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.15)`,
              border: `1px solid rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.3)`,
              color: color,
              boxShadow: `0 8px 16px -6px rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.2)`
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatCard;
