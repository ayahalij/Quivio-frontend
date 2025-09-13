import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  LinearProgress,
  Divider
} from '@mui/material';
import { 
  CameraAlt, 
  CheckCircle, 
  CloudUpload, 
  Close, 
  PhotoCamera 
} from '@mui/icons-material';
import ApiService from '../../services/api';

const DailyChallenge = ({ open, onClose, onSuccess }) => {
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  
  // Photo upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDailyChallenge();
      // Reset photo states when dialog opens
      resetPhotoStates();
    }
  }, [open]);

  const resetPhotoStates = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploading(false);
    setUploadMode(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const fetchDailyChallenge = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ApiService.getDailyChallenge();
      console.log('Challenge data received:', result);
      setChallengeData(result);
    } catch (error) {
      console.error('Failed to fetch daily challenge:', error);
      console.error('Error details:', error.response?.data);
      setError(error.response?.data?.detail || 'Failed to load today\'s challenge')
    } finally {
      setLoading(false);
    }
  };

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

  const handleCompleteWithoutPhoto = async () => {
    if (!challengeData?.challenge?.id) {
      setError('Challenge ID not found');
      return;
    }

    setCompleting(true);
    setError(null);

    try {
      console.log('Completing challenge ID:', challengeData.challenge.id);
      
      const result = await ApiService.completeChallenge(challengeData.challenge.id, {
        is_completed: true,
        photo_url: null
      });
      
      console.log('Challenge completion result:', result);
      
      // Update the local state to show completion
      setChallengeData(prev => ({
        ...prev,
        user_challenge: {
          ...prev.user_challenge,
          is_completed: true,
          completed_at: new Date().toISOString()
        }
      }));
      
      onSuccess && onSuccess();
      
    } catch (error) {
      console.error('Failed to complete challenge:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to mark challenge as complete';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      setError(errorMessage);
    } finally {
      setCompleting(false);
    }
  };

  const handleCompleteWithPhoto = async () => {
    if (!challengeData?.challenge?.id) {
      setError('Challenge ID not found');
      return;
    }

    if (!selectedFile) {
      setError('Please select a photo first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      console.log('Completing challenge with photo, ID:', challengeData.challenge.id);
      
      const result = await ApiService.completeChallengeWithPhoto(challengeData.challenge.id, selectedFile);
      
      console.log('Challenge completion with photo result:', result);
      
      // Update the local state to show completion
      setChallengeData(prev => ({
        ...prev,
        user_challenge: {
          ...prev.user_challenge,
          is_completed: true,
          completed_at: new Date().toISOString(),
          photo_url: result.photo_url,
          photo_cloudinary_id: result.photo_cloudinary_id
        }
      }));
      
      onSuccess && onSuccess();
      
    } catch (error) {
      console.error('Failed to complete challenge with photo:', error);
      console.error('Error response:', error.response?.data);
      
      let errorMessage = 'Failed to upload photo and complete challenge';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 413) {
        errorMessage = 'File is too large. Please select a smaller image.';
      }
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'primary';
    }
  };

  const handleClose = () => {
    resetPhotoStates();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <CameraAlt color="primary" />
          Today's Photography Challenge
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {uploading && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              Uploading photo and completing challenge...
            </Typography>
            <LinearProgress />
          </Box>
        )}

        {challengeData && !loading && (
          <>
            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Chip 
                    label={challengeData.challenge.difficulty_level} 
                    color={getDifficultyColor(challengeData.challenge.difficulty_level)}
                    size="small"
                  />
                  {challengeData.user_challenge?.is_completed && (
                    <Chip 
                      icon={<CheckCircle />}
                      label="Completed" 
                      color="success" 
                      size="small"
                    />
                  )}
                </Box>

                <Typography variant="h6" gutterBottom>
                  {challengeData.challenge.challenge_text}
                </Typography>

                <Typography variant="body2" color="text.secondary" paragraph>
                  This challenge is based on your current mood level. Take your time and be creative!
                </Typography>

                {challengeData.user_challenge?.photo_url && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="primary" gutterBottom>
                      Challenge Photo:
                    </Typography>
                    <img
                      src={challengeData.user_challenge.photo_url}
                      alt="Challenge completion"
                      style={{
                        width: '100%',
                        height: 'auto',
                        maxHeight: 200,
                        objectFit: 'contain',
                        borderRadius: 8,
                        border: '1px solid #ddd'
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Photo Upload Section */}
            {challengeData.can_complete && 
             !challengeData.user_challenge?.is_completed && (
              <>
                <Divider sx={{ my: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Complete Challenge
                  </Typography>
                </Divider>

                {!uploadMode ? (
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Button
                      variant="outlined"
                      startIcon={<PhotoCamera />}
                      onClick={() => setUploadMode(true)}
                      fullWidth
                    >
                      Upload Photo
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCompleteWithoutPhoto}
                      disabled={completing}
                      fullWidth
                    >
                      {completing ? 'Completing...' : 'Complete Without Photo'}
                    </Button>
                  </Box>
                ) : (
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      {!selectedFile ? (
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="challenge-photo-input"
                            type="file"
                            onChange={handleFileSelect}
                          />
                          <label htmlFor="challenge-photo-input">
                            <IconButton
                              color="primary"
                              component="span"
                              sx={{ mb: 1 }}
                            >
                              <CloudUpload sx={{ fontSize: 40 }} />
                            </IconButton>
                          </label>
                          
                          <Typography variant="body2" gutterBottom>
                            Select a photo to complete the challenge
                          </Typography>
                          
                          <label htmlFor="challenge-photo-input">
                            <Button variant="contained" component="span" size="small">
                              Choose Photo
                            </Button>
                          </label>
                        </Box>
                      ) : (
                        <Box>
                          <Box sx={{ position: 'relative', mb: 2 }}>
                            <img
                              src={previewUrl}
                              alt="Challenge preview"
                              style={{
                                width: '100%',
                                height: 'auto',
                                maxHeight: 200,
                                objectFit: 'contain',
                                borderRadius: 8
                              }}
                            />
                            <IconButton
                              sx={{
                                position: 'absolute',
                                top: 4,
                                right: 4,
                                backgroundColor: 'rgba(0,0,0,0.7)',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: 'rgba(0,0,0,0.9)'
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
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            File: {selectedFile.name}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              variant="contained"
                              onClick={handleCompleteWithPhoto}
                              disabled={uploading}
                              startIcon={uploading ? <CircularProgress size={16} /> : <CloudUpload />}
                              fullWidth
                            >
                              {uploading ? 'Uploading...' : 'Complete with Photo'}
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => setUploadMode(false)}
                              disabled={uploading}
                            >
                              Cancel
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}

                {!uploadMode && (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                    Upload a photo to show your creative interpretation of the challenge, or simply mark it complete without a photo.
                  </Typography>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading || completing}>
          Close
        </Button>
        {/* Action buttons are now in the content section for better UX */}
      </DialogActions>
    </Dialog>
  );
};

export default DailyChallenge;