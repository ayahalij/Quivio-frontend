// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Timeline from './pages/TimelinePage';
import ProfilePage from './pages/ProfilePage';
import CapsulesPage from './pages/CapsulesPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import QuivioLoader from './components/common/QuivioLoader';

const theme = createTheme({
  palette: {
    primary: {
      main: '#8761a7', // Updated to Quivio purple
    },
    secondary: {
      main: '#cdd475', // Updated to Quivio green
    },
  },
});

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
 
  if (loading) {
    return (
      <QuivioLoader 
        variant="spinner" 
        fullScreen 
        message="Verifying your access..." 
        size="large"
      />
    );
  }
 
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Public Route wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
 
  if (loading) {
    return (
      <QuivioLoader 
        variant="pulsing-circles" 
        fullScreen 
        message="Getting ready..." 
        size="medium"
      />
    );
  }
 
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <Register />
                </PublicRoute>
              }
            />
           
            {/* Reset Password Route */}
            <Route path="/reset-password" element={<ResetPasswordPage />} />
           
            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
           
            <Route
              path="/timeline"
              element={
                <ProtectedRoute>
                  <Timeline />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/capsules"
              element={
                <ProtectedRoute>
                  <CapsulesPage />
                </ProtectedRoute>
              }
            />
           
            {/* Catch all route - MUST BE LAST */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;