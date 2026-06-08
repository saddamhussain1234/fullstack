import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography, Avatar, Divider, Chip, Button } from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  ContactPhone as ContactPhoneIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  AssignmentTurnedIn as TodoIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems = [
    { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
    { text: 'Employees', path: '/employees', icon: <PeopleIcon /> },
    { text: 'Departments', path: '/departments', icon: <BusinessIcon /> },
    { text: 'Contacts', path: '/contacts', icon: <ContactPhoneIcon /> },
    { text: 'Todos', path: '/todos', icon: <TodoIcon /> },
    { text: 'Profile', path: '/profile', icon: <AccountCircleIcon /> },
    { text: 'Settings', path: '/settings', icon: <SettingsIcon /> },
  ];

  // Role color helper
  const getRoleColor = (roleName) => {
    switch (roleName) {
      case 'Admin': return 'error';
      case 'Manager': return 'warning';
      default: return 'primary';
    }
  };

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'rgba(10, 11, 14, 0.95)', borderRight: '1px solid rgba(255,255,255,0.03)' }}>
      {/* Brand Logo Header */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          width: 32, height: 32, borderRadius: '8px', 
          background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 0 12px rgba(6, 182, 212, 0.4)'
        }}>
          <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>Æ</Typography>
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.5, color: '#f3f4f6', fontSize: '1.15rem' }}>
          Aether<span style={{ color: '#06b6d4' }}>AI</span>
        </Typography>
      </Box>
      
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)' }} />
 
      {/* Logged in User Profile Info */}
      {user && (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <Avatar 
            className="pulse-avatar-cyan"
            sx={{ 
              width: 64, height: 64, mb: 1.5, 
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              fontSize: '1.5rem', fontWeight: 600,
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.2)'
            }}
          >
            {user.first_name[0]}{user.last_name[0]}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#f3f4f6' }}>
            {user.first_name} {user.last_name}
          </Typography>
          <Typography variant="body2" sx={{ color: '#9ca3af', mb: 1, fontSize: '0.8rem' }}>
            {user.email}
          </Typography>
          <Chip 
            label={user.role?.name || 'Employee'} 
            color={getRoleColor(user.role?.name)} 
            size="small" 
            sx={{ fontWeight: 600, px: 1, height: 20, fontSize: '0.7rem' }}
          />
        </Box>
      )}
 
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)', mb: 2 }} />
 
      {/* Navigation Links */}
      <List sx={{ px: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={handleDrawerToggle ? () => handleDrawerToggle() : undefined}
              className={({ isActive }) => isActive ? 'active-nav-item' : ''}
              sx={{
                borderRadius: '8px',
                color: '#9ca3af',
                '&:hover': {
                  background: 'rgba(6, 182, 212, 0.04)',
                  color: '#f3f4f6',
                  '& .MuiListItemIcon-root': { color: '#f3f4f6' }
                },
                '&.active-nav-item .MuiListItemIcon-root': { color: '#06b6d4' }
              }}
            >
              <ListItemIcon sx={{ color: '#6b7280', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* Logout Action */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            justifyContent: 'flex-start',
            borderColor: 'rgba(255,255,255,0.05)',
            color: '#9ca3af',
            textTransform: 'none',
            borderRadius: '8px',
            py: 1,
            px: 2.5,
            '&:hover': {
              borderColor: '#f43f5e',
              background: 'rgba(244, 63, 94, 0.05)',
              color: '#f43f5e'
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
      >
        {drawerContent}
      </Drawer>
      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
