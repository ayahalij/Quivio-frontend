// src/pages/Dashboard.jsx - Complete with Avatar Support and Debug Logs
import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  AppBar,
  Toolbar,
  Avatar,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import MoodTracker from '../components/daily/MoodTracker';
import DiaryEntry from '../components/daily/DiaryEntry';
import DailyChallenge from '../components/challenges/DailyChallenge';
import { useNavigate } from 'react-router-dom';
import PhotoUpload from '../components/daily/PhotoUpload';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [moodDialogOpen, setMoodDialogOpen] = useState(false);
  const [diaryDialogOpen, setDiaryDialogOpen] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  // Debug logging
  useEffect(() => {
    console.log('=== DASHBOARD DEBUG ===');
    console.log('Full user object:', user);
    console.log('User avatar_url:', user?.avatar_url);
    console.log('User username:', user?.username);
    console.log('Avatar URL exists:', !!user?.avatar_url);
    console.log('Avatar URL value:', JSON.stringify(user?.avatar_url));
  }, [user]);

  const handleLogout = () => {
    logout();
  };

  const handleMoodSuccess = (result) => {
    setSuccessMessage(`Mood saved! You're feeling ${result.mood_level}/5 today.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleDiarySuccess = (result) => {
    setSuccessMessage(`Diary entry saved! ${result.word_count} words written.`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChallengeSuccess = () => {
    setSuccessMessage('Challenge completed! Well done!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handlePhotoSuccess = (result) => {
    setSuccessMessage(`Photo "${result.title}" uploaded successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Quivio Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={user?.avatar_url} 
              sx={{ 
                width: 32, 
                height: 32,
                bgcolor: user?.avatar_url ? 'transparent' : 'primary.main'
              }}
              onError={(e) => {
                console.log('Avatar failed to load:', user?.avatar_url);
                console.log('Error event:', e);
              }}
              onLoad={() => {
                console.log('Avatar loaded successfully:', user?.avatar_url);
              }}
            >
              {(!user?.avatar_url) && user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2">
              {user?.username}
            </Typography>
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.username}!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          Ready to continue your journaling journey? Here's what you can do today.
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Row 1 - Core Daily Features */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Mood
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  How are you feeling today? Track your mood and reflect on what's influencing it.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => setMoodDialogOpen(true)}
                >
                  Set Today's Mood
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Write Entry
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Capture your thoughts and experiences in today's diary entry.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => setDiaryDialogOpen(true)}
                >
                  Start Writing
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Challenge
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Complete today's photography challenge based on your mood.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => setChallengeDialogOpen(true)}
                >
                  View Challenge
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Row 2 - Additional Features */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add Photo Memory
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Capture and save special moments from your day with location data.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => setPhotoDialogOpen(true)}
                >
                  Upload Photo
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Calendar View
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Browse your past entries and moods in an organized calendar layout.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/timeline')}
                >
                  View Calendar
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Search Memories
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Find specific entries, thoughts, and moments from your journaling history.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/timeline?tab=1')}
                >
                  Search Entries
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Row 3 - Additional Features */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Photo Map
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Explore your photo memories on an interactive world map.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/timeline?tab=2')}
                >
                  View Photo Map
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Memory Capsules
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Create time-locked messages and memories for your future self.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/capsules')}
                >
                  View Capsules
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile & Settings
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Manage your account, view statistics, and customize your experience.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/profile')}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Recent Activity */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Recent Activity
          </Typography>
          <Card>
            <CardContent>
              <Typography color="text.secondary">
                Your recent entries and activities will appear here once you start journaling.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Dialogs */}
      <MoodTracker
        open={moodDialogOpen}
        onClose={() => setMoodDialogOpen(false)}
        onSuccess={handleMoodSuccess}
      />

      <DiaryEntry
        open={diaryDialogOpen}
        onClose={() => setDiaryDialogOpen(false)}
        onSuccess={handleDiarySuccess}
      />

      <DailyChallenge
        open={challengeDialogOpen}
        onClose={() => setChallengeDialogOpen(false)}
        onSuccess={handleChallengeSuccess}
      />

      <PhotoUpload
        open={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        onSuccess={handlePhotoSuccess}
      />
    </Box>
  );
};

export default Dashboard;