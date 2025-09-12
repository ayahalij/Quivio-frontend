// src/pages/LandingPage.js
import React from 'react'
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Chip
} 
from '@mui/material'
import { 
  Mood, 
  EditNote, 
  CameraAlt, 
  Timeline 
} from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const LandingPage = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Mood sx={{ fontSize: 40, color: '#6366f1' }} />,
      title: 'Daily Mood Tracking',
      description: 'Track your emotional journey with our 5-level mood system and reflect on what influences your feelings.'
    },
    {
      icon: <EditNote sx={{ fontSize: 40, color: '#ec4899' }} />,
      title: 'Personal Journaling',
      description: 'Write daily diary entries to capture your thoughts, experiences, and personal growth.'
    },
    {
      icon: <CameraAlt sx={{ fontSize: 40, color: '#10b981' }} />,
      title: 'Photography Challenges',
      description: 'Complete mood-based photography challenges that encourage mindfulness and creativity.'
    },
    {
      icon: <Timeline sx={{ fontSize: 40, color: '#f59e0b' }} />,
      title: 'Timeline & Memories',
      description: 'View your entries on a calendar, search past memories, and track your emotional patterns.'
    }
  ]

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Box sx={{ py: 8, textAlign: 'center' }}>
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #6366f1, #ec4899)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Quivio
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary" 
          paragraph
          sx={{ maxWidth: 600, mx: 'auto', mb: 4 }}
        >
          Your personal lifestyle journaling platform. Track moods, capture memories, 
          and grow through daily reflection and creative challenges.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button 
            variant="contained" 
            size="large"
            onClick={() => navigate('/register')}
            sx={{ minWidth: 150 }}
          >
            Get Started
          </Button>
          <Button 
            variant="outlined" 
            size="large"
            onClick={() => navigate('/login')}
            sx={{ minWidth: 150 }}
          >
            Sign In
          </Button>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 1, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Chip label="Free to Use" variant="outlined" />
          <Chip label="Privacy First" variant="outlined" />
          <Chip label="Daily Challenges" variant="outlined" />
        </Box>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 6 }}>
        <Typography variant="h4" align="center" gutterBottom sx={{ mb: 6 }}>
          Everything you need for mindful journaling
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%', 
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                    {feature.icon}
                    <Box>
                      <Typography variant="h6" gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 8, textAlign: 'center', bgcolor: 'grey.50', borderRadius: 2, my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Start Your Journey Today
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Join thousands of users who have transformed their daily reflection practice with Quivio.
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate('/register')}
        >
          Create Your Account
        </Button>
      </Box>
    </Container>
  )
}

export default LandingPage