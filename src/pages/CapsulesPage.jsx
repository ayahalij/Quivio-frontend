// src/pages/CapsulesPage.js - Updated with Real API
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Fab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  AppBar,
  Toolbar,
  Avatar,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import {
  Add,
  Schedule,
  Lock,
  LockOpen,
  Close,
  Send,
  Person
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';

const CapsulesPage = () => {
  const { user, logout } = useAuth();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Create capsule dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [capsuleData, setCapsuleData] = useState({
    title: '',
    message: '',
    open_date: dayjs().add(1, 'week'),
    recipient_email: '',
    is_private: true
  });

  // View capsule dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  useEffect(() => {
    fetchCapsules();
  }, []);

  const fetchCapsules = async () => {
    setLoading(true);
    try {
      const result = await ApiService.getCapsules();
      setCapsules(result);
    } catch (error) {
      console.error('Failed to fetch capsules:', error);
      setError('Failed to load capsules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCapsule = async () => {
    if (!capsuleData.title.trim() || !capsuleData.message.trim()) {
      setError('Please fill in title and message');
      return;
    }

    if (capsuleData.open_date.isBefore(dayjs())) {
      setError('Open date must be in the future');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const newCapsule = await ApiService.createCapsule({
        title: capsuleData.title.trim(),
        message: capsuleData.message.trim(),
        open_date: capsuleData.open_date.toISOString(),
        is_private: capsuleData.is_private,
        recipient_email: capsuleData.recipient_email || null
      });

      setCapsules(prev => [newCapsule, ...prev]);
      setSuccess('Memory capsule created successfully!');
      setCreateDialogOpen(false);
      resetCapsuleForm();
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Failed to create capsule:', error);
      setError(error.response?.data?.detail || 'Failed to create capsule');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCapsule = async (capsule) => {
    if (capsule.is_opened) {
      setSelectedCapsule(capsule);
      setViewDialogOpen(true);
      return;
    }

    const openDate = dayjs(capsule.open_date);
    if (openDate.isAfter(dayjs())) {
      setError(`This capsule will open on ${openDate.format('MMMM D, YYYY at h:mm A')}`);
      return;
    }

    // Open the capsule via API
    try {
      const updatedCapsule = await ApiService.openCapsule(capsule.id);
      
      setCapsules(prev => 
        prev.map(c => c.id === capsule.id ? updatedCapsule : c)
      );
      
      setSelectedCapsule(updatedCapsule);
      setViewDialogOpen(true);
      setSuccess('Capsule opened!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Failed to open capsule:', error);
      setError(error.response?.data?.detail || 'Failed to open capsule');
    }
  };

  const resetCapsuleForm = () => {
    setCapsuleData({
      title: '',
      message: '',
      open_date: dayjs().add(1, 'week'),
      recipient_email: '',
      is_private: true
    });
  };

  const getTimeUntilOpen = (openDate) => {
    const now = dayjs();
    const open = dayjs(openDate);
    
    if (open.isBefore(now)) {
      return 'Ready to open';
    }
    
    const diff = open.diff(now);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else {
      return 'Opening soon';
    }
  };

  const openCapsules = capsules.filter(c => c.is_opened);
  const closedCapsules = capsules.filter(c => !c.is_opened);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        {/* Navigation Bar */}
        <AppBar position="static" elevation={1}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Memory Capsules
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar 
                src={user?.avatar_url} 
                sx={{ width: 32, height: 32 }}
              >
                {!user?.avatar_url && user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Typography variant="body2">
                {user?.username}
              </Typography>
              <Button color="inherit" onClick={logout}>
                Logout
              </Button>
            </Box>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4">
              Your Memory Capsules
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Capsule
            </Button>
          </Box>

          <Typography variant="body1" color="text.secondary" paragraph>
            Create time-locked memories and messages for your future self. Set a date and time, and your capsule will only open when that moment arrives.
          </Typography>

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}

          <Grid container spacing={4}>
            {/* Closed Capsules */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Lock color="primary" />
                Locked Capsules ({closedCapsules.length})
              </Typography>
              
              {closedCapsules.length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Lock sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">
                      No locked capsules yet. Create your first time-locked memory!
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={2}>
                  {closedCapsules.map(capsule => (
                    <Grid item xs={12} key={capsule.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { boxShadow: 2 }
                        }}
                        onClick={() => handleOpenCapsule(capsule)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Typography variant="h6">
                              {capsule.title}
                            </Typography>
                            <Chip
                              icon={<Schedule />}
                              label={getTimeUntilOpen(capsule.open_date)}
                              size="small"
                              color="primary"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Opens on {dayjs(capsule.open_date).format('MMMM D, YYYY at h:mm A')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created {dayjs(capsule.created_at).format('MMM D, YYYY')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>

            {/* Opened Capsules */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockOpen color="success" />
                Opened Capsules ({openCapsules.length})
              </Typography>
              
              {openCapsules.length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <LockOpen sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">
                      No opened capsules yet. Your memories will appear here when their time comes.
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={2}>
                  {openCapsules.map(capsule => (
                    <Grid item xs={12} key={capsule.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: 'success.main',
                          '&:hover': { boxShadow: 2 }
                        }}
                        onClick={() => handleOpenCapsule(capsule)}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Typography variant="h6">
                              {capsule.title}
                            </Typography>
                            <Chip
                              icon={<LockOpen />}
                              label="Opened"
                              size="small"
                              color="success"
                            />
                          </Box>
                          <Typography variant="body2" color="text.secondary">
                            Opened on {dayjs(capsule.opened_at).format('MMMM D, YYYY at h:mm A')}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Created {dayjs(capsule.created_at).format('MMM D, YYYY')}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Grid>
          </Grid>
        </Container>

        {/* Create Capsule Dialog */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Memory Capsule</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Capsule Title"
              value={capsuleData.title}
              onChange={(e) => setCapsuleData({...capsuleData, title: e.target.value})}
              margin="normal"
              placeholder="What is this memory about?"
            />

            <TextField
              fullWidth
              label="Message"
              multiline
              rows={4}
              value={capsuleData.message}
              onChange={(e) => setCapsuleData({...capsuleData, message: e.target.value})}
              margin="normal"
              placeholder="Write a message to your future self..."
            />

            <DateTimePicker
              label="Open Date & Time"
              value={capsuleData.open_date}
              onChange={(newValue) => setCapsuleData({...capsuleData, open_date: newValue})}
              sx={{ width: '100%', mt: 2 }}
              minDateTime={dayjs().add(1, 'hour')}
            />

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Your capsule will be locked until the specified date and time.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateCapsule}
              variant="contained"
              disabled={loading}
              startIcon={<Send />}
            >
              Create Capsule
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Capsule Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="sm" fullWidth>
          {selectedCapsule && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {selectedCapsule.title}
                  <IconButton onClick={() => setViewDialogOpen(false)}>
                    <Close />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Typography variant="body1" paragraph>
                  {selectedCapsule.message}
                </Typography>
                
                <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Created:</strong> {dayjs(selectedCapsule.created_at).format('MMMM D, YYYY at h:mm A')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <strong>Scheduled to open:</strong> {dayjs(selectedCapsule.open_date).format('MMMM D, YYYY at h:mm A')}
                  </Typography>
                  {selectedCapsule.opened_at && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Actually opened:</strong> {dayjs(selectedCapsule.opened_at).format('MMMM D, YYYY at h:mm A')}
                    </Typography>
                  )}
                </Box>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default CapsulesPage;