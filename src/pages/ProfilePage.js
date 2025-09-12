// src/pages/ProfilePage.js
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
  Chip
} from '@mui/material';
import {
  Person,
  Settings,
  BarChart,
  Edit,
  Save,
  Cancel,
  Logout
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';

const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  
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

  const fetchUserStats = async () => {
    try {
      const result = await ApiService.getUserStats();
      setStats(result);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await ApiService.updateProfile(profileData);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
      
      // Update local user data if needed
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
  };

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Profile & Settings
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.username?.charAt(0).toUpperCase()}
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
      </Container>
    </Box>
  );
};

export default ProfilePage;