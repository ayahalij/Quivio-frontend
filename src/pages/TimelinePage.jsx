// src/pages/TimelinePage.js - Complete Integrated Timeline with Calendar, Search & Map
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
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Mood,
  Event,
  CameraAlt,
  Search,
  Clear,
  Edit,
  Map as MapIcon,
  PhotoCamera,
  LocationOn,
  Close,
  Home
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PhotoViewer from '../components/common/PhotoViewer';
import { Assignment, CheckCircle } from '@mui/icons-material';

// Fix for default markers in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

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

// Custom marker for photo locations
const photoIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const TimelinePage = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get initial tab from URL parameters
  const getInitialTab = () => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['0', '1', '2'].includes(tabParam)) {
      return parseInt(tabParam);
    }
    return 0; // Default to calendar
  };

  const [currentTab, setCurrentTab] = useState(getInitialTab());
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

  // Map state
  const [locations, setLocations] = useState([]);
  const [mapLoading, setMapLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [photoStats, setPhotoStats] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all');

  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  const [capsuleViewerOpen, setCapsuleViewerOpen] = useState(false);
  const [selectedCapsule, setSelectedCapsule] = useState(null);

  const handleTabChange = (event, newValue) => {
  setCurrentTab(newValue);
  
  // Clear day details when switching tabs
  setSelectedDay(null);
  
  // Also clear any other modals that might be open
  setCapsuleViewerOpen(false);
  setLocationDialogOpen(false);
  setPhotoViewerOpen(false);
  
  const newUrl = newValue === 0 ? '/timeline' : `/timeline?tab=${newValue}`;
  navigate(newUrl, { replace: true });
};

  useEffect(() => {
    if (currentTab === 0) {
      fetchCalendarData();
    } else if (currentTab === 2) {
      fetchPhotoLocations();
      fetchPhotoStats();
    }
  }, [currentDate, currentTab, timeFilter]);

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

  const fetchPhotoLocations = async () => {
    setMapLoading(true);
    setMapError('');

    try {
      let startDate = null;
      let endDate = null;

      if (timeFilter === '7days') {
        startDate = dayjs().subtract(7, 'day').format('YYYY-MM-DD');
      } else if (timeFilter === '30days') {
        startDate = dayjs().subtract(30, 'day').format('YYYY-MM-DD');
      } else if (timeFilter === '90days') {
        startDate = dayjs().subtract(90, 'day').format('YYYY-MM-DD');
      }

      const response = await ApiService.getPhotoLocations(startDate, endDate);
      setLocations(response.locations || []);
    } catch (error) {
      console.error('Failed to fetch photo locations:', error);
      setMapError('Failed to load photo locations');
    } finally {
      setMapLoading(false);
    }
  };

  const fetchPhotoStats = async () => {
    try {
      const response = await ApiService.getPhotoStats();
      setPhotoStats(response);
    } catch (error) {
      console.error('Failed to fetch photo stats:', error);
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

  const handleMarkerClick = (location) => {
    setSelectedLocation(location);
    setLocationDialogOpen(true);
  };

  const getMapCenter = () => {
    if (locations.length === 0) {
      return [25.9, 50.5]; // Default to Bahrain (user's location)
    }

    const latSum = locations.reduce((sum, loc) => sum + loc.lat, 0);
    const lngSum = locations.reduce((sum, loc) => sum + loc.lng, 0);
    
    return [latSum / locations.length, lngSum / locations.length];
  };

  const getMapZoom = () => {
    if (locations.length === 0) return 8;
    if (locations.length === 1) return 12;
    
    const lats = locations.map(loc => loc.lat);
    const lngs = locations.map(loc => loc.lng);
    
    const latRange = Math.max(...lats) - Math.min(...lats);
    const lngRange = Math.max(...lngs) - Math.min(...lngs);
    const maxRange = Math.max(latRange, lngRange);
    
    if (maxRange > 10) return 3;
    if (maxRange > 5) return 5;
    if (maxRange > 1) return 8;
    return 10;
  };

  const handlePhotoClick = (photos, index = 0) => {
  // Convert photo data to format expected by PhotoViewer
  const formattedPhotos = photos.map(photo => ({
    url: photo.url,
    title: photo.title,
    date: photo.date,
    location_lat: photo.location_lat,
    location_lng: photo.location_lng
  }));
  
  setSelectedPhotos(formattedPhotos);
  setSelectedPhotoIndex(index);
  setPhotoViewerOpen(true);
};

const handleSinglePhotoClick = (photo) => {
  handlePhotoClick([photo], 0);
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
            <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
              {/* Mood indicator */}
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
                  title={`Mood: ${dayData.mood.level}/5`}
                >
                  <Typography variant="caption" sx={{ fontSize: 10 }}>
                    {MOOD_EMOJIS[dayData.mood.level]}
                  </Typography>
                </Box>
              )}
              
              {/* Diary indicator */}
              {dayData.diary && (
                <Edit 
                  sx={{ fontSize: 12, color: '#666' }} 
                  title="Has diary entry"
                />
              )}
              
              {/* Photo indicator */}
              {dayData.photos && dayData.photos.length > 0 && (
                <CameraAlt 
                  sx={{ fontSize: 12, color: '#666' }} 
                  title={`${dayData.photos.length} photo${dayData.photos.length !== 1 ? 's' : ''}`}
                />
              )}

              {/* Challenge indicator */}
              {dayData.challenge && (
                <Assignment 
                  sx={{ 
                    fontSize: 12, 
                    color: dayData.challenge.is_completed ? '#4caf50' : '#ff9800' 
                  }} 
                  title={
                    dayData.challenge.is_completed 
                      ? 'Challenge completed' 
                      : 'Challenge available'
                  }
                />
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

    const handleCapsuleClick = async (capsuleId) => {
  try {
    setLoading(true);
    const capsuleData = await ApiService.getCapsule(capsuleId);
    setSelectedCapsule(capsuleData);
    setCapsuleViewerOpen(true);
  } catch (error) {
    console.error('Failed to fetch capsule details:', error);
    setError('Failed to load capsule details');
  } finally {
    setLoading(false);
  }
};

const handleCapsuleMediaClick = (media, allMedia) => {
  const photos = allMedia
    .filter(m => m.media_type === 'image')
    .map(m => ({
      url: m.media_url,
      title: 'Capsule Media',
      date: selectedCapsule?.created_at
    }));
  
  const clickedIndex = photos.findIndex(p => p.url === media.media_url);
  
  setSelectedPhotos(photos);
  setSelectedPhotoIndex(Math.max(0, clickedIndex));
  setPhotoViewerOpen(true);
};

const renderCapsuleMedia = (media) => {
  const images = media.filter(m => m.media_type === 'image');
  const videos = media.filter(m => m.media_type === 'video');
  
  return (
    <Box sx={{ mt: 2 }}>
      {images.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Images ({images.length})
          </Typography>
          <Grid container spacing={1}>
            {images.map((image, index) => (
              <Grid item xs={4} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    '&:hover': { 
                      transform: 'scale(1.05)',
                      transition: 'transform 0.2s ease-in-out'
                    }
                  }}
                  onClick={() => handleCapsuleMediaClick(image, media)}
                >
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={image.media_url}
                      alt="Capsule media"
                      style={{
                        width: '100%',
                        height: 80,
                        objectFit: 'cover'
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 2,
                        right: 2,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        borderRadius: '50%',
                        width: 20,
                        height: 20,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontSize: 8 }}>
                        👁️
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
      
      {videos.length > 0 && (
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Videos ({videos.length})
          </Typography>
          <Grid container spacing={1}>
            {videos.map((video, index) => (
              <Grid item xs={6} key={index}>
                <Card>
                  <Box sx={{ position: 'relative' }}>
                    <video
                      controls
                      style={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover'
                      }}
                    >
                      <source src={video.media_url} />
                      Your browser does not support the video tag.
                    </video>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <IconButton 
            color="inherit" 
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <Home />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Timeline & Memories
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
              src={user?.avatar_url} 
              sx={{ width: 32, height: 32 }}
            >
              {!user?.avatar_url && user?.username?.charAt(0).toUpperCase()}
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
            onChange={handleTabChange}
            centered
          >
            <Tab label="Calendar View" icon={<Event />} />
            <Tab label="Search Memories" icon={<Search />} />
            <Tab label="Photo Map" icon={<MapIcon />} />
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

        {/* Photo Map Tab */}
        {currentTab === 2 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">Photo Map</Typography>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Time Filter</InputLabel>
                <Select
                  value={timeFilter}
                  label="Time Filter"
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="90days">Last 3 Months</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {mapError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {mapError}
              </Alert>
            )}

            {/* Statistics Cards */}
            {photoStats && (
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <PhotoCamera color="primary" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4">{photoStats.total_photos}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Photos
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <LocationOn color="success" sx={{ fontSize: 40, mb: 1 }} />
                      <Typography variant="h4">{photoStats.photos_with_location}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        With Location
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Card>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="h4" color="primary">
                        {photoStats.location_percentage.toFixed(0)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Location Coverage
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            )}

            {/* Map */}
            <Card sx={{ height: 500 }}>
              <CardContent sx={{ height: '100%', p: 0 }}>
                {mapLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress />
                  </Box>
                ) : locations.length === 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <LocationOn sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No photos with location data
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', px: 2 }}>
                      Upload photos with location enabled to see them on the map
                    </Typography>
                  </Box>
                ) : (
                  <MapContainer
                    center={getMapCenter()}
                    zoom={getMapZoom()}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {locations.map((location, index) => (
                      <Marker
                        key={index}
                        position={[location.lat, location.lng]}
                        icon={photoIcon}
                        eventHandlers={{
                          click: () => handleMarkerClick(location)
                        }}
                      >
                        <Popup>
                          <Box sx={{ minWidth: 200 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              {location.location_name || 'Unknown Location'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {location.photos.length} photo{location.photos.length !== 1 ? 's' : ''}
                            </Typography>
                            <Button
                              size="small"
                              onClick={() => handleMarkerClick(location)}
                              sx={{ mt: 1 }}
                            >
                              View Photos
                            </Button>
                          </Box>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                )}
              </CardContent>
            </Card>

            {/* Map Instructions */}
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  How to Add Photos to the Map
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  To see your photos on this map, enable location services when uploading photos through the "Add Photo Memory" feature on your dashboard.
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Chip label="Enable location on your device" size="small" variant="outlined" />
                  <Chip label="Allow location access when uploading" size="small" variant="outlined" />
                  <Chip label="Photos will automatically appear on the map" size="small" variant="outlined" />
                </Box>
              </CardContent>
            </Card>
          </Box>
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
                <Grid container spacing={2}>
                  {selectedDay.data.photos.map((photo, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            transform: 'scale(1.02)',
                            transition: 'transform 0.2s ease-in-out',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => handlePhotoClick(selectedDay.data.photos, index)}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={photo.url}
                            alt={photo.title}
                            style={{
                              width: '100%',
                              height: 120,
                              objectFit: 'cover',
                              borderRadius: '4px 4px 0 0'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          {photo.has_location && (
                            <Chip
                              icon={<LocationOn />}
                              label="Located"
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(255,255,255,0.9)'
                              }}
                            />
                          )}
                          {/* Add click indicator overlay */}
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 4,
                              right: 4,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              borderRadius: '50%',
                              width: 24,
                              height: 24,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'white', fontSize: 10 }}>
                              👁️
                            </Typography>
                          </Box>
                        </Box>
                        <CardContent sx={{ p: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {photo.title}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {selectedDay.data.capsules && (
  <Box sx={{ mb: 2 }}>
    <Typography variant="subtitle1" gutterBottom>Memory Capsules</Typography>
    
    {selectedDay.data.capsules.created && selectedDay.data.capsules.created.length > 0 && (
      <Box sx={{ mb: 1 }}>
        <Typography variant="body2" color="primary" gutterBottom>
          📦 Capsules Created
        </Typography>
        {selectedDay.data.capsules.created.map((capsule, index) => (
          <Card key={index} sx={{ mb: 1, backgroundColor: '#e3f2fd' }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2">{capsule.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Opens: {dayjs(capsule.open_date).format('MMM D, YYYY')}
              </Typography>
              <Chip
                label={capsule.is_opened ? 'Opened' : 'Locked'}
                size="small"
                color={capsule.is_opened ? 'success' : 'default'}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        ))}
      </Box>
    )}
    
    {selectedDay.data.capsules.opened && selectedDay.data.capsules.opened.length > 0 && (
      <Box>
        <Typography variant="body2" color="success.main" gutterBottom>
          🎉 Capsules Opened
        </Typography>
        {selectedDay.data.capsules.opened.map((capsule, index) => (
          <Card 
            key={index} 
            sx={{ 
              mb: 1, 
              backgroundColor: '#e8f5e8',
              cursor: 'pointer',
              '&:hover': { 
                boxShadow: 2,
                backgroundColor: '#d4edda'
              }
            }}
            onClick={() => handleCapsuleClick(capsule.id)}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2">{capsule.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Created: {dayjs(capsule.created_date).format('MMM D, YYYY')}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {capsule.message}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderRadius: '50%',
                    width: 32,
                    height: 32,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ml: 1
                  }}
                >
                  <Typography variant="caption" sx={{ color: '#4caf50', fontSize: 12 }}>
                    👁️
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                Click to view full capsule content
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    )}
  </Box>
)}


           {selectedDay.data.challenge && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>Daily Challenge</Typography>
                
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Assignment color="primary" />
                        <Typography variant="h6">
                          Photography Challenge
                        </Typography>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {selectedDay.data.challenge.difficulty_level && (
                          <Chip 
                            label={selectedDay.data.challenge.difficulty_level} 
                            color={
                              selectedDay.data.challenge.difficulty_level?.toLowerCase() === 'easy' ? 'success' :
                              selectedDay.data.challenge.difficulty_level?.toLowerCase() === 'medium' ? 'warning' :
                              selectedDay.data.challenge.difficulty_level?.toLowerCase() === 'hard' ? 'error' : 'primary'
                            }
                            size="small"
                          />
                        )}
                        
                        <Chip 
                          label={selectedDay.data.challenge.is_completed ? 'Completed' : 'Not Completed'}
                          color={selectedDay.data.challenge.is_completed ? 'success' : 'default'}
                          size="small"
                          icon={selectedDay.data.challenge.is_completed ? <CheckCircle /> : undefined}
                        />
                      </Box>
                    </Box>

                    <Typography variant="body1" paragraph>
                      {selectedDay.data.challenge.challenge_text}
                    </Typography>

                    {selectedDay.data.challenge.is_completed && selectedDay.data.challenge.completed_at && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Completed: {dayjs(selectedDay.data.challenge.completed_at).format('MMM D, YYYY [at] h:mm A')}
                      </Typography>
                    )}

                    {selectedDay.data.challenge.mood_level && (
                      <Typography variant="body2" color="text.secondary">
                        Based on mood level: {selectedDay.data.challenge.mood_level}/5
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                {/* Challenge Photo Section */}
                {selectedDay.data.challenge.photo_url && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" gutterBottom>
                        Challenge Photo
                      </Typography>
                      
                      <Box 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            transform: 'scale(1.02)',
                            transition: 'transform 0.2s ease-in-out'
                          }
                        }}
                        onClick={() => handleSinglePhotoClick({
                          url: selectedDay.data.challenge.photo_url,
                          title: `Challenge: ${selectedDay.data.challenge.challenge_text}`,
                          date: selectedDay.data.challenge.completed_at || selectedDay.data.challenge.date
                        })}
                      >
                        <Box sx={{ position: 'relative' }}>
                          <img
                            src={selectedDay.data.challenge.photo_url}
                            alt="Challenge completion"
                            style={{
                              width: '100%',
                              height: 'auto',
                              maxHeight: 250,
                              objectFit: 'contain',
                              borderRadius: 8,
                              border: '1px solid #ddd'
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                          
                          {/* Click indicator */}
                          <Box
                            sx={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              borderRadius: '50%',
                              width: 32,
                              height: 32,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <Typography variant="caption" sx={{ color: 'white', fontSize: 12 }}>
                              👁️
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Click to view full size
                      </Typography>
                    </CardContent>
                  </Card>
                )}

                {/* If no photo but challenge completed */}
                {selectedDay.data.challenge.is_completed && !selectedDay.data.challenge.photo_url && (
                  <Alert severity="info" sx={{ mt: 1 }}>
                    Challenge completed without photo
                  </Alert>
                )}

                {/* If challenge not completed */}
                {!selectedDay.data.challenge.is_completed && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    Challenge not completed on this day
                  </Alert>
                )}
              </Box>
            )}
          </Paper>
        )}

        {/* Location Details Dialog for Map */}
        <Dialog open={locationDialogOpen} onClose={() => setLocationDialogOpen(false)} maxWidth="md" fullWidth>
          {selectedLocation && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h6">
                      {selectedLocation.location_name || 'Unknown Location'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedLocation.photos.length} photo{selectedLocation.photos.length !== 1 ? 's' : ''} taken here
                    </Typography>
                  </Box>
                  <Button onClick={() => setLocationDialogOpen(false)}>
                    <Close />
                  </Button>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Grid container spacing={2}>
                  {selectedLocation.photos.map((photo, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': { 
                            transform: 'scale(1.02)',
                            transition: 'transform 0.2s ease-in-out',
                            boxShadow: 3
                          }
                        }}
                        onClick={() => handlePhotoClick(selectedLocation.photos, index)}
                      >
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            {photo.title}
                          </Typography>
                          <Chip
                            label={dayjs(photo.date).format('MMM D, YYYY')}
                            size="small"
                            variant="outlined"
                          />
                          {photo.url && (
                            <Box sx={{ mt: 2, position: 'relative' }}>
                              <img
                                src={photo.url}
                                alt={photo.title}
                                style={{
                                  width: '100%',
                                  height: 120,
                                  objectFit: 'cover',
                                  borderRadius: 4
                                }}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              {/* Add click indicator */}
                              <Box
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  backgroundColor: 'rgba(0,0,0,0.7)',
                                  borderRadius: '50%',
                                  width: 20,
                                  height: 20,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                <Typography variant="caption" sx={{ color: 'white', fontSize: 8 }}>
                                  👁️
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </DialogContent>
            </>
          )}
        </Dialog>
      </Container>
      <Dialog open={capsuleViewerOpen} onClose={() => setCapsuleViewerOpen(false)} maxWidth="md" fullWidth>
  {selectedCapsule && (
    <>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">
              {selectedCapsule.title}
            </Typography>
            <Chip
              label="Opened Capsule"
              size="small"
              color="success"
              sx={{ mt: 0.5 }}
            />
          </Box>
          <IconButton onClick={() => setCapsuleViewerOpen(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-wrap' }}>
          {selectedCapsule.message}
        </Typography>
        
        {/* Display media if available */}
        {selectedCapsule.media && selectedCapsule.media.length > 0 && (
          renderCapsuleMedia(selectedCapsule.media)
        )}
        
        <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Created:</strong> {dayjs(selectedCapsule.created_at).format('MMMM D, YYYY at h:mm A')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            <strong>Scheduled to open:</strong> {dayjs(selectedCapsule.open_date).format('MMMM D, YYYY at h:mm A')}
          </Typography>
          {!selectedCapsule.is_private && selectedCapsule.recipient_email && (
            <Typography variant="body2" color="text.secondary">
              <strong>Shared with:</strong> {selectedCapsule.recipient_email}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setCapsuleViewerOpen(false)}>
          Close
        </Button>
      </DialogActions>
    </>
  )}
</Dialog>
      <PhotoViewer
        open={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
        photos={selectedPhotos}
        initialIndex={selectedPhotoIndex}
      />
    </Box>
  );
};

export default TimelinePage;