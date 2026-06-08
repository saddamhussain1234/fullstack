import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, IconButton } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Description as DescIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Departments = () => {
  const { isAdmin } = useAuth();

  // Data states
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog / Modal Form States
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('New Department');
  const [editId, setEditId] = useState(null);
  
  // Field values
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [managerName, setManagerName] = useState('');
  
  const [dialogError, setDialogError] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/departments');
      setDepartments(response.data);
    } catch (err) {
      setError('Could not retrieve departments database.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setManagerName('');
    setDialogTitle('Create New Department');
    setDialogError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (dept) => {
    setEditId(dept.id);
    setName(dept.name);
    setDescription(dept.description || '');
    setManagerName(dept.manager_name || '');
    setDialogTitle(`Modify ${dept.name} Department`);
    setDialogError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setDialogError('');

    if (!name.trim()) {
      setDialogError('Department name is required.');
      return;
    }

    const payload = {
      name,
      description,
      manager_name: managerName
    };

    setDialogLoading(true);
    try {
      if (editId) {
        // Edit Department
        await api.put(`/api/departments/${editId}`, payload);
      } else {
        // Create Department
        await api.post('/api/departments', payload);
      }
      setOpenDialog(false);
      fetchDepartments();
    } catch (err) {
      setDialogError(err.response?.data?.detail || 'An error occurred while saving.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = async (id, deptName) => {
    if (window.confirm(`Are you sure you want to delete the department '${deptName}'?`)) {
      try {
        await api.delete(`/api/departments/${id}`);
        fetchDepartments();
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to delete department. Make sure it contains no active employees.');
      }
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6' }}>
          Departments
        </Typography>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAdd}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', textTransform: 'none',
              fontWeight: 600, borderRadius: '8px', px: 2, '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)' }
            }}
          >
            Create Department
          </Button>
        )}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, background: 'rgba(244, 63, 94, 0.1)', color: '#f87171', borderColor: 'rgba(244, 63, 94, 0.2)' }}>{error}</Alert>}

      {loading ? (
        <LoadingSpinner message="Querying departments database..." />
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#9ca3af', fontWeight: 600 } }}>
                <TableCell>Department Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Department Head</TableCell>
                <TableCell align="center">Active Count</TableCell>
                {isAdmin && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length > 0 ? (
                departments.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.02)', color: '#d1d5db' },
                      '&:hover': { background: 'rgba(255,255,255,0.01)' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#f3f4f6' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <BusinessIcon sx={{ color: '#818cf8', fontSize: 20 }} />
                        {row.name}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.description || '-'}
                    </TableCell>
                    <TableCell>
                      {row.manager_name ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ color: '#9ca3af', fontSize: 16 }} />
                          {row.manager_name}
                        </Box>
                      ) : (
                        <Typography variant="body2" sx={{ color: '#6b7280', fontStyle: 'italic' }}>Unassigned</Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={`${row.employee_count} Employee(s)`}
                        size="small"
                        sx={{
                          fontWeight: 600, background: 'rgba(99, 102, 241, 0.07)', color: '#818cf8',
                          border: '1px solid rgba(99, 102, 241, 0.15)'
                        }}
                      />
                    </TableCell>
                    {isAdmin && (
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => handleOpenEdit(row)} sx={{ color: '#9ca3af', '&:hover': { color: '#f59e0b' } }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(row.id, row.name)} sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 5 : 4} align="center" sx={{ py: 6, color: '#6b7280' }}>
                    No departments created yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* dialog for add / edit department */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            background: '#111318', border: '1px solid rgba(255, 255, 255, 0.05)',
            color: '#f3f4f6', minWidth: { xs: '90%', sm: 450 }
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: '#818cf8' }}>
          {dialogTitle}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {dialogError && <Alert severity="error" sx={{ mb: 2, background: 'rgba(244, 63, 94, 0.1)', color: '#f87171', borderColor: 'rgba(244, 63, 94, 0.2)' }}>{dialogError}</Alert>}
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              required
              fullWidth
              label="Department Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' } } }}
            />
            <TextField
              fullWidth
              label="Department Head / Manager"
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' } } }}
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' } } }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button onClick={handleCloseDialog} sx={{ color: '#9ca3af', textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={dialogLoading}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', textTransform: 'none',
              fontWeight: 600, px: 3, borderRadius: '8px'
            }}
          >
            {dialogLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Department'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// Simple Chip override import
import { Chip } from '@mui/material';

export default Departments;
