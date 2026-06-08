import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Card, CardContent, TextField, Button, Typography, Alert, InputAdornment, IconButton, CircularProgress, Divider } from '@mui/material';
import { Email, Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to dashboard
    if (user) {
      navigate('/');
    }
    // Check if redirect due to expired session
    if (searchParams.get('session_expired') === 'true') {
      setSessionExpired(true);
    }
  }, [user, navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSessionExpired(false);

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, rgba(6, 182, 212, 0.15) 0%, rgba(3, 7, 18, 1) 70%)',
        p: 2
      }}
    >
      <Card
        className="glass-panel header-grid-panel"
        sx={{
          width: '100%',
          maxWidth: 420,
          background: 'rgba(17, 24, 39, 0.75)',
          borderColor: 'rgba(6, 182, 212, 0.1)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 0 30px rgba(6, 182, 212, 0.05)',
          overflow: 'visible',
          position: 'relative'
        }}
      >
        {/* Glow effect background */}
        <Box sx={{
          position: 'absolute',
          top: -20, left: -20, right: -20, bottom: -20,
          background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
          filter: 'blur(35px)',
          opacity: 0.15,
          zIndex: -1,
          borderRadius: '20px'
        }} />

        <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
          {/* Logo Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 1 }}>
            <Box sx={{
              width: 36, height: 36, borderRadius: '8px', 
              background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 10px rgba(6, 182, 212, 0.4)'
            }}>
              <Typography sx={{ fontWeight: 800, color: '#fff', fontSize: '1.2rem' }}>Æ</Typography>
            </Box>
            <Typography variant="h5" className="glow-cyan-text" sx={{ fontWeight: 800, color: '#f3f4f6' }}>
              Aether<span style={{ color: '#06b6d4' }}>AI</span>
            </Typography>
          </Box>
          <Typography variant="body2" align="center" sx={{ color: '#9ca3af', mb: 3, fontSize: '0.85rem', letterSpacing: 0.5 }}>
            Enterprise Quantum Command Portal
          </Typography>

          {/* Messages */}
          {error && <Alert severity="error" sx={{ mb: 2, background: 'rgba(244, 63, 94, 0.1)', color: '#f87171', borderColor: 'rgba(244, 63, 94, 0.2)' }}>{error}</Alert>}
          {sessionExpired && <Alert severity="info" sx={{ mb: 2, background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.2)' }}>Your session has expired. Please login again.</Alert>}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2.5,
                '& .MuiInputLabel-root': { color: '#6b7280' },
                '& .MuiOutlinedInput-root': {
                  color: '#f3f4f6',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' },
                  '&:hover fieldset': { borderColor: 'rgba(6, 182, 212, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                }
              }}
            />

            {/* Password Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: '#6b7280' }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: '#6b7280' }}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{
                mb: 3.5,
                '& .MuiInputLabel-root': { color: '#6b7280' },
                '& .MuiOutlinedInput-root': {
                  color: '#f3f4f6',
                  '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' },
                  '&:hover fieldset': { borderColor: 'rgba(6, 182, 212, 0.5)' },
                  '&.Mui-focused fieldset': { borderColor: '#06b6d4' },
                }
              }}
            />

            {/* Login Button */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '1rem',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                boxShadow: '0 0 12px rgba(6, 182, 212, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0891b2 0%, #7c3aed 100%)',
                  boxShadow: '0 0 20px rgba(6, 182, 212, 0.5)',
                }
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#fff' }} /> : 'Initialize Session'}
            </Button>
          </Box>

          <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 3 }} />

          {/* Quick Admin Access Hint */}
          <Box sx={{
            background: 'rgba(6, 182, 212, 0.03)',
            border: '1px dashed rgba(6, 182, 212, 0.2)',
            borderRadius: '8px',
            p: 2,
            textAlign: 'center'
          }}>
            <Typography variant="caption" sx={{ color: '#06b6d4', fontWeight: 600, display: 'block', mb: 0.5, letterSpacing: 0.8 }}>
              ADMINISTRATIVE NODE TELEMETRY
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>
              Identity: <strong>admin@company.com</strong>
            </Typography>
            <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block' }}>
              Passcode: <strong>admin123</strong>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
