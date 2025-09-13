// src/components/common/PhotoViewer.jsx - Photo Modal with Full View & Download
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Chip,
  CircularProgress,
  Backdrop,
  Zoom
} from '@mui/material';
import {
  Close,
  Download,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Fullscreen,
  FullscreenExit
} from '@mui/icons-material';
import dayjs from 'dayjs';

const PhotoViewer = ({ 
  open, 
  onClose, 
  photos = [], 
  initialIndex = 0 
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    setCurrentIndex(initialIndex);
    setZoom(1);
    setImageLoaded(false);
  }, [initialIndex, open]);

  useEffect(() => {
    if (open && photos.length > 0) {
      setImageLoaded(false);
    }
  }, [currentIndex, open]);

  const currentPhoto = photos[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < photos.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.5, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.5, 0.5));
  };

  const handleDownload = async () => {
    if (!currentPhoto?.url) return;

    setLoading(true);
    try {
      // For Cloudinary URLs, we can get the original by removing transformations
      const downloadUrl = currentPhoto.url;
      
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${currentPhoto.title || 'photo'}.jpg`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(currentPhoto.url, '_blank');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (!open) return;
    
    switch (event.key) {
      case 'ArrowLeft':
        handlePrevious();
        break;
      case 'ArrowRight':
        handleNext();
        break;
      case 'Escape':
        onClose();
        break;
      case '+':
      case '=':
        handleZoomIn();
        break;
      case '-':
        handleZoomOut();
        break;
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [open, currentIndex]);

  if (!currentPhoto) return null;

  const dialogContent = (
    <>
      {/* Header */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)',
          color: 'white',
          p: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <Box>
          <Typography variant="h6" component="div">
            {currentPhoto.title}
          </Typography>
          {currentPhoto.date && (
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {dayjs(currentPhoto.date).format('MMMM D, YYYY')}
            </Typography>
          )}
          {photos.length > 1 && (
            <Chip
              label={`${currentIndex + 1} of ${photos.length}`}
              size="small"
              sx={{ mt: 0.5, backgroundColor: 'rgba(255,255,255,0.2)' }}
            />
          )}
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={() => setFullscreen(!fullscreen)}
            sx={{ color: 'white' }}
          >
            {fullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <Close />
          </IconButton>
        </Box>
      </Box>

      {/* Image Container */}
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          maxHeight: fullscreen ? '100vh' : '80vh',
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: '#000'
        }}
      >
        {!imageLoaded && (
          <CircularProgress sx={{ color: 'white' }} />
        )}

        <img
          src={currentPhoto.url}
          alt={currentPhoto.title}
          onLoad={() => setImageLoaded(true)}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            transform: `scale(${zoom})`,
            transition: 'transform 0.3s ease',
            cursor: zoom > 1 ? 'grab' : 'zoom-in',
            display: imageLoaded ? 'block' : 'none'
          }}
          onClick={zoom === 1 ? handleZoomIn : undefined}
        />

        {/* Navigation Arrows */}
        {photos.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              sx={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                },
                '&:disabled': {
                  display: 'none'
                }
              }}
            >
              <ChevronLeft />
            </IconButton>

            <IconButton
              onClick={handleNext}
              disabled={currentIndex === photos.length - 1}
              sx={{
                position: 'absolute',
                right: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(0,0,0,0.5)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0,0,0,0.7)'
                },
                '&:disabled': {
                  display: 'none'
                }
              }}
            >
              <ChevronRight />
            </IconButton>
          </>
        )}
      </DialogContent>

      {/* Bottom Controls */}
      <DialogActions
        sx={{
          justifyContent: 'space-between',
          backgroundColor: 'rgba(0,0,0,0.9)',
          color: 'white',
          px: 3,
          py: 2
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            sx={{ color: 'white' }}
          >
            <ZoomOut />
          </IconButton>
          <Typography
            variant="body2"
            sx={{
              alignSelf: 'center',
              minWidth: 60,
              textAlign: 'center'
            }}
          >
            {Math.round(zoom * 100)}%
          </Typography>
          <IconButton
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            sx={{ color: 'white' }}
          >
            <ZoomIn />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          {currentPhoto.location_lat && currentPhoto.location_lng && (
            <Chip
              label="Has Location"
              size="small"
              color="success"
              variant="outlined"
            />
          )}
          
          <Button
            onClick={handleDownload}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Download />}
            variant="contained"
            color="primary"
          >
            {loading ? 'Downloading...' : 'Download'}
          </Button>
        </Box>
      </DialogActions>
    </>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      fullWidth={fullscreen}
      fullScreen={fullscreen}
      PaperProps={{
        sx: {
          backgroundColor: 'black',
          maxWidth: fullscreen ? '100%' : '90vw',
          maxHeight: fullscreen ? '100%' : '90vh',
          m: fullscreen ? 0 : 2
        }
      }}
    >
      <Zoom in={open}>
        <Box>
          {dialogContent}
        </Box>
      </Zoom>
    </Dialog>
  );
};

export default PhotoViewer;