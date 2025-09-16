import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  Avatar,
  Alert,
  Chip,
  CircularProgress,
  BottomNavigation,
  BottomNavigationAction,
  Paper
} from '@mui/material';
import { 
  Mood, 
  Book, 
  Assignment,
  Home,
  CalendarToday,
  AccountBox,
  PhotoCamera,
  Person
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import MoodTracker from '../components/daily/MoodTracker';
import DiaryEntry from '../components/daily/DiaryEntry';
import DailyChallenge from '../components/challenges/DailyChallenge';
import PhotoUpload from '../components/daily/PhotoUpload';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import PhotoViewer from '../components/common/PhotoViewer';

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

  // Bottom navigation
  const [navValue, setNavValue] = useState(0);

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // Load today's data on component mount
  useEffect(() => {
    loadTodayData();
  }, []);

  const loadTodayData = async () => {
    try {
      setLoading(true);
      const currentDate = new Date().toISOString().split('T')[0];
      const data = await ApiService.getDailyEntry(currentDate);
      setTodayData(data);
    } catch (error) {
      console.error('Failed to load today\'s data:', error);
      setError('Failed to load today\'s data');
    } finally {
      setLoading(false);
    }
  };

  const handleMoodSuccess = (result) => {
    setSuccessMessage(`Mood saved! You're feeling ${result.mood_level}/5 today.`);
    setTimeout(() => setSuccessMessage(''), 3000);
    loadTodayData();
  };

  const handleDiarySuccess = (result) => {
    setSuccessMessage(`Diary entry saved! ${result.word_count} words written.`);
    setTimeout(() => setSuccessMessage(''), 3000);
    loadTodayData();
  };

  const handleChallengeSuccess = () => {
    setSuccessMessage('Challenge completed! Well done!');
    setTimeout(() => setSuccessMessage(''), 3000);
    loadTodayData();
  };

  const handlePhotoSuccess = (result) => {
    setSuccessMessage(`Photo "${result.title}" uploaded successfully!`);
    setTimeout(() => setSuccessMessage(''), 3000);
    loadTodayData();
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

  // Check if we have today's data
  const hasTodaysMood = todayData?.mood && todayData?.date === today;
  const hasTodaysDiary = todayData?.diary && todayData?.date === today;

  const handleBottomNavigation = (event, newValue) => {
    setNavValue(newValue);
    switch(newValue) {
      case 0:
        navigate('/dashboard');
        break;
      case 1:
        navigate('/timeline');
        break;
      case 2:
        navigate('/capsules');
        break;
      case 3:
        navigate('/profile');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ backgroundColor: '#fffefb' }}
      >
        <CircularProgress sx={{ color: '#8761a7' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      backgroundColor: '#fffefb', 
      minHeight: '100vh',
      paddingBottom: '80px' // Space for bottom navigation
    }}>
      {/* Enhanced Header with #fffefb background */}
      <Box sx={{ 
        backgroundColor: '#fffefb',
        borderBottom: '3px solid #8761a7',
        boxShadow: '0 2px 10px rgba(135, 97, 167, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            py: 1,
            px: 3
          }}>
            {/* Logo */}
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#cdd475',
                fontWeight: 700,
                fontSize: { xs: '1.6rem', md: '2rem' }
              }}
            >
              Quivio
            </Typography>

            {/* User Section */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              backgroundColor: '#cdd475',
              borderRadius: '18px',
              padding: '6px 14px',
              border: '2px solid #8761a7'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  color: '#8761a7',
                  fontFamily: '"Kalam", cursive',
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', md: '1rem' }
                }}
              >
                {user?.username}
              </Typography>
              <Avatar 
                src={user?.avatar_url} 
                sx={{ 
                  width: { xs: 32, md: 36 }, 
                  height: { xs: 32, md: 36 },
                  border: '2px solid #8761a7',
                  bgcolor: '#fffefb'
                }}
              >
                {(!user?.avatar_url) && user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              <Button 
                onClick={logout}
                sx={{ 
                  color: '#8761a7',
                  fontFamily: '"Kalam", cursive',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', md: '0.9rem' },
                  backgroundColor: '#fffefb',
                  border: '2px solid #8761a7',
                  borderRadius: '14px',
                  px: 2,
                  py: 0.25,
                  minHeight: 'auto',
                  '&:hover': {
                    backgroundColor: '#fdfedbff',
                    transform: 'scale(1.05)'
                  }
                }}
              >
                Logout
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Content - Centered with max width */}
      <Container 
        maxWidth="xl" 
        sx={{ 
          px: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: 'calc(100vh - 200px)'
        }}
      >
        {/* Success/Error Messages */}
        <Box sx={{ width: '100%', maxWidth: '1400px', mt: 3 }}>
          {successMessage && (
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
              {successMessage}
            </Alert>
          )}

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
        </Box>

        {/* Main Cards Grid - 4 cards with proper responsive layout */}
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: 'repeat(2, 1fr)', 
            lg: 'repeat(4, 1fr)' 
          },
          gap: 4, 
          width: '100%',
          maxWidth: '1400px',
          mt: 2,
          mb: 4
        }}>
          {/* Daily Mood Card */}
          <Card sx={{ 
            height: '450px',
            backgroundColor: '#fffbef',
            border: '3px solid #8761a7',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(135, 97, 167, 0.15)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 16px 48px rgba(135, 97, 167, 0.25)',
            }
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              p: 4,
              justifyContent: 'space-between'
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Mood sx={{ color: '#8761a7', fontSize: 32 }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600,
                      fontSize: '1.4rem'
                    }}
                  >
                    Daily Mood
                  </Typography>
                </Box>
                
                {hasTodaysMood ? (
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={`${getMoodLabel(todayData.mood.mood_level)} (${todayData.mood.mood_level}/5)`}
                      sx={{ 
                        mb: 2,
                        backgroundColor: '#dce291',
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        height: '32px'
                      }}
                    />
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontFamily: '"Kalam", cursive',
                        color: '#8761a7',
                        fontSize: '1rem',
                        lineHeight: 1.6,
                        mb: 1.5
                      }}
                    >
                      You've tracked your mood today! Your emotional state helps us understand your well-being patterns and suggest personalized challenges.
                    </Typography>
                    {todayData.mood.note && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          fontStyle: 'italic',
                          p: 2,
                          backgroundColor: '#dce291',
                          borderRadius: 2,
                          fontSize: '0.9rem'
                        }}
                      >
                        Note: "{todayData.mood.note}"
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      mb: 3,
                      fontSize: '1rem',
                      lineHeight: 1.6
                    }}
                  >
                    How are you feeling today? Track your mood on a scale of 1-5 and reflect on what's influencing your emotional state. Your daily mood tracking helps build awareness of patterns and triggers.
                  </Typography>
                )}
              </Box>
              
              <Button 
                variant="contained"
                onClick={() => setMoodDialogOpen(true)}
                disabled={!todayData?.can_edit && hasTodaysMood}
                sx={{
                  backgroundColor: '#cdd475',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 2,
                  boxShadow: '0 4px 15px rgba(205, 212, 117, 0.3)',
                  '&:hover': {
                    backgroundColor: '#dce291',
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 20px rgba(205, 212, 117, 0.4)',
                  },
                  '&:disabled': {
                    backgroundColor: '#f0f0f0',
                    color: '#999',
                  }
                }}
              >
                {hasTodaysMood ? 'Update Mood' : 'Set Today\'s Mood'}
              </Button>

              {!todayData?.can_edit && hasTodaysMood && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 1, 
                    textAlign: 'center',
                    color: '#8761a7',
                    fontFamily: '"Kalam", cursive'
                  }}
                >
                  Entry locked after 11:59 PM
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Write Entry Card */}
          <Card sx={{ 
            height: '450px',
            backgroundColor: '#fffbef',
            border: '3px solid #8761a7',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(135, 97, 167, 0.15)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 16px 48px rgba(135, 97, 167, 0.25)',
            }
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              p: 4,
              justifyContent: 'space-between'
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Book sx={{ color: '#8761a7', fontSize: 32 }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600,
                      fontSize: '1.4rem'
                    }}
                  >
                    Write Entry
                  </Typography>
                </Box>
                
                {hasTodaysDiary ? (
                  <Box sx={{ mb: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#8761a7', 
                        fontFamily: '"Kalam", cursive',
                        mb: 1.5,
                        fontWeight: 600,
                        fontSize: '1rem'
                      }}
                    >
                      {todayData.diary.word_count} words written today!
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontFamily: '"Kalam", cursive',
                        color: '#8761a7',
                        mb: 2,
                        fontSize: '1rem',
                        lineHeight: 1.6
                      }}
                    >
                      Your thoughts are safely recorded. Writing regularly helps process emotions, clarify thoughts, and track personal growth over time.
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        fontStyle: 'italic',
                        p: 2,
                        backgroundColor: '#dce291',
                        borderRadius: 2,
                        fontSize: '0.9rem'
                      }}
                    >
                      "{todayData.diary.content.substring(0, 100)}..."
                    </Typography>
                  </Box>
                ) : (
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      mb: 3,
                      fontSize: '1rem',
                      lineHeight: 1.6
                    }}
                  >
                    Capture your thoughts and experiences in today's diary entry. Express yourself freely, document memories, process emotions, and create a personal record of your journey through life.
                  </Typography>
                )}
              </Box>
              
              <Button 
                variant="contained"
                onClick={() => setDiaryDialogOpen(true)}
                disabled={!todayData?.can_edit && hasTodaysDiary}
                sx={{
                  backgroundColor: '#cdd475',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 2,
                  boxShadow: '0 4px 15px rgba(205, 212, 117, 0.3)',
                  '&:hover': {
                    backgroundColor: '#dce291',
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 20px rgba(205, 212, 117, 0.4)',
                  },
                  '&:disabled': {
                    backgroundColor: '#f0f0f0',
                    color: '#999',
                  }
                }}
              >
                {hasTodaysDiary ? 'Edit Entry' : 'Start Writing'}
              </Button>

              {!todayData?.can_edit && hasTodaysDiary && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    mt: 1, 
                    textAlign: 'center',
                    color: '#8761a7',
                    fontFamily: '"Kalam", cursive'
                  }}
                >
                  Entry locked after 11:59 PM
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Daily Challenge Card */}
          <Card sx={{ 
            height: '450px',
            backgroundColor: '#fffbef',
            border: '3px solid #8761a7',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(135, 97, 167, 0.15)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 16px 48px rgba(135, 97, 167, 0.25)',
            }
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              p: 4,
              justifyContent: 'space-between'
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <Assignment sx={{ color: '#8761a7', fontSize: 32 }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600,
                      fontSize: '1.4rem'
                    }}
                  >
                    Daily Challenge
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    mb: 3,
                    fontSize: '1rem',
                    lineHeight: 1.6
                  }}
                >
                  Complete today's photography challenge based on your mood. These creative exercises encourage mindfulness, help you see the world differently, and build a visual diary of your experiences.
                </Typography>
              </Box>
              
              <Button 
                variant="contained"
                onClick={() => setChallengeDialogOpen(true)}
                sx={{
                  backgroundColor: '#cdd475',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 2,
                  boxShadow: '0 4px 15px rgba(205, 212, 117, 0.3)',
                  '&:hover': {
                    backgroundColor: '#dce291',
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 20px rgba(205, 212, 117, 0.4)',
                  }
                }}
              >
                View Challenge
              </Button>
            </CardContent>
          </Card>

          {/* Photo Upload Card */}
          <Card sx={{ 
            height: '450px',
            backgroundColor: '#fffbef',
            border: '3px solid #8761a7',
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            transition: 'all 0.3s ease',
            boxShadow: '0 8px 32px rgba(135, 97, 167, 0.15)',
            '&:hover': {
              transform: 'translateY(-8px)',
              boxShadow: '0 16px 48px rgba(135, 97, 167, 0.25)',
            }
          }}>
            <CardContent sx={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              p: 4,
              justifyContent: 'space-between'
            }}>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                  <PhotoCamera sx={{ color: '#8761a7', fontSize: 32 }} />
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600,
                      fontSize: '1.4rem'
                    }}
                  >
                    Photo Memory
                  </Typography>
                </Box>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    mb: 3,
                    fontSize: '1rem',
                    lineHeight: 1.6
                  }}
                >
                  Capture and save special moments from your day with location data. Build a visual diary of your experiences and create lasting memories that you can revisit and cherish.
                </Typography>
              </Box>
              
              <Button 
                variant="contained"
                onClick={() => setPhotoDialogOpen(true)}
                sx={{
                  backgroundColor: '#cdd475',
                  color: '#8761a7',
                  border: '2px solid #8761a7',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  py: 2,
                  boxShadow: '0 4px 15px rgba(205, 212, 117, 0.3)',
                  '&:hover': {
                    backgroundColor: '#dce291',
                    transform: 'scale(1.02)',
                    boxShadow: '0 6px 20px rgba(205, 212, 117, 0.4)',
                  }
                }}
              >
                Upload Photo
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Bottom Navigation */}
      <Paper 
        sx={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0,
          backgroundColor: '#cdd475',
          borderTop: '3px solid #8761a7',
          boxShadow: '0 -4px 20px rgba(135, 97, 167, 0.15)'
        }} 
        elevation={3}
      >
        <BottomNavigation
          value={navValue}
          onChange={handleBottomNavigation}
          sx={{
            backgroundColor: 'transparent',
            height: '70px',
            '& .MuiBottomNavigationAction-root': {
              color: '#8761a7',
              fontFamily: '"Kalam", cursive',
              fontWeight: 500,
              '&.Mui-selected': {
                color: '#8761a7',
                fontWeight: 600,
              }
            }
          }}
        >
          <BottomNavigationAction 
            label="Home" 
            icon={<Home sx={{ fontSize: 30 }} />} 
          />
          <BottomNavigationAction 
            label="Calendar" 
            icon={<CalendarToday sx={{ fontSize: 30 }} />} 
          />
          <BottomNavigationAction 
            label="Capsules" 
            icon={<PhotoCamera sx={{ fontSize: 30 }} />} 
          />
          <BottomNavigationAction 
            label="Profile" 
            icon={<Person sx={{ fontSize: 30 }} />} 
          />
        </BottomNavigation>
      </Paper>

      {/* Dialogs */}
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

      <PhotoViewer
        open={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
        photos={selectedPhotos}
        initialIndex={0}
      />
    </Box>
  );
};

export default Dashboard;