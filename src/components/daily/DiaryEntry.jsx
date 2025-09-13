// src/components/daily/DiaryEntry.jsx - Complete Fixed Version
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert
} from '@mui/material';
import ApiService from '../../services/api';

const DiaryEntry = ({ open, onClose, onSuccess, initialData }) => {
  const [content, setContent] = useState(initialData?.content || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;

  const handleSubmit = async () => {
    if (!content.trim()) {
      setError('Please write something in your diary entry');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // FIXED: Always use current date
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      console.log('=== DIARY SUBMIT DEBUG ===');
      console.log('Current date being sent:', currentDate);
      console.log('Diary content:', content.trim());
      console.log('Word count:', wordCount);
      
      const result = await ApiService.createDiary({
        content: content.trim()
      }, currentDate); // Pass current date explicitly
      
      console.log('Diary entry saved successfully:', result);
      onSuccess && onSuccess(result);
      onClose();
      setContent('');
    } catch (error) {
      console.error('Failed to save diary entry:', error);
      setError(error.response?.data?.detail || 'Failed to save diary entry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Today's Journal Entry</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Write about your day, thoughts, experiences, or anything on your mind.
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Dear diary, today was..."
          variant="outlined"
          sx={{ mt: 2 }}
        />

        <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {wordCount} words
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You can edit this until 11:59 PM today ({new Date().toISOString().split('T')[0]})
          </Typography>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || !content.trim()}
        >
          {loading ? 'Saving...' : 'Save Entry'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DiaryEntry;