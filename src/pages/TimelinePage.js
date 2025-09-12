// src/pages/TimelinePage.js
import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Paper,
  Chip,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Avatar
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Mood,
  Event,
  CameraAlt,
  Search
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';

const MOOD_COLORS = {
  1: '#f44336', // Very Sad - Red
  2: '#ff9800', // Sad - Orange  
  3: '#9e9e9e', // Neutral - Grey
  4: '#4caf50', // Happy - Green
  5: '#2196f3'  // Very Happy - Blue
};

const MOOD_EMOJIS = {
  1: '😢',
  2: '😞', 
  3: '😐',
  4: '😊',
  5: '😄'
};

const TimelinePage = () => {
  const { user, logout } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    fetchCalendarData();
  }, [currentDate]);

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
      
      const result = await ApiService.getCalendarData(year, month);
      console.log('Calendar data:', result);
      setCalendarData(result);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay(); // 0 = Sunday

    const days = [];
    
    // Add empty cells for days before the month starts
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getDayData = (day) => {
    if (!calendarData || !day) return null;
    
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return calendarData.calendar_data[dateString] || null;
  };

  const handleDayClick = (day) => {
    if (!day) return;
    
    const dayData = getDayData(day);
    if (dayData) {
      setSelectedDay({ day, data: dayData });
    }
  };

  const renderDayCard = (day) => {
    if (!day) {
      return <Box key={`empty-${Math.random()}`} sx={{ height: 80 }} />;
    }

    const dayData = getDayData(day);
    const hasData = dayData !== null;
    const today = new Date();
    const isToday = 
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();

    return (
      <Card
        key={day}
        sx={{
          height: 80,
          cursor: hasData ? 'pointer' : 'default',
          border: isToday ? '2px solid #2196f3' : '1px solid #e0e0e0',
          backgroundColor: hasData ? '#f8f9fa' : 'white',
          '&:hover': hasData ? { boxShadow: 2 } : {}
        }}
        onClick={() => handleDayClick(day)}
      >
        <CardContent sx={{ p: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ fontWeight: isToday ? 'bold' : 'normal' }}>
            {day}
          </Typography>
          
          {dayData && (
            <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {dayData.mood && (
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: MOOD_COLORS[dayData.mood.level],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="caption" sx={{ fontSize: 10 }}>
                    {MOOD_EMOJIS[dayData.mood.level]}
                  </Typography>
                </Box>
              )}
              
              {dayData.diary && (
                <Event sx={{ fontSize: 12, color: '#666' }} />
              )}
              
              {dayData.photos && dayData.photos.length > 0 && (
                <CameraAlt sx={{ fontSize: 12, color: '#666' }} />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Timeline & Calendar
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2">
              {user?.username}
            </Typography>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4 }}>
        {/* Calendar Header */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <IconButton onClick={() => navigateMonth(-1)}>
              <ChevronLeft />
            </IconButton>
            
            <Typography variant="h5">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Typography>
            
            <IconButton onClick={() => navigateMonth(1)}>
              <ChevronRight />
            </IconButton>
          </Box>

          {calendarData && (
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
              <Chip 
                label={`${calendarData.total_days_with_entries} days with entries`} 
                color="primary" 
                size="small" 
              />
            </Box>
          )}
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Days of the week header */}
            <Grid container spacing={1} sx={{ mb: 1 }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <Grid item xs key={day} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666' }}>
                    {day}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Calendar Grid */}
            <Grid container spacing={1}>
              {getDaysInMonth().map((day, index) => (
                <Grid item xs key={index} sx={{ display: 'flex' }}>
                  {renderDayCard(day)}
                </Grid>
              ))}
            </Grid>
          </>
        )}

        {/* Day Detail Modal/Section */}
        {selectedDay && (
          <Paper sx={{ mt: 3, p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                {currentDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDay.day}, {currentDate.getFullYear()}
              </Typography>
              <Button onClick={() => setSelectedDay(null)}>Close</Button>
            </Box>

            {selectedDay.data.mood && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Mood</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h4">
                    {MOOD_EMOJIS[selectedDay.data.mood.level]}
                  </Typography>
                  <Typography variant="body1">
                    Level {selectedDay.data.mood.level}/5
                  </Typography>
                </Box>
                {selectedDay.data.mood.note && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    "{selectedDay.data.mood.note}"
                  </Typography>
                )}
              </Box>
            )}

            {selectedDay.data.diary && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Diary Entry</Typography>
                <Typography variant="body2">
                  {selectedDay.data.diary.excerpt}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedDay.data.diary.word_count} words
                </Typography>
              </Box>
            )}

            {selectedDay.data.photos && selectedDay.data.photos.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Photos</Typography>
                <Grid container spacing={1}>
                  {selectedDay.data.photos.map((photo, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card>
                        <CardContent>
                          <Typography variant="body2">{photo.title}</Typography>
                          {photo.has_location && (
                            <Typography variant="caption" color="text.secondary">
                              📍 Location saved
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {selectedDay.data.challenge && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>Daily Challenge</Typography>
                <Typography variant="body2">
                  {selectedDay.data.challenge.challenge_text}
                </Typography>
                <Chip 
                  label={selectedDay.data.challenge.is_completed ? 'Completed' : 'Not completed'}
                  color={selectedDay.data.challenge.is_completed ? 'success' : 'default'}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
};

export default TimelinePage;