// src/pages/ResetPasswordPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ApiService from '../services/api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  useEffect(() => {
    verifyToken();
  }, [token]);

  const verifyToken = async () => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      setVerifying(false);
      return;
    }

    try {
      await ApiService.verifyResetToken(token);
      setTokenValid(true);
    } catch (error) {
      setError('This reset link has expired or is invalid. Please request a new password reset.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await ApiService.resetPassword(token, password);
      setSuccess(response.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
      
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestNewReset = () => {
    navigate('/login');
  };

  if (verifying) {
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
                mb: 3,
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
                textAlign: 'center',
                backgroundColor: '#fffbef',
                border: '3px solid #8761a7',
                borderRadius: 4,
                boxShadow: '0 8px 32px rgba(135, 97, 167, 0.15)'
              }}
            >
              <CircularProgress sx={{ mb: 2, color: '#8761a7' }} />
              <Typography 
                variant="h6"
                sx={{
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontWeight: 600
                }}
              >
                Verifying reset link...
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>
    );
  }

  if (!tokenValid) {
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
                mb: 3,
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
                Invalid Reset Link
              </Typography>
              
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

              <Typography 
                variant="body1" 
                align="center" 
                paragraph
                sx={{
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontSize: '1rem'
                }}
              >
                This could happen if:
              </Typography>
              <Typography 
                variant="body1" 
                component="ul" 
                sx={{ 
                  textAlign: 'left', 
                  mb: 3,
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontSize: '0.95rem',
                  paddingLeft: 3
                }}
              >
                <li>The link has expired (links expire after 1 hour)</li>
                <li>The link has already been used</li>
                <li>The link was copied incorrectly</li>
              </Typography>

              <Button
                fullWidth
                variant="contained"
                onClick={handleRequestNewReset}
                sx={{
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
                  }
                }}
              >
                Request New Password Reset
              </Button>
            </Paper>
          </Box>
        </Container>
      </Box>
    );
  }

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
              mb: 3,
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
              Reset Your Password
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
              Enter your new password below
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
                <br />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1,
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7'
                  }}
                >
                  Redirecting to login page...
                </Typography>
              </Alert>
            )}

            {!success && (
              <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="New Password"
                  type="password"
                  autoFocus
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  helperText="Password must be at least 6 characters long"
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
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
                  {loading ? <CircularProgress size={24} sx={{ color: '#8761a7' }} /> : 'Reset Password'}
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    variant="text"
                    onClick={() => navigate('/login')}
                    disabled={loading}
                    sx={{
                      color: '#8761a7',
                      fontFamily: '"Kalam", cursive',
                      fontWeight: 600,
                      textTransform: 'none',
                      fontSize: '1rem',
                      '&:hover': {
                        color: '#6b4c87',
                        backgroundColor: 'rgba(135, 97, 167, 0.1)'
                      }
                    }}
                  >
                    Back to Login
                  </Button>
                </Box>
              </Box>
            )}
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default ResetPasswordPage;