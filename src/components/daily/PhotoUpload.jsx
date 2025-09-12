// src/components/daily/PhotoUpload.js
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
  IconButton
} from '@mui/material';
import { CloudUpload, Close, PhotoCamera } from '@mui/icons-material';
import ApiService from '../../services/api';

const PhotoUpload = ({ open, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

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
      // For now, we'll simulate upload since Cloudinary isn't fully configured
      // In a real implementation, this would upload to your backend
      console.log('Uploading photo:', {
        file: selectedFile,
        title: title.trim()
      });

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate successful upload
      const result = {
        id: Date.now(),
        title: title.trim(),
        image_url: previewUrl,
        created_at: new Date().toISOString()
      };

      onSuccess && onSuccess(result);
      handleClose();

    } catch (error) {
      console.error('Photo upload failed:', error);
      setError('Failed to upload photo. Please try again.');
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
        />

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          💡 Tip: Your photo will be saved to today's memories and may be visible on the timeline and map views.
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