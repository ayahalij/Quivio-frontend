// src/pages/SearchPage.js
import React from 'react';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Avatar,
  Button,
  Paper
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SearchBar from '../components/timeline/SearchBar';

const SearchPage = () => {
  const { user, logout } = useAuth();

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Search Your Memories
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ width: 32, height: 32 }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2">
              {user?.username}
            </Typography>
            <Button color="inherit" onClick={logout}>
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Search sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Search Your Journey
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Find specific memories, thoughts, and moments from your journaling history.
            Search through your diary entries and mood notes to rediscover past insights.
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <SearchBar />
        </Paper>

        {/* Search Tips */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Search Tips
          </Typography>
          <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' } }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Keywords
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try searching for emotions, people, places, or events from your entries.
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                What you can find
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Diary entries, mood notes, and any text you've written in your journal.
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default SearchPage;