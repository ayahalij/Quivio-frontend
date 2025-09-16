// src/components/auth/Login.jsx
import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/api';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Forgot password state
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotError, setForgotError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      console.log('Login error details:', error.response?.data);
      console.log('Login error:', error);
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }

    setForgotLoading(true);
    setForgotError('');

    try {
      const response = await ApiService.forgotPassword(forgotEmail);
      setForgotSuccess(response.message);
      setForgotEmail('');
      setTimeout(() => {
        setForgotPasswordOpen(false);
        setForgotSuccess('');
      }, 3000);
    } catch (error) {
      setForgotError(error.response?.data?.detail || 'Failed to send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  const closeForgotPasswordDialog = () => {
    setForgotPasswordOpen(false);
    setForgotEmail('');
    setForgotError('');
    setForgotSuccess('');
  };

  return (
    <Box sx={{ 
      backgroundColor: '#fffefb', 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      py: 4
    }}>
      <Container component="main" maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
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
              component="h1" 
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
              Welcome Back
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              paragraph
              sx={{
                color: '#8761a7',
                fontFamily: '"Kalam", cursive',
                fontSize: '1rem',
                mb: 3
              }}
            >
              Sign in to continue your journaling journey
            </Typography>

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

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                value={formData.email}
                onChange={handleChange}
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
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
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
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  backgroundColor: '#cdd475',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 1.5,
                  boxShadow: '0 4px 15px rgba(205, 212, 117, 0.3)',
                  '&:hover': {
                    backgroundColor: '#dce291',
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 20px rgba(205, 212, 117, 0.4)',
                  },
                  '&:disabled': {
                    backgroundColor: '#f0f0f0',
                    color: '#999',
                    border: '2px solid #ddd'
                  }
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: '#8761a7' }} /> : 'Sign In'}
              </Button>

              {/* Forgot Password Link */}
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Link
                  component="button"
                  variant="body1"
                  onClick={(e) => {
                    e.preventDefault();
                    setForgotPasswordOpen(true);
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    color: '#8761a7',
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1rem',
                    textDecorationColor: '#8761a7',
                    '&:hover': {
                      color: '#6b4c87'
                    }
                  }}
                >
                  Forgot your password?
                </Link>
              </Box>

              <Box sx={{ textAlign: 'center' }}>
                <Link
                  component="button"
                  variant="body1"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                  sx={{ 
                    cursor: 'pointer',
                    color: '#8761a7',
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1rem',
                    textDecorationColor: '#8761a7',
                    '&:hover': {
                      color: '#6b4c87'
                    }
                  }}
                >
                  Don't have an account? Sign Up
                </Link>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Forgot Password Dialog */}
        <Dialog 
          open={forgotPasswordOpen} 
          onClose={closeForgotPasswordDialog} 
          maxWidth="sm" 
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
            backgroundColor: '#cdd475',
            color: '#8761a7',
            fontFamily: '"Kalam", cursive',
            fontWeight: 600,
            fontSize: '1.3rem',
            borderBottom: '2px solid #8761a7'
          }}>
            Reset Password
          </DialogTitle>
          <DialogContent sx={{ p: 3 }}>
            <Typography 
              variant="body1" 
              paragraph
              sx={{
                color: '#8761a7',
                fontFamily: '"Kalam", cursive',
                fontSize: '1rem'
              }}
            >
              Enter your email address and we'll send you a link to reset your password.
            </Typography>

            {forgotError && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  backgroundColor: '#fffbef',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive'
                }}
              >
                {forgotError}
              </Alert>
            )}

            {forgotSuccess && (
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 2,
                  backgroundColor: '#dce291',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive'
                }}
              >
                {forgotSuccess}
              </Alert>
            )}

            <TextField
              autoFocus
              margin="dense"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              disabled={forgotLoading}
              sx={{ 
                mt: 2,
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
          </DialogContent>
          <DialogActions sx={{ p: 3, gap: 2 }}>
            <Button 
              onClick={closeForgotPasswordDialog} 
              disabled={forgotLoading}
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
              variant="outlined"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleForgotPassword} 
              variant="contained"
              disabled={forgotLoading}
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
                },
                '&:disabled': {
                  backgroundColor: '#f0f0f0',
                  color: '#999'
                }
              }}
            >
              {forgotLoading ? <CircularProgress size={20} sx={{ color: '#8761a7' }} /> : 'Send Reset Link'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Login;