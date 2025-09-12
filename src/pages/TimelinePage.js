// src/pages/TimelinePage.js - Enhanced with Search
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
  Avatar,
  TextField,
  InputAdornment,
  Tabs,
  Tab
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Mood,
  Event,
  CameraAlt,
  Search,
  Clear,
  Edit
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import dayjs from 'dayjs';

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
  const [currentTab, setCurrentTab] = useState(0); // 0 = Calendar, 1 = Search
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDay, setSelectedDay] = useState(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (currentTab === 0) {
      fetchCalendarData();
    }
  }, [currentDate, currentTab]);

  const fetchCalendarData = async () => {
    setLoading(true);
    setError(null);

    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const result = await ApiService.getCalendarData(year, month);
      setCalendarData(result);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      setError('Failed to load calendar data');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchError('Please enter a search term');
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setHasSearched(true);

    try {
      const results = await ApiService.searchEntries(searchTerm.trim());
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setSearchError('');
    setHasSearched(false);
  };

  const highlightSearchTerm = (text, term) => {
    if (!term || !text) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '0 2px' }}>
          {part}
        </mark>
      ) : part
    );
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
    const startingDay = firstDay.getDay();

    const days = [];
    
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
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
            Timeline & Search
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
        {/* Tabs */}
        <Paper sx={{ mb: 3 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            centered
          >
            <Tab label="Calendar View" icon={<Event />} />
            <Tab label="Search Memories" icon={<Search />} />
          </Tabs>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Calendar Tab */}
        {currentTab === 0 && (
          <>
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

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Grid container spacing={1} sx={{ mb: 1 }}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Grid item xs key={day} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#666' }}>
                        {day}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>

                <Grid container spacing={1}>
                  {getDaysInMonth().map((day, index) => (
                    <Grid item xs key={index} sx={{ display: 'flex' }}>
                      {renderDayCard(day)}
                    </Grid>
                  ))}
                </Grid>
              </>
            )}
          </>
        )}

        {/* Search Tab */}
        {currentTab === 1 && (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Search sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Search Your Journey
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Find specific memories, thoughts, and moments from your journaling history.
              </Typography>
            </Box>

            {/* Search Input */}
            <TextField
              fullWidth
              placeholder="Search your memories, moods, and thoughts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={clearSearch} size="small">
                      <Clear />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleSearch}
                disabled={searchLoading || !searchTerm.trim()}
                startIcon={searchLoading ? <CircularProgress size={20} /> : <Search />}
              >
                Search
              </Button>
            </Box>

            {searchError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {searchError}
              </Alert>
            )}

            {/* Search Results */}
            {hasSearched && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Search Results
                  {searchResults.length > 0 && (
                    <Chip 
                      label={`${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  )}
                </Typography>

                {searchLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : searchResults.length === 0 ? (
                  <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                      <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography color="text.secondary">
                        No results found for "{searchTerm}"
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Try different keywords or check your spelling
                      </Typography>
                    </CardContent>
                  </Card>
                ) : (
                  <Grid container spacing={2}>
                    {searchResults.map((result, index) => (
                      <Grid item xs={12} key={index}>
                        <Card 
                          sx={{ 
                            '&:hover': { boxShadow: 2 },
                            border: result.type === 'diary' ? '1px solid #e3f2fd' : '1px solid #f3e5f5'
                          }}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                {result.type === 'diary' ? (
                                  <Edit color="primary" />
                                ) : (
                                  <Mood color="secondary" />
                                )}
                                <Typography variant="h6">
                                  {result.type === 'diary' ? 'Diary Entry' : 'Mood Note'}
                                </Typography>
                                {result.mood_level && (
                                  <Typography variant="h6">
                                    {MOOD_EMOJIS[result.mood_level]}
                                  </Typography>
                                )}
                              </Box>
                              <Chip
                                label={dayjs(result.date).format('MMM D, YYYY')}
                                size="small"
                                variant="outlined"
                              />
                            </Box>

                            <Typography variant="body1" paragraph>
                              {highlightSearchTerm(result.excerpt, searchTerm)}
                            </Typography>

                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Chip
                                label={result.type === 'diary' ? 'Diary' : 'Mood'}
                                size="small"
                                color={result.type === 'diary' ? 'primary' : 'secondary'}
                              />
                              {result.word_count && (
                                <Chip
                                  label={`${result.word_count} words`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {result.mood_level && (
                                <Chip
                                  label={`Mood: ${result.mood_level}/5`}
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Box>
            )}
          </Paper>
        )}

        {/* Day Detail Modal */}
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