import React from 'react';
import { Box, Paper, Typography, Grid, Divider, Button } from '@mui/material';
import {
  Settings as SettingsIcon,
  Storage as DBIcon,
  Cloud as CloudIcon,
  Input as InputIcon
} from '@mui/icons-material';

const Settings = () => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 4 }}>
        System Settings
      </Typography>

      <Paper className="glass-panel" sx={{ p: 4, background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)', maxWidth: 650 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <SettingsIcon sx={{ color: '#6366f1' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#f3f4f6' }}>
            System Configurations
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Box>
                <Typography variant="body1" sx={{ color: '#f3f4f6', fontWeight: 600 }}>Backend API Service Endpoint</Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>Active API URL serving data records</Typography>
              </Box>
              <Chip label={API_URL} sx={{ background: 'rgba(99, 102, 241, 0.05)', color: '#818cf8', fontWeight: 500 }} />
            </Box>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.04)', my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Box>
                <Typography variant="body1" sx={{ color: '#f3f4f6', fontWeight: 600 }}>PostgreSQL DB Cluster</Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>Database connection engine status</Typography>
              </Box>
              <Chip icon={<DBIcon style={{ fontSize: 14 }} />} label="CONNECTED" color="success" size="small" sx={{ fontWeight: 600 }} />
            </Box>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.04)', my: 2 }} />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
              <Box>
                <Typography variant="body1" sx={{ color: '#f3f4f6', fontWeight: 600 }}>AI Bio Generation Falling-Back</Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>OpenAI integration fallback system status</Typography>
              </Box>
              <Chip label="LOCAL TEMPLATES FALLBACK ENABLED" color="warning" size="small" sx={{ fontWeight: 600 }} />
            </Box>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.04)', my: 2 }} />
          </Grid>
          
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => alert("All system parameters are up-to-date.")}
              sx={{ borderColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', textTransform: 'none', borderRadius: '8px', '&:hover': { borderColor: '#6366f1', color: '#f3f4f6' } }}
            >
              Force Sync Config
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

import { Chip } from '@mui/material';

export default Settings;
