// src/components/auth/Register.js
import React, { useState } from 'react'
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
} from '@mui/material'
import { useAuth } from '../../contexts/AuthContext'
import { useNavigate, Link as RouterLink } from 'react-router-dom'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirm_password: '',
    bio: ''
  })
  const [loading, setLoading] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  const { register, error } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    if (formData.password !== formData.confirm_password) {
      alert('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await register(formData)
      navigate('/dashboard')
    } catch (error) {
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Join Quivio
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Start your personal journaling journey today
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {Array.isArray(error) ? error.map(e => e.msg).join(', ') : error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              margin="normal"
              required
              helperText="Must be at least 3 characters, letters, numbers, and underscores only"
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
              helperText="Must contain uppercase, lowercase, and numbers"
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
              multiline
              rows={2}
              value={formData.bio}
              onChange={handleChange}
              margin="normal"
              placeholder="Tell us a bit about yourself..."
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
              disabled={loading || !agreedToTerms}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <Box textAlign="center">
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign In
            </Link>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default Register