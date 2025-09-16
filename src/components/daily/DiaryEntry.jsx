// src/components/daily/DiaryEntry.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  TextField,
  Box,
  IconButton
} from '@mui/material';
import {
  Close,
  Book
} from '@mui/icons-material';
import ApiService from '../../services/api';

const DiaryEntry = ({ open, onClose, onSuccess, initialData }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setContent(initialData.content || '');
    } else {
      setContent('');
    }
  }, [initialData, open]);

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please write something in your diary entry');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const diaryData = {
        content: content.trim()
      };

      const result = await ApiService.createDiary(diaryData);
      onSuccess(result);
      onClose();
    } catch (error) {
      console.error('Failed to save diary entry:', error);
      setError(error.response?.data?.detail || 'Failed to save diary entry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md" 
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
            <Book sx={{ color: '#8761a7', fontSize: 32 }} />
            <Typography 
              variant="h5" 
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#8761a7',
                fontWeight: 600
              }}
            >
              Today's Diary Entry
            </Typography>
          </Box>
          <IconButton onClick={handleClose} sx={{ color: '#8761a7' }}>
            <Close />
          </IconButton>
        </Box>

        {/* Description */}
        <Typography 
          variant="body1" 
          sx={{ 
            fontFamily: '"Kalam", cursive',
            color: '#8761a7',
            mb: 3,
            fontSize: '1rem'
          }}
        >
          What happened today? Write about your thoughts, experiences, or anything on your mind...
        </Typography>

        {/* Main Text Area */}
        <TextField
          fullWidth
          multiline
          rows={8}
          placeholder="Dear diary, today was..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          variant="outlined"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              fontFamily: '"Kalam", cursive',
              backgroundColor: '#fffbef',
              borderRadius: 2,
              fontSize: '1.1rem',
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
              lineHeight: 1.8,
            },
            '& .MuiInputBase-input::placeholder': {
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              opacity: 0.7,
            }
          }}
        />

        {/* Word Count */}
        <Typography 
          variant="body2" 
          sx={{ 
            color: '#8761a7',
            fontFamily: '"Kalam", cursive',
            textAlign: 'right',
            mb: 2,
            fontWeight: 500
          }}
        >
          {wordCount} words written
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

        {/* Tip */}
        <Box sx={{ 
          backgroundColor: '#dce291', 
          p: 2, 
          borderRadius: 2, 
          border: '2px solid #8761a7',
          mb: 3
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontStyle: 'italic'
            }}
          >
            💡 Tip: Be honest with yourself. This is your safe space to express thoughts and feelings freely.
          </Typography>
        </Box>
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
          disabled={loading || !content.trim()}
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
          {loading ? 'SAVING...' : 'SAVE ENTRY'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiaryEntry;