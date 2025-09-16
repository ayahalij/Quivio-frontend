// src/components/profile/AnalyticsDashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Chip,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Mood, Edit, Star } from '@mui/icons-material';
import ApiService from '../../services/api';
import dayjs from 'dayjs';

const MOOD_COLORS = {
  1: '#ff6b6b',  // Red
  2: '#ffa726',  // Orange
  3: '#42a5f5',  // Blue (Neutral)
  4: '#8cd38fff',  // Green
  5: '#47a14aff'   // Darker green
};


const MOOD_LABELS = {
  1: 'Very Sad',
  2: 'Sad',
  3: 'Neutral', 
  4: 'Happy',
  5: 'Very Happy'
};

const AnalyticsDashboard = () => {
  const [timeRange, setTimeRange] = useState('30'); // days
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [moodTrends, setMoodTrends] = useState([]);
  const [moodDistribution, setMoodDistribution] = useState([]);
  const [activityData, setActivityData] = useState([]);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get basic stats
      const statsResponse = await ApiService.getUserStats();
      setStats(statsResponse);

      // Get real analytics data
      const days = parseInt(timeRange);
      
      const [trendsResponse, distributionResponse, activityResponse, insightsResponse] = await Promise.all([
        ApiService.getMoodTrends(days),
        ApiService.getMoodDistribution(days),
        ApiService.getActivitySummary(days),
        ApiService.getInsights()
      ]);

      // Process mood trends for chart
      const processedTrends = trendsResponse.trends.map(trend => ({
        date: dayjs(trend.date).format('MMM D'),
        fullDate: trend.date,
        mood: trend.mood_level,
        hasEntry: trend.mood_level !== null
      }));
      setMoodTrends(processedTrends);

      // Process mood distribution for pie chart
      const processedDistribution = distributionResponse.distribution.map(item => ({
        name: MOOD_LABELS[item.mood_level],
        value: item.count,
        fill: MOOD_COLORS[item.mood_level]
      }));
      setMoodDistribution(processedDistribution);

      // Process activity data for bar chart
      const processedActivity = activityResponse.activity
        .filter(day => day.has_diary || day.challenges_completed > 0)
        .slice(-14) // Last 14 days with activity
        .map(day => ({
          date: dayjs(day.date).format('MMM D'),
          entries: day.has_diary ? 1 : 0,
          words: day.word_count,
          challenges: day.challenges_completed
        }));
      setActivityData(processedActivity);

      setInsights(insightsResponse.insights || []);

    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const calculateMoodTrend = () => {
    const validMoods = moodTrends.filter(day => day.mood !== null);
    if (validMoods.length < 2) return { trend: 'neutral', change: 0 };

    const recent = validMoods.slice(-7); // Last 7 entries
    const earlier = validMoods.slice(-14, -7); // Previous 7 entries

    if (recent.length === 0 || earlier.length === 0) return { trend: 'neutral', change: 0 };

    const recentAvg = recent.reduce((sum, day) => sum + day.mood, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, day) => sum + day.mood, 0) / earlier.length;
    const change = ((recentAvg - earlierAvg) / earlierAvg * 100);

    return {
      trend: change > 5 ? 'improving' : change < -5 ? 'declining' : 'stable',
      change: Math.abs(change)
    };
  };

  const moodTrend = calculateMoodTrend();

  const formatTooltip = (value, name) => {
    if (name === 'mood') {
      return [MOOD_LABELS[value], 'Mood'];
    }
    return [value, name];
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress sx={{ color: '#8761a7' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h5"
          sx={{ 
            fontFamily: '"Kalam", cursive',
            color: '#8761a7',
            fontWeight: 600,
            fontSize: '1.5rem'
          }}
        >
          Analytics Dashboard
        </Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ fontFamily: '"Kalam", cursive', color: '#8761a7' }}>
            Time Range
          </InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
            sx={{
              fontFamily: '"Kalam", cursive',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: '#8761a7'
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#8761a7'
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: '#8761a7'
              }
            }}
          >
            <MenuItem value="7" sx={{ fontFamily: '"Kalam", cursive' }}>Last 7 days</MenuItem>
            <MenuItem value="30" sx={{ fontFamily: '"Kalam", cursive' }}>Last 30 days</MenuItem>
            <MenuItem value="90" sx={{ fontFamily: '"Kalam", cursive' }}>Last 3 months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: '#fffbef',
            color: '#8761a7',
            border: '2px solid #8761a7',
            borderRadius: 3,
            fontFamily: '"Kalam", cursive'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Summary Cards Row */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontWeight: 600,
              mb: 3
            }}
          >
            Summary Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                backgroundColor: '#dce291',
                border: '2px solid #8761a7',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600
                      }} 
                      gutterBottom
                    >
                      Total Entries
                    </Typography>
                    <Typography 
                      variant="h4"
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 700
                      }}
                    >
                      {stats?.total_entries || 0}
                    </Typography>
                  </Box>
                  <Edit sx={{ color: '#8761a7', fontSize: 40 }} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                backgroundColor: '#dce291',
                border: '2px solid #8761a7',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600
                      }} 
                      gutterBottom
                    >
                      Current Streak
                    </Typography>
                    <Typography 
                      variant="h4"
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 700
                      }}
                    >
                      {stats?.current_streak || 0}
                    </Typography>
                  </Box>
                  <Star sx={{ color: '#8761a7', fontSize: 40 }} />
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                backgroundColor: '#dce291',
                border: '2px solid #8761a7',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600
                      }} 
                      gutterBottom
                    >
                      Mood Trend
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {moodTrend.trend === 'improving' ? (
                        <TrendingUp sx={{ color: '#4caf50' }} />
                      ) : moodTrend.trend === 'declining' ? (
                        <TrendingDown sx={{ color: '#f44336' }} />
                      ) : (
                        <Mood sx={{ color: '#8761a7' }} />
                      )}
                      <Typography 
                        variant="h6"
                        sx={{ 
                          color: '#8761a7',
                          fontFamily: '"Kalam", cursive',
                          fontWeight: 600
                        }}
                      >
                        {moodTrend.trend}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ 
                p: 2, 
                textAlign: 'center',
                backgroundColor: '#dce291',
                border: '2px solid #8761a7',
                borderRadius: 2
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography 
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 600
                      }} 
                      gutterBottom
                    >
                      Challenges Done
                    </Typography>
                    <Typography 
                      variant="h4"
                      sx={{ 
                        color: '#8761a7',
                        fontFamily: '"Kalam", cursive',
                        fontWeight: 700
                      }}
                    >
                      {stats?.total_challenges_completed || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '50%', 
                    bgcolor: '#8761a7', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Typography variant="h6" color="white">✓</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Mood Trend Line Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontWeight: 600
            }}
          >
            Mood Trends Over Time
          </Typography>
          {moodTrends.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={moodTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontFamily: '"Kalam", cursive', fill: '#8761a7' }}
                />
                <YAxis 
                  domain={[1, 5]}
                  tickFormatter={(value) => MOOD_LABELS[value]}
                  tick={{ fontFamily: '"Kalam", cursive', fill: '#8761a7' }}
                />
                <Tooltip formatter={formatTooltip} />
                <Line 
                  type="monotone" 
                  dataKey="mood" 
                  stroke="#8761a7" 
                  strokeWidth={3}
                  dot={{ fill: '#8761a7', strokeWidth: 2, r: 4 }}
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography 
                sx={{ 
                  color: '#8761a7',
                  fontFamily: '"Kalam", cursive'
                }}
              >
                No mood data available for the selected time range
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Mood Distribution Pie Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontWeight: 600
            }}
          >
            Mood Distribution
          </Typography>
          {moodDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={moodDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {moodDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography 
                sx={{ 
                  color: '#8761a7',
                  fontFamily: '"Kalam", cursive'
                }}
              >
                No mood data available for the selected time range
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Activity Bar Chart */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              fontFamily: '"Kalam", cursive',
              color: '#8761a7',
              fontWeight: 600
            }}
          >
            Daily Activity (Last 14 Days with Activity)
          </Typography>
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontFamily: '"Kalam", cursive', fill: '#8761a7' }}
                />
                <YAxis 
                  tick={{ fontFamily: '"Kalam", cursive', fill: '#8761a7' }}
                />
                <Tooltip />
                <Legend />
                <Bar dataKey="entries" fill="#8761a7" name="Diary Entries" />
                <Bar dataKey="challenges" fill="#cdd475" name="Challenges" />
                <Bar dataKey="words" fill="#aecaf4ff" name="Words Written" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography 
                sx={{ 
                  color: '#8761a7',
                  fontFamily: '"Kalam", cursive'
                }}
              >
                No activity data available for the selected time range
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Personal Insights */}
      {insights.length > 0 && (
        <Card>
          <CardContent>
            <Typography 
              variant="h6" 
              gutterBottom
              sx={{ 
                fontFamily: '"Kalam", cursive',
                color: '#8761a7',
                fontWeight: 600
              }}
            >
              Personal Insights
            </Typography>
            <Grid container spacing={2}>
              {insights.map((insight, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper sx={{ 
                    p: 3, 
                    backgroundColor: '#dce291',
                    border: '2px solid #8761a7',
                    borderRadius: 2
                  }}>
                    <Typography 
                      variant="subtitle2" 
                      gutterBottom
                      sx={{ 
                        fontFamily: '"Kalam", cursive',
                        color: '#8761a7',
                        fontWeight: 600
                      }}
                    >
                      {insight.title}
                    </Typography>
                    <Typography 
                      variant="body2"
                      sx={{ 
                        fontFamily: '"Kalam", cursive',
                        color: '#8761a7'
                      }}
                    >
                      {insight.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default AnalyticsDashboard;