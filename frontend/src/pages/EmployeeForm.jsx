import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Paper, Typography, Grid, TextField, Button, MenuItem, Select, InputLabel, FormControl, Alert, CircularProgress, Divider } from '@mui/material';
import { Save as SaveIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EmployeeForm = () => {
  const { id } = useParams(); // present if editing
  const navigate = useNavigate();
  const { isManager } = useAuth();
  
  const isEditMode = Boolean(id);

  // Form Field States
  const [employeeId, setEmployeeId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deptId, setDeptId] = useState('');
  const [designation, setDesignation] = useState('');
  const [salary, setSalary] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');
  const [status, setStatus] = useState('Active');
  
  // App UI states
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Non-managers cannot edit or add employees
    if (!isManager) {
      navigate('/employees');
      return;
    }
    
    fetchDepartments();
    if (isEditMode) {
      fetchEmployeeDetails();
    }
  }, [id]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const fetchEmployeeDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/employees/${id}`);
      const emp = response.data;
      
      setEmployeeId(emp.employee_id);
      setFirstName(emp.first_name);
      setLastName(emp.last_name);
      setEmail(emp.email);
      setPhoneNumber(emp.phone_number || '');
      setDeptId(emp.department_id || '');
      setDesignation(emp.designation);
      setSalary(parseFloat(emp.salary) || '');
      // Format date to YYYY-MM-DD
      setJoiningDate(emp.joining_date);
      setAddress(emp.address || '');
      setCity(emp.city || '');
      setState(emp.state || '');
      setCountry(emp.country || '');
      setPostalCode(emp.postal_code || '');
      setProfileImageUrl(emp.profile_image_url || '');
      setStatus(emp.status);
    } catch (err) {
      setError('Failed to fetch employee details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!employeeId || !firstName || !lastName || !email || !designation || !salary || !joiningDate) {
      setError('Please fill in all required fields marked with *');
      return;
    }

    const payload = {
      employee_id: employeeId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone_number: phoneNumber,
      department_id: deptId ? parseInt(deptId, 10) : null,
      designation,
      salary: parseFloat(salary),
      joining_date: joiningDate,
      address,
      city,
      state,
      country,
      postal_code: postalCode,
      profile_image_url: profileImageUrl,
      status
    };

    setSubmitLoading(true);
    try {
      if (isEditMode) {
        // Edit Endpoint
        await api.put(`/api/employees/${id}`, payload);
      } else {
        // Add Endpoint
        await api.post('/api/employees', payload);
      }
      navigate('/employees');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during submission.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading employee information..." />;

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/employees')}
          sx={{ borderColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', textTransform: 'none', '&:hover': { borderColor: '#6366f1', color: '#f3f4f6' } }}
        >
          Cancel
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6' }}>
          {isEditMode ? 'Modify Employee Profile' : 'Onboard New Employee'}
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, background: 'rgba(244, 63, 94, 0.1)', color: '#f87171', borderColor: 'rgba(244, 63, 94, 0.2)' }}>{error}</Alert>}

      <Paper className="glass-panel" sx={{ p: 4, background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            {/* Primary Details */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ color: '#818cf8', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                Primary Records
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Employee ID (Custom)"
                value={employeeId}
                disabled={isEditMode} // Cannot edit Custom Employee ID once created
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="e.g. EMP001"
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                type="email"
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>

            {/* Employment details */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#818cf8', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                Employment Details
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="dept-label-form" sx={{ color: '#6b7280' }}>Department</InputLabel>
                <Select
                  labelId="dept-label-form"
                  label="Department"
                  value={deptId}
                  onChange={(e) => setDeptId(e.target.value)}
                  sx={{ color: '#f3f4f6', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.05)' } }}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                label="Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                type="number"
                label="Salary rate ($ / year)"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                required
                fullWidth
                type="date"
                label="Joining Date"
                InputLabelProps={{ shrink: true }}
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="status-label-form" sx={{ color: '#6b7280' }}>Status</InputLabel>
                <Select
                  labelId="status-label-form"
                  label="Status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  sx={{ color: '#f3f4f6', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.05)' } }}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Avatar URL"
                value={profileImageUrl}
                onChange={(e) => setProfileImageUrl(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>

            {/* Address Info */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Typography variant="subtitle2" sx={{ color: '#818cf8', fontWeight: 600, mb: 1, textTransform: 'uppercase' }}>
                Contact / Address Details
              </Typography>
              <Divider sx={{ borderColor: 'rgba(255,255,255,0.05)', mb: 2 }} />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Residential Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="State / Province"
                value={state}
                onChange={(e) => setState(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Postal / Zip Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' } } }}
              />
            </Grid>

            {/* Submit Bar */}
            <Grid item xs={12} sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={submitLoading}
                startIcon={submitLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{
                  py: 1.5, px: 4, fontWeight: 700, textTransform: 'none', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                  '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)' }
                }}
              >
                {isEditMode ? 'Update Record' : 'Save Employee'}
              </Button>
            </Grid>

          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default EmployeeForm;
