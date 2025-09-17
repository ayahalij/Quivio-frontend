// src/pages/TimelinePage.jsx
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
  DialogActions,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Event,
  CameraAlt,
  Search,
  Clear,
  Edit,
  Map as MapIcon,
  PhotoCamera,
  SendTimeExtension,
  LocationOn,
  Close,
  Home,
  CalendarToday,
  Person,
  Assignment,
  CheckCircle,
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied
} from '@mui/icons-material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import dayjs from 'dayjs';
import { useLocation, useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import PhotoViewer from '../components/common/PhotoViewer';

// Fix for default markers in Leaflet with React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Enhanced mood system - consistent with MoodTracker
const MOOD_COLORS = {
  1: '#ff6b6b',    // Red - Very Sad
  2: '#ffa726',    // Orange - Sad  
  3: '#42a5f5',    // Blue - Neutral
  4: '#8cd38f',    // Light Green - Happy
  5: '#47a14a'     // Dark Green - Very Happy
};

const MOOD_LABELS = {
  1: 'Very Sad',
  2: 'Sad',
  3: 'Neutral',
  4: 'Happy',
  5: 'Very Happy'
};

const MOOD_ICONS = {
  1: SentimentVeryDissatisfied,
  2: SentimentDissatisfied,
  3: SentimentNeutral,
  4: SentimentSatisfied,
  5: SentimentVerySatisfied
};

// Enhanced Mood Display Component
const MoodDisplay = ({ mood, size = 'medium', showLabel = false, showLevel = false }) => {
  if (!mood) return null;

  const IconComponent = MOOD_ICONS[mood.level];
  const color = MOOD_COLORS[mood.level];
  const label = MOOD_LABELS[mood.level];

  const iconSize = {
    mini: 15,
    small: 24,
    medium: 32,
    large: 48,
    xlarge: 64
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 0.5 
    }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: iconSize[size] + 16,
          height: iconSize[size] + 16,
          borderRadius: '50%',
          backgroundColor: `${color}20`,
          border: `2px solid ${color}`,
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: `${color}30`,
            transform: 'scale(1.05)'
          }
        }}
      >
        <IconComponent 
          sx={{ 
            fontSize: iconSize[size], 
            color: color 
          }} 
        />
      </Box>
      
      {showLabel && (
        <Typography 
          variant="caption"
          sx={{ 
            fontFamily: '"Kalam", cursive',
            color: color,
            fontWeight: 600,
            fontSize: '0.8rem'
          }}
        >
          {label}
        </Typography>
      )}
      
      {showLevel && (
        <Typography 
          variant="caption"
          sx={{ 
            fontFamily: '"Kalam", cursive',
            color: '#8761a7',
            fontWeight: 600
          }}
        >
          {mood.level}/5
        </Typography>
      )}
    </Box>
  );
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
  
  // Bottom navigation
  const [navValue, setNavValue] = useState(1); // Timeline page is index 1
  
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

  const handleLogout = () => {
    logout();
    setTimeout(() => {
      navigate('/');
    }, 100);
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
        <mark key={index} style={{ backgroundColor: '#dce291', padding: '0 2px', borderRadius: '2px' }}>
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
      return <Box key={`empty-${Math.random()}`} sx={{ height: 120 }} />;
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
          height: 120,
          cursor: hasData ? 'pointer' : 'default',
          backgroundColor: hasData ? '#fffbef' : '#f8f9fa',
          border: isToday ? '3px solid #cdd475' : hasData ? '2px solid #8761a7' : '1px solid #e0e0e0',
          borderRadius: 3,
          transition: 'all 0.3s ease',
          '&:hover': hasData ? { 
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(135, 97, 167, 0.2)'
          } : {}
        }}
        onClick={() => handleDayClick(day)}
      >
        <CardContent sx={{ 
          p: 2, 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: isToday ? 700 : 600,
              color: isToday ? '#8761a7' : '#8761a7',
              fontFamily: '"Kalam", cursive',
              fontSize: '1.1rem'
            }}
          >
            {day}
          </Typography>
          
          {dayData && (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 0.5, 
              alignItems: 'center'
            }}>
              {/* Enhanced mood display */}
              {dayData.mood && (
                <MoodDisplay 
                  mood={dayData.mood} 
                  size="small"
                  showLabel={false}
                />
              )}
              
              {/* Activity indicators row */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 0.5,
                flexWrap: 'wrap',
                justifyContent: 'center'
              }}>
                {/* Diary indicator */}
                {dayData.diary && (
                  <Chip
                    icon={<Edit sx={{ fontSize: 14 }} />}
                    label=""
                    size="small"
                    sx={{
                      backgroundColor: '#dce291',
                      border: '1px solid #8761a7',
                      height: '20px',
                      minWidth: '20px',
                      '& .MuiChip-label': {marginLeft: -1, }
                    }}
                    title="Has diary entry"
                  />
                )}
                
                {/* Photo indicator */}
                {dayData.photos && dayData.photos.length > 0 && (
                  <Chip
                    icon={<CameraAlt sx={{ fontSize: 14 }} />}
                    label={dayData.photos.length > 1 ? dayData.photos.length : ""}
                    size="small"
                    sx={{
                      backgroundColor: '#dce291',
                      border: '1px solid #8761a7',
                      height: '20px',
                      minWidth: '20px',
                      color: '#8761a7',
                      fontFamily: '"Kalam", cursive',
                      fontWeight: 600,
                      fontSize: '0.7rem'
                    }}
                    title={`${dayData.photos.length} photo${dayData.photos.length !== 1 ? 's' : ''}`}
                  />
                )}

                {/* Challenge indicator */}
                {dayData.challenge && (
                  <Chip
                    icon={dayData.challenge.is_completed ? 
                      <CheckCircle sx={{ fontSize: 14 }} /> : 
                      <Assignment sx={{ fontSize: 14 }} />
                    }
                    label=""
                    size="small"
                    sx={{
                      backgroundColor: dayData.challenge.is_completed ? '#dce291' : '#ffe0b2',
                      border: `1px solid ${dayData.challenge.is_completed ? '#8761a7' : '#ff9800'}`,
                      height: '20px',
                      minWidth: '20px',
                      '& .MuiChip-label': {marginLeft: -1, }
                    }}
                    title={
                      dayData.challenge.is_completed 
                        ? 'Challenge completed' 
                        : 'Challenge available'
                    }
                  />
                )}
              </Box>
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
            <Typography 
              variant="subtitle2" 
              gutterBottom
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#8761a7',
                fontWeight: 600
              }}
            >
              Images ({images.length})
            </Typography>
            <Grid container spacing={1}>
              {images.map((image, index) => (
                <Grid item xs={4} key={index}>
                  <Card 
                    sx={{ 
                      cursor: 'pointer',
                      border: '2px solid #8761a7',
                      borderRadius: 2,
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
                          backgroundColor: 'rgba(135, 97, 167, 0.8)',
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
            <Typography 
              variant="subtitle2" 
              gutterBottom
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#8761a7',
                fontWeight: 600
              }}
            >
              Videos ({videos.length})
            </Typography>
            <Grid container spacing={1}>
              {videos.map((video, index) => (
                <Grid item xs={6} key={index}>
                  <Card sx={{ border: '2px solid #8761a7', borderRadius: 2 }}>
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

  // Enhanced mood section renderer
  const renderMoodSection = (mood) => {
    if (!mood) return null;

    return (
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            fontFamily: '"Kalam", cursive',
            color: '#8761a7',
            fontWeight: 600
          }}
        >
          Mood
        </Typography>
        
        <Card sx={{ 
          backgroundColor: `${MOOD_COLORS[mood.level]}15`,
          border: `2px solid ${MOOD_COLORS[mood.level]}`,
          borderRadius: 3,
          p: 3
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
            <MoodDisplay 
              mood={mood} 
              size="xlarge"
              showLabel={true}
              showLevel={true}
            />
            
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h5"
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  color: MOOD_COLORS[mood.level],
                  fontWeight: 700,
                  mb: 1
                }}
              >
                {MOOD_LABELS[mood.level]}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Level ${mood.level}/5`}
                  sx={{
                    backgroundColor: MOOD_COLORS[mood.level],
                    color: 'white',
                    fontFamily: '"Kalam", cursive',
                    fontWeight: 600
                  }}
                />
                
                <Chip
                  label={MOOD_LABELS[mood.level]}
                  variant="outlined"
                  sx={{
                    borderColor: MOOD_COLORS[mood.level],
                    color: MOOD_COLORS[mood.level],
                    fontFamily: '"Kalam", cursive',
                    fontWeight: 600
                  }}
                />
              </Box>
            </Box>
          </Box>
          
          {mood.note && (
            <Card sx={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              border: `1px solid ${MOOD_COLORS[mood.level]}`,
              borderRadius: 2,
              p: 2,
              mt: 2
            }}>
              <Typography 
                variant="body1"
                sx={{ 
                  color: '#8761a7',
                  fontFamily: '"Kalam", cursive',
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  lineHeight: 1.6
                }}
              >
                "{mood.note}"
              </Typography>
            </Card>
          )}
        </Card>
      </Box>
    );
  };

  if (loading && !calendarData) {
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
      {/* Header - Same as Dashboard */}
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
                onClick={handleLogout}
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

      {/* Main Content */}
      <Container maxWidth="xl" sx={{ 
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 'calc(100vh - 200px)'
      }}>
        <Box sx={{ width: '100%', maxWidth: '1400px', mt: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#8761a7',
                fontWeight: 700
              }}
            >
              Timeline & Memories
            </Typography>
          </Box>

          {/* Tabs */}
          <Card sx={{ 
            mb: 3,
            backgroundColor: '#fffbef',
            border: '3px solid #8761a7',
            borderRadius: 4
          }}>
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange}
              centered
              sx={{
                '& .MuiTab-root': {
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontWeight: 600,
                  fontSize: '1rem',
                  textTransform: 'none',
                  '&.Mui-selected': {
                    color: '#8761a7',
                    backgroundColor: '#dce291'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#8761a7',
                  height: '3px'
                }
              }}
            >
              <Tab label="Calendar View" icon={<Event />} />
              <Tab label="Search Memories" icon={<Search />} />
              <Tab label="Photo Map" icon={<MapIcon />} />
            </Tabs>
          </Card>

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

          {/* Calendar Tab */}
          {currentTab === 0 && (
            <>
              <Card sx={{ 
                p: 3, 
                mb: 3,
                backgroundColor: '#fffbef',
                border: '3px solid #8761a7',
                borderRadius: 4
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                  <IconButton 
                    onClick={() => navigateMonth(-1)}
                    sx={{
                      backgroundColor: '#cdd475',
                      border: '2px solid #8761a7',
                      color: '#8761a7',
                      '&:hover': {
                        backgroundColor: '#dce291',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <ChevronLeft />
                  </IconButton>
                  
                  <Typography 
                    variant="h4"
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 700
                    }}
                  >
                    {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </Typography>
                  
                  <IconButton 
                    onClick={() => navigateMonth(1)}
                    sx={{
                      backgroundColor: '#cdd475',
                      border: '2px solid #8761a7',
                      color: '#8761a7',
                      '&:hover': {
                        backgroundColor: '#dce291',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <ChevronRight />
                  </IconButton>
                </Box>

                {calendarData && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                    <Chip 
                      label={`${calendarData.total_days_with_entries} days with entries`} 
                      sx={{
                        backgroundColor: '#dce291',
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600,
                        border: '2px solid #8761a7'
                      }}
                      size="medium" 
                    />
                  </Box>
                )}
              </Card>

              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress sx={{ color: '#8761a7' }} />
                </Box>
              ) : (
                <>
                  {/* Calendar Header Days */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                      <Grid item xs key={day} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 600, 
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            fontSize: '1.1rem'
                          }}
                        >
                          {day.slice(0, 3)}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Calendar Grid - Traditional Monthly View */}
                  <Grid container spacing={1}>
                    {getDaysInMonth().map((day, index) => (
                      <Grid item xs={12/7} key={index} sx={{ display: 'flex' }}>
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
            <Card sx={{ 
              p: 4,
              backgroundColor: '#fffbef',
              border: '3px solid #8761a7',
              borderRadius: 4
            }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Search sx={{ fontSize: 48, color: '#8761a7', mb: 2 }} />
                <Typography 
                  variant="h4" 
                  gutterBottom
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontWeight: 600
                  }}
                >
                  Search Your Journey
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: '#8761a7',
                    fontFamily: '"Kalam", cursive',
                    fontSize: '1.1rem'
                  }}
                >
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
                      <Search sx={{ color: '#8761a7' }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchTerm && (
                    <InputAdornment position="end">
                      <IconButton onClick={clearSearch} size="small">
                        <Clear sx={{ color: '#8761a7' }} />
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    fontFamily: '"Kalam", cursive',
                    backgroundColor: '#fffefb',
                    border: '2px solid #8761a7',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8761a7'
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#8761a7',
                      borderWidth: '2px'
                    }
                  },
                  '& .MuiInputBase-input::placeholder': {
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    opacity: 0.7
                  }
                }}
              />

              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={searchLoading || !searchTerm.trim()}
                  startIcon={searchLoading ? <CircularProgress size={20} sx={{ color: '#8761a7' }} /> : <Search />}
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
                    px: 4,
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
                  Search Memories
                </Button>
              </Box>

              {searchError && (
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
                  {searchError}
                </Alert>
              )}

              {/* Enhanced Search Results */}
              {hasSearched && (
                <Box>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    mb: 3 
                  }}>
                    <Typography 
                      variant="h5"
                      sx={{ 
                        fontFamily: '"Kalam", cursive',
                        color: '#8761a7',
                        fontWeight: 600
                      }}
                    >
                      Search Results
                    </Typography>
                    {searchResults.length > 0 && (
                      <Chip 
                        label={`${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
                        sx={{
                          backgroundColor: '#dce291',
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          fontWeight: 600,
                          border: '2px solid #8761a7'
                        }}
                      />
                    )}
                  </Box>

                  {searchLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress sx={{ color: '#8761a7' }} />
                    </Box>
                  ) : searchResults.length === 0 ? (
                    <Card sx={{
                      backgroundColor: '#fffbef',
                      border: '3px solid #8761a7',
                      borderRadius: 4
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 6 }}>
                        <Search sx={{ fontSize: 64, color: '#8761a7', mb: 2, opacity: 0.5 }} />
                        <Typography 
                          variant="h6"
                          sx={{ 
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            fontWeight: 600,
                            mb: 1
                          }}
                        >
                          No results found for "{searchTerm}"
                        </Typography>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive'
                          }}
                        >
                          Try different keywords or check your spelling
                        </Typography>
                      </CardContent>
                    </Card>
                  ) : (
                    <Grid container spacing={3}>
                      {searchResults.map((result, index) => (
                        <Grid item xs={12} key={index}>
                          <Card 
                            sx={{ 
                              backgroundColor: '#fffbef',
                              border: '3px solid #8761a7',
                              borderRadius: 4,
                              transition: 'all 0.3s ease',
                              '&:hover': { 
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 25px rgba(135, 97, 167, 0.2)'
                              }
                            }}
                          >
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  {result.type === 'diary' ? (
                                    <Edit sx={{ color: '#8761a7', fontSize: 28 }} />
                                  ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {result.mood_level && (
                                        <MoodDisplay 
                                          mood={{ level: result.mood_level }} 
                                          size="medium"
                                        />
                                      )}
                                    </Box>
                                  )}
                                  <Typography 
                                    variant="h6"
                                    sx={{ 
                                      fontFamily: '"Kalam", cursive',
                                      color: '#8761a7',
                                      fontWeight: 600
                                    }}
                                  >
                                    {result.type === 'diary' ? 'Diary Entry' : 'Mood Note'}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={dayjs(result.date).format('MMM D, YYYY')}
                                  sx={{
                                    backgroundColor: '#dce291',
                                    color: '#8761a7',
                                    fontFamily: '"Kalam", cursive',
                                    fontWeight: 600,
                                    border: '1px solid #8761a7'
                                  }}
                                />
                              </Box>

                              <Typography 
                                variant="body1" 
                                paragraph
                                sx={{ 
                                  fontFamily: '"Kalam", cursive',
                                  color: '#8761a7',
                                  fontSize: '1.1rem',
                                  lineHeight: 1.6,
                                  mb: 2
                                }}
                              >
                                {highlightSearchTerm(result.excerpt, searchTerm)}
                              </Typography>

                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                <Chip
                                  label={result.type === 'diary' ? 'Diary' : 'Mood'}
                                  size="small"
                                  sx={{
                                    backgroundColor: result.type === 'diary' ? '#dce291' : '#ffe0b2',
                                    color: '#8761a7',
                                    fontFamily: '"Kalam", cursive',
                                    fontWeight: 600,
                                    border: '1px solid #8761a7'
                                  }}
                                />
                                {result.word_count && (
                                  <Chip
                                    label={`${result.word_count} words`}
                                    size="small"
                                    variant="outlined"
                                    sx={{
                                      borderColor: '#8761a7',
                                      color: '#8761a7',
                                      fontFamily: '"Kalam", cursive'
                                    }}
                                  />
                                )}
                                {result.mood_level && (
                                  <Chip
                                    label={`${MOOD_LABELS[result.mood_level]}`}
                                    size="small"
                                    sx={{
                                      backgroundColor: MOOD_COLORS[result.mood_level],
                                      color: 'white',
                                      fontFamily: '"Kalam", cursive',
                                      fontWeight: 600
                                    }}
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
            </Card>
          )}

          {/* Photo Map Tab */}
          {currentTab === 2 && (
            <Box>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3 
              }}>
                <Typography 
                  variant="h5"
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontWeight: 600
                  }}
                >
                  Photo Map
                </Typography>
                <FormControl 
                  size="small" 
                  sx={{ 
                    minWidth: 140,
                    '& .MuiOutlinedInput-root': {
                      fontFamily: '"Kalam", cursive',
                      backgroundColor: '#fffefb',
                      border: '2px solid #8761a7',
                      borderRadius: 2
                    },
                    '& .MuiInputLabel-root': {
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600
                    }
                  }}
                >
                  <InputLabel>Time Filter</InputLabel>
                  <Select
                    value={timeFilter}
                    label="Time Filter"
                    onChange={(e) => setTimeFilter(e.target.value)}
                    sx={{
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7'
                    }}
                  >
                    <MenuItem value="all" sx={{ fontFamily: '"Kalam", cursive' }}>All Time</MenuItem>
                    <MenuItem value="7days" sx={{ fontFamily: '"Kalam", cursive' }}>Last 7 Days</MenuItem>
                    <MenuItem value="30days" sx={{ fontFamily: '"Kalam", cursive' }}>Last 30 Days</MenuItem>
                    <MenuItem value="90days" sx={{ fontFamily: '"Kalam", cursive' }}>Last 3 Months</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {mapError && (
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
                  {mapError}
                </Alert>
              )}

              {/* Statistics Cards */}
              {photoStats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{
                      backgroundColor: '#fffbef',
                      border: '3px solid #8761a7',
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(135, 97, 167, 0.2)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <PhotoCamera sx={{ fontSize: 48, color: '#8761a7', mb: 2 }} />
                        <Typography 
                          variant="h3"
                          sx={{ 
                            fontFamily: '"Kalam", cursive',
                            color: '#8761a7',
                            fontWeight: 700,
                            mb: 1
                          }}
                        >
                          {photoStats.total_photos}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            fontWeight: 600
                          }}
                        >
                          Total Photos
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{
                      backgroundColor: '#fffbef',
                      border: '3px solid #8761a7',
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(135, 97, 167, 0.2)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <LocationOn sx={{ fontSize: 48, color: '#cdd475', mb: 2 }} />
                        <Typography 
                          variant="h3"
                          sx={{ 
                            fontFamily: '"Kalam", cursive',
                            color: '#8761a7',
                            fontWeight: 700,
                            mb: 1
                          }}
                        >
                          {photoStats.photos_with_location}
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            fontWeight: 600
                          }}
                        >
                          With Location
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Card sx={{
                      backgroundColor: '#fffbef',
                      border: '3px solid #8761a7',
                      borderRadius: 4,
                      transition: 'all 0.3s ease',
                      '&:hover': { 
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(135, 97, 167, 0.2)'
                      }
                    }}>
                      <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Typography 
                          variant="h3" 
                          sx={{ 
                            color: '#cdd475',
                            fontFamily: '"Kalam", cursive',
                            fontWeight: 700,
                            mb: 2
                          }}
                        >
                          {photoStats.location_percentage.toFixed(0)}%
                        </Typography>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            fontWeight: 600
                          }}
                        >
                          Location Coverage
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              )}

              {/* Map */}
              <Card sx={{ 
                height: 500,
                backgroundColor: '#fffbef',
                border: '3px solid #8761a7',
                borderRadius: 4
              }}>
                <CardContent sx={{ height: '100%', p: 0 }}>
                  {mapLoading ? (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      flexDirection: 'column'
                    }}>
                      <CircularProgress sx={{ color: '#8761a7', mb: 2 }} />
                      <Typography 
                        sx={{ 
                          fontFamily: '"Kalam", cursive',
                          color: '#8761a7'
                        }}
                      >
                        Loading map...
                      </Typography>
                    </Box>
                  ) : locations.length === 0 ? (
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: '100%',
                      p: 4
                    }}>
                      <LocationOn sx={{ fontSize: 80, color: '#8761a7', mb: 2, opacity: 0.5 }} />
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          fontWeight: 600,
                          mb: 1
                        }}
                      >
                        No photos with location data
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ 
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          textAlign: 'center'
                        }}
                      >
                        Upload photos with location enabled to see them on the map
                      </Typography>
                    </Box>
                  ) : (
                    <MapContainer
                      center={getMapCenter()}
                      zoom={getMapZoom()}
                      style={{ height: '100%', width: '100%', borderRadius: '12px' }}
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
                              <Typography 
                                variant="subtitle2" 
                                gutterBottom
                                sx={{ 
                                  fontFamily: '"Kalam", cursive',
                                  fontWeight: 600
                                }}
                              >
                                {location.location_name || 'Unknown Location'}
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: 'text.secondary',
                                  fontFamily: '"Kalam", cursive'
                                }}
                              >
                                {location.photos.length} photo{location.photos.length !== 1 ? 's' : ''}
                              </Typography>
                              <Button
                                size="small"
                                onClick={() => handleMarkerClick(location)}
                                sx={{ 
                                  mt: 1,
                                  fontFamily: '"Kalam", cursive'
                                }}
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
              <Card sx={{ 
                mt: 3,
                backgroundColor: '#fffbef',
                border: '3px solid #8761a7',
                borderRadius: 4
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600
                    }}
                  >
                    How to Add Photos to the Map
                  </Typography>
                  <Typography 
                    variant="body1" 
                    paragraph
                    sx={{ 
                      color: '#8761a7',
                      fontFamily: '"Kalam", cursive',
                      mb: 2
                    }}
                  >
                    To see your photos on this map, enable location services when uploading photos through the "Add Photo Memory" feature on your dashboard.
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip 
                      label="Enable location on your device" 
                      size="small" 
                      sx={{
                        backgroundColor: '#dce291',
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        border: '1px solid #8761a7'
                      }}
                    />
                    <Chip 
                      label="Allow location access when uploading" 
                      size="small" 
                      sx={{
                        backgroundColor: '#dce291',
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        border: '1px solid #8761a7'
                      }}
                    />
                    <Chip 
                      label="Photos will automatically appear on the map" 
                      size="small" 
                      sx={{
                        backgroundColor: '#dce291',
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        border: '1px solid #8761a7'
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Day Detail Modal */}
          {selectedDay && (
            <Card sx={{ 
              mt: 4, 
              p: 4,
              backgroundColor: '#fffbef',
              border: '3px solid #8761a7',
              borderRadius: 4
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography 
                  variant="h5"
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontWeight: 600
                  }}
                >
                  {currentDate.toLocaleDateString('en-US', { month: 'long' })} {selectedDay.day}, {currentDate.getFullYear()}
                </Typography>
                <Button 
                  onClick={() => setSelectedDay(null)}
                  sx={{
                    backgroundColor: '#cdd475',
                    color: '#8761a7',
                    border: '2px solid #8761a7',
                    borderRadius: 2,
                    fontFamily: '"Kalam", cursive',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#dce291'
                    }
                  }}
                >
                  Close
                </Button>
              </Box>

              {/* Enhanced Mood Section */}
              {selectedDay.data.mood && renderMoodSection(selectedDay.data.mood)}

              {selectedDay.data.diary && (
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600
                    }}
                  >
                    Diary Entry
                  </Typography>
                  <Card sx={{ 
                    backgroundColor: '#dce291',
                    border: '2px solid #8761a7',
                    borderRadius: 2,
                    p: 3
                  }}>
                    <Typography 
                      variant="body1"
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        mb: 2
                      }}
                    >
                      {selectedDay.data.diary.excerpt}
                    </Typography>
                    <Chip
                      label={`${selectedDay.data.diary.word_count} words`}
                      size="small"
                      sx={{
                        backgroundColor: '#cdd475',
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600,
                        border: '1px solid #8761a7'
                      }}
                    />
                  </Card>
                </Box>
              )}

              {selectedDay.data.photos && selectedDay.data.photos.length > 0 && (
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600
                    }}
                  >
                    Photos ({selectedDay.data.photos.length})
                  </Typography>
                  <Grid container spacing={2}>
                    {selectedDay.data.photos.map((photo, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            backgroundColor: '#fffbef',
                            border: '2px solid #8761a7',
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'scale(1.05)',
                              boxShadow: '0 8px 25px rgba(135, 97, 167, 0.3)'
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
                                height: 150,
                                objectFit: 'cover',
                                borderRadius: '8px 8px 0 0'
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
                                  top: 8,
                                  right: 8,
                                  backgroundColor: 'rgba(205, 212, 117, 0.9)',
                                  color: '#8761a7',
                                  fontFamily: '"Kalam", cursive',
                                  fontWeight: 600,
                                  border: '1px solid #8761a7'
                                }}
                              />
                            )}
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                backgroundColor: 'rgba(135, 97, 167, 0.8)',
                                borderRadius: '50%',
                                width: 28,
                                height: 28,
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
                          <CardContent sx={{ p: 2 }}>
                            <Typography 
                              variant="body1" 
                              sx={{ 
                                fontWeight: 600,
                                fontFamily: '"Kalam", cursive',
                                color: '#8761a7'
                              }}
                            >
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
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600
                    }}
                  >
                    Memory Capsules
                  </Typography>
                  
                  {selectedDay.data.capsules.created && selectedDay.data.capsules.created.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography 
                        variant="body1" 
                        gutterBottom
                        sx={{ 
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          fontWeight: 600
                        }}
                      >
                        📦 Capsules Created
                      </Typography>
                      {selectedDay.data.capsules.created.map((capsule, index) => (
                        <Card key={index} sx={{ 
                          mb: 2, 
                          backgroundColor: '#e3f2fd',
                          border: '2px solid #8761a7',
                          borderRadius: 3
                        }}>
                          <CardContent sx={{ p: 2 }}>
                            <Typography 
                              variant="h6"
                              sx={{ 
                                fontFamily: '"Kalam", cursive',
                                color: '#8761a7',
                                fontWeight: 600
                              }}
                            >
                              {capsule.title}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#8761a7',
                                fontFamily: '"Kalam", cursive',
                                mb: 1
                              }}
                            >
                              Opens: {dayjs(capsule.open_date).format('MMM D, YYYY')}
                            </Typography>
                            <Chip
                              label={capsule.is_opened ? 'Opened' : 'Locked'}
                              size="small"
                              sx={{
                                backgroundColor: capsule.is_opened ? '#dce291' : '#ffe0b2',
                                color: '#8761a7',
                                fontFamily: '"Kalam", cursive',
                                fontWeight: 600,
                                border: '1px solid #8761a7'
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  )}
                  
                  {selectedDay.data.capsules.opened && selectedDay.data.capsules.opened.length > 0 && (
                    <Box>
                      <Typography 
                        variant="body1" 
                        gutterBottom
                        sx={{ 
                          color: '#cdd475',
                          fontFamily: '"Kalam", cursive',
                          fontWeight: 600
                        }}
                      >
                        🎉 Capsules Opened
                      </Typography>
                      {selectedDay.data.capsules.opened.map((capsule, index) => (
                        <Card 
                          key={index} 
                          sx={{ 
                            mb: 2, 
                            backgroundColor: '#e8f5e8',
                            border: '2px solid #cdd475',
                            borderRadius: 3,
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 20px rgba(205, 212, 117, 0.3)'
                            }
                          }}
                          onClick={() => handleCapsuleClick(capsule.id)}
                        >
                          <CardContent sx={{ p: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="h6"
                                  sx={{ 
                                    fontFamily: '"Kalam", cursive',
                                    color: '#8761a7',
                                    fontWeight: 600
                                  }}
                                >
                                  {capsule.title}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    color: '#8761a7',
                                    fontFamily: '"Kalam", cursive',
                                    mb: 1
                                  }}
                                >
                                  Created: {dayjs(capsule.created_date).format('MMM D, YYYY')}
                                </Typography>
                                <Typography 
                                  variant="body1" 
                                  sx={{ 
                                    color: '#8761a7',
                                    fontFamily: '"Kalam", cursive',
                                    fontSize: '1.1rem'
                                  }}
                                >
                                  {capsule.message}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                                  borderRadius: '50%',
                                  width: 36,
                                  height: 36,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  ml: 2,
                                  border: '2px solid #4caf50'
                                }}
                              >
                                <Typography variant="caption" sx={{ color: '#4caf50', fontSize: 14 }}>
                                  👁️
                                </Typography>
                              </Box>
                            </Box>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                color: '#8761a7',
                                fontFamily: '"Kalam", cursive',
                                display: 'block', 
                                mt: 2,
                                fontStyle: 'italic'
                              }}
                            >
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
                <Box sx={{ mb: 3 }}>
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600
                    }}
                  >
                    Daily Challenge
                  </Typography>
                  
                  <Card sx={{ 
                    backgroundColor: '#fffbef',
                    border: '3px solid #8761a7',
                    borderRadius: 3,
                    mb: 2
                  }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Assignment sx={{ color: '#8761a7', fontSize: 32 }} />
                          <Typography 
                            variant="h6"
                            sx={{ 
                              fontFamily: '"Kalam", cursive',
                              color: '#8761a7',
                              fontWeight: 600
                            }}
                          >
                            Photography Challenge
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {selectedDay.data.challenge.difficulty_level && (
                            <Chip 
                              label={selectedDay.data.challenge.difficulty_level} 
                              size="small"
                              sx={{
                                backgroundColor: 
                                  selectedDay.data.challenge.difficulty_level?.toLowerCase() === 'easy' ? '#dce291' :
                                  selectedDay.data.challenge.difficulty_level?.toLowerCase() === 'medium' ? '#ffe0b2' :
                                  selectedDay.data.challenge.difficulty_level?.toLowerCase() === 'hard' ? '#ffcdd2' : '#dce291',
                                color: '#8761a7',
                                fontFamily: '"Kalam", cursive',
                                fontWeight: 600,
                                border: '1px solid #8761a7'
                              }}
                            />
                          )}
                          
                          <Chip 
                            label={selectedDay.data.challenge.is_completed ? 'Completed' : 'Not Completed'}
                            size="small"
                            icon={selectedDay.data.challenge.is_completed ? <CheckCircle /> : undefined}
                            sx={{
                              backgroundColor: selectedDay.data.challenge.is_completed ? '#dce291' : '#ffcdd2',
                              color: '#8761a7',
                              fontFamily: '"Kalam", cursive',
                              fontWeight: 600,
                              border: '1px solid #8761a7'
                            }}
                          />
                        </Box>
                      </Box>

                      <Typography 
                        variant="body1" 
                        paragraph
                        sx={{ 
                          fontFamily: '"Kalam", cursive',
                          color: '#8761a7',
                          fontSize: '1.1rem',
                          lineHeight: 1.6
                        }}
                      >
                        {selectedDay.data.challenge.challenge_text}
                      </Typography>

                      {selectedDay.data.challenge.is_completed && selectedDay.data.challenge.completed_at && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            mb: 1
                          }}
                        >
                          Completed: {dayjs(selectedDay.data.challenge.completed_at).format('MMM D, YYYY [at] h:mm A')}
                        </Typography>
                      )}

                      {selectedDay.data.challenge.mood_level && (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive'
                          }}
                        >
                          Based on mood level: {selectedDay.data.challenge.mood_level}/5
                        </Typography>
                      )}
                    </CardContent>
                  </Card>

                  {/* Challenge Photo Section */}
                  {selectedDay.data.challenge.photo_url && (
                    <Card sx={{ 
                      backgroundColor: '#fffbef',
                      border: '2px solid #8761a7',
                      borderRadius: 3
                    }}>
                      <CardContent sx={{ p: 3 }}>
                        <Typography 
                          variant="h6" 
                          gutterBottom
                          sx={{ 
                            fontFamily: '"Kalam", cursive',
                            color: '#8761a7',
                            fontWeight: 600
                          }}
                        >
                          Challenge Photo
                        </Typography>
                        
                        <Box 
                          sx={{ 
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'scale(1.02)'
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
                                maxHeight: 300,
                                objectFit: 'contain',
                                borderRadius: 8,
                                border: '2px solid #8761a7'
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 12,
                                right: 12,
                                backgroundColor: 'rgba(135, 97, 167, 0.8)',
                                borderRadius: '50%',
                                width: 36,
                                height: 36,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Typography variant="caption" sx={{ color: 'white', fontSize: 14 }}>
                                👁️
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: '#8761a7',
                            fontFamily: '"Kalam", cursive',
                            display: 'block', 
                            mt: 2,
                            textAlign: 'center',
                            fontStyle: 'italic'
                          }}
                        >
                          Click to view full size
                        </Typography>
                      </CardContent>
                    </Card>
                  )}

                  {/* If no photo but challenge completed */}
                  {selectedDay.data.challenge.is_completed && !selectedDay.data.challenge.photo_url && (
                    <Alert 
                      severity="info" 
                      sx={{ 
                        mt: 2,
                        backgroundColor: '#dce291',
                        color: '#8761a7',
                        border: '2px solid #8761a7',
                        borderRadius: 3,
                        fontFamily: '"Kalam", cursive'
                      }}
                    >
                      Challenge completed without photo
                    </Alert>
                  )}

                  {/* If challenge not completed */}
                  {!selectedDay.data.challenge.is_completed && (
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mt: 2,
                        backgroundColor: '#ffe0b2',
                        color: '#8761a7',
                        border: '2px solid #ff9800',
                        borderRadius: 3,
                        fontFamily: '"Kalam", cursive'
                      }}
                    >
                      Challenge not completed on this day
                    </Alert>
                  )}
                </Box>
              )}
            </Card>
          )}

          {/* Location Details Dialog for Map */}
          <Dialog 
            open={locationDialogOpen} 
            onClose={() => setLocationDialogOpen(false)} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: '#fffbef',
                border: '3px solid #8761a7',
                borderRadius: 4
              }
            }}
          >
            {selectedLocation && (
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontFamily: '"Kalam", cursive',
                          color: '#8761a7',
                          fontWeight: 600
                        }}
                      >
                        {selectedLocation.location_name || 'Unknown Location'}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive'
                        }}
                      >
                        {selectedLocation.photos.length} photo{selectedLocation.photos.length !== 1 ? 's' : ''} taken here
                      </Typography>
                    </Box>
                    <IconButton onClick={() => setLocationDialogOpen(false)}>
                      <Close sx={{ color: '#8761a7' }} />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <Grid container spacing={2}>
                    {selectedLocation.photos.map((photo, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card 
                          sx={{ 
                            cursor: 'pointer',
                            backgroundColor: '#fffbef',
                            border: '2px solid #8761a7',
                            borderRadius: 3,
                            transition: 'all 0.3s ease',
                            '&:hover': { 
                              transform: 'scale(1.05)',
                              boxShadow: '0 8px 25px rgba(135, 97, 167, 0.3)'
                            }
                          }}
                          onClick={() => handlePhotoClick(selectedLocation.photos, index)}
                        >
                          <CardContent sx={{ p: 2 }}>
                            <Typography 
                              variant="subtitle2" 
                              gutterBottom
                              sx={{ 
                                fontFamily: '"Kalam", cursive',
                                color: '#8761a7',
                                fontWeight: 600
                              }}
                            >
                              {photo.title}
                            </Typography>
                            <Chip
                              label={dayjs(photo.date).format('MMM D, YYYY')}
                              size="small"
                              sx={{
                                backgroundColor: '#dce291',
                                color: '#8761a7',
                                fontFamily: '"Kalam", cursive',
                                border: '1px solid #8761a7',
                                mb: 2
                              }}
                            />
                            {photo.url && (
                              <Box sx={{ position: 'relative' }}>
                                <img
                                  src={photo.url}
                                  alt={photo.title}
                                  style={{
                                    width: '100%',
                                    height: 120,
                                    objectFit: 'cover',
                                    borderRadius: 4,
                                    border: '1px solid #8761a7'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 4,
                                    right: 4,
                                    backgroundColor: 'rgba(135, 97, 167, 0.8)',
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

          {/* Capsule Viewer Dialog */}
          <Dialog 
            open={capsuleViewerOpen} 
            onClose={() => setCapsuleViewerOpen(false)} 
            maxWidth="md" 
            fullWidth
            PaperProps={{
              sx: {
                backgroundColor: '#fffbef',
                border: '3px solid #8761a7',
                borderRadius: 4
              }
            }}
          >
            {selectedCapsule && (
              <>
                <DialogTitle>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography 
                        variant="h6"
                        sx={{ 
                          fontFamily: '"Kalam", cursive',
                          color: '#8761a7',
                          fontWeight: 600
                        }}
                      >
                        {selectedCapsule.title}
                      </Typography>
                      <Chip
                        label="Opened Capsule"
                        size="small"
                        sx={{
                          mt: 0.5,
                          backgroundColor: '#dce291',
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          fontWeight: 600,
                          border: '1px solid #8761a7'
                        }}
                      />
                    </Box>
                    <IconButton onClick={() => setCapsuleViewerOpen(false)}>
                      <Close sx={{ color: '#8761a7' }} />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <Typography 
                    variant="body1" 
                    paragraph 
                    sx={{ 
                      whiteSpace: 'pre-wrap',
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontSize: '1.1rem',
                      lineHeight: 1.6
                    }}
                  >
                    {selectedCapsule.message}
                  </Typography>
                  
                  {/* Display media if available */}
                  {selectedCapsule.media && selectedCapsule.media.length > 0 && (
                    renderCapsuleMedia(selectedCapsule.media)
                  )}
                  
                  <Box sx={{ 
                    mt: 3, 
                    p: 3, 
                    backgroundColor: '#dce291', 
                    borderRadius: 3,
                    border: '2px solid #8761a7'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600
                      }}
                    >
                      <strong>Created:</strong> {dayjs(selectedCapsule.created_at).format('MMMM D, YYYY at h:mm A')}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600
                      }}
                    >
                      <strong>Scheduled to open:</strong> {dayjs(selectedCapsule.open_date).format('MMMM D, YYYY at h:mm A')}
                    </Typography>
                    {!selectedCapsule.is_private && selectedCapsule.recipient_email && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          fontWeight: 600
                        }}
                      >
                        <strong>Shared with:</strong> {selectedCapsule.recipient_email}
                      </Typography>
                    )}
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button 
                    onClick={() => setCapsuleViewerOpen(false)}
                    sx={{
                      backgroundColor: '#cdd475',
                      color: '#8761a7',
                      border: '2px solid #8761a7',
                      borderRadius: 3,
                      fontFamily: '"Kalam", cursive',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': {
                        backgroundColor: '#dce291'
                      }
                    }}
                  >
                    Close
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
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
            icon={<SendTimeExtension sx={{ fontSize: 30 }} />} 
          />
          <BottomNavigationAction 
            label="Profile" 
            icon={<Person sx={{ fontSize: 30 }} />} 
          />
        </BottomNavigation>
      </Paper>

      {/* Photo Viewer */}
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