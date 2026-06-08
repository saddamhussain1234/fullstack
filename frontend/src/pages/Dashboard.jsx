import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Alert } from '@mui/material';
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as ActiveIcon,
  Add as AddIcon,
  ContactPhone as ContactsIcon,
  Download as DownloadIcon,
  ArrowForward as ArrowIcon
} from '@mui/icons-material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend, CartesianGrid } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { isManager } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/employees/dashboard');
      setMetrics(response.data);
    } catch (err) {
      setError('Failed to fetch dashboard metrics. Make sure the API service is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/api/employees/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export employee directory', err);
    }
  };

  if (loading) return <LoadingSpinner message="Fetching live metrics..." />;

  const COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#d946ef'];

  const stats = [
    { title: 'Total Employees', value: metrics?.total_employees || 0, icon: <PeopleIcon />, color: '#06b6d4', trend: '+4%' },
    { title: 'Total Departments', value: metrics?.total_departments || 0, icon: <BusinessIcon />, color: '#8b5cf6', trend: '0%' },
    { title: 'New This Month', value: metrics?.new_employees_this_month || 0, icon: <PersonAddIcon />, color: '#d946ef', trend: '+12%' },
    { title: 'Active Employees', value: metrics?.active_employees || 0, icon: <ActiveIcon />, color: '#10b981', trend: '+5%' }
  ];

  return (
    <Box sx={{ py: 1 }}>
      {error && <Alert severity="error" sx={{ mb: 3, background: 'rgba(244, 63, 94, 0.1)', color: '#f87171', borderColor: 'rgba(244, 63, 94, 0.2)' }}>{error}</Alert>}

      {/* Welcome Banner */}
      <Box className="header-grid-panel" sx={{ mb: 4, p: 3, borderRadius: '12px', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(139, 92, 246, 0.05) 100%)', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 1 }}>
          Welcome back to AetherAI Enterprise Console
        </Typography>
        <Typography variant="body2" sx={{ color: '#9ca3af' }}>
          Here is what is happening across the organization today. You have manager authorization levels active.
        </Typography>
      </Box>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Charts Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Growth Area Chart */}
        <Grid item xs={12} md={8}>
          <Paper className="glass-panel" sx={{ p: 3, background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 3 }}>
              Employee Growth Curve
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics?.growth_data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <YAxis stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: '#171b22', borderColor: '#374151', color: '#f3f4f6' }} />
                  <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Department Distribution Pie Chart */}
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel" sx={{ p: 3, background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 3 }}>
              Department Headcounts
            </Typography>
            <Box sx={{ width: '100%', height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {metrics?.department_distribution && metrics.department_distribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.department_distribution}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                      nameKey="department"
                    >
                      {metrics.department_distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#171b22', borderColor: '#374151', color: '#f3f4f6' }} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      iconSize={8}
                      wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" sx={{ color: '#6b7280' }}>No employee distributions registered.</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Quick Actions & Recent Activities */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel" sx={{ p: 3, background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)', height: 'calc(100% - 48px)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 3 }}>
              Quick Tools
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {isManager && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/employees/add')}
                  sx={{
                    py: 1.5, textTransform: 'none', fontWeight: 600, borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)' }
                  }}
                >
                  Onboard Employee
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<ContactsIcon />}
                onClick={() => navigate('/contacts')}
                sx={{
                  py: 1.5, textTransform: 'none', fontWeight: 600, borderRadius: '8px',
                  borderColor: 'rgba(255,255,255,0.05)', color: '#9ca3af',
                  '&:hover': { borderColor: '#6366f1', background: 'rgba(99, 102, 241, 0.05)', color: '#f3f4f6' }
                }}
              >
                Search Contact List
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={handleExportCSV}
                sx={{
                  py: 1.5, textTransform: 'none', fontWeight: 600, borderRadius: '8px',
                  borderColor: 'rgba(255,255,255,0.05)', color: '#9ca3af',
                  '&:hover': { borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.05)', color: '#f3f4f6' }
                }}
              >
                Export Directory CSV
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Activities Audit Logs */}
        <Grid item xs={12} md={8}>
          <Paper className="glass-panel" sx={{ p: 3, background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 2 }}>
              Recent Action Logs
            </Typography>
            <TableContainer sx={{ background: 'transparent' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#9ca3af', fontWeight: 600 } }}>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Details</TableCell>
                    <TableCell>Timestamp</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {metrics?.recent_activities && metrics.recent_activities.length > 0 ? (
                    metrics.recent_activities.map((row) => (
                      <TableRow key={row.id} sx={{ '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.02)', color: '#d1d5db' } }}>
                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem' }}>{row.user_email}</TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem' }}>
                          <span style={{ color: row.action.startsWith('DELETE') ? '#ef4444' : row.action.startsWith('CREATE') ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                            {row.action}
                          </span>
                        </TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem' }}>{row.details}</TableCell>
                        <TableCell sx={{ py: 1.5, fontSize: '0.85rem', color: '#6b7280' }}>
                          {new Date(row.timestamp).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4, color: '#6b7280' }}>
                        No audit activities recorded.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
