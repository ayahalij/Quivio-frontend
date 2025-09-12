// src/components/auth/Register.jsx - With Avatar Upload
import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  Link,
  Checkbox,
  FormControlLabel,
  Avatar,
  IconButton,
  Card,
  CardContent
} from '@mui/material';
import { PhotoCamera, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  // Avatar state
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLocalError(null);
  };

  const handleAvatarSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setLocalError('Please select an image file for your avatar');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setLocalError('Avatar file size must be less than 5MB');
        return;
      }

      setSelectedAvatar(file);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirm_password) {
      setLocalError('Please fill in all required fields');
      return false;
    }

    if (formData.username.length < 3) {
      setLocalError('Username must be at least 3 characters long');
      return false;
    }

    if (formData.password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return false;
    }

    if (formData.password !== formData.confirm_password) {
      setLocalError('Passwords do not match');
      return false;
    }

    if (!agreedToTerms) {
      setLocalError('Please agree to the terms');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLocalError(null);
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Register user first
      const result = await register(formData);
      
      // Upload avatar if selected
      if (selectedAvatar) {
        const avatarFormData = new FormData();
        avatarFormData.append('file', selectedAvatar);
        
        try {
          // You'll need to add this API call to your ApiService
          await fetch('/users/avatar', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: avatarFormData
          });
        } catch (avatarError) {
          console.error('Avatar upload failed:', avatarError);
          // Don't fail registration if avatar upload fails
        }
      }
      
      navigate('/dashboard');
      
    } catch (error) {
      console.log('Registration failed:', error);
      
      let errorMessage = 'Registration failed';
      
      if (error.response?.data?.detail) {
        if (Array.isArray(error.response.data.detail)) {
          errorMessage = error.response.data.detail.map(err => 
            err.msg || err.toString()
          ).join(', ');
        } else {
          errorMessage = error.response.data.detail;
        }
      } else if (error.response?.data) {
        errorMessage = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setLocalError(errorMessage);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ padding: 4 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Join Quivio
          </Typography>

          {localError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {localError}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            {/* Avatar Upload Section */}
            <Card variant="outlined" sx={{ mb: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Profile Photo (Optional)
                </Typography>
                
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <Avatar
                    src={avatarPreview}
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      mx: 'auto', 
                      mb: 1,
                      bgcolor: 'primary.main'
                    }}
                  >
                    {!avatarPreview && <AccountCircle sx={{ fontSize: 50 }} />}
                  </Avatar>
                  
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="avatar-upload"
                    type="file"
                    onChange={handleAvatarSelect}
                  />
                  <label htmlFor="avatar-upload">
                    <IconButton
                      color="primary"
                      component="span"
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
                
                <Typography variant="caption" display="block" color="text.secondary">
                  Max 5MB • JPG, PNG, GIF
                </Typography>
              </CardContent>
            </Card>

            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              helperText="At least 3 characters"
            />

            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
              helperText="At least 8 characters"
            />

            <TextField
              fullWidth
              label="Confirm Password"
              name="confirm_password"
              type="password"
              value={formData.confirm_password}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Bio (Optional)"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              margin="normal"
              multiline
              rows={2}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  color="primary"
                />
              }
              label="I agree to the Terms and Conditions"
              sx={{ mt: 2 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </Box>

          <Box textAlign="center">
            <Link component={RouterLink} to="/login">
              Already have an account? Sign In
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;