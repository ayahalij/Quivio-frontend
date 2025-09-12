// src/components/profile/ProfileEdit.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Grid,
  LinearProgress
} from '@mui/material';
import { PhotoCamera, AccountCircle, Save, Close } from '@mui/icons-material';
import ApiService from '../../services/api';

const ProfileEdit = ({ open, onClose, user, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Avatar state
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || null);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleAvatarSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file for your avatar');
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
      setError(null);
    }
  };

  const uploadAvatar = async () => {
    if (!selectedAvatar) return null;

    setAvatarUploading(true);
    try {
      const avatarFormData = new FormData();
      avatarFormData.append('file', selectedAvatar);
      
      const response = await ApiService.api.post('/users/avatar', avatarFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.avatar_url;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      throw new Error('Failed to upload avatar');
    } finally {
      setAvatarUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.username.trim()) {
      setError('Username is required');
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let avatarUrl = user?.avatar_url;
      
      // Upload avatar if changed
      if (selectedAvatar) {
        avatarUrl = await uploadAvatar();
      }

      // Update profile
      const updateData = {
        ...formData,
        avatar_url: avatarUrl
      };

      const response = await ApiService.updateProfile(updateData);
      
      onSuccess && onSuccess(response);
      handleClose();
      
    } catch (error) {
      console.error('Profile update failed:', error);
      
      if (error.message === 'Failed to upload avatar') {
        setError('Failed to upload avatar. Please try again.');
      } else if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Failed to update profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      bio: user?.bio || ''
    });
    setSelectedAvatar(null);
    setAvatarPreview(user?.avatar_url || null);
    setError(null);
    setLoading(false);
    setAvatarUploading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountCircle color="primary" />
          Edit Profile
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {(loading || avatarUploading) && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              {avatarUploading ? 'Uploading avatar...' : 'Updating profile...'}
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* Avatar Section */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="subtitle2" gutterBottom>
              Profile Photo
            </Typography>
            
            <Box sx={{ position: 'relative', display: 'inline-block' }}>
              <Avatar
                src={avatarPreview}
                sx={{ 
                  width: 100, 
                  height: 100, 
                  mx: 'auto', 
                  mb: 1,
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
                id="avatar-upload-edit"
                type="file"
                onChange={handleAvatarSelect}
                disabled={loading || avatarUploading}
              />
              <label htmlFor="avatar-upload-edit">
                <IconButton
                  color="primary"
                  component="span"
                  disabled={loading || avatarUploading}
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
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
            
            <Typography variant="caption" display="block" color="text.secondary">
              Max 5MB • JPG, PNG, GIF
            </Typography>
            
            {selectedAvatar && (
              <Typography variant="caption" display="block" color="primary">
                New avatar selected: {selectedAvatar.name}
              </Typography>
            )}
          </CardContent>
        </Card>

        {/* Profile Form */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              disabled={loading || avatarUploading}
              required
              helperText="This is how others will see your name"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading || avatarUploading}
              required
              helperText="Your email address for account recovery"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              disabled={loading || avatarUploading}
              multiline
              rows={3}
              placeholder="Tell us a bit about yourself..."
              helperText={`${formData.bio.length}/500 characters`}
              inputProps={{ maxLength: 500 }}
            />
          </Grid>
        </Grid>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Your profile information helps personalize your Quivio experience.
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button 
          onClick={handleClose} 
          disabled={loading || avatarUploading}
          startIcon={<Close />}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || avatarUploading}
          startIcon={<Save />}
        >
          {loading || avatarUploading ? 'Saving...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileEdit;