// src/components/daily/MoodTracker.js
import React, { useState } from 'react';
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

const MoodTracker = ({ open, onClose, onSuccess }) => {
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

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await ApiService.createMood({
        mood_level: moodLevel,
        note: note.trim() || null
      });
      
      console.log('Mood saved:', result);
      onSuccess && onSuccess(result);
      onClose();
    } catch (error) {
      console.error('Failed to save mood:', error);
      setError(error.response?.data?.detail || 'Failed to save mood');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>How are you feeling today?</DialogTitle>
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
            onChange={(_, newValue) => setMoodLevel(newValue || 3)}
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
          onChange={(e) => setNote(e.target.value)}
          placeholder="Describe what's making you feel this way..."
          helperText={`${note.length}/500 characters`}
          inputProps={{ maxLength: 500 }}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Mood'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoodTracker;