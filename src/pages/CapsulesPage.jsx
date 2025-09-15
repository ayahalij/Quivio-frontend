// Update your src/pages/CapsulesPage.jsx with this enhanced version that supports recipients:

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
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
  IconButton,
  ImageList,
  ImageListItem,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Divider
} from '@mui/material';
import {
  Add,
  Schedule,
  Lock,
  LockOpen,
  Close,
  Send,
  CloudUpload,
  PlayArrow,
  Image as ImageIcon,
  VideoFile,
  Delete,
  Email,
  PersonAdd
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import PhotoViewer from '../components/common/PhotoViewer';

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
    is_private: true
  });

  // NEW: Recipient management
  const [recipientEmails, setRecipientEmails] = useState(['']);
  const [sendToSelf, setSendToSelf] = useState(true);
  const [emailErrors, setEmailErrors] = useState({});

  // Media upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // View capsule dialog
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  // Photo viewer states
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

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

  // NEW: Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // NEW: Add recipient email field
  const addRecipientField = () => {
    if (recipientEmails.length < 30) {
      setRecipientEmails([...recipientEmails, '']);
    }
  };

  // NEW: Remove recipient email field
  const removeRecipientField = (index) => {
    if (recipientEmails.length > 1) {
      const newEmails = recipientEmails.filter((_, i) => i !== index);
      setRecipientEmails(newEmails);
      
      // Clear error for removed field
      const newErrors = { ...emailErrors };
      delete newErrors[index];
      setEmailErrors(newErrors);
    }
  };

  // NEW: Update recipient email
  const updateRecipientEmail = (index, email) => {
    const newEmails = [...recipientEmails];
    newEmails[index] = email;
    setRecipientEmails(newEmails);
    
    // Validate email
    const newErrors = { ...emailErrors };
    if (email && !validateEmail(email)) {
      newErrors[index] = 'Invalid email format';
    } else {
      delete newErrors[index];
    }
    setEmailErrors(newErrors);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const validFiles = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
        setError(`${file.name} is not a valid image or video file`);
        continue;
      }
      
      const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
      if (file.size > maxSize) {
        const sizeLimit = file.type.startsWith('video/') ? '50MB' : '10MB';
        setError(`${file.name} exceeds the ${sizeLimit} size limit`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > 10) {
      setError('Maximum 10 files allowed per capsule');
      return;
    }
    
    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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

    // Validate recipient emails
    const validEmails = recipientEmails.filter(email => email.trim() && validateEmail(email));
    const hasInvalidEmails = Object.keys(emailErrors).length > 0;
    
    if (hasInvalidEmails) {
      setError('Please fix invalid email addresses');
      return;
    }

    setUploading(true);
    setError('');
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('title', capsuleData.title.trim());
      formData.append('message', capsuleData.message.trim());
      formData.append('open_date', capsuleData.open_date.toISOString());
      formData.append('is_private', capsuleData.is_private);
      
      // NEW: Add recipient emails
      if (validEmails.length > 0) {
        formData.append('recipient_emails', validEmails.join(','));
      }
      formData.append('send_to_self', sendToSelf);

      // Add files
      selectedFiles.forEach(file => {
        formData.append('files', file);
      });

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      // Use new endpoint if recipients are specified
      const newCapsule = validEmails.length > 0 || !sendToSelf
        ? await ApiService.createCapsuleWithRecipients(formData)
        : await ApiService.createCapsuleWithMedia(formData);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      setCapsules(prev => [newCapsule, ...prev]);
      
      if (validEmails.length > 0 || !sendToSelf) {
        setSuccess(`Memory capsule created! ${validEmails.length > 0 ? `Will email ${validEmails.length} recipient(s)` : ''} ${sendToSelf ? 'and yourself' : ''} when it opens.`);
      } else {
        setSuccess('Memory capsule created successfully!');
      }
      
      setCreateDialogOpen(false);
      resetCapsuleForm();
      setTimeout(() => setSuccess(''), 5000);

    } catch (error) {
      console.error('Failed to create capsule:', error);
      setError(error.response?.data?.detail || 'Failed to create capsule');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetCapsuleForm = () => {
    setCapsuleData({
      title: '',
      message: '',
      open_date: dayjs().add(1, 'week'),
      is_private: true
    });
    setSelectedFiles([]);
    setRecipientEmails(['']);
    setSendToSelf(true);
    setEmailErrors({});
  };

 const handleOpenCapsule = async (capsule) => {
    if (capsule.is_opened) {
      setSelectedCapsule(capsule);
      setViewDialogOpen(true);
      return;
    }

    const now = new Date();
    const openDate = new Date(capsule.open_date);
    
    if (openDate > now) {
      const diffMs = openDate.getTime() - now.getTime();
      const minutes = Math.floor(diffMs / (1000 * 60));
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      let timeRemaining;
      if (days > 0) {
        timeRemaining = `${days} day${days > 1 ? 's' : ''}`;
      } else if (hours > 0) {
        timeRemaining = `${hours} hour${hours > 1 ? 's' : ''}`;
      } else if (minutes > 0) {
        timeRemaining = `${minutes} minute${minutes > 1 ? 's' : ''}`;
      } else {
        timeRemaining = 'less than a minute';
      }
      
      setError(`This capsule will open in ${timeRemaining}`);
      return;
    }

    try {
      const updatedCapsule = await ApiService.openCapsule(capsule.id);
      
      setCapsules(prev => 
        prev.map(c => c.id === capsule.id ? updatedCapsule : c)
      );
      
      setSelectedCapsule(updatedCapsule);
      setViewDialogOpen(true);
      setSuccess('Capsule opened! Email notifications sent to recipients.');
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Failed to open capsule:', error);
      setError(error.response?.data?.detail || 'Failed to open capsule');
    }
  };

  const handleMediaClick = (media, allMedia) => {
    const photos = allMedia
      .filter(m => m.media_type === 'image')
      .map(m => ({
        url: m.media_url,
        title: 'Capsule Media',
        date: selectedCapsule?.created_at
      }));
    
    const clickedIndex = photos.findIndex(p => p.url === media.media_url);
    
    setSelectedPhotos(photos);
    setSelectedPhotoIndex(Math.max(0, clickedIndex));
    setPhotoViewerOpen(true);
  };

  const getTimeUntilOpen = (openDate) => {
    const now = new Date();
    const open = new Date(openDate);
    
    console.log('Now:', now.toISOString());
    console.log('Open date:', open.toISOString());
    
    if (open <= now) {
      return 'Ready to open';
    }
    
    const diffMs = open.getTime() - now.getTime();
    const minutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
    } else {
      return 'Opening soon';
    }
  };


  const renderMediaPreview = (file, index) => {
    const isVideo = file.type.startsWith('video/');
    const previewUrl = URL.createObjectURL(file);
    
    return (
      <Card key={index} sx={{ position: 'relative' }}>
        <Box sx={{ position: 'relative', width: 80, height: 80 }}>
          {isVideo ? (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                backgroundColor: '#000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 1
              }}
            >
              <VideoFile sx={{ color: 'white', fontSize: 30 }} />
            </Box>
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: 4
              }}
            />
          )}
          <IconButton
            size="small"
            onClick={() => removeFile(index)}
            sx={{
              position: 'absolute',
              top: -5,
              right: -5,
              backgroundColor: 'error.main',
              color: 'white',
              '&:hover': { backgroundColor: 'error.dark' }
            }}
          >
            <Close sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
        <Typography variant="caption" sx={{ display: 'block', p: 0.5, textAlign: 'center' }}>
          {file.name.length > 12 ? `${file.name.substring(0, 12)}...` : file.name}
        </Typography>
      </Card>
    );
  };

  const renderCapsuleMedia = (media) => {
    const images = media.filter(m => m.media_type === 'image');
    const videos = media.filter(m => m.media_type === 'video');
    
    return (
      <Box sx={{ mt: 2 }}>
        {images.length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Images ({images.length})
            </Typography>
            <ImageList cols={3} gap={8} sx={{ maxHeight: 200 }}>
              {images.map((image, index) => (
                <ImageListItem
                  key={index}
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={() => handleMediaClick(image, media)}
                >
                  <img
                    src={image.media_url}
                    alt="Capsule media"
                    style={{
                      width: '100%',
                      height: 80,
                      objectFit: 'cover'
                    }}
                  />
                </ImageListItem>
              ))}
            </ImageList>
          </Box>
        )}
        
        {videos.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Videos ({videos.length})
            </Typography>
            <Grid container spacing={1}>
              {videos.map((video, index) => (
                <Grid item xs={6} key={index}>
                  <Card>
                    <Box sx={{ position: 'relative' }}>
                      <video
                        controls
                        style={{
                          width: '100%',
                          height: 120,
                          objectFit: 'cover'
                        }}
                      >
                        <source src={video.media_url} />
                        Your browser does not support the video tag.
                      </video>
                    </Box>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Box>
    );
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
            Create time-locked memories with photos and videos for your future self or share them with others. Set a date and time, and your capsule will only open when that moment arrives.
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
                          
                          {/* Media count indicators */}
                          {capsule.media && capsule.media.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              {capsule.media.filter(m => m.media_type === 'image').length > 0 && (
                                <Chip
                                  icon={<ImageIcon />}
                                  label={capsule.media.filter(m => m.media_type === 'image').length}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {capsule.media.filter(m => m.media_type === 'video').length > 0 && (
                                <Chip
                                  icon={<VideoFile />}
                                  label={capsule.media.filter(m => m.media_type === 'video').length}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          )}
                          
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
                          
                          {/* Media count indicators */}
                          {capsule.media && capsule.media.length > 0 && (
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              {capsule.media.filter(m => m.media_type === 'image').length > 0 && (
                                <Chip
                                  icon={<ImageIcon />}
                                  label={capsule.media.filter(m => m.media_type === 'image').length}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {capsule.media.filter(m => m.media_type === 'video').length > 0 && (
                                <Chip
                                  icon={<VideoFile />}
                                  label={capsule.media.filter(m => m.media_type === 'video').length}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          )}
                          
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

        {/* ENHANCED Create Capsule Dialog with Recipients */}
        <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="md" fullWidth>
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

            <Divider sx={{ my: 3 }} />

            {/* NEW: Recipient Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Email color="primary" />
                Email Recipients (Optional)
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Add email addresses to share this capsule with others when it opens.
              </Typography>

              {recipientEmails.map((email, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    label={`Recipient ${index + 1}`}
                    value={email}
                    onChange={(e) => updateRecipientEmail(index, e.target.value)}
                    placeholder="friend@example.com"
                    error={!!emailErrors[index]}
                    helperText={emailErrors[index]}
                  />
                  {recipientEmails.length > 1 && (
                    <IconButton onClick={() => removeRecipientField(index)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              ))}

              <Button
                startIcon={<PersonAdd />}
                onClick={addRecipientField}
                disabled={recipientEmails.length >= 30}
                size="small"
                sx={{ mt: 1 }}
              >
                Add Recipient ({recipientEmails.length}/30)
              </Button>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendToSelf}
                    onChange={(e) => setSendToSelf(e.target.checked)}
                  />
                }
                label="Send email notification to me when opened"
                sx={{ mt: 2 }}
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* Media Upload Section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Attach Photos & Videos (Optional)
              </Typography>
              
              <input
                accept="image/*,video/*"
                style={{ display: 'none' }}
                id="media-upload"
                multiple
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="media-upload">
                <Button
                  variant="outlined"
                  component="span"
                  startIcon={<CloudUpload />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Select Photos & Videos (Max 10 files)
                </Button>
              </label>

              {selectedFiles.length > 0 && (
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Selected files ({selectedFiles.length}/10):
                  </Typography>
                  <Grid container spacing={1}>
                    {selectedFiles.map((file, index) => (
                      <Grid item key={index}>
                        {renderMediaPreview(file, index)}
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                • Images: max 10MB each • Videos: max 50MB each
                <br />
                • Supported formats: JPG, PNG, GIF, MP4, MOV, AVI
              </Typography>
            </Box>

            {uploading && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Creating capsule... {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Your capsule will be locked until the specified date and time. Email notifications will be sent to all recipients when it opens.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateDialogOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCapsule}
              variant="contained"
              disabled={uploading}
              startIcon={<Send />}
            >
              {uploading ? 'Creating...' : 'Create Capsule'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Capsule Dialog */}
        <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
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
                
                {/* Display media */}
                {selectedCapsule.media && selectedCapsule.media.length > 0 && (
                  renderCapsuleMedia(selectedCapsule.media)
                )}
                
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

        {/* Photo Viewer */}
        <PhotoViewer
          open={photoViewerOpen}
          onClose={() => setPhotoViewerOpen(false)}
          photos={selectedPhotos}
          initialIndex={selectedPhotoIndex}
        />
      </Box>
    </LocalizationProvider>
  );
};

export default CapsulesPage;