// src/components/auth/Register.js (Simplified debugging version)
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
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLocalError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== FORM SUBMIT TRIGGERED ===');
    console.log('Form data:', formData);
    console.log('Terms agreed:', agreedToTerms);

    // Simple validation
    if (!formData.username || !formData.email || !formData.password || !formData.confirm_password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setLocalError('Passwords do not match');
      return;
    }

    if (!agreedToTerms) {
      setLocalError('Please agree to the terms');
      return;
    }

    setLoading(true);
    console.log('Starting registration...');

    try {
      const result = await register(formData);
      console.log('Registration successful:', result);
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      setLocalError('Registration failed: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Test button click
  const handleButtonClick = (e) => {
    console.log('=== BUTTON CLICKED ===');
    console.log('Event:', e);
    console.log('Loading state:', loading);
    console.log('Form valid check:', {
      username: !!formData.username,
      email: !!formData.email,
      password: !!formData.password,
      confirm_password: !!formData.confirm_password,
      terms: agreedToTerms
    });
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
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
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
              onClick={handleButtonClick}
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