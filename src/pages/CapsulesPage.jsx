// src/pages/CapsulesPage.jsx
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
  Avatar,
  Alert,
  CircularProgress,
  IconButton,
  ImageList,
  ImageListItem,
  LinearProgress,
  FormControlLabel,
  Checkbox,
  Divider,
  BottomNavigation,
  BottomNavigationAction,
  Paper
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
  PersonAdd,
  Home,
  CalendarToday,
  PhotoCamera,
  Person
} from '@mui/icons-material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import PhotoViewer from '../components/common/PhotoViewer';

const CapsulesPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Bottom navigation
  const [navValue, setNavValue] = useState(2); // Capsules page is index 2
  
  // Create capsule dialog
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [capsuleData, setCapsuleData] = useState({
    title: '',
    message: '',
    open_date: dayjs().add(1, 'week'),
    is_private: true
  });

  // Recipient management
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

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Add recipient email field
  const addRecipientField = () => {
    if (recipientEmails.length < 30) {
      setRecipientEmails([...recipientEmails, '']);
    }
  };

  // Remove recipient email field
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

  // Update recipient email
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

  const handleBottomNavigation = (event, newValue) => {
    setNavValue(newValue);
    switch(newValue) {
      case 0:
        navigate('/dashboard');
        break;
      case 1:
        navigate('/timeline');
        break;
      case 2:
        navigate('/capsules');
        break;
      case 3:
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    logout()
    setTimeout(() => {
      navigate('/')
    }, 100)
  }

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
      
      // Add recipient emails
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

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ backgroundColor: '#fffefb' }}
      >
        <CircularProgress sx={{ color: '#8761a7' }} />
      </Box>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ 
        backgroundColor: '#fffefb', 
        minHeight: '100vh',
        paddingBottom: '80px' // Space for bottom navigation
      }}>
        {/* Header - Same as Dashboard */}
        <Box sx={{ 
          backgroundColor: '#fffefb',
          borderBottom: '3px solid #8761a7',
          boxShadow: '0 2px 10px rgba(135, 97, 167, 0.1)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <Container maxWidth="lg">
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              py: 1,
              px: 3
            }}>
              {/* Logo */}
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  color: '#cdd475',
                  fontWeight: 700,
                  fontSize: { xs: '1.6rem', md: '2rem' }
                }}
              >
                Quivio
              </Typography>

              {/* User Section */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 2,
                backgroundColor: '#cdd475',
                borderRadius: '18px',
                padding: '6px 14px',
                border: '2px solid #8761a7'
              }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#8761a7',
                    fontFamily: '"Kalam", cursive',
                    fontWeight: 600,
                    fontSize: { xs: '0.9rem', md: '1rem' }
                  }}
                >
                  {user?.username}
                </Typography>
                <Avatar 
                  src={user?.avatar_url} 
                  sx={{ 
                    width: { xs: 32, md: 36 }, 
                    height: { xs: 32, md: 36 },
                    border: '2px solid #8761a7',
                    bgcolor: '#fffefb'
                  }}
                >
                  {(!user?.avatar_url) && user?.username?.charAt(0).toUpperCase()}
                </Avatar>
                <Button 
                  onClick={handleLogout}
                  sx={{ 
                    color: '#8761a7',
                    fontFamily: '"Kalam", cursive',
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: { xs: '0.8rem', md: '0.9rem' },
                    backgroundColor: '#fffefb',
                    border: '2px solid #8761a7',
                    borderRadius: '14px',
                    px: 2,
                    py: 0.25,
                    minHeight: 'auto',
                    '&:hover': {
                      backgroundColor: '#fdfedbff',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  Logout
                </Button>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Main Content */}
        <Container maxWidth="xl" sx={{ 
          px: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)'
        }}>
          <Box sx={{ width: '100%', maxWidth: '1400px', mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography 
                variant="h4" 
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontWeight: 700
                }}
              >
                Memory Capsules
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setCreateDialogOpen(true)}
                sx={{
                  backgroundColor: '#cdd475',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1.5,
                  px: 3,
                  boxShadow: '0 4px 15px rgba(205, 212, 117, 0.3)',
                  '&:hover': {
                    backgroundColor: '#eff4b3ff',
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 20px rgba(205, 212, 117, 0.4)',
                  }
                }}
              >
                Create Capsule
              </Button>
            </Box>

            <Typography 
              variant="body1" 
              color="text.secondary" 
              paragraph
              sx={{ 
                fontFamily: '"Kalam", cursive',
                fontSize: '1.1rem',
                color: '#8761a7',
                mb: 4
              }}
            >
              Create time-locked memories with photos and videos for your future self or share them with others. Set a date and time, and your capsule will only open when that moment arrives.
            </Typography>

            {success && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  backgroundColor: '#dce291',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1rem'
                }}
              >
                {success}
              </Alert>
            )}

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  backgroundColor: '#fffbef',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1rem'
                }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <Grid container spacing={4}>
              {/* Locked Capsules - Left Side */}
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontWeight: 600,
                    fontSize: '1.3rem'
                  }}
                >
                  <Lock sx={{ color: '#8761a7' }} />
                  Locked Capsules ({closedCapsules.length})
                </Typography>
                
                {closedCapsules.length === 0 ? (
                  <Card sx={{
                    backgroundColor: '#fffbef',
                    border: '3px solid #8761a7',
                    borderRadius: 4,
                    height: '200px',
                    width: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Lock sx={{ fontSize: 48, color: '#8761a7', mb: 2 }} />
                      <Typography 
                        sx={{ 
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          fontSize: '1rem'
                        }}
                      >
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
                            backgroundColor: '#fffbef',
                            border: '3px solid #8761a7',
                            borderRadius: 4,
                            height: '240px',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(135, 97, 167, 0.2)'
                            }
                          }}
                          onClick={() => handleOpenCapsule(capsule)}
                        >
                          <CardContent sx={{ 
                            p: 2.5, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            height: '100%',
                            width: '100%'
                          }}>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                                <Typography 
                                  variant="h6"
                                  sx={{ 
                                    fontFamily: '"Kalam", cursive',
                                    color: '#8761a7',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    lineHeight: 1.2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    flex: 1,
                                    mr: 1
                                  }}
                                >
                                  {capsule.title}
                                </Typography>
                                <Chip
                                  icon={<Schedule />}
                                  label={getTimeUntilOpen(capsule.open_date)}
                                  size="small"
                                  sx={{
                                    backgroundColor: '#dce291',
                                    color: '#8761a7',
                                    fontFamily: '"Kalam", cursive',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    flexShrink: 0
                                  }}
                                />
                              </Box>
                              
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: '#8761a7',
                                  fontFamily: '"Kalam", cursive',
                                  fontSize: '0.85rem',
                                  mb: 1.5
                                }}
                              >
                                Opens {dayjs(capsule.open_date).format('MMM D, YYYY')}
                              </Typography>
                            </Box>

                            <Box>
                              {/* Media count indicators */}
                              {capsule.media && capsule.media.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                                  {capsule.media.filter(m => m.media_type === 'image').length > 0 && (
                                    <Chip
                                      icon={<ImageIcon />}
                                      label={capsule.media.filter(m => m.media_type === 'image').length}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderColor: '#8761a7',
                                        color: '#8761a7',
                                        fontFamily: '"Kalam", cursive',
                                        height: '24px',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  )}
                                  {capsule.media.filter(m => m.media_type === 'video').length > 0 && (
                                    <Chip
                                      icon={<VideoFile />}
                                      label={capsule.media.filter(m => m.media_type === 'video').length}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderColor: '#8761a7',
                                        color: '#8761a7',
                                        fontFamily: '"Kalam", cursive',
                                        height: '24px',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                              
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#8761a7',
                                  fontFamily: '"Kalam", cursive',
                                  fontSize: '0.75rem'
                                }}
                              >
                                Created {dayjs(capsule.created_at).format('MMM D, YYYY')}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>

              {/* Opened Capsules - Right Side */}
              <Grid item xs={12} md={6}>
                <Typography 
                  variant="h6" 
                  gutterBottom 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontWeight: 600,
                    fontSize: '1.3rem'
                  }}
                >
                  <LockOpen sx={{ color: '#cdd475' }} />
                  Opened Capsules ({openCapsules.length})
                </Typography>
                
                {openCapsules.length === 0 ? (
                  <Card sx={{
                    backgroundColor: '#fffbef',
                    border: '3px solid #8761a7',
                    borderRadius: 4,
                    height: '200px',
                    width: '100%'
                  }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <LockOpen sx={{ fontSize: 48, color: '#cdd475', mb: 2 }} />
                      <Typography 
                        sx={{ 
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          fontSize: '1rem'
                        }}
                      >
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
                            backgroundColor: '#fffbef',
                            border: '3px solid #cdd475',
                            borderRadius: 4,
                            height: '240px',
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            '&:hover': { 
                              transform: 'translateY(-4px)',
                              boxShadow: '0 8px 25px rgba(205, 212, 117, 0.3)'
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: '-3px',
                              left: '-3px',
                              right: '-3px',
                              bottom: '-3px',
                              background: 'linear-gradient(45deg, #edf3a6ff, #fbfed3ff)',
                              borderRadius: 4,
                              zIndex: -1
                            }
                          }}
                          onClick={() => handleOpenCapsule(capsule)}
                        >
                          <CardContent sx={{ 
                            p: 2.5, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            height: '100%',
                            width: '100%'
                          }}>
                            <Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1.5 }}>
                                <Typography 
                                  variant="h6"
                                  sx={{ 
                                    fontFamily: '"Kalam", cursive',
                                    color: '#8761a7',
                                    fontWeight: 600,
                                    fontSize: '1.1rem',
                                    lineHeight: 1.2,
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    flex: 1,
                                    mr: 1
                                  }}
                                >
                                  {capsule.title}
                                </Typography>
                                <Chip
                                  icon={<LockOpen />}
                                  label="Opened"
                                  size="small"
                                  sx={{
                                    backgroundColor: '#dce291',
                                    color: '#8761a7',
                                    fontFamily: '"Kalam", cursive',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    flexShrink: 0
                                  }}
                                />
                              </Box>
                              
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: '#8761a7',
                                  fontFamily: '"Kalam", cursive',
                                  fontSize: '0.85rem',
                                  mb: 1.5
                                }}
                              >
                                Opened {dayjs(capsule.opened_at).format('MMM D, YYYY')}
                              </Typography>
                            </Box>

                            <Box>
                              {/* Media count indicators */}
                              {capsule.media && capsule.media.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
                                  {capsule.media.filter(m => m.media_type === 'image').length > 0 && (
                                    <Chip
                                      icon={<ImageIcon />}
                                      label={capsule.media.filter(m => m.media_type === 'image').length}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderColor: '#8761a7',
                                        color: '#8761a7',
                                        fontFamily: '"Kalam", cursive',
                                        height: '24px',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  )}
                                  {capsule.media.filter(m => m.media_type === 'video').length > 0 && (
                                    <Chip
                                      icon={<VideoFile />}
                                      label={capsule.media.filter(m => m.media_type === 'video').length}
                                      size="small"
                                      variant="outlined"
                                      sx={{
                                        borderColor: '#8761a7',
                                        color: '#8761a7',
                                        fontFamily: '"Kalam", cursive',
                                        height: '24px',
                                        fontSize: '0.7rem'
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                              
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#8761a7',
                                  fontFamily: '"Kalam", cursive',
                                  fontSize: '0.75rem'
                                }}
                              >
                                Created {dayjs(capsule.created_at).format('MMM D, YYYY')}
                              </Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Grid>
            </Grid>
          </Box>
        </Container>

        {/* Bottom Navigation */}
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0,
            backgroundColor: '#cdd475',
            borderTop: '3px solid #8761a7',
            boxShadow: '0 -4px 20px rgba(135, 97, 167, 0.15)'
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={navValue}
            onChange={handleBottomNavigation}
            sx={{
              backgroundColor: 'transparent',
              height: '70px',
              '& .MuiBottomNavigationAction-root': {
                color: '#8761a7',
                fontFamily: '"Kalam", cursive',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: '#8761a7',
                  fontWeight: 600,
                }
              }
            }}
          >
            <BottomNavigationAction 
              label="Home" 
              icon={<Home sx={{ fontSize: 30 }} />} 
            />
            <BottomNavigationAction 
              label="Calendar" 
              icon={<CalendarToday sx={{ fontSize: 30 }} />} 
            />
            <BottomNavigationAction 
              label="Capsules" 
              icon={<PhotoCamera sx={{ fontSize: 30 }} />} 
            />
            <BottomNavigationAction 
              label="Profile" 
              icon={<Person sx={{ fontSize: 30 }} />} 
            />
          </BottomNavigation>
        </Paper>

        {/* Create Capsule Dialog */}
        <Dialog 
          open={createDialogOpen} 
          onClose={() => setCreateDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#fffbef',
              border: '3px solid #8761a7',
              borderRadius: 4
            }
          }}
        >
          <DialogTitle sx={{ 
            fontFamily: '"Kalam", cursive',
            color: '#8761a7',
            fontWeight: 600,
            fontSize: '1.5rem'
          }}>
            Create Memory Capsule
          </DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Capsule Title"
              value={capsuleData.title}
              onChange={(e) => setCapsuleData({...capsuleData, title: e.target.value})}
              margin="normal"
              placeholder="What is this memory about?"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: '"Kalam", cursive',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8761a7'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8761a7',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  '&.Mui-focused': {
                    color: '#cdd475'
                  }
                }
              }}
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
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: '"Kalam", cursive',
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8761a7'
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#8761a7',
                    borderWidth: '2px'
                  }
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  '&.Mui-focused': {
                    color: '#cdd475'
                  }
                }
              }}
            />

            <DateTimePicker
              label="Open Date & Time"
              value={capsuleData.open_date}
              onChange={(newValue) => setCapsuleData({...capsuleData, open_date: newValue})}
              sx={{ 
                width: '100%', 
                mt: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  fontFamily: '"Kalam", cursive'
                },
                '& .MuiInputLabel-root': {
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7'
                }
              }}
              minDateTime={dayjs().add(1, 'hour')}
            />

            <Divider sx={{ my: 3, borderColor: '#8761a7' }} />

            {/* Recipient Section */}
            <Box sx={{ mb: 3 }}>
              <Typography 
                variant="subtitle1" 
                gutterBottom 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontWeight: 600
                }}
              >
                <Email sx={{ color: '#8761a7' }} />
                Email Recipients (Optional)
              </Typography>
              <Typography 
                variant="body2" 
                gutterBottom
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  color: '#cdd475'
                }}
              >
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
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        fontFamily: '"Kalam", cursive'
                      },
                      '& .MuiInputLabel-root': {
                        fontFamily: '"Kalam", cursive'
                      }
                    }}
                  />
                  {recipientEmails.length > 1 && (
                    <IconButton onClick={() => removeRecipientField(index)} color="error" size="small">
                      <Delete />
                    </IconButton>
                  )}
                </Box>
              ))}

              <Box>
              <Button
                startIcon={<PersonAdd />}
                onClick={addRecipientField}
                disabled={recipientEmails.length >= 30}
                size="small"
                sx={{ 
                  mt: 1,
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  borderColor: '#8761a7'
                }}
              >
                Add Recipient ({recipientEmails.length}/30)
              </Button>
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={sendToSelf}
                    onChange={(e) => setSendToSelf(e.target.checked)}
                    sx={{ color: '#cdd475' }}
                  />
                }
                label="Send email notification to me when opened"
                sx={{ 
                  mt: 2,
                  '& .MuiFormControlLabel-label': {
                    fontFamily: '"Kalam", cursive',
                    color: '#cdd475'
                  }
                }}
              />
            </Box>

            <Divider sx={{ my: 3, borderColor: '#8761a7' }} />

            {/* Media Upload Section */}
            <Box sx={{ mt: 3 }}>
              <Typography 
                variant="subtitle1" 
                gutterBottom
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontWeight: 600
                }}
              >
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
                  sx={{ 
                    mb: 2,
                    fontFamily: '"Kalam", cursive',
                    color: '#cdd475',
                    borderColor: '#cdd475',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: '#8761a7',
                      borderWidth: '2px',
                      backgroundColor: 'rgba(205, 212, 117, 0.1)'
                    }
                  }}
                >
                  Select Photos & Videos (Max 10 files)
                </Button>
              </label>

              {selectedFiles.length > 0 && (
                <Box>
                  <Typography 
                    variant="body2" 
                    gutterBottom
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7'
                    }}
                  >
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

              <Typography 
                variant="caption" 
                sx={{ 
                  display: 'block', 
                  mt: 1,
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7'
                }}
              >
                • Images: max 10MB each • Videos: max 50MB each
                <br />
                • Supported formats: JPG, PNG, GIF, MP4, MOV, AVI
              </Typography>
            </Box>

            {uploading && (
              <Box sx={{ mt: 2 }}>
                <Typography 
                  variant="body2" 
                  gutterBottom
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7'
                  }}
                >
                  Creating capsule... {uploadProgress}%
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#cdd475'
                    }
                  }}
                />
              </Box>
            )}

            <Typography 
              variant="body2" 
              sx={{ 
                mt: 2,
                fontFamily: '"Kalam", cursive',
                color: '#8761a7'
              }}
            >
              Your capsule will be locked until the specified date and time. Email notifications will be sent to all recipients when it opens.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button 
              onClick={() => setCreateDialogOpen(false)} 
              disabled={uploading}
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#8761a7'
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCapsule}
              variant="contained"
              disabled={uploading}
              startIcon={<Send />}
              sx={{
                backgroundColor: '#cdd475',
                color: '#8761a7',
                border: '2px solid #8761a7',
                borderRadius: 3,
                fontFamily: '"Kalam", cursive',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: '#dce291'
                }
              }}
            >
              {uploading ? 'Creating...' : 'Create Capsule'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Capsule Dialog */}
        <Dialog 
          open={viewDialogOpen} 
          onClose={() => setViewDialogOpen(false)} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: '#fffbef',
              border: '3px solid #8761a7',
              borderRadius: 4
            }
          }}
        >
          {selectedCapsule && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600,
                      fontSize: '1.5rem'
                    }}
                  >
                    {selectedCapsule.title}
                  </Typography>
                  <IconButton onClick={() => setViewDialogOpen(false)}>
                    <Close sx={{ color: '#8761a7' }} />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}
                >
                  {selectedCapsule.message}
                </Typography>
                
                {/* Display media */}
                {selectedCapsule.media && selectedCapsule.media.length > 0 && (
                  renderCapsuleMedia(selectedCapsule.media)
                )}
                
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: '#dce291', 
                  borderRadius: 2,
                  border: '2px solid #8761a7'
                }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600
                    }}
                  >
                    <strong>Created:</strong> {dayjs(selectedCapsule.created_at).format('MMMM D, YYYY at h:mm A')}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600
                    }}
                  >
                    <strong>Scheduled to open:</strong> {dayjs(selectedCapsule.open_date).format('MMMM D, YYYY at h:mm A')}
                  </Typography>
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