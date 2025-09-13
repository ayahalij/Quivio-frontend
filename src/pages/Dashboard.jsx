// src/pages/Dashboard.jsx - Complete Fixed Version with Proper Date Handling
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
  Alert,
  Chip,
  CircularProgress
} from '@mui/material';
import { 
  Mood, 
  Book, 
  CameraAlt, 
  Assignment,
  CalendarToday,
  Search,
  Map,
  Message,
  Person,
  TrendingUp
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import MoodTracker from '../components/daily/MoodTracker';
import DiaryEntry from '../components/daily/DiaryEntry';
import DailyChallenge from '../components/challenges/DailyChallenge';
import PhotoUpload from '../components/daily/PhotoUpload';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // Dialog states
  const [moodDialogOpen, setMoodDialogOpen] = useState(false);
  const [diaryDialogOpen, setDiaryDialogOpen] = useState(false);
  const [challengeDialogOpen, setChallengeDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  
  // Data states
  const [todayData, setTodayData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState(null);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Load today's data on component mount
  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const currentDate = new Date().toISOString().split('T')[0]; // Always get fresh current date
      
      console.log('=== DASHBOARD DEBUG ===');
      console.log('Loading data for date:', currentDate);
      console.log('Expected today date:', currentDate);
      
      const data = await ApiService.getDailyEntry(currentDate);
      
      console.log('API returned data:', data);
      console.log('API returned date:', data?.date);
      console.log('Date matches today:', data?.date === currentDate);
      
      setTodayData(data);
    } catch (error) {
      console.error('Failed to load today\'s data:', error);
      setError('Failed to load today\'s data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleMoodSuccess = (result) => {
    setSuccessMessage(`Mood saved! You're feeling ${result.mood_level}/5 today.`);
    setTimeout(() => setSuccessMessage(''), 3000);
    loadTodayData(); // Reload data to show updated info
  };

  const handleDiarySuccess = (result) => {
    setSuccessMessage(`Diary entry saved! ${result.word_count} words written.`);
    setTimeout(() => setSuccessMessage(''), 3000);
    loadTodayData(); // Reload data to show updated info
  };

  const handleChallengeSuccess = () => {
    setSuccessMessage('Challenge completed! Well done!');
    setTimeout(() => setSuccessMessage(''), 3000);
    loadTodayData(); // Reload data
  };

  const handlePhotoSuccess = (result) => {
    setSuccessMessage(`Photo "${result.title}" uploaded successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
    loadTodayData(); // Reload data
  };

  const getMoodLabel = (level) => {
    const labels = {
      1: 'Very Sad',
      2: 'Sad',
      3: 'Neutral', 
      4: 'Happy',
      5: 'Very Happy'
    };
    return labels[level] || 'Unknown';
  };

  const getMoodColor = (level) => {
    const colors = {
      1: 'error',
      2: 'warning',
      3: 'default',
      4: 'primary',
      5: 'success'
    };
    return colors[level] || 'default';
  };

  // Check if we have today's data (not old data)
  const hasTodaysMood = todayData?.mood && todayData?.date === today;
  const hasTodaysDiary = todayData?.diary && todayData?.date === today;

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome back, {user?.username}!
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Today: {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
          
          {/* Today's Status - Only show if data is actually for today */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {hasTodaysMood && (
              <Chip 
                icon={<Mood />}
                label={`Mood: ${getMoodLabel(todayData.mood.mood_level)}`}
                color={getMoodColor(todayData.mood.mood_level)}
                variant="filled"
              />
            )}
            {hasTodaysDiary && (
              <Chip 
                icon={<Book />}
                label={`${todayData.diary.word_count} words written`}
                color="primary"
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Row 1 - Core Daily Features */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Mood color="primary" />
                  <Typography variant="h6">
                    Daily Mood
                  </Typography>
                </Box>
                
                {hasTodaysMood ? (
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={`${getMoodLabel(todayData.mood.mood_level)} (${todayData.mood.mood_level}/5)`}
                      color={getMoodColor(todayData.mood.mood_level)}
                      sx={{ mb: 1 }}
                    />
                    {todayData.mood.note && (
                      <Typography variant="body2" color="text.secondary">
                        "{todayData.mood.note}"
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    How are you feeling today? Track your mood and reflect on what's influencing it.
                  </Typography>
                )}
                
                <Button 
                  variant={hasTodaysMood ? "outlined" : "contained"}
                  fullWidth
                  onClick={() => setMoodDialogOpen(true)}
                  disabled={!todayData?.can_edit}
                >
                  {hasTodaysMood ? 'Update Mood' : 'Set Today\'s Mood'}
                </Button>
                
                {!todayData?.can_edit && hasTodaysMood && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Entry locked after 11:59 PM
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Book color="primary" />
                  <Typography variant="h6">
                    Write Entry
                  </Typography>
                </Box>
                
                {hasTodaysDiary ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="primary" gutterBottom>
                      {todayData.diary.word_count} words written today
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {todayData.diary.content}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary" paragraph>
                    Capture your thoughts and experiences in today's diary entry.
                  </Typography>
                )}
                
                <Button 
                  variant={hasTodaysDiary ? "outlined" : "contained"}
                  fullWidth
                  onClick={() => setDiaryDialogOpen(true)}
                  disabled={!todayData?.can_edit}
                >
                  {hasTodaysDiary ? 'Edit Entry' : 'Start Writing'}
                </Button>
                
                {!todayData?.can_edit && hasTodaysDiary && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Entry locked after 11:59 PM
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Assignment color="primary" />
                  <Typography variant="h6">
                    Daily Challenge
                  </Typography>
                </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CameraAlt color="primary" />
                  <Typography variant="h6">
                    Add Photo Memory
                  </Typography>
                </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CalendarToday color="primary" />
                  <Typography variant="h6">
                    Calendar View
                  </Typography>
                </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Search color="primary" />
                  <Typography variant="h6">
                    Search Memories
                  </Typography>
                </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Map color="primary" />
                  <Typography variant="h6">
                    Photo Map
                  </Typography>
                </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Message color="primary" />
                  <Typography variant="h6">
                    Memory Capsules
                  </Typography>
                </Box>
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Person color="primary" />
                  <Typography variant="h6">
                    Profile & Settings
                  </Typography>
                </Box>
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
      </Container>

      {/* Dialogs - CRITICAL FIX: Only pass initialData if it's actually today's data */}
      <MoodTracker
        open={moodDialogOpen}
        onClose={() => setMoodDialogOpen(false)}
        onSuccess={handleMoodSuccess}
        initialData={hasTodaysMood ? todayData.mood : null}
      />

      <DiaryEntry
        open={diaryDialogOpen}
        onClose={() => setDiaryDialogOpen(false)}
        onSuccess={handleDiarySuccess}
        initialData={hasTodaysDiary ? todayData.diary : null}
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