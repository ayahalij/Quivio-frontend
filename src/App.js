// src/App.js
import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import Login from './components/auth/Login'
import Register from './components/auth/Register'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import Timeline from './pages/TimelinePage'
import ProfilePage from './pages/ProfilePage'
import CapsulesPage from './pages/CapsulesPage'

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1', // Indigo
    },
    secondary: {
      main: '#ec4899', // Pink
    },
  },
})

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div> //can replace this with a proper loading component
  }
  
  return isAuthenticated ? children : <Navigate to="/login" replace />
};

// Public Route wrapper (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) {
    return <div>Loading...</div>
  }
  
  return !isAuthenticated ? children : <Navigate to="/dashboard" replace />
};

function App() {
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
  )
}

export default App