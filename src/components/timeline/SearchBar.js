// src/components/timeline/SearchBar.js
import React, { useState } from 'react';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Card,
  CardContent,
  Typography,
  Chip,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { Search, Clear, Mood, Edit } from '@mui/icons-material';
import ApiService from '../../services/api';
import dayjs from 'dayjs';

const MOOD_EMOJIS = {
  1: '😢',
  2: '😞', 
  3: '😐',
  4: '😊',
  5: '😄'
};

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');
    setHasSearched(true);

    try {
      const results = await ApiService.searchEntries(searchTerm.trim());
      console.log('Search results:', results);
      setSearchResults(results.results || []);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Search failed. Please try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setError('');
    setHasSearched(false);
  };

  const highlightSearchTerm = (text, term) => {
    if (!term || !text) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} style={{ backgroundColor: '#ffeb3b', padding: '0 2px' }}>
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <Box>
      {/* Search Input */}
      <TextField
        fullWidth
        placeholder="Search your memories, moods, and thoughts..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={handleKeyPress}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton onClick={clearSearch} size="small">
                <Clear />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{ mb: 2 }}
      />

      {/* Search Button */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <IconButton
          onClick={handleSearch}
          disabled={loading || !searchTerm.trim()}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            '&:hover': { backgroundColor: 'primary.dark' },
            '&:disabled': { backgroundColor: 'grey.300' }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : <Search />}
        </IconButton>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search Results */}
      {hasSearched && (
        <Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Typography variant="h6" gutterBottom>
                Search Results
                {searchResults.length > 0 && (
                  <Chip 
                    label={`${searchResults.length} result${searchResults.length !== 1 ? 's' : ''}`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>

              {searchResults.length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <Search sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography color="text.secondary">
                      No results found for "{searchTerm}"
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Try different keywords or check your spelling
                    </Typography>
                  </CardContent>
                </Card>
              ) : (
                <Grid container spacing={2}>
                  {searchResults.map((result, index) => (
                    <Grid item xs={12} key={index}>
                      <Card 
                        sx={{ 
                          '&:hover': { boxShadow: 2 },
                          border: result.type === 'diary' ? '1px solid #e3f2fd' : '1px solid #f3e5f5'
                        }}
                      >
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {result.type === 'diary' ? (
                                <Edit color="primary" />
                              ) : (
                                <Mood color="secondary" />
                              )}
                              <Typography variant="h6">
                                {result.type === 'diary' ? 'Diary Entry' : 'Mood Note'}
                              </Typography>
                              {result.mood_level && (
                                <Typography variant="h6">
                                  {MOOD_EMOJIS[result.mood_level]}
                                </Typography>
                              )}
                            </Box>
                            <Chip
                              label={dayjs(result.date).format('MMM D, YYYY')}
                              size="small"
                              variant="outlined"
                            />
                          </Box>

                          <Typography variant="body1" paragraph>
                            {highlightSearchTerm(result.excerpt, searchTerm)}
                          </Typography>

                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            <Chip
                              label={result.type === 'diary' ? 'Diary' : 'Mood'}
                              size="small"
                              color={result.type === 'diary' ? 'primary' : 'secondary'}
                            />
                            {result.word_count && (
                              <Chip
                                label={`${result.word_count} words`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {result.mood_level && (
                              <Chip
                                label={`Mood: ${result.mood_level}/5`}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default SearchBar;