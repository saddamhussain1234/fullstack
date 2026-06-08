import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Grid, Typography, Avatar, Button, Divider, Chip, Card, CardContent, TextField, CircularProgress, Alert } from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  AutoAwesome as AIActIcon,
  Save as SaveIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarMonth as JoinIcon,
  AttachMoney as SalaryIcon,
  Badge as IDIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const EmployeeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isManager } = useAuth();

  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // AI Bio States
  const [experienceText, setExperienceText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedBio, setGeneratedBio] = useState('');
  const [aiError, setAiError] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get(`/api/employees/${id}`);
      setEmployee(response.data);
      // Prepopulate experience default
      setExperienceText(`software systems, collaborating with teams, and technical leadership`);
    } catch (err) {
      setError('Employee record not found.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateBio = async () => {
    if (!experienceText.trim()) {
      setAiError('Please enter a brief experience summary.');
      return;
    }

    setAiLoading(true);
    setAiError('');
    try {
      const response = await api.post('/api/ai/generate-bio', {
        name: `${employee.first_name} ${employee.last_name}`,
        designation: employee.designation,
        department: employee.department?.name || 'Technology',
        experience: experienceText
      });
      setGeneratedBio(response.data.bio);
    } catch (err) {
      setAiError('AI generation failed. Running local templates instead.');
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveBio = async () => {
    if (!generatedBio) return;

    setSaveLoading(true);
    try {
      const response = await api.put(`/api/employees/${employee.id}`, {
        ai_bio: generatedBio
      });
      setEmployee(response.data);
      setGeneratedBio('');
      alert('AI Bio saved to profile successfully!');
    } catch (err) {
      setAiError('Failed to save bio to database.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Retrieving employee profile..." />;
  if (error) return <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>;

  return (
    <Box sx={{ py: 1 }}>
      {/* Action Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<BackIcon />}
          onClick={() => navigate('/employees')}
          sx={{ borderColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', textTransform: 'none', '&:hover': { borderColor: '#6366f1', color: '#f3f4f6' } }}
        >
          Back to List
        </Button>
        {isManager && (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/employees/edit/${employee.id}`)}
            sx={{ background: '#f59e0b', '&:hover': { background: '#d97706' }, textTransform: 'none', fontWeight: 600 }}
          >
            Edit Record
          </Button>
        )}
      </Box>

      <Grid container spacing={4}>
        {/* Left Side: General Profile Card */}
        <Grid item xs={12} md={4}>
          <Paper className="glass-panel" sx={{ p: 4, textAlign: 'center', background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
            <Avatar
              src={employee.profile_image_url || undefined}
              sx={{
                width: 120, height: 120, mx: 'auto', mb: 2,
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                fontSize: '3rem', fontWeight: 600
              }}
            >
              {employee.first_name[0]}{employee.last_name[0]}
            </Avatar>
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6' }}>
              {employee.first_name} {employee.last_name}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: '#818cf8', fontWeight: 500, mb: 2 }}>
              {employee.designation}
            </Typography>
            <Chip
              label={employee.status}
              color={employee.status === 'Active' ? 'success' : employee.status === 'Inactive' ? 'default' : 'warning'}
              sx={{ fontWeight: 600, px: 1.5, mb: 3 }}
            />
            
            <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.04)', my: 2 }} />

            {/* Quick Details List */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left', mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IDIcon sx={{ color: '#6b7280' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>EMPLOYEE ID</Typography>
                  <Typography variant="body2" sx={{ color: '#f3f4f6', fontWeight: 500 }}>{employee.employee_id}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <EmailIcon sx={{ color: '#6b7280' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>EMAIL ADDRESS</Typography>
                  <Typography variant="body2" sx={{ color: '#f3f4f6', fontWeight: 500, wordBreak: 'break-all' }}>{employee.email}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PhoneIcon sx={{ color: '#6b7280' }} />
                <Box>
                  <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>PHONE NUMBER</Typography>
                  <Typography variant="body2" sx={{ color: '#f3f4f6', fontWeight: 500 }}>{employee.phone_number || '-'}</Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Right Side: Tabular Info & AI Generator */}
        <Grid item xs={12} md={8}>
          {/* Detailed Specifications */}
          <Paper className="glass-panel" sx={{ p: 4, mb: 4, background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 3 }}>
              Employment Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <JoinIcon sx={{ color: '#6b7280' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>JOINING DATE</Typography>
                    <Typography variant="body1" sx={{ color: '#f3f4f6', fontWeight: 500 }}>
                      {new Date(employee.joining_date).toLocaleDateString()}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SalaryIcon sx={{ color: '#6b7280' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>SALARY RATE</Typography>
                    <Typography variant="body1" sx={{ color: '#f3f4f6', fontWeight: 500 }}>
                      ${parseFloat(employee.salary).toLocaleString()} / year
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationIcon sx={{ color: '#6b7280' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>OFFICE LOCATION</Typography>
                    <Typography variant="body1" sx={{ color: '#f3f4f6', fontWeight: 500 }}>
                      {employee.city && employee.country ? `${employee.city}, ${employee.country}` : 'Not Specified'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IDIcon sx={{ color: '#6b7280' }} />
                  <Box>
                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>DEPARTMENT</Typography>
                    <Typography variant="body1" sx={{ color: '#f3f4f6', fontWeight: 500 }}>
                      {employee.department?.name || 'Unassigned'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.04)', my: 1 }} />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>RESIDENTIAL ADDRESS</Typography>
                <Typography variant="body2" sx={{ color: '#f3f4f6', lineHeight: 1.6 }}>
                  {[employee.address, employee.city, employee.state, employee.postal_code, employee.country].filter(Boolean).join(', ') || 'No home address registered.'}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', mb: 0.5 }}>AI GENERATED BIOGRAPHY</Typography>
                <Paper sx={{ p: 2.5, background: 'rgba(99, 102, 241, 0.03)', border: '1px solid rgba(99, 102, 241, 0.1)', borderRadius: '8px' }}>
                  <Typography variant="body2" sx={{ color: '#d1d5db', fontStyle: employee.ai_bio ? 'normal' : 'italic', lineHeight: 1.6 }}>
                    {employee.ai_bio || 'No biography has been generated for this employee yet. Use the AI module below to generate one.'}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Paper>

          {/* AI Bio Generator Panel */}
          {isManager && (
            <Paper className="glass-panel" sx={{ p: 4, background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AIActIcon sx={{ color: '#818cf8' }} />
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#f3f4f6' }}>
                  AI Employee Bio Generator
                </Typography>
              </Box>

              {aiError && <Alert severity="warning" sx={{ mb: 2, background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', borderColor: 'rgba(245,158,11,0.2)' }}>{aiError}</Alert>}

              <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>
                Generate a professional Corporate Biography for {employee.first_name}. Describe their key experience below.
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Skills & Experience Description"
                    multiline
                    rows={2}
                    value={experienceText}
                    onChange={(e) => setExperienceText(e.target.value)}
                    placeholder="e.g. backend systems, cloud infrastructure, enterprise application development"
                    sx={{
                      '& .MuiInputLabel-root': { color: '#6b7280' },
                      '& .MuiOutlinedInput-root': {
                        color: '#f3f4f6',
                        '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' },
                        '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    disabled={aiLoading}
                    startIcon={aiLoading ? <CircularProgress size={20} color="inherit" /> : <AIActIcon />}
                    onClick={handleGenerateBio}
                    sx={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                      textTransform: 'none', fontWeight: 600, borderRadius: '8px'
                    }}
                  >
                    {aiLoading ? 'Generating Bio...' : 'Generate AI Bio'}
                  </Button>
                </Grid>

                {generatedBio && (
                  <Grid item xs={12} sx={{ mt: 2 }}>
                    <Typography variant="caption" sx={{ color: '#818cf8', fontWeight: 600, display: 'block', mb: 1 }}>
                      GENERATED RESULT PREVIEW
                    </Typography>
                    <Paper sx={{ p: 2.5, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', mb: 2 }}>
                      <Typography variant="body2" sx={{ color: '#f3f4f6', lineHeight: 1.6 }}>
                        {generatedBio}
                      </Typography>
                    </Paper>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={saveLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                      disabled={saveLoading}
                      onClick={handleSaveBio}
                      sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '8px' }}
                    >
                      {saveLoading ? 'Saving...' : 'Apply and Save to Profile'}
                    </Button>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default EmployeeDetails;
