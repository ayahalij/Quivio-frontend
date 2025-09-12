// src/components/daily/PhotoUpload.jsx - Fixed to actually upload
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
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
import { CloudUpload, Close, PhotoCamera, LocationOn } from '@mui/icons-material';
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
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <PhotoCamera color="primary" />
          Upload Photo Memory
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Uploading photo...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {/* File Upload Area */}
        {!selectedFile ? (
          <Card variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="photo-upload-input"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="photo-upload-input">
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="span"
                  sx={{ mb: 2 }}
                >
                  <CloudUpload sx={{ fontSize: 48 }} />
                </IconButton>
              </label>
              
              <Typography variant="h6" gutterBottom>
                Choose a photo to upload
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Select an image from your device (max 10MB)
              </Typography>
              
              <label htmlFor="photo-upload-input">
                <Button variant="contained" component="span">
                  Select Photo
                </Button>
              </label>
            </CardContent>
          </Card>
        ) : (
          /* Photo Preview */
          <Card variant="outlined" sx={{ mb: 2 }}>
            <Box sx={{ position: 'relative' }}>
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: 300,
                  objectFit: 'contain'
                }}
              />
              <IconButton
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)',
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
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                File: {selectedFile.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
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
          sx={{ mb: 2 }}
        />

        {/* Location Options */}
        <Card variant="outlined" sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Location Options
            </Typography>
            
            {!location ? (
              <Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add location data to see your photos on the map view
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={gettingLocation ? <CircularProgress size={16} /> : <LocationOn />}
                  onClick={getLocation}
                  disabled={gettingLocation || uploading}
                  size="small"
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
                    />
                  }
                  label="Include location with this photo"
                />
                <Typography variant="body2" color="text.secondary">
                  Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Typography variant="body2" color="text.secondary">
          Your photo will be saved to today's memories and may be visible on the timeline and map views.
        </Typography>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button 
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || !title.trim() || uploading}
          startIcon={<CloudUpload />}
        >
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PhotoUpload;