import React from 'react';
import { Box, Paper, Grid, Typography, Avatar, Divider, Chip } from '@mui/material';
import {
  Email as EmailIcon,
  Badge as BadgeIcon,
  Shield as ShieldIcon,
  CheckCircle as ActiveIcon,
  AccountCircle as UserIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <Box sx={{ py: 1 }}>
      <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 4 }}>
        My Profile
      </Typography>

      <Grid container spacing={4}>
        {/* Left Side: Avatar Details */}
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel" sx={{ p: 4, textAlign: 'center', background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
            <Avatar
              sx={{
                width: 100, height: 100, mx: 'auto', mb: 2,
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                fontSize: '2.5rem', fontWeight: 600
              }}
            >
              {user.first_name[0]}{user.last_name[0]}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6' }}>
              {user.first_name} {user.last_name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#818cf8', fontWeight: 500, mb: 2 }}>
              {user.role?.name || 'Employee'}
            </Typography>
            <Chip
              icon={<ActiveIcon style={{ color: '#10b981' }} />}
              label="Active Session"
              variant="outlined"
              sx={{ color: '#f3f4f6', borderColor: 'rgba(255,255,255,0.05)', background: 'rgba(16, 185, 129, 0.05)', fontWeight: 600 }}
            />
          </Paper>
        </Grid>

        {/* Right Side: Account Specifications */}
        <Grid item xs={12} md={8}>
          <Paper className="glass-panel" sx={{ p: 4, background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 3 }}>
              Account Settings & Permissions
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <UserIcon sx={{ color: '#6b7280' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>FULL NAME</Typography>
                    <Typography variant="body1" sx={{ color: '#f3f4f6', fontWeight: 500 }}>
                      {user.first_name} {user.last_name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <EmailIcon sx={{ color: '#6b7280' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>EMAIL ADDRESS</Typography>
                    <Typography variant="body1" sx={{ color: '#f3f4f6', fontWeight: 500 }}>
                      {user.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BadgeIcon sx={{ color: '#6b7280' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>USER ROLE ID</Typography>
                    <Typography variant="body1" sx={{ color: '#f3f4f6', fontWeight: 500 }}>
                      ROLE #{user.role_id} ({user.role?.name})
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <ShieldIcon sx={{ color: '#6b7280' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>ACCESS PERMISSIONS</Typography>
                    <Typography variant="body1" sx={{ color: '#818cf8', fontWeight: 600 }}>
                      {user.role?.name === 'Admin' ? 'FULL SYSTEM ACCESS' : user.role?.name === 'Manager' ? 'EMPLOYEE MANAGEMENT ACCESS' : 'READ ONLY DIRECTORY ACCESS'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.04)', my: 2 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ color: '#6b7280', mb: 1, fontWeight: 600 }}>
                  ROLE AUTHORIZATIONS EXPLAINED:
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af', lineHeight: 1.6, mb: 1 }}>
                  - <strong>Admin:</strong> Edit configurations, manage departments, modify records, delete employees, check audit logs, reset database seeds.
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af', lineHeight: 1.6, mb: 1 }}>
                  - <strong>Manager:</strong> Add, edit, delete employee profiles, manage office contact directories, generate AI bios.
                </Typography>
                <Typography variant="body2" sx={{ color: '#9ca3af', lineHeight: 1.6 }}>
                  - <strong>Employee:</strong> Read-only lists of departments, office contacts, employee directory profiles.
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
