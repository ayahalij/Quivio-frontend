// src/components/daily/MoodTracker.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Box,
  IconButton,
  Rating
} from '@mui/material';
import {
  SentimentVeryDissatisfied,
  SentimentDissatisfied,
  SentimentNeutral,
  SentimentSatisfied,
  SentimentVerySatisfied,
  Close
} from '@mui/icons-material';
import ApiService from '../../services/api';

const MoodTracker = ({ open, onClose, onSuccess, initialData }) => {
  const [moodLevel, setMoodLevel] = useState(3);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setMoodLevel(initialData.mood_level || 3);
      setNote(initialData.note || '');
    } else {
      setMoodLevel(3);
      setNote('');
    }
  }, [initialData, open]);

  const handleSave = async () => {
    setLoading(true);
    setError('');

    try {
      const moodData = {
        mood_level: moodLevel,
        note: note.trim()
      };

      const result = await ApiService.createMood(moodData);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error('Failed to save mood:', error);
      setError(error.response?.data?.detail || 'Failed to save mood');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const getMoodLabel = (level) => {
    const labels = {
      1: 'Very Sad',
      2: 'Sad',
      3: 'Neutral',
      4: 'Happy',
      5: 'Very Happy'
    };
    return labels[level] || 'Neutral';
  };

  const getMoodColor = (level) => {
    const colors = {
      1: '#ff6b6b',  // Red
      2: '#ffa726',  // Orange
      3: '#42a5f5',  // Blue (Neutral)
      4: '#8cd38fff',  // Green
      5: '#47a14aff'   // Darker green
    };
    return colors[level] || '#42a5f5';
  };

  // Custom mood icons with colors
  const MoodIcon = ({ level, isSelected, onClick }) => {
    const icons = {
      1: SentimentVeryDissatisfied,
      2: SentimentDissatisfied,
      3: SentimentNeutral,
      4: SentimentSatisfied,
      5: SentimentVerySatisfied
    };
    
    const IconComponent = icons[level];
    const color = isSelected ? getMoodColor(level) : '#e0e0e0';
    
    return (
      <IconButton
        onClick={() => onClick(level)}
        sx={{
          width: 60,
          height: 60,
          border: isSelected ? `3px solid ${getMoodColor(level)}` : '3px solid #e0e0e0',
          borderRadius: '50%',
          backgroundColor: isSelected ? `${getMoodColor(level)}20` : 'transparent',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: `${getMoodColor(level)}30`,
            border: `3px solid ${getMoodColor(level)}`,
            transform: 'scale(1.1)',
          }
        }}
      >
        <IconComponent sx={{ fontSize: 32, color: color }} />
      </IconButton>
    );
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
          <Typography 
            variant="h5" 
            sx={{ 
              fontFamily: '"Kalam", cursive',
              color: '#333',
              fontWeight: 600
            }}
          >
            How are you feeling today?
          </Typography>
          <IconButton onClick={handleClose} sx={{ color: '#8761a7' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Current Mood Display */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              color: getMoodColor(moodLevel),
              fontFamily: '"Kalam", cursive',
              fontWeight: 600,
              mb: 2
            }}
          >
            {getMoodLabel(moodLevel)}
          </Typography>
        </Box>

        {/* Mood Selection Icons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: 2, 
          mb: 4,
          flexWrap: 'wrap'
        }}>
          {[1, 2, 3, 4, 5].map((level) => (
            <MoodIcon
              key={level}
              level={level}
              isSelected={moodLevel === level}
              onClick={setMoodLevel}
            />
          ))}
        </Box>

        {/* Notes Section */}
        <TextField
          fullWidth
          multiline
          rows={3}
          placeholder="What's influencing your mood today? (Optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          variant="outlined"
          inputProps={{ maxLength: 500 }}
          sx={{
            mb: 2,
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

        {/* Character Count */}
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#8761a7',
            fontFamily: '"Kalam", cursive',
            display: 'block',
            textAlign: 'right',
            mb: 3
          }}
        >
          {note.length}/500 characters
        </Typography>

        {/* Error Message */}
        {error && (
          <Typography 
            color="error" 
            variant="body2" 
            sx={{ 
              mb: 2, 
              textAlign: 'center',
              fontFamily: '"Kalam", cursive'
            }}
          >
            {error}
          </Typography>
        )}
      </DialogContent>

      {/* Action Buttons */}
      <DialogActions sx={{ p: 3, pt: 0, gap: 2 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={loading}
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
          onClick={handleSave}
          variant="contained"
          disabled={loading}
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
          {loading ? 'SAVING...' : 'SAVE MOOD'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MoodTracker;