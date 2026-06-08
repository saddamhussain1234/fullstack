import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, IconButton } from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  ContactPhone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Business as DeptIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Contacts = () => {
  const { isManager } = useAuth();

  // Data states
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Dialog / Modal Form States
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogTitle, setDialogTitle] = useState('New Contact');
  const [editId, setEditId] = useState(null);

  // Field values
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [designation, setDesignation] = useState('');

  const [dialogError, setDialogError] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError('');
      const params = search ? { search } : {};
      const response = await api.get('/api/contacts', { params });
      setContacts(response.data);
    } catch (err) {
      setError('Could not retrieve contact directory.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchContacts();
  };

  const handleClearSearch = () => {
    setSearch('');
    setTimeout(() => {
      // Direct call with empty param
      api.get('/api/contacts').then(res => setContacts(res.data)).catch(() => {});
    }, 50);
  };

  const handleOpenAdd = () => {
    setEditId(null);
    setName('');
    setEmail('');
    setPhone('');
    setDepartment('');
    setDesignation('');
    setDialogTitle('Add Contact to Directory');
    setDialogError('');
    setOpenDialog(true);
  };

  const handleOpenEdit = (contact) => {
    setEditId(contact.id);
    setName(contact.name);
    setEmail(contact.email);
    setPhone(contact.phone || '');
    setDepartment(contact.department || '');
    setDesignation(contact.designation || '');
    setDialogTitle(`Modify Contact: ${contact.name}`);
    setDialogError('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setDialogError('');

    if (!name.trim() || !email.trim()) {
      setDialogError('Contact name and email are required.');
      return;
    }

    const payload = {
      name,
      email,
      phone,
      department,
      designation
    };

    setDialogLoading(true);
    try {
      if (editId) {
        await api.put(`/api/contacts/${editId}`, payload);
      } else {
        await api.post('/api/contacts', payload);
      }
      setOpenDialog(false);
      fetchContacts();
    } catch (err) {
      setDialogError(err.response?.data?.detail || 'An error occurred while saving contact.');
    } finally {
      setDialogLoading(false);
    }
  };

  const handleDelete = async (id, contactName) => {
    if (window.confirm(`Are you sure you want to remove '${contactName}' from directory?`)) {
      try {
        await api.delete(`/api/contacts/${id}`);
        fetchContacts();
      } catch (err) {
        setError('Failed to delete contact.');
      }
    }
  };

  // Export Contacts
  const handleExportCSV = () => {
    if (contacts.length === 0) return;
    
    // Build CSV content
    const headers = ['Name', 'Email', 'Phone', 'Department', 'Designation'];
    const rows = contacts.map(c => [
      c.name, c.email, c.phone || '', c.department || '', c.designation || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "contacts_directory.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Box sx={{ py: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6' }}>
          Office Contact Directory
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            onClick={handleExportCSV}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.05)', color: '#9ca3af', textTransform: 'none',
              borderRadius: '8px', px: 2, '&:hover': { borderColor: '#6366f1', background: 'rgba(99, 102, 241, 0.05)', color: '#f3f4f6' }
            }}
          >
            Export Directory
          </Button>
          {isManager && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAdd}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', textTransform: 'none',
                fontWeight: 600, borderRadius: '8px', px: 2, '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)' }
              }}
            >
              Add Contact
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Search Bar Panel */}
      <Paper className="glass-panel" sx={{ p: 2.5, mb: 4, background: 'rgba(17, 19, 24, 0.4)', borderColor: 'rgba(255,255,255,0.03)' }}>
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search contacts by name, email, department or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ color: '#6b7280', mr: 1, fontSize: 20 }} />,
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                color: '#f3f4f6',
                '& fieldset': { borderColor: 'rgba(255,255,255,0.05)' },
                '&:hover fieldset': { borderColor: 'rgba(99,102,241,0.5)' },
                '&.Mui-focused fieldset': { borderColor: '#6366f1' },
              }
            }}
          />
          <Button
            type="submit"
            variant="contained"
            sx={{ background: '#6366f1', textTransform: 'none', px: 3, fontWeight: 600, '&:hover': { background: '#4f46e5' } }}
          >
            Search
          </Button>
          <Button
            variant="outlined"
            onClick={handleClearSearch}
            sx={{ borderColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', textTransform: 'none', px: 2, '&:hover': { borderColor: '#f43f5e', color: '#f87171', background: 'rgba(244,63,94,0.05)' } }}
          >
            Clear
          </Button>
        </Box>
      </Paper>

      {/* Directory Grid List */}
      {loading ? (
        <LoadingSpinner message="Loading directory profiles..." />
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#9ca3af', fontWeight: 600 } }}>
                <TableCell>Contact Name</TableCell>
                <TableCell>Email Address</TableCell>
                <TableCell>Phone Number</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Designation</TableCell>
                {isManager && <TableCell align="right">Actions</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {contacts.length > 0 ? (
                contacts.map((row) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.02)', color: '#d1d5db' },
                      '&:hover': { background: 'rgba(255,255,255,0.01)' }
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600, color: '#f3f4f6' }}>{row.name}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EmailIcon sx={{ color: '#6b7280', fontSize: 16 }} />
                        {row.email}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {row.phone ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PhoneIcon sx={{ color: '#6b7280', fontSize: 16 }} />
                          {row.phone}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {row.department ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <DeptIcon sx={{ color: '#9ca3af', fontSize: 16 }} />
                          {row.department}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {row.designation ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BadgeIcon sx={{ color: '#9ca3af', fontSize: 16 }} />
                          {row.designation}
                        </Box>
                      ) : '-'}
                    </TableCell>
                    {isManager && (
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
                  <TableCell colSpan={isManager ? 6 : 5} align="center" sx={{ py: 6, color: '#6b7280' }}>
                    No contacts found matching search terms.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add / Edit Dialog */}
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
              label="Contact Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' } } }}
            />
            <TextField
              required
              fullWidth
              type="email"
              label="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' } } }}
            />
            <TextField
              fullWidth
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' } } }}
            />
            <TextField
              fullWidth
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              sx={{ '& .MuiInputLabel-root': { color: '#6b7280' }, '& .MuiOutlinedInput-root': { color: '#f3f4f6', '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' } } }}
            />
            <TextField
              fullWidth
              label="Designation"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
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
            {dialogLoading ? <CircularProgress size={20} color="inherit" /> : 'Save Contact'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Contacts;
