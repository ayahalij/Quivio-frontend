// src/pages/PhotoMapPage.js
import React from 'react';
import {
  Container,
  Box,
  Typography,
  AppBar,
  Toolbar,
  Avatar,
  Button
} from '@mui/material';
import { Map } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import PhotoMap from '../components/photos/PhotoMap';

const PhotoMapPage = () => {
  const { user, logout } = useAuth();

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="static" elevation={1}>
        <Toolbar>
          <Map sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Photo Map
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar 
            src={user?.avatar_url} 
            sx={{ width: 32, height: 32 }}
            >
            {!user?.avatar_url && user?.username?.charAt(0).toUpperCase()}
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

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <PhotoMap />
      </Container>
    </Box>
  );
};

export default PhotoMapPage;