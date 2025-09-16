// src/components/daily/PhotoUpload.jsx - Styled to match your design
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  LinearProgress,
  Card,
  CardContent,
  IconButton,
  FormControlLabel,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { CloudUpload, Close, PhotoCamera, LocationOn, Image } from '@mui/icons-material';
import ApiService from '../../services/api';

const PhotoUpload = ({ open, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [includeLocation, setIncludeLocation] = useState(false);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }

      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setSelectedFile(file);
      setError(null);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const getLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser');
      return;
    }

    setGettingLocation(true);
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0
        });
      });

      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      });
      
      setIncludeLocation(true);
    } catch (error) {
      console.error('Error getting location:', error);
      setError('Could not get your location. Please check permissions.');
    } finally {
      setGettingLocation(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a photo first');
      return;
    }

    if (!title.trim()) {
      setError('Please enter a title for your photo');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('title', title.trim());
      
      // Add location if available and user wants to include it
      if (includeLocation && location) {
        formData.append('location_lat', location.lat.toString());
        formData.append('location_lng', location.lng.toString());
      }

      // Call the actual backend API
      const response = await ApiService.api.post('/photos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = response.data;
      console.log('Photo uploaded successfully:', result);

      onSuccess && onSuccess(result);
      handleClose();

    } catch (error) {
      console.error('Photo upload failed:', error);
      
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else if (error.response?.status === 413) {
        setError('File is too large. Please select a smaller image.');
      } else {
        setError('Failed to upload photo. Please try again.');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setTitle('');
    setError(null);
    setUploading(false);
    setLocation(null);
    setIncludeLocation(false);
    setGettingLocation(false);
    
    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#fffefb',
          border: '3px solid #8761a7',
          borderRadius: 4,
          fontFamily: '"Kalam", cursive'
        }
      }}
    >
      <DialogContent sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhotoCamera sx={{ color: '#8761a7', fontSize: 32 }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#8761a7',
                fontWeight: 600
              }}
            >
              Upload Photo Memory
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: '#8761a7' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 2,
              backgroundColor: '#ffe6e6',
              color: '#8761a7',
              border: '2px solid #8761a7',
              borderRadius: 2,
              fontFamily: '"Kalam", cursive'
            }}
          >
            {error}
          </Alert>
        )}

        {/* Upload Progress */}
        {uploading && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="body2" 
              gutterBottom
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#8761a7',
                fontWeight: 500
              }}
            >
              Uploading your photo memory...
            </Typography>
            <LinearProgress 
              sx={{
                backgroundColor: '#dce291',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#8761a7'
                }
              }}
            />
          </Box>
        )}

        {/* File Upload Area */}
        {!selectedFile ? (
          <Card sx={{ 
            mb: 3,
            backgroundColor: '#dce291',
            border: '2px dashed #8761a7',
            borderRadius: 3,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#cdd475',
              transform: 'scale(1.02)',
            }
          }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload-input"
                type="file"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              <label htmlFor="photo-upload-input">
                <Box sx={{ cursor: 'pointer' }}>
                  <CloudUpload sx={{ 
                    fontSize: 64, 
                    color: '#8761a7', 
                    mb: 2,
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)'
                    }
                  }} />
                  
                  <Typography 
                    variant="h6" 
                    gutterBottom
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontWeight: 600
                    }}
                  >
                    Choose a photo to upload
                  </Typography>
                  
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      mb: 2
                    }}
                  >
                    Click here or drag and drop an image (max 10MB)
                  </Typography>
                  
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      fontFamily: '"Kalam", cursive',
                      color: '#8761a7',
                      fontStyle: 'italic'
                    }}
                  >
                    JPG, PNG, GIF supported
                  </Typography>
                </Box>
              </label>
            </CardContent>
          </Card>
        ) : (
          /* Photo Preview */
          <Card sx={{ 
            mb: 3,
            backgroundColor: '#fffbef',
            border: '2px solid #8761a7',
            borderRadius: 3
          }}>
            <Box sx={{ position: 'relative' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 300,
                  objectFit: 'contain',
                  borderRadius: '8px 8px 0 0'
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: '#8761a7',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: '#9e7ebf',
                  }
                }}
                onClick={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                  URL.revokeObjectURL(previewUrl);
                }}
              >
                <Close />
              </IconButton>
            </Box>
            <CardContent sx={{ backgroundColor: '#fffbef' }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontWeight: 500
                }}
              >
                📁 {selectedFile.name}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7'
                }}
              >
                📏 Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Photo Title Input */}
        <TextField
          fullWidth
          label="Photo Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Give your photo a meaningful title..."
          disabled={uploading}
          inputProps={{ maxLength: 255 }}
          helperText={`${title.length}/255 characters`}
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              fontFamily: '"Kalam", cursive',
              backgroundColor: '#fffbef',
              borderRadius: 2,
              '& fieldset': {
                borderColor: '#8761a7',
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: '#8761a7',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8761a7',
              },
            },
            '& .MuiInputLabel-root': {
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
            },
            '& .MuiFormHelperText-root': {
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
            },
            '& .MuiInputBase-input': {
              fontFamily: '"Kalam", cursive',
              color: '#333',
            },
            '& .MuiInputBase-input::placeholder': {
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              opacity: 0.7,
            }
          }}
        />

        {/* Location Options */}
        <Card sx={{ 
          mb: 3,
          backgroundColor: '#fffbef',
          border: '2px solid #8761a7',
          borderRadius: 3
        }}>
          <CardContent>
            <Typography 
              variant="subtitle2" 
              gutterBottom
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#8761a7',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <LocationOn /> Location Options
            </Typography>
            
            {!location ? (
              <Box>
                <Typography 
                  variant="body2" 
                  paragraph
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    mb: 2
                  }}
                >
                  Add location data to see your photos on the map view
                </Typography>
                <Button
                  variant="contained"
                  startIcon={gettingLocation ? <CircularProgress size={16} color="inherit" /> : <LocationOn />}
                  onClick={getLocation}
                  disabled={gettingLocation || uploading}
                  sx={{
                    backgroundColor: '#cdd475',
                    color: '#8761a7',
                    border: '2px solid #8761a7',
                    borderRadius: 2,
                    fontFamily: '"Kalam", cursive',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#dce291',
                    },
                    '&:disabled': {
                      backgroundColor: '#f0f0f0',
                      color: '#999',
                    }
                  }}
                >
                  {gettingLocation ? 'Getting Location...' : 'Get Current Location'}
                </Button>
              </Box>
            ) : (
              <Box>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={includeLocation}
                      onChange={(e) => setIncludeLocation(e.target.checked)}
                      disabled={uploading}
                      sx={{
                        color: '#8761a7',
                        '&.Mui-checked': {
                          color: '#8761a7',
                        }
                      }}
                    />
                  }
                  label={
                    <Typography sx={{ fontFamily: '"Kalam", cursive', color: '#8761a7' }}>
                      Include location with this photo
                    </Typography>
                  }
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontStyle: 'italic'
                  }}
                >
                  📍 Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Info Note */}
        <Box sx={{ 
          backgroundColor: '#dce291', 
          p: 2, 
          borderRadius: 2, 
          border: '2px solid #8761a7',
          mb: 2
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontStyle: 'italic'
            }}
          >
            📸 Your photo will be saved to today's memories and may be visible on the timeline and map views.
          </Typography>
        </Box>
      </DialogContent>
      
      {/* Action Buttons */}
      <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={uploading}
          variant="outlined"
          sx={{
            color: '#8761a7',
            borderColor: '#8761a7',
            borderWidth: 2,
            borderRadius: 3,
            fontFamily: '"Kalam", cursive',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1,
            '&:hover': {
              borderColor: '#8761a7',
              borderWidth: 2,
              backgroundColor: '#8761a720',
            }
          }}
        >
          CANCEL
        </Button>
        
        <Button 
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || !title.trim() || uploading}
          startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUpload />}
          sx={{
            backgroundColor: '#6366f1',
            color: 'white',
            borderRadius: 3,
            fontFamily: '"Kalam", cursive',
            fontSize: '1rem',
            fontWeight: 600,
            textTransform: 'none',
            px: 3,
            py: 1,
            '&:hover': {
              backgroundColor: '#5856eb',
            },
            '&:disabled': {
              backgroundColor: '#cccccc',
            }
          }}
        >
          {uploading ? 'UPLOADING...' : 'UPLOAD PHOTO'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoUpload;