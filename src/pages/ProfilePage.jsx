// src/pages/ProfilePage.jsx - Complete with Avatar Upload
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
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Chip,
  Tabs,
  Tab,
  LinearProgress
} from '@mui/material';
import {
  Person,
  Settings,
  BarChart,
  Edit,
  Save,
  Cancel,
  Logout,
  Analytics,
  PhotoCamera,
  AccountCircle
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import AnalyticsDashboard from '../components/profile/AnalyticsDashboard';

const ProfilePage = () => {
  const { user, logout, setUser } = useAuth(); // Added setUser to update context
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  
  // Avatar upload state
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  
  // Profile form data
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || '',
    language: user?.language || 'en',
    theme_mode: user?.theme_mode || 'light'
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
        bio: user.bio || '',
        language: user.language || 'en',
        theme_mode: user.theme_mode || 'light'
      });
      setAvatarPreview(user.avatar_url || null);
    }
  }, [user]);

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
      setUser(updatedUser); // Update user in context
      
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
    if (passwordData.new_password !== passwordData.confirm_new_password) {
      setError('New passwords do not match');
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
      setError(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || '',
      language: user?.language || 'en',
      theme_mode: user?.theme_mode || 'light'
    });
    setEditMode(false);
    setError('');
    
    // Reset avatar changes
    setSelectedAvatar(null);
    setAvatarPreview(user?.avatar_url || null);
  };

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Profile & Analytics
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
        {/* Tab Navigation */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={tabValue} 
            onChange={(e, newValue) => setTabValue(newValue)}
            centered
          >
            <Tab label="Profile & Settings" icon={<Person />} />
            <Tab label="Analytics Dashboard" icon={<Analytics />} />
          </Tabs>
        </Paper>

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Profile Tab */}
        {tabValue === 0 && (
          <Grid container spacing={3}>
            {/* Profile Section */}
            <Grid item xs={12} md={8}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Person color="primary" />
                    <Typography variant="h6">Profile Information</Typography>
                    {!editMode && (
                      <IconButton onClick={() => setEditMode(true)}>
                        <Edit />
                      </IconButton>
                    )}
                  </Box>

                  {/* Avatar Upload Section */}
                  <Card variant="outlined" sx={{ mb: 3, p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Profile Photo
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Box sx={{ position: 'relative' }}>
                        <Avatar
                          src={avatarPreview}
                          sx={{ 
                            width: 100, 
                            height: 100,
                            bgcolor: 'primary.main'
                          }}
                        >
                          {!avatarPreview && (
                            <AccountCircle sx={{ fontSize: 60 }} />
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
                              backgroundColor: 'white',
                              border: '2px solid',
                              borderColor: 'primary.main',
                              '&:hover': { backgroundColor: 'grey.100' }
                            }}
                          >
                            <PhotoCamera fontSize="small" />
                          </IconButton>
                        </label>
                      </Box>
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          Upload a new avatar. Max 5MB • JPG, PNG, GIF
                        </Typography>
                        
                        {selectedAvatar && (
                          <>
                            <Typography variant="caption" display="block" color="primary">
                              New avatar selected: {selectedAvatar.name}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              <Button
                                variant="contained"
                                size="small"
                                onClick={handleAvatarUpload}
                                disabled={avatarUploading}
                                sx={{ mr: 1 }}
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
                              >
                                Cancel
                              </Button>
                            </Box>
                          </>
                        )}
                        
                        {avatarUploading && (
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress />
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Card>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Username"
                        value={profileData.username}
                        onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                        disabled={!editMode}
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
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={!editMode}>
                        <InputLabel>Language</InputLabel>
                        <Select
                          value={profileData.language}
                          label="Language"
                          onChange={(e) => setProfileData({...profileData, language: e.target.value})}
                        >
                          <MenuItem value="en">English</MenuItem>
                          <MenuItem value="ar">Arabic</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth disabled={!editMode}>
                        <InputLabel>Theme</InputLabel>
                        <Select
                          value={profileData.theme_mode}
                          label="Theme"
                          onChange={(e) => setProfileData({...profileData, theme_mode: e.target.value})}
                        >
                          <MenuItem value="light">Light Mode</MenuItem>
                          <MenuItem value="dark">Dark Mode</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>

                  {editMode && (
                    <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                      <Button
                        variant="contained"
                        startIcon={<Save />}
                        onClick={handleProfileUpdate}
                        disabled={loading}
                      >
                        Save Changes
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<Cancel />}
                        onClick={handleCancel}
                      >
                        Cancel
                      </Button>
                    </Box>
                  )}

                  <Divider sx={{ my: 3 }} />

                  {/* Password Change Section */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Security
                    </Typography>
                    {!showPasswordChange ? (
                      <Button
                        variant="outlined"
                        onClick={() => setShowPasswordChange(true)}
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
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="New Password"
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Confirm New Password"
                            type="password"
                            value={passwordData.confirm_new_password}
                            onChange={(e) => setPasswordData({...passwordData, confirm_new_password: e.target.value})}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                              variant="contained"
                              onClick={handlePasswordChange}
                              disabled={loading}
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
            </Grid>

            {/* Stats Section */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                    <BarChart color="primary" />
                    <Typography variant="h6">Your Statistics</Typography>
                  </Box>

                  {stats ? (
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {stats.total_entries}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Entries
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {stats.current_streak}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Current Streak
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {stats.total_photos}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Photos
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={6}>
                        <Paper sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="h4" color="primary">
                            {stats.total_challenges_completed}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Challenges
                          </Typography>
                        </Paper>
                      </Grid>

                      <Grid item xs={12}>
                        <Typography variant="subtitle2" gutterBottom>
                          Mood Distribution
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(stats.mood_distribution || {}).map(([mood, count]) => (
                            <Chip
                              key={mood}
                              label={`Level ${mood}: ${count}`}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </Grid>
                    </Grid>
                  ) : (
                    <Typography color="text.secondary">
                      Loading statistics...
                    </Typography>
                  )}
                </CardContent>
              </Card>

              {/* Account Actions */}
              <Card sx={{ mt: 2 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Account Actions
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Member since: {new Date(user?.created_at).toLocaleDateString()}
                  </Typography>

                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Logout />}
                    onClick={logout}
                    fullWidth
                  >
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Analytics Tab */}
        {tabValue === 1 && (
          <AnalyticsDashboard />
        )}
      </Container>
    </Box>
  );
};

export default ProfilePage;