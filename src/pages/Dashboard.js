// src/pages/Dashboard.js - Complete Dashboard with Profile
import React, { useState } from 'react';
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
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.username?.charAt(0).toUpperCase()}
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
            <Card>
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
            <Card>
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
            <Card>
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
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload Photo
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Capture and save special moments from your day as photo memories.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => setPhotoDialogOpen(true)}
                >
                  Add Photo Memory
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Timeline & Search
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Browse your past entries in calendar view and search through your memories.
                </Typography>
                <Button 
                  variant="contained" 
                  fullWidth
                  onClick={() => navigate('/timeline')}
                >
                  View Timeline
                </Button>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
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

          <Grid item xs={12} md={4}>
            <Card>
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