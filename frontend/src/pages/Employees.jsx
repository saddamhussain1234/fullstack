import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Grid, TextField, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, TableSortLabel, Checkbox, IconButton, Select, MenuItem, InputLabel, FormControl, Menu, MenuItem as ContextMenuItem, Alert, Badge, Chip } from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  MoreVert as MoreIcon
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Employees = () => {
  const { isManager } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [employees, setEmployees] = useState([]);
  const [total, setTotal] = useState(0);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination & Sorting states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');

  // Search & Filter states
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [minSalary, setMinSalary] = useState('');
  const [maxSalary, setMaxSalary] = useState('');

  // Row Selection states
  const [selectedRows, setSelectedRows] = useState([]);

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, rowsPerPage, sortBy, sortOrder, selectedDept, selectedStatus]);

  const fetchDepartments = async () => {
    try {
      const response = await api.get('/api/departments');
      setDepartments(response.data);
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: page + 1,
        size: rowsPerPage,
        sort_by: sortBy,
        sort_order: sortOrder,
      };

      if (search) params.search = search;
      if (selectedDept) params.department_id = selectedDept;
      if (selectedStatus) params.status = selectedStatus;
      if (minSalary) params.min_salary = minSalary;
      if (maxSalary) params.max_salary = maxSalary;

      const response = await api.get('/api/employees', { params });
      setEmployees(response.data.items);
      setTotal(response.data.total);
    } catch (err) {
      setError('Could not fetch employees.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Search form submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchEmployees();
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedDept('');
    setSelectedStatus('');
    setMinSalary('');
    setMaxSalary('');
    setPage(0);
    // Explicitly refetch
    setTimeout(() => {
      fetchEmployees();
    }, 100);
  };

  // Sorting
  const handleRequestSort = (property) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortBy(property);
  };

  // Selection
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const newSelected = employees.map((n) => n.id);
      setSelectedRows(newSelected);
      return;
    }
    setSelectedRows([]);
  };

  const handleSelectRow = (event, id) => {
    const selectedIndex = selectedRows.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }
    setSelectedRows(newSelected);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Deletion
  const handleDeleteSingle = async (id) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await api.delete(`/api/employees/${id}`);
        fetchEmployees();
      } catch (err) {
        setError('Failed to delete employee.');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the ${selectedRows.length} selected employees?`)) {
      try {
        await api.post('/api/employees/bulk-delete', selectedRows);
        setSelectedRows([]);
        fetchEmployees();
      } catch (err) {
        setError('Failed to complete bulk deletion.');
      }
    }
  };

  // CSV Export
  const handleExportCSV = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (selectedDept) params.department_id = selectedDept;
      if (selectedStatus) params.status = selectedStatus;
      
      const response = await api.get('/api/employees/export', { params, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'employees_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export CSV', err);
    }
  };

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6' }}>
          Staff Base
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.05)', color: '#9ca3af', textTransform: 'none',
              borderRadius: '8px', px: 2, '&:hover': { borderColor: '#10b981', background: 'rgba(16, 185, 129, 0.05)' }
            }}
          >
            Export CSV
          </Button>
          {isManager && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/employees/add')}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', textTransform: 'none',
                fontWeight: 600, borderRadius: '8px', px: 2, '&:hover': { background: 'linear-gradient(135deg, #4f46e5 0%, #9333ea 100%)' }
              }}
            >
              Add Employee
            </Button>
          )}
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, background: 'rgba(244, 63, 94, 0.1)', color: '#f87171', borderColor: 'rgba(244, 63, 94, 0.2)' }}>{error}</Alert>}

      {/* Advanced Filters Panel */}
      <Paper className="glass-panel" sx={{ p: 3, mb: 4, background: 'rgba(17, 19, 24, 0.4)', borderColor: 'rgba(255,255,255,0.03)' }}>
        <Box component="form" onSubmit={handleSearchSubmit}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search name, email, employee ID..."
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
            </Grid>

            {/* Department Filter */}
            <Grid item xs={12} sm={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="dept-label" sx={{ color: '#6b7280', '&.Mui-focused': { color: '#6366f1' } }}>Department</InputLabel>
                <Select
                  labelId="dept-label"
                  label="Department"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  sx={{
                    color: '#f3f4f6',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.05)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(99,102,241,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' }
                  }}
                >
                  <MenuItem value="">All Departments</MenuItem>
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid item xs={12} sm={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel id="status-label" sx={{ color: '#6b7280', '&.Mui-focused': { color: '#6366f1' } }}>Status</InputLabel>
                <Select
                  labelId="status-label"
                  label="Status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  sx={{
                    color: '#f3f4f6',
                    '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.05)' },
                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(99,102,241,0.5)' },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#6366f1' }
                  }}
                >
                  <MenuItem value="">All Statuses</MenuItem>
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                  <MenuItem value="On Leave">On Leave</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Action Buttons */}
            <Grid item xs={12} sm={3} sx={{ display: 'flex', gap: 1.5 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  background: '#6366f1', textTransform: 'none', flexGrow: 1, fontWeight: 600,
                  '&:hover': { background: '#4f46e5' }
                }}
              >
                Apply
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                sx={{
                  borderColor: 'rgba(255,255,255,0.05)', color: '#9ca3af', textTransform: 'none', flexGrow: 1,
                  '&:hover': { borderColor: '#f43f5e', color: '#f87171', background: 'rgba(244,63,94,0.05)' }
                }}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {/* Bulk action toolbar */}
      {selectedRows.length > 0 && isManager && (
        <Box sx={{ mb: 2, p: 2, background: 'rgba(244, 63, 94, 0.05)', border: '1px solid rgba(244, 63, 94, 0.2)', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" sx={{ color: '#f87171', fontWeight: 600 }}>
            {selectedRows.length} employee(s) selected
          </Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleBulkDelete}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            Bulk Delete
          </Button>
        </Box>
      )}

      {/* Main Employee Grid Table */}
      {loading ? (
        <LoadingSpinner message="Querying staff database..." />
      ) : (
        <TableContainer component={Paper} className="glass-panel" sx={{ background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ '& th': { borderBottom: '1px solid rgba(255, 255, 255, 0.04)', color: '#9ca3af', fontWeight: 600 } }}>
                {isManager && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedRows.length > 0 && selectedRows.length < employees.length}
                      checked={employees.length > 0 && selectedRows.length === employees.length}
                      onChange={handleSelectAll}
                      sx={{ color: 'rgba(255,255,255,0.2)' }}
                    />
                  </TableCell>
                )}
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'employee_id'}
                    direction={sortBy === 'employee_id' ? sortOrder : 'asc'}
                    onClick={() => handleRequestSort('employee_id')}
                    sx={{ color: '#9ca3af !important', '& .MuiTableSortLabel-icon': { color: '#9ca3af !important' } }}
                  >
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.length > 0 ? (
                employees.map((row) => {
                  const isItemSelected = selectedRows.indexOf(row.id) !== -1;
                  return (
                    <TableRow
                      key={row.id}
                      selected={isItemSelected}
                      sx={{
                        '& td': { borderBottom: '1px solid rgba(255, 255, 255, 0.02)', color: '#d1d5db' },
                        '&:hover': { background: 'rgba(255,255,255,0.01)' }
                      }}
                    >
                      {isManager && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={isItemSelected}
                            onChange={(event) => handleSelectRow(event, row.id)}
                            sx={{ color: 'rgba(255,255,255,0.2)' }}
                          />
                        </TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 600, color: '#f3f4f6' }}>{row.employee_id}</TableCell>
                      <TableCell>{row.first_name} {row.last_name}</TableCell>
                      <TableCell>{row.email}</TableCell>
                      <TableCell>{row.department?.name || '-'}</TableCell>
                      <TableCell>{row.designation}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.status}
                          size="small"
                          color={row.status === 'Active' ? 'success' : row.status === 'Inactive' ? 'default' : 'warning'}
                          sx={{ fontWeight: 600, height: 20, fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <IconButton size="small" onClick={() => navigate(`/employees/${row.id}`)} sx={{ color: '#9ca3af', '&:hover': { color: '#6366f1' } }}>
                            <ViewIcon fontSize="small" />
                          </IconButton>
                          {isManager && (
                            <>
                              <IconButton size="small" onClick={() => navigate(`/employees/edit/${row.id}`)} sx={{ color: '#9ca3af', '&:hover': { color: '#f59e0b' } }}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" onClick={() => handleDeleteSingle(row.id)} sx={{ color: '#9ca3af', '&:hover': { color: '#ef4444' } }}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 6, color: '#6b7280' }}>
                    No employee records matching criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={total}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            sx={{
              color: '#9ca3af',
              borderTop: '1px solid rgba(255,255,255,0.04)',
              '& .MuiTablePagination-actions': { color: '#9ca3af' },
              '& .MuiSelect-select': { color: '#9ca3af' }
            }}
          />
        </TableContainer>
      )}
    </Box>
  );
};

export default Employees;
