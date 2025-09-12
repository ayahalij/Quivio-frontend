// src/components/auth/Login.js
import React, { useState } from 'react';
import { 
  Container, 
  Paper, 
  TextField, 
  Button, 
  Typography, 
  Box, 
  Alert,
  Link 
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState(null);
  
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear errors when user starts typing
    setLocalError(null);
  };

  // Function to format error messages
  const formatError = (error) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (Array.isArray(error)) {
      return error.map(e => {
        if (typeof e === 'string') return e;
        if (e.msg) return e.msg;
        return 'Validation error occurred';
      }).join(', ');
    }
    
    if (error && typeof error === 'object') {
      if (error.detail) {
        if (Array.isArray(error.detail)) {
          return error.detail.map(e => e.msg || e.toString()).join(', ');
        }
        return error.detail;
      }
      return 'Login failed. Please check your credentials.';
    }
    
    return 'An unknown error occurred';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setLocalError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setLocalError(null);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      // Set local error based on the response
      if (error.response?.data?.detail) {
        setLocalError(formatError(error.response.data.detail));
      } else if (error.response?.status === 422) {
        setLocalError('Invalid email or password format');
      } else {
        setLocalError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Use local error or context error
  const displayError = localError || error;

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to continue your journaling journey
          </Typography>

          {displayError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formatError(displayError)}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <Box textAlign="center">
            <Link component={RouterLink} to="/register" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;