// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  Paper,
  IconButton,
  Chip,
  Tabs,
  Tab,
  LinearProgress,
  BottomNavigation,
  BottomNavigationAction,
  CircularProgress
} from '@mui/material';
import {
  Person,
  BarChart,
  Edit,
  Save,
  Cancel,
  Analytics,
  PhotoCamera,
  AccountCircle,
  Home,
  CalendarToday,
  TrendingUp,
  TrendingDown,
  Mood,
  Star
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import AnalyticsDashboard from '../components/profile/AnalyticsDashboard';

const ProfilePage = () => {
  const { user, logout, setUser } = useAuth();
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  
  // Bottom navigation
  const [navValue, setNavValue] = useState(3); // Profile page is index 3
  
  // Avatar upload state
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });

  // Password change data
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: ''
  });
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  useEffect(() => {
    fetchUserStats();
  }, []);

  // Update profile data when user changes
  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
        bio: user.bio || ''
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

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

  const fetchUserStats = async () => {
    try {
      const result = await ApiService.getUserStats();
      setStats(result);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleAvatarSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('Avatar file size must be less than 5MB');
        return;
      }

      setSelectedAvatar(file);
      
      // Create preview URL
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setError('');
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatar) return;

    setAvatarUploading(true);
    setError('');

    try {
      const result = await ApiService.uploadAvatar(selectedAvatar);
      
      // Refresh user data to get updated avatar URL
      const updatedUser = await ApiService.getCurrentUser();
      setUser(updatedUser);
      
      setSuccess('Avatar updated successfully!');
      setSelectedAvatar(null);
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (error) {
      console.error('Avatar upload failed:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to upload avatar. Please try again.');
      }
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await ApiService.updateProfile(profileData);
      
      // Refresh user data
      const updatedUser = await ApiService.getCurrentUser();
      setUser(updatedUser);
      
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Profile update failed:', error);
      setError(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Client-side validation
    if (!passwordData.current_password.trim()) {
      setError('Current password is required');
      return;
    }

    if (!passwordData.new_password.trim()) {
      setError('New password is required');
      return;
    }

    if (!passwordData.confirm_new_password.trim()) {
      setError('Please confirm your new password');
      return;
    }

    if (passwordData.new_password.length < 8) {
      setError('New password must be at least 8 characters long');
      return;
    }

    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.new_password === passwordData.current_password) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await ApiService.api.post('/users/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password,
        confirm_new_password: passwordData.confirm_new_password
      });
      
      setSuccess('Password changed successfully!');
      setPasswordData({
        current_password: '',
        new_password: '',
        confirm_new_password: ''
      });
      setShowPasswordChange(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Password change failed:', error);
      
      // Properly handle different error types
      let errorMessage = 'Failed to change password';
      
      if (error.response?.data?.detail) {
        const detail = error.response.data.detail;
        
        // Handle validation errors (arrays of error objects)
        if (Array.isArray(detail)) {
          errorMessage = detail
            .map(err => {
              if (typeof err === 'object' && err.msg) {
                return err.msg;
              } else if (typeof err === 'string') {
                return err;
              }
              return 'Validation error';
            })
            .join('. ');
        } 
        // Handle string errors
        else if (typeof detail === 'string') {
          errorMessage = detail;
        }
        // Handle object errors
        else if (typeof detail === 'object') {
          errorMessage = JSON.stringify(detail);
        }
      } 
      // Handle specific HTTP status codes
      else if (error.response?.status === 400) {
        errorMessage = 'Current password is incorrect';
      } else if (error.response?.status === 422) {
        errorMessage = 'Password requirements not met. Password must be at least 8 characters long.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
    setEditMode(false);
    setError('');
    
    // Reset avatar changes
    setSelectedAvatar(null);
    setAvatarPreview(user?.avatar_url || null);
  };

  if (!user) {
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
                onClick={logout}
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
          {/* Tab Navigation */}
          <Card sx={{ 
            mb: 3,
            backgroundColor: '#fffbef',
            border: '3px solid #8761a7',
            borderRadius: 4
          }}>
            <Tabs 
              value={tabValue} 
              onChange={(e, newValue) => setTabValue(newValue)}
              centered
              sx={{
                '& .MuiTab-root': {
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: '#8761a7',
                    backgroundColor: '#dce291'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#8761a7',
                  height: '3px'
                }
              }}
            >
              <Tab label="Profile & Settings" icon={<Person />} />
              <Tab label="Analytics Dashboard" icon={<Analytics />} />
            </Tabs>
          </Card>

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
            >
              {error}
            </Alert>
          )}

          {/* Profile Tab */}
          {tabValue === 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              width: '100%' 
            }}>
              {/* Profile Section - Centered */}
              <Box sx={{ width: '100%', maxWidth: '800px' }}>
                <Card sx={{
                  backgroundColor: '#fffbef',
                  border: '3px solid #8761a7',
                  borderRadius: 4,
                  width: '100%'
                }}>
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                      <Person sx={{ color: '#8761a7', fontSize: 28 }} />
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontFamily: '"Kalam", cursive',
                          color: '#8761a7',
                          fontWeight: 600,
                          fontSize: '1.4rem'
                        }}
                      >
                        Profile Information
                      </Typography>
                      {!editMode && (
                        <IconButton onClick={() => setEditMode(true)}>
                          <Edit sx={{ color: '#8761a7' }} />
                        </IconButton>
                      )}
                    </Box>

                    {/* Avatar Upload Section */}
                    <Card 
                      variant="outlined" 
                      sx={{ 
                        mb: 3, 
                        p: 3,
                        backgroundColor: '#dce291',
                        border: '2px solid #8761a7',
                        borderRadius: 3
                      }}
                    >
                      <Typography 
                        variant="subtitle2" 
                        gutterBottom
                        sx={{ 
                          fontFamily: '"Kalam", cursive',
                          color: '#8761a7',
                          fontWeight: 600,
                          fontSize: '1.1rem'
                        }}
                      >
                        Profile Photo
                      </Typography>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Box sx={{ position: 'relative' }}>
                          <Avatar
                            src={avatarPreview}
                            sx={{ 
                              width: 100, 
                              height: 100,
                              bgcolor: '#8761a7',
                              border: '3px solid #8761a7'
                            }}
                          >
                            {!avatarPreview && (
                              <AccountCircle sx={{ fontSize: 60, color: '#fffefb' }} />
                            )}
                          </Avatar>
                          
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="avatar-upload"
                            type="file"
                            onChange={handleAvatarSelect}
                            disabled={avatarUploading}
                          />
                          <label htmlFor="avatar-upload">
                            <IconButton
                              color="primary"
                              component="span"
                              disabled={avatarUploading}
                              sx={{
                                position: 'absolute',
                                bottom: -5,
                                right: -5,
                                backgroundColor: '#cdd475',
                                border: '2px solid #8761a7',
                                color: '#8761a7',
                                '&:hover': { 
                                  backgroundColor: '#dce291',
                                  transform: 'scale(1.1)'
                                }
                              }}
                            >
                              <PhotoCamera fontSize="small" />
                            </IconButton>
                          </label>
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography 
                            variant="body2" 
                            paragraph
                            sx={{ 
                              fontFamily: '"Kalam", cursive',
                              color: '#8761a7',
                              fontSize: '1rem'
                            }}
                          >
                            Upload a new avatar. Max 5MB • JPG, PNG, GIF
                          </Typography>
                          
                          {selectedAvatar && (
                            <>
                              <Typography 
                                variant="caption" 
                                display="block" 
                                sx={{ 
                                  color: '#8761a7',
                                  fontFamily: '"Kalam", cursive',
                                  fontWeight: 600
                                }}
                              >
                                New avatar selected: {selectedAvatar.name}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  onClick={handleAvatarUpload}
                                  disabled={avatarUploading}
                                  sx={{ 
                                    mr: 1,
                                    backgroundColor: '#cdd475',
                                    color: '#8761a7',
                                    fontFamily: '"Kalam", cursive',
                                    fontWeight: 600,
                                    '&:hover': {
                                      backgroundColor: '#dce291'
                                    }
                                  }}
                                >
                                  {avatarUploading ? 'Uploading...' : 'Upload Avatar'}
                                </Button>
                                <Button
                                  variant="outlined"
                                  size="small"
                                  onClick={() => {
                                    setSelectedAvatar(null);
                                    setAvatarPreview(user?.avatar_url || null);
                                  }}
                                  disabled={avatarUploading}
                                  sx={{
                                    color: '#8761a7',
                                    borderColor: '#8761a7',
                                    fontFamily: '"Kalam", cursive',
                                    fontWeight: 600,
                                    '&:hover': {
                                      borderColor: '#8761a7',
                                      backgroundColor: 'rgba(135, 97, 167, 0.1)'
                                    }
                                  }}
                                >
                                  Cancel
                                </Button>
                              </Box>
                            </>
                          )}
                          
                          {avatarUploading && (
                            <Box sx={{ mt: 1 }}>
                              <LinearProgress 
                                sx={{
                                  '& .MuiLinearProgress-bar': {
                                    backgroundColor: '#8761a7'
                                  }
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Card>

                    {/* Basic Profile Fields */}
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Username"
                          value={profileData.username}
                          onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                          disabled={!editMode}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontFamily: '"Kalam", cursive',
                              backgroundColor: editMode ? '#fffefb' : '#f5f5f5',
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
                                color: '#8761a7'
                              }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          disabled={!editMode}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontFamily: '"Kalam", cursive',
                              backgroundColor: editMode ? '#fffefb' : '#f5f5f5',
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
                                color: '#8761a7'
                              }
                            }
                          }}
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Bio"
                          multiline
                          rows={3}
                          value={profileData.bio}
                          onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                          disabled={!editMode}
                          placeholder="Tell us about yourself..."
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              fontFamily: '"Kalam", cursive',
                              backgroundColor: editMode ? '#fffefb' : '#f5f5f5',
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
                                color: '#8761a7'
                              }
                            }
                          }}
                        />
                      </Grid>
                    </Grid>

                    {editMode && (
                      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                        <Button
                          variant="contained"
                          startIcon={<Save />}
                          onClick={handleProfileUpdate}
                          disabled={loading}
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
                          Save Changes
                        </Button>
                        <Button
                          variant="outlined"
                          startIcon={<Cancel />}
                          onClick={handleCancel}
                          sx={{
                            color: '#8761a7',
                            borderColor: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: '#8761a7',
                              backgroundColor: 'rgba(135, 97, 167, 0.1)'
                            }
                          }}
                        >
                          Cancel
                        </Button>
                      </Box>
                    )}

                    <Divider sx={{ my: 3, borderColor: '#8761a7' }} />

                    {/* Password Change Section */}
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="h6" 
                        gutterBottom
                        sx={{ 
                          fontFamily: '"Kalam", cursive',
                          color: '#8761a7',
                          fontWeight: 600,
                          fontSize: '1.3rem'
                        }}
                      >
                        Security
                      </Typography>
                      {!showPasswordChange ? (
                        <Button
                          variant="outlined"
                          onClick={() => setShowPasswordChange(true)}
                          sx={{
                            color: '#8761a7',
                            borderColor: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            fontWeight: 600,
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: '#8761a7',
                              backgroundColor: 'rgba(135, 97, 167, 0.1)'
                            }
                          }}
                        >
                          Change Password
                        </Button>
                      ) : (
                        <Grid container spacing={2}>
                          <Grid item xs={12}>
                            <TextField
                              fullWidth
                              label="Current Password"
                              type="password"
                              value={passwordData.current_password}
                              onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  fontFamily: '"Kalam", cursive'
                                },
                                '& .MuiInputLabel-root': {
                                  fontFamily: '"Kalam", cursive',
                                  color: '#8761a7'
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="New Password"
                              type="password"
                              value={passwordData.new_password}
                              onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  fontFamily: '"Kalam", cursive'
                                },
                                '& .MuiInputLabel-root': {
                                  fontFamily: '"Kalam", cursive',
                                  color: '#8761a7'
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              fullWidth
                              label="Confirm New Password"
                              type="password"
                              value={passwordData.confirm_new_password}
                              onChange={(e) => setPasswordData({...passwordData, confirm_new_password: e.target.value})}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  fontFamily: '"Kalam", cursive'
                                },
                                '& .MuiInputLabel-root': {
                                  fontFamily: '"Kalam", cursive',
                                  color: '#8761a7'
                                }
                              }}
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2 }}>
                              <Button
                                variant="contained"
                                onClick={handlePasswordChange}
                                disabled={
                                  loading || 
                                  !passwordData.current_password.trim() ||
                                  !passwordData.new_password.trim() ||
                                  !passwordData.confirm_new_password.trim()
                                }
                                sx={{
                                  backgroundColor: (
                                    passwordData.current_password.trim() &&
                                    passwordData.new_password.trim() &&
                                    passwordData.confirm_new_password.trim() &&
                                    !loading
                                  ) ? '#cdd475' : '#f0f0f0',
                                  color: (
                                    passwordData.current_password.trim() &&
                                    passwordData.new_password.trim() &&
                                    passwordData.confirm_new_password.trim() &&
                                    !loading
                                  ) ? '#8761a7' : '#999',
                                  border: (
                                    passwordData.current_password.trim() &&
                                    passwordData.new_password.trim() &&
                                    passwordData.confirm_new_password.trim() &&
                                    !loading
                                  ) ? '2px solid #8761a7' : '2px solid #ddd',
                                  borderRadius: 3,
                                  fontFamily: '"Kalam", cursive',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  '&:hover': (
                                    passwordData.current_password.trim() &&
                                    passwordData.new_password.trim() &&
                                    passwordData.confirm_new_password.trim() &&
                                    !loading
                                  ) ? {
                                    backgroundColor: '#dce291'
                                  } : {},
                                  '&:disabled': {
                                    backgroundColor: '#f0f0f0',
                                    color: '#999',
                                    border: '2px solid #ddd',
                                    cursor: 'not-allowed'
                                  }
                                }}
                              >
                                Change Password
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  setShowPasswordChange(false);
                                  setPasswordData({
                                    current_password: '',
                                    new_password: '',
                                    confirm_new_password: ''
                                  });
                                  setError(''); // Clear any existing errors
                                }}
                                sx={{
                                  color: '#8761a7',
                                  borderColor: '#8761a7',
                                  fontFamily: '"Kalam", cursive',
                                  fontWeight: 600,
                                  textTransform: 'none',
                                  '&:hover': {
                                    borderColor: '#8761a7',
                                    backgroundColor: 'rgba(135, 97, 167, 0.1)'
                                  }
                                }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Grid>
                        </Grid>
                      )}
                    </Box>
                  </CardContent>
                </Card>

                {/* Account Actions */}
                <Card sx={{
                  backgroundColor: '#fffbef',
                  border: '3px solid #8761a7',
                  borderRadius: 4,
                  mt: 3
                }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography 
                      variant="h6" 
                      gutterBottom
                      sx={{ 
                        fontFamily: '"Kalam", cursive',
                        color: '#8761a7',
                        fontWeight: 600,
                        fontSize: '1.3rem'
                      }}
                    >
                      Account Actions
                    </Typography>
                    
                    <Typography 
                      variant="body2" 
                      paragraph
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontSize: '1rem'
                      }}
                    >
                      Member since: {new Date(user?.created_at).toLocaleDateString()}
                    </Typography>

                    <Button
                      variant="contained"
                      onClick={logout}
                      fullWidth
                      sx={{
                        backgroundColor: '#ff6b6b',
                        color: 'white',
                        border: '2px solid #d63031',
                        borderRadius: 3,
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600,
                        textTransform: 'none',
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: '#d63031',
                          transform: 'scale(1.02)'
                        }
                      }}
                    >
                      Sign Out
                    </Button>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}

          {/* Analytics Tab */}
          {tabValue === 1 && (
            <Box sx={{ width: '100%' }}>
              <Box sx={{
                '& .MuiCard-root': {
                  backgroundColor: '#fffbef',
                  border: '3px solid #8761a7',
                  borderRadius: 4,
                  width: '100%',
                  mb: 3
                },
                '& .MuiPaper-root': {
                  backgroundColor: '#fffbef',
                  border: '3px solid #8761a7',
                  borderRadius: 4
                },
                '& .MuiTypography-h5, & .MuiTypography-h6': {
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontWeight: 600
                },
                '& .MuiFormControl-root .MuiInputLabel-root, & .MuiFormControl-root .MuiSelect-root': {
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7'
                },
                '& .recharts-text': {
                  fontFamily: '"Kalam", cursive',
                  fill: '#8761a7'
                }
              }}>
                <AnalyticsDashboard />
              </Box>
            </Box>
          )}
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
    </Box>
  );
};

export default ProfilePage;