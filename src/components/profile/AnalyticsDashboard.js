// src/components/profile/AnalyticsDashboard.js - Real Data Version
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
  1: '#f44336', // Very Sad - Red
  2: '#ff9800', // Sad - Orange  
  3: '#9e9e9e', // Neutral - Grey
  4: '#4caf50', // Happy - Green
  5: '#2196f3'  // Very Happy - Blue
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
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Analytics Dashboard</Typography>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Time Range</InputLabel>
          <Select
            value={timeRange}
            label="Time Range"
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="7">Last 7 days</MenuItem>
            <MenuItem value="30">Last 30 days</MenuItem>
            <MenuItem value="90">Last 3 months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Entries
                  </Typography>
                  <Typography variant="h4">
                    {stats?.total_entries || 0}
                  </Typography>
                </Box>
                <Edit color="primary" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Current Streak
                  </Typography>
                  <Typography variant="h4">
                    {stats?.current_streak || 0}
                  </Typography>
                </Box>
                <Star color="warning" sx={{ fontSize: 40 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Mood Trend
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {moodTrend.trend === 'improving' ? (
                      <TrendingUp color="success" />
                    ) : moodTrend.trend === 'declining' ? (
                      <TrendingDown color="error" />
                    ) : (
                      <Mood color="action" />
                    )}
                    <Typography variant="h6">
                      {moodTrend.trend}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Challenges Done
                  </Typography>
                  <Typography variant="h4">
                    {stats?.total_challenges_completed || 0}
                  </Typography>
                </Box>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  bgcolor: 'success.main', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center' 
                }}>
                  <Typography variant="h6" color="white">✓</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Mood Trend Line Chart */}
        <Grid item xs={12} lg={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mood Trends Over Time
              </Typography>
              {moodTrends.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={moodTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis 
                      domain={[1, 5]}
                      tickFormatter={(value) => MOOD_LABELS[value]}
                    />
                    <Tooltip formatter={formatTooltip} />
                    <Line 
                      type="monotone" 
                      dataKey="mood" 
                      stroke="#2196f3" 
                      strokeWidth={3}
                      dot={{ fill: '#2196f3', strokeWidth: 2, r: 4 }}
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No mood data available for the selected time range
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Mood Distribution Pie Chart */}
        <Grid item xs={12} lg={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mood Distribution
              </Typography>
              {moodDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={moodDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
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
                  <Typography color="text.secondary">
                    No mood data available for the selected time range
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Activity Bar Chart */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Daily Activity (Last 14 Days with Activity)
              </Typography>
              {activityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="entries" fill="#2196f3" name="Diary Entries" />
                    <Bar dataKey="challenges" fill="#4caf50" name="Challenges" />
                    <Bar dataKey="words" fill="#ff9800" name="Words Written" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    No activity data available for the selected time range
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Real Insights */}
      {insights.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Personal Insights
            </Typography>
            <Grid container spacing={2}>
              {insights.map((insight, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper sx={{ 
                    p: 2, 
                    bgcolor: insight.type === 'mood_trend' ? 'primary.light' : 'success.light',
                    color: insight.type === 'mood_trend' ? 'primary.contrastText' : 'success.contrastText'
                  }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {insight.title}
                    </Typography>
                    <Typography variant="body2">
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