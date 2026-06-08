import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography, TextField, Button, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Checkbox, Divider, Alert, CircularProgress } from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CheckCircle as CompletedIcon,
  RadioButtonUnchecked as UncompletedIcon,
  AssignmentTurnedIn as TodoHeaderIcon
} from '@mui/icons-material';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Todos = () => {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/api/todos');
      setTodos(response.data);
    } catch (err) {
      setError('Could not retrieve todo items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setActionLoading(true);
    try {
      const response = await api.post('/api/todos', {
        title: title.trim(),
        description: description.trim() || null,
        completed: false
      });
      setTodos([response.data, ...todos]);
      setTitle('');
      setDescription('');
    } catch (err) {
      setError('Failed to create todo item.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleTodo = async (todo) => {
    try {
      const updatedStatus = !todo.completed;
      const response = await api.put(`/api/todos/${todo.id}`, {
        completed: updatedStatus
      });
      
      // Update local state
      setTodos(todos.map(t => t.id === todo.id ? response.data : t));
    } catch (err) {
      setError('Failed to update todo status.');
    }
  };

  const handleDeleteTodo = async (id) => {
    try {
      await api.delete(`/api/todos/${id}`);
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setError('Failed to delete todo item.');
    }
  };

  const activeTodos = todos.filter(t => !t.completed);
  const completedTodos = todos.filter(t => t.completed);

  return (
    <Box sx={{ py: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 4 }}>
        <TodoHeaderIcon sx={{ color: '#06b6d4', fontSize: 32 }} />
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#f3f4f6' }}>
          Personal Tasks & Todo List
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
        {/* Left: Input Form */}
        <Box sx={{ flex: 1 }}>
          <Paper className="glass-panel" sx={{ p: 3, background: 'rgba(17, 19, 24, 0.4)', borderColor: 'rgba(255,255,255,0.03)' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#f3f4f6', mb: 2 }}>
              Add New Task
            </Typography>
            <Box component="form" onSubmit={handleAddTodo} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                required
                fullWidth
                size="small"
                label="Task Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                sx={{
                  '& .MuiInputLabel-root': { color: '#6b7280' },
                  '& .MuiOutlinedInput-root': {
                    color: '#f3f4f6',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' }
                  }
                }}
              />
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Description (Optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                sx={{
                  '& .MuiInputLabel-root': { color: '#6b7280' },
                  '& .MuiOutlinedInput-root': {
                    color: '#f3f4f6',
                    '& fieldset': { borderColor: 'rgba(255, 255, 255, 0.05)' }
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={actionLoading || !title.trim()}
                startIcon={actionLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
                sx={{
                  background: 'linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%)',
                  textTransform: 'none',
                  fontWeight: 600,
                  borderRadius: '8px',
                  '&:hover': { background: 'linear-gradient(135deg, #0891b2 0%, #7c3aed 100%)' }
                }}
              >
                Add Task
              </Button>
            </Box>
          </Paper>
        </Box>

        {/* Right: Tasks List */}
        <Box sx={{ flex: 2 }}>
          {loading ? (
            <LoadingSpinner message="Retrieving your tasks..." />
          ) : (
            <Paper className="glass-panel" sx={{ p: 3, background: 'rgba(17, 19, 24, 0.6)', borderColor: 'rgba(255,255,255,0.03)', minHeight: 300 }}>
              {/* Active Tasks Section */}
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#06b6d4', mb: 2 }}>
                Active Tasks ({activeTodos.length})
              </Typography>
              {activeTodos.length > 0 ? (
                <List>
                  {activeTodos.map((todo) => (
                    <ListItem
                      key={todo.id}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.01)',
                        border: '1px solid rgba(255, 255, 255, 0.02)',
                        borderRadius: '8px',
                        mb: 1,
                        '&:hover': { background: 'rgba(255, 255, 255, 0.02)' }
                      }}
                    >
                      <Checkbox
                        icon={<UncompletedIcon sx={{ color: '#6b7280' }} />}
                        checkedIcon={<CompletedIcon sx={{ color: '#06b6d4' }} />}
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo)}
                      />
                      <ListItemText
                        primary={todo.title}
                        secondary={todo.description}
                        primaryTypographyProps={{ style: { color: '#f3f4f6', fontWeight: 600 } }}
                        secondaryTypographyProps={{ style: { color: '#9ca3af' } }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTodo(todo.id)} sx={{ color: '#6b7280', '&:hover': { color: '#ef4444' } }}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: '#6b7280', mb: 3, italic: true }}>
                  No active tasks. Add one on the left!
                </Typography>
              )}

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.05)', my: 3 }} />

              {/* Completed Tasks Section */}
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#9ca3af', mb: 2 }}>
                Completed Tasks ({completedTodos.length})
              </Typography>
              {completedTodos.length > 0 ? (
                <List>
                  {completedTodos.map((todo) => (
                    <ListItem
                      key={todo.id}
                      sx={{
                        background: 'rgba(255, 255, 255, 0.01)',
                        border: '1px solid rgba(255, 255, 255, 0.01)',
                        borderRadius: '8px',
                        mb: 1,
                        opacity: 0.6,
                        '&:hover': { opacity: 0.8 }
                      }}
                    >
                      <Checkbox
                        icon={<UncompletedIcon sx={{ color: '#6b7280' }} />}
                        checkedIcon={<CompletedIcon sx={{ color: '#10b981' }} />}
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo)}
                      />
                      <ListItemText
                        primary={todo.title}
                        secondary={todo.description}
                        primaryTypographyProps={{ style: { color: '#9ca3af', textDecoration: 'line-through' } }}
                        secondaryTypographyProps={{ style: { color: '#6b7280' } }}
                      />
                      <ListItemSecondaryAction>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteTodo(todo.id)} sx={{ color: '#6b7280', '&:hover': { color: '#ef4444' } }}>
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" sx={{ color: '#6b7280', italic: true }}>
                  No completed tasks yet. Keep going!
                </Typography>
              )}
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Todos;
