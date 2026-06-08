import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, Typography, Box, Badge, Menu, MenuItem, MenuItem as DropdownItem, Avatar, Divider, Popover, List, ListItem, ListItemText } from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  AccountCircle,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ handleDrawerToggle }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // State for user profile dropdown
  const [anchorEl, setAnchorEl] = useState(null);
  // State for notifications popover
  const [notifAnchorEl, setNotifAnchorEl] = useState(null);

  const handleProfileMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleProfileMenuClose = () => setAnchorEl(null);

  const handleNotifOpen = (event) => setNotifAnchorEl(event.currentTarget);
  const handleNotifClose = () => setNotifAnchorEl(null);

  const handleLogout = async () => {
    handleProfileMenuClose();
    await logout();
    navigate('/login');
  };

  // Determine page title based on path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/employees/add')) return 'Add Employee';
    if (path.startsWith('/employees/edit')) return 'Edit Employee';
    if (path.startsWith('/employees/')) return 'Employee Profile';
    if (path.startsWith('/employees')) return 'Employee Directory';
    if (path.startsWith('/departments')) return 'Departments';
    if (path.startsWith('/contacts')) return 'Office Contacts';
    if (path.startsWith('/todos')) return 'My Tasks / Todo List';
    if (path.startsWith('/profile')) return 'My Profile';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Office Record Manager Pro';
  };

  // Mock Notifications
  const notifications = [
    { id: 1, title: 'New Employee Joined', desc: 'Sarah Connor joined Technology dept.', time: '10 mins ago' },
    { id: 2, title: 'System Update Completed', desc: 'FastAPI backend updated to v1.0.0.', time: '2 hours ago' },
    { id: 3, title: 'Department Limit Reached', desc: 'Finance department has reached warning limit.', time: '1 day ago' },
  ];

  return (
    <AppBar
      position="sticky"
      sx={{
        background: 'rgba(10, 11, 13, 0.75)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
        boxShadow: 'none',
        color: '#f3f4f6',
        width: '100%'
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Mobile hamburger menu */}
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography variant="h6" noWrap sx={{ fontWeight: 700, color: '#f3f4f6' }}>
            {getPageTitle()}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Notification Icon and Popover */}
          <IconButton color="inherit" onClick={handleNotifOpen}>
            <Badge badgeContent={notifications.length} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          <Popover
            open={Boolean(notifAnchorEl)}
            anchorEl={notifAnchorEl}
            onClose={handleNotifClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                width: 300,
                background: '#171b22',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#f3f4f6',
                p: 1.5,
                borderRadius: '8px'
              }
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: '#818cf8' }}>
              Notifications
            </Typography>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', mb: 1 }} />
            <List sx={{ p: 0 }}>
              {notifications.map((n) => (
                <ListItem key={n.id} disablePadding sx={{ py: 1, display: 'block' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                    {n.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', fontSize: '0.75rem', mb: 0.5 }}>
                    {n.desc}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', fontSize: '0.7rem' }}>
                    {n.time}
                  </Typography>
                  {n.id !== notifications.length && <Divider sx={{ borderColor: 'rgba(255,255,255,0.03)', mt: 1 }} />}
                </ListItem>
              ))}
            </List>
          </Popover>

          {/* User Avatar & Menu */}
          {user && (
            <IconButton onClick={handleProfileMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                {user.first_name[0]}{user.last_name[0]}
              </Avatar>
            </IconButton>
          )}

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            PaperProps={{
              sx: {
                background: '#171b22',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                color: '#f3f4f6',
                minWidth: 160,
                mt: 1,
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                '& .MuiMenuItem-root': {
                  fontSize: '0.875rem',
                  py: 1,
                  px: 2,
                  gap: 1.5,
                  '&:hover': {
                    background: 'rgba(255,255,255,0.03)',
                  }
                }
              }
            }}
          >
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
              <AccountCircle fontSize="small" sx={{ color: '#9ca3af' }} /> Profile
            </MenuItem>
            <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
              <SettingsIcon fontSize="small" sx={{ color: '#9ca3af' }} /> Settings
            </MenuItem>
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)' }} />
            <MenuItem onClick={handleLogout} sx={{ color: '#f43f5e', '&:hover': { background: 'rgba(244, 63, 94, 0.05) !important' } }}>
              <LogoutIcon fontSize="small" /> Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
