import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box, Toolbar } from '@mui/material';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import EmployeeDetails from './pages/EmployeeDetails';
import EmployeeForm from './pages/EmployeeForm';
import Departments from './pages/Departments';
import Contacts from './pages/Contacts';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Todos from './pages/Todos';
import NotFound from './pages/NotFound';

// Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Theme configuration
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#06b6d4' }, // Digital Cyan
    secondary: { main: '#8b5cf6' }, // Cyber Purple
    background: {
      default: '#030712', // Void Black
      paper: 'rgba(17, 24, 39, 0.75)', // Glassmorphic translucent panel
    },
    text: {
      primary: '#f3f4f6',
      secondary: '#9ca3af',
    },
  },
  typography: {
    fontFamily: "'Space Grotesk', 'Outfit', sans-serif",
    h5: { fontWeight: 700, letterSpacing: '-0.02em' },
    h6: { fontWeight: 700, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    body1: { fontSize: '0.925rem' },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 0 12px rgba(6, 182, 212, 0.25)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(17, 24, 39, 0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: 12,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '& fieldset': {
            borderColor: 'rgba(255, 255, 255, 0.05)',
          },
          '&:hover fieldset': {
            borderColor: 'rgba(6, 182, 212, 0.35) !important',
          },
          '&.Mui-focused fieldset': {
            borderColor: '#06b6d4 !important',
            boxShadow: '0 0 10px rgba(6, 182, 212, 0.15)',
          },
        },
      },
    },
  },
});

// Guard Component for Private Routes
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, hasRole } = useAuth();

  if (loading) return null; // Wait for session load

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Main Layout Coordinator
const MainLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: 'transparent' }}>
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, sm: 4 },
          width: { md: `calc(100% - 260px)` },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Navbar handleDrawerToggle={handleDrawerToggle} />
        {/* Adds padding below navbar */}
        <Box sx={{ flexGrow: 1, mt: 3, display: 'flex', flexDirection: 'column' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            
            {/* Employee Routes */}
            <Route path="/employees" element={<Employees />} />
            <Route 
              path="/employees/add" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                  <EmployeeForm />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/employees/edit/:id" 
              element={
                <ProtectedRoute allowedRoles={['Admin', 'Manager']}>
                  <EmployeeForm />
                </ProtectedRoute>
              } 
            />
            <Route path="/employees/:id" element={<EmployeeDetails />} />

            {/* Department Routes */}
            <Route path="/departments" element={<Departments />} />

            {/* Contact Routes */}
            <Route path="/contacts" element={<Contacts />} />

            {/* Account Info */}
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />

            {/* Todos Route */}
            <Route path="/todos" element={<Todos />} />

            {/* 404 Route fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Box>
        <Footer />
      </Box>
    </Box>
  );
};

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Independent clean login route */}
            <Route path="/login" element={<Login />} />
            
            {/* Protected shell layout */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
