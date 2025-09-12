// src/components/auth/Register.jsx - Debug version
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
  FormControlLabel 
} from '@mui/material';
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
  const [debugInfo, setDebugInfo] = useState('');
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLocalError(null);
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
    
    // Clear previous debug info
    setDebugInfo('');
    setLocalError(null);
    
    console.log('=== REGISTRATION DEBUG ===');
    console.log('1. Form Data:', {
      username: formData.username,
      email: formData.email,
      password: '[HIDDEN]',
      confirm_password: '[HIDDEN]',
      bio: formData.bio
    });

    if (!validateForm()) {
      return;
    }

    console.log('2. Validation passed');
    setLoading(true);
    setDebugInfo('Sending request to backend...');

    try {
      console.log('3. Calling register function...');
      const result = await register(formData);
      
      console.log('4. Registration successful:', result);
      setDebugInfo('Registration successful! Redirecting...');
      navigate('/dashboard');
      
    } catch (error) {
      console.log('5. Registration failed:');
      console.log('Error object:', error);
      console.log('Error response:', error.response);
      console.log('Error response data:', error.response?.data);
      console.log('Error response status:', error.response?.status);
      
      // Detailed error message
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
      setDebugInfo(`Error: ${errorMessage}`);
      
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

          {debugInfo && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Debug: {debugInfo}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
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
          
          {/* Debug Section */}
          {process.env.NODE_ENV === 'development' && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="caption" display="block">
                API URL: {process.env.REACT_APP_API_URL || 'http://localhost:8000'}
              </Typography>
              <Typography variant="caption" display="block">
                Form valid: {JSON.stringify({
                  username: formData.username.length >= 3,
                  email: formData.email.includes('@'),
                  password: formData.password.length >= 8,
                  match: formData.password === formData.confirm_password,
                  terms: agreedToTerms
                })}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;