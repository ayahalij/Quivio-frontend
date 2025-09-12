// src/components/challenges/DailyChallenge.js - Complete Challenge Component
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
  CircularProgress
} from '@mui/material';
import { CameraAlt, CheckCircle } from '@mui/icons-material';
import ApiService from '../../services/api';

const DailyChallenge = ({ open, onClose, onSuccess }) => {
  const [challengeData, setChallengeData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (open) {
      fetchDailyChallenge();
    }
  }, [open]);

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
      setError('Failed to load today\'s challenge. Make sure you\'ve set your mood first!');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteChallenge = async () => {
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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'primary';
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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

        {challengeData && !loading && (
          <Card variant="outlined">
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

              <Typography variant="body2" color="text.secondary">
                💡 Tip: You can complete this challenge anytime today. Photo upload feature coming soon!
              </Typography>
            </CardContent>
          </Card>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {challengeData && 
         challengeData.can_complete && 
         !challengeData.user_challenge?.is_completed && (
          <Button 
            onClick={handleCompleteChallenge}
            variant="contained"
            startIcon={<CheckCircle />}
            disabled={completing}
          >
            {completing ? 'Completing...' : 'Mark as Complete'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DailyChallenge;