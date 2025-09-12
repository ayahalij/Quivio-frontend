// src/services/api.jsx - Complete API Service with Avatar Upload
import axios from 'axios'

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
    })

    // Add auth token to requests
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('access_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
      return config
    })

    // Handle auth errors and token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          const refreshToken = localStorage.getItem('refresh_token')
          
          if (refreshToken) {
            try {
              const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                refresh_token: refreshToken
              })
              
              localStorage.setItem('access_token', response.data.access_token)
              
              // Retry the original request
              error.config.headers.Authorization = `Bearer ${response.data.access_token}`
              return this.api.request(error.config)
            } catch (refreshError) {
              // Refresh failed, redirect to login
              localStorage.removeItem('access_token')
              localStorage.removeItem('refresh_token')
              window.location.href = '/login'
            }
          } else {
            // No refresh token, redirect to login
            localStorage.removeItem('access_token')
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async register(userData) {
    const response = await this.api.post('/auth/register', userData)
    return response.data
  }

  async login(credentials) {
    const response = await this.api.post('/auth/login', credentials)
    return response.data
  }

  async getCurrentUser() {
    const response = await this.api.get('/auth/me')
    return response.data
  }

  // USER AVATAR UPLOAD - ADDED THIS METHOD
  async uploadAvatar(file) {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await this.api.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }

  // Daily endpoints
  async createMood(moodData) {
    const response = await this.api.post('/daily/mood', moodData)
    return response.data
  }

  async createDiary(diaryData) {
    const response = await this.api.post('/daily/diary', diaryData)
    return response.data
  }

  // Challenge endpoints
  async getDailyChallenge() {
    const response = await this.api.get('/challenges/daily')
    return response.data
  }

  async completeChallenge(challengeId, data) {
    const response = await this.api.post(`/challenges/complete/${challengeId}`, data)
    return response.data
  }

  async getChallengeStats() {
    const response = await this.api.get('/challenges/stats/me')
    return response.data
  }

  // User endpoints  
  async getUserStats() {
    const response = await this.api.get('/users/stats')
    return response.data
  }

  async updateProfile(profileData) {
    const response = await this.api.put('/users/profile', profileData)
    return response.data
  }

  // Timeline endpoints
  async getCalendarData(year, month) {
    const response = await this.api.get(`/timeline/calendar/${year}/${month}`)
    return response.data
  }

  async searchEntries(searchTerm) {
    const response = await this.api.get(`/timeline/search?q=${encodeURIComponent(searchTerm)}`)
    return response.data
  }

    // Capsules endpoints
    async getCapsules() {
    const response = await this.api.get('/capsules/');
    return response.data;
    }

    async createCapsule(capsuleData) {
    const response = await this.api.post('/capsules/', capsuleData);
    return response.data;
    }

    async openCapsule(capsuleId) {
    const response = await this.api.put(`/capsules/${capsuleId}/open`);
    return response.data;
    }

    async getCapsule(capsuleId) {
    const response = await this.api.get(`/capsules/${capsuleId}`);
    return response.data;
    }

    // Analytics endpoints
    async getMoodTrends(days = 30) {
    const response = await this.api.get(`/analytics/mood-trends?days=${days}`);
    return response.data;
    }

    async getMoodDistribution(days = 30) {
    const response = await this.api.get(`/analytics/mood-distribution?days=${days}`);
    return response.data;
    }

    async getActivitySummary(days = 30) {
    const response = await this.api.get(`/analytics/activity-summary?days=${days}`);
    return response.data;
    }

    async getInsights() {
    const response = await this.api.get('/analytics/insights');
    return response.data;
    }

    // Photo endpoints
    async getPhotoLocations(startDate = null, endDate = null) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    
    const response = await this.api.get(`/photos/locations?${params}`);
    return response.data;
    }

    async getPhotoStats() {
    const response = await this.api.get('/photos/stats');
    return response.data;
    }
}

const apiService = new ApiService()
export default apiService