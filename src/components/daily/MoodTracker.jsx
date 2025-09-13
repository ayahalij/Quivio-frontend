// src/components/daily/MoodTracker.jsx - Complete Fixed Version with Proper State Management
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Rating,
  Alert
} from '@mui/material';
import { Mood, MoodOutlined } from '@mui/icons-material';
import ApiService from '../../services/api';

const MoodTracker = ({ open, onClose, onSuccess, initialData }) => {
  const [moodLevel, setMoodLevel] = useState(3);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const moodLabels = {
    1: 'Very Sad',
    2: 'Sad', 
    3: 'Neutral',
    4: 'Happy',
    5: 'Very Happy'
  };

  // FIXED: Properly handle initialData when dialog opens
  useEffect(() => {
    if (open) {
      console.log('MoodTracker opened with initialData:', initialData);
      
      if (initialData) {
        // Editing existing mood
        setMoodLevel(initialData.mood_level || 3);
        setNote(initialData.note || '');
        console.log('Loading existing mood:', {
          level: initialData.mood_level,
          note: initialData.note
        });
      } else {
        // Creating new mood
        setMoodLevel(3);
        setNote('');
        console.log('Creating new mood entry');
      }
      
      // Clear any previous errors
      setError(null);
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Always use current date
      const currentDate = new Date().toISOString().split('T')[0];
      
      console.log('=== MOOD SUBMIT DEBUG ===');
      console.log('Current date being sent:', currentDate);
      console.log('Mood level:', moodLevel);
      console.log('Note value:', note);
      console.log('Note length:', note.length);
      console.log('Note after trim:', note.trim());
      console.log('Final mood data:', { 
        mood_level: moodLevel, 
        note: note.trim() || null 
      });
      
      const result = await ApiService.createMood({
        mood_level: moodLevel,
        note: note.trim() || null
      }, currentDate);
      
      console.log('Mood saved successfully:', result);
      console.log('Returned mood note:', result.note);
      
      onSuccess && onSuccess(result);
      handleClose();
      
    } catch (error) {
      console.error('Failed to save mood:', error);
      setError(error.response?.data?.detail || 'Failed to save mood');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setMoodLevel(3);
    setNote('');
    onClose();
  };

  const handleMoodChange = (_, newValue) => {
    const level = newValue || 3;
    setMoodLevel(level);
    console.log('Mood level changed to:', level);
  };

  const handleNoteChange = (e) => {
    const newNote = e.target.value;
    setNote(newNote);
    console.log('Note changed to:', newNote);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {initialData ? 'Update Your Mood' : 'How are you feeling today?'}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" color="primary" gutterBottom>
            {moodLabels[moodLevel]}
          </Typography>
          
          <Rating
            value={moodLevel}
            onChange={handleMoodChange}
            max={5}
            size="large"
            icon={<Mood fontSize="inherit" />}
            emptyIcon={<MoodOutlined fontSize="inherit" />}
            sx={{ fontSize: '3rem' }}
          />
        </Box>

        <TextField
          fullWidth
          label="What's influencing your mood today? (Optional)"
          multiline
          rows={3}
          value={note}
          onChange={handleNoteChange}
          placeholder="Describe what's making you feel this way..."
          helperText={`${note.length}/500 characters`}
          inputProps={{ maxLength: 500 }}
        />

        {initialData && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            You're updating your mood for today. Changes will be saved immediately.
          </Typography>
        )}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : (initialData ? 'Update Mood' : 'Save Mood')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoodTracker;