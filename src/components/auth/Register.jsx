// src/components/auth/Register.jsx
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
  CardContent,
  LinearProgress
} from '@mui/material';
import { PhotoCamera, AccountCircle } from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import ApiService from '../../services/api';

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
  
  const { register, setUser } = useAuth();
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
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      setLocalError(null);
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
      console.log('Step 1: Registering user...');
      
      // Step 1: Register user first
      const result = await register(formData);
      console.log('Step 2: User registered successfully:', result);
      
      // Step 2: Upload avatar if selected (AFTER registration)
      if (selectedAvatar) {
        console.log('Step 3: Uploading avatar...');
        
        try {
          const avatarResult = await ApiService.uploadAvatar(selectedAvatar);
          console.log('Step 4: Avatar uploaded successfully:', avatarResult);
          
          // Step 3: Refresh user data to get updated avatar
          const updatedUser = await ApiService.getCurrentUser();
          console.log('Step 5: Updated user data:', updatedUser);
          setUser(updatedUser);
          
        } catch (avatarError) {
          console.warn('Avatar upload failed, but registration succeeded:', avatarError);
          // Don't fail registration if avatar upload fails
          setLocalError('Account created successfully, but avatar upload failed. You can upload an avatar later in your profile.');
        }
      }
      
      console.log('Step 6: Navigating to dashboard...');
      navigate('/dashboard');
      
    } catch (error) {
      console.error('Registration failed:', error);
      
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

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  return (
    <Box sx={{ 
      backgroundColor: '#fffefb', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container maxWidth="sm">
        <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
          {/* Quivio Logo */}
          <Typography 
            variant="h2" 
            sx={{ 
              fontFamily: '"Kalam", cursive',
              color: '#cdd475',
              fontWeight: 700,
              mb: 1,
              fontSize: { xs: '2.5rem', md: '3.5rem' }
            }}
          >
            Quivio
          </Typography>

          <Paper 
            elevation={0} 
            sx={{ 
              padding: 4,
              width: '100%',
              backgroundColor: '#fffbef',
              border: '3px solid #8761a7',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(135, 97, 167, 0.15)'
            }}
          >
            <Typography 
              variant="h4" 
              align="center" 
              gutterBottom
              sx={{
                fontFamily: '"Kalam", cursive',
                color: '#8761a7',
                fontWeight: 600,
                fontSize: '1.8rem'
              }}
            >
              Join Quivio
            </Typography>

            {localError && (
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
                {localError}
              </Alert>
            )}

            {loading && (
              <Box sx={{ mb: 3 }}>
                <Typography 
                  variant="body1" 
                  gutterBottom
                  sx={{
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontWeight: 600
                  }}
                >
                  Creating your account...
                </Typography>
                <LinearProgress 
                  sx={{
                    backgroundColor: '#dce291',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#8761a7'
                    }
                  }}
                />
              </Box>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              {/* Avatar Upload Section */}
              <Card 
                variant="outlined" 
                sx={{ 
                  mb: 3,
                  textAlign: 'center',
                  backgroundColor: '#dce291',
                  border: '2px solid #8761a7',
                  borderRadius: 3
                }}
              >
                <CardContent sx={{ p: 3 }}>
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
                        bgcolor: '#8761a7',
                        border: '3px solid #8761a7'
                      }}
                    >
                      {!avatarPreview && <AccountCircle sx={{ fontSize: 50, color: '#fffefb' }} />}
                    </Avatar>
                    
                    <input
                      accept="image/*"
                      style={{ display: 'none' }}
                      id="avatar-upload"
                      type="file"
                      onChange={handleAvatarSelect}
                      disabled={loading}
                    />
                    <label htmlFor="avatar-upload">
                      <IconButton
                        color="primary"
                        component="span"
                        disabled={loading}
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
                          },
                          '&:disabled': {
                            backgroundColor: '#f0f0f0',
                            color: '#999'
                          }
                        }}
                      >
                        <PhotoCamera fontSize="small" />
                      </IconButton>
                    </label>
                  </Box>
                  
                  <Typography 
                    variant="caption" 
                    display="block" 
                    sx={{
                      color: '#8761a7',
                      fontFamily: '"Kalam", cursive',
                      fontSize: '0.9rem'
                    }}
                  >
                    Max 5MB • JPG, PNG, GIF
                  </Typography>
                  
                  {selectedAvatar && (
                    <Typography 
                      variant="caption" 
                      display="block" 
                      sx={{ 
                        mt: 1,
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600
                      }}
                    >
                      Selected: {selectedAvatar.name}
                    </Typography>
                  )}
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
                disabled={loading}
                helperText="At least 3 characters"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"Kalam", cursive',
                    backgroundColor: '#fffefb',
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
                  },
                  '& .MuiFormHelperText-root': {
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7'
                  }
                }}
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
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"Kalam", cursive',
                    backgroundColor: '#fffefb',
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
              
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                margin="normal"
                required
                disabled={loading}
                helperText="At least 8 characters"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"Kalam", cursive',
                    backgroundColor: '#fffefb',
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
                  },
                  '& .MuiFormHelperText-root': {
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7'
                  }
                }}
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
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"Kalam", cursive',
                    backgroundColor: '#fffefb',
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

              <TextField
                fullWidth
                label="Bio (Optional)"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                margin="normal"
                multiline
                rows={2}
                disabled={loading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: '"Kalam", cursive',
                    backgroundColor: '#fffefb',
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

              <FormControlLabel
                control={
                  <Checkbox
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={loading}
                    sx={{
                      color: '#8761a7',
                      '&.Mui-checked': {
                        color: '#8761a7'
                      }
                    }}
                  />
                }
                label="I agree to the Terms and Conditions"
                sx={{ 
                  mt: 2,
                  '& .MuiFormControlLabel-label': {
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontSize: '1rem'
                  }
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading || !agreedToTerms}
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: agreedToTerms ? '#cdd475' : '#f0f0f0',
                  color: agreedToTerms ? '#8761a7' : '#999',
                  border: agreedToTerms ? '2px solid #8761a7' : '2px solid #ddd',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1.5,
                  boxShadow: agreedToTerms ? '0 4px 15px rgba(205, 212, 117, 0.3)' : 'none',
                  '&:hover': agreedToTerms ? {
                    backgroundColor: '#dce291',
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 20px rgba(205, 212, 117, 0.4)',
                  } : {},
                  '&:disabled': {
                    backgroundColor: '#f0f0f0',
                    color: '#999',
                    border: '2px solid #ddd',
                    cursor: 'not-allowed'
                  }
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </Box>

            <Box textAlign="center">
              <Link 
                component={RouterLink} 
                to="/login"
                sx={{
                  color: '#8761a7',
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1rem',
                  textDecorationColor: '#8761a7',
                  '&:hover': {
                    color: '#6b4c87'
                  }
                }}
              >
                Already have an account? Sign In
              </Link>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Register;