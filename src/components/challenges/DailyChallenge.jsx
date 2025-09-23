// src/components/challenges/DailyChallenge.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
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
  PhotoCamera,
  Assignment,
  Star,
  Mood
} from '@mui/icons-material';
import ApiService from '../../services/api';

const DailyChallenge = ({ open, onClose, onSuccess }) => {
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);
  const [needsMood, setNeedsMood] = useState(false);
  
  // Photo upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDailyChallenge();
      resetPhotoStates();
    }
  }, [open]);

  const resetPhotoStates = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploading(false);
    setUploadMode(false);
    setNeedsMood(false);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  const fetchDailyChallenge = async () => {
    setLoading(true);
    setError(null);
    setNeedsMood(false);

    try {
      const result = await ApiService.getDailyChallenge();
      console.log('Challenge data received:', result);
      setChallengeData(result);
    } catch (error) {
      console.error('Failed to fetch daily challenge:', error);
      
      // Check if the error is about needing to set mood first
      if (error.response?.status === 400 && 
          error.response?.data?.detail?.includes('mood first')) {
        setNeedsMood(true);
        setError('Please log your mood first to get a personalized daily challenge!');
      } else {
        setError(error.response?.data?.detail || 'Failed to load today\'s challenge');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
      setError(null);
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
      const result = await ApiService.completeChallenge(challengeData.challenge.id, {
        is_completed: true,
        photo_url: null
      });
      
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
      const result = await ApiService.completeChallengeWithPhoto(challengeData.challenge.id, selectedFile);
      
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
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#2196f3';
    }
  };

  const getMoodLevelName = (moodLevel) => {
    const names = {
      1: 'Very Sad',
      2: 'Sad', 
      3: 'Neutral',
      4: 'Happy',
      5: 'Very Happy'
    };
    return names[moodLevel] || 'Unknown';
  };

  const handleClose = () => {
    resetPhotoStates();
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
            <Assignment sx={{ color: '#8761a7', fontSize: 32 }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#8761a7',
                fontWeight: 600
              }}
            >
              Today's Photography Challenge
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: '#8761a7' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress sx={{ color: '#8761a7' }} />
            <Typography sx={{ ml: 2, fontFamily: '"Kalam", cursive', color: '#8761a7' }}>
              Loading challenge...
            </Typography>
          </Box>
        )}

        {/* Need Mood First Message */}
        {needsMood && !loading && (
          <Card sx={{ 
            mb: 3,
            backgroundColor: '#fff3cd',
            border: '2px solid #ffc107',
            borderRadius: 3
          }}>
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Mood sx={{ fontSize: 48, color: '#ffc107', mb: 2 }} />
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  fontWeight: 600
                }}
              >
                Set Your Mood First!
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontFamily: '"Kalam", cursive',
                  color: '#8761a7',
                  mb: 3,
                  lineHeight: 1.6
                }}
              >
                To get a personalized photography challenge that matches your current mood, 
                please log your mood first. Your challenge will be tailored to help you based on how you're feeling today!
              </Typography>
              <Button
                variant="contained"
                onClick={handleClose}
                sx={{
                  backgroundColor: '#8761a7',
                  color: 'white',
                  borderRadius: 3,
                  fontFamily: '"Kalam", cursive',
                  fontSize: '1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: '#9e7ebf',
                  }
                }}
              >
                Go Set Your Mood
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error Alert */}
        {error && !needsMood && (
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
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="body2" 
              gutterBottom
              sx={{ fontFamily: '"Kalam", cursive', color: '#8761a7' }}
            >
              Uploading photo and completing challenge...
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

        {/* Challenge Content */}
        {challengeData && !loading && !needsMood && (
          <>
            {/* Challenge Card */}
            <Card sx={{ 
              mb: 3,
              backgroundColor: '#fffbef',
              border: '2px solid #8761a7',
              borderRadius: 3
            }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={challengeData.challenge.difficulty_level} 
                      sx={{
                        backgroundColor: getDifficultyColor(challengeData.challenge.difficulty_level),
                        color: 'white',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600
                      }}
                    />
                    {challengeData.user_challenge?.mood_id && (
                      <Chip 
                        label={`Mood: ${getMoodLevelName(challengeData.challenge.mood_trigger)}`}
                        sx={{
                          backgroundColor: '#8761a7',
                          color: 'white',
                          fontFamily: '"Kalam", cursive',
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>
                  {challengeData.user_challenge?.is_completed && (
                    <Chip 
                      icon={<CheckCircle />}
                      label="Completed" 
                      sx={{
                        backgroundColor: '#4caf50',
                        color: 'white',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600
                      }}
                    />
                  )}
                </Box>

                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontWeight: 600,
                    mb: 2
                  }}
                >
                  {challengeData.challenge.challenge_text}
                </Typography>

                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    mb: 2,
                    lineHeight: 1.6
                  }}
                >
                  This challenge is personalized based on your {getMoodLevelName(challengeData.challenge.mood_trigger).toLowerCase()} mood. 
                  Take your time and be creative!
                </Typography>

                {challengeData.user_challenge?.photo_url && (
                  <Box sx={{ mt: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: '"Kalam", cursive',
                        color: '#8761a7',
                        fontWeight: 600,
                        mb: 1
                      }}
                    >
                      Your Challenge Photo:
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
                        border: '2px solid #8761a7'
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Completion Section */}
            {challengeData.can_complete && !challengeData.user_challenge?.is_completed && (
              <>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontFamily: '"Kalam", cursive',
                    color: '#8761a7',
                    fontWeight: 600,
                    mb: 2,
                    textAlign: 'center'
                  }}
                >
                  Complete Your Challenge
                </Typography>

                {!uploadMode ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<PhotoCamera />}
                      onClick={() => setUploadMode(true)}
                      sx={{
                        backgroundColor: '#cdd475',
                        color: '#8761a7',
                        border: '2px solid #8761a7',
                        borderRadius: 3,
                        fontFamily: '"Kalam", cursive',
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: '#dce291',
                        }
                      }}
                    >
                      Upload Photo & Complete
                    </Button>
                    <Button
                      variant="outlined"
                      onClick={handleCompleteWithoutPhoto}
                      disabled={completing}
                      sx={{
                        color: '#8761a7',
                        borderColor: '#8761a7',
                        borderWidth: 2,
                        borderRadius: 3,
                        fontFamily: '"Kalam", cursive',
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        py: 1.5,
                        '&:hover': {
                          borderColor: '#8761a7',
                          borderWidth: 2,
                          backgroundColor: '#8761a720',
                        }
                      }}
                    >
                      {completing ? 'Completing...' : 'Complete Without Photo'}
                    </Button>
                  </Box>
                ) : (
                  <Card sx={{ 
                    mb: 2,
                    backgroundColor: '#fffbef',
                    border: '2px solid #8761a7',
                    borderRadius: 3
                  }}>
                    <CardContent>
                      {!selectedFile ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <input
                            accept="image/*"
                            style={{ display: 'none' }}
                            id="challenge-photo-input"
                            type="file"
                            onChange={handleFileSelect}
                          />
                          <label htmlFor="challenge-photo-input">
                            <Box sx={{ cursor: 'pointer' }}>
                              <CloudUpload sx={{ 
                                fontSize: 48, 
                                color: '#8761a7', 
                                mb: 2
                              }} />
                              
                              <Typography 
                                variant="body1" 
                                gutterBottom
                                sx={{ 
                                  fontFamily: '"Kalam", cursive',
                                  color: '#8761a7',
                                  fontWeight: 600
                                }}
                              >
                                Click to select your challenge photo
                              </Typography>
                              
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontFamily: '"Kalam", cursive',
                                  color: '#8761a7'
                                }}
                              >
                                Max 10MB • JPG, PNG, GIF
                              </Typography>
                            </Box>
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
                                backgroundColor: '#8761a7',
                                color: 'white',
                                '&:hover': {
                                  backgroundColor: '#9e7ebf'
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
                          
                          <Typography 
                            variant="body2" 
                            gutterBottom
                            sx={{ fontFamily: '"Kalam", cursive', color: '#8761a7' }}
                          >
                            {selectedFile.name}
                          </Typography>
                          
                          <Typography 
                            variant="body2" 
                            gutterBottom
                            sx={{ fontFamily: '"Kalam", cursive', color: '#8761a7' }}
                          >
                            Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                          </Typography>
                          
                          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                            <Button
                              variant="contained"
                              onClick={handleCompleteWithPhoto}
                              disabled={uploading}
                              startIcon={uploading ? <CircularProgress size={16} color="inherit" /> : <CloudUpload />}
                              sx={{
                                flex: 1,
                                backgroundColor: '#6366f1',
                                color: 'white',
                                borderRadius: 3,
                                fontFamily: '"Kalam", cursive',
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'none',
                                py: 1.5,
                                '&:hover': {
                                  backgroundColor: '#5856eb',
                                }
                              }}
                            >
                              {uploading ? 'Uploading...' : 'Complete Challenge'}
                            </Button>
                            <Button
                              variant="outlined"
                              onClick={() => setUploadMode(false)}
                              disabled={uploading}
                              sx={{
                                color: '#8761a7',
                                borderColor: '#8761a7',
                                borderWidth: 2,
                                borderRadius: 3,
                                fontFamily: '"Kalam", cursive',
                                fontWeight: 600,
                                textTransform: 'none',
                                '&:hover': {
                                  borderColor: '#8761a7',
                                  borderWidth: 2,
                                  backgroundColor: '#8761a720',
                                }
                              }}
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
                  <Box sx={{ 
                    backgroundColor: '#dce291', 
                    p: 2, 
                    borderRadius: 2, 
                    border: '2px solid #8761a7'
                  }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: '"Kalam", cursive',
                        color: '#8761a7',
                        textAlign: 'center',
                        fontStyle: 'italic'
                      }}
                    >
                      Upload a photo to show your creative interpretation, or simply mark the challenge as complete!
                    </Typography>
                  </Box>
                )}
              </>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose} 
          disabled={uploading || completing}
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
          CLOSE
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DailyChallenge;