// src/services/api.js
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

    // Handle auth errors
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
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

  async getChallengeStats() {
    const response = await this.api.get('/challenges/stats/me')
    return response.data
  }

  // Timeline endpoints
  async getCalendarData(year, month) {
    const response = await this.api.get(`/timeline/calendar/${year}/${month}`)
    return response.data
  }

  async searchEntries(searchTerm) {
    const response = await this.api.get(`/timeline/search?q=${searchTerm}`)
    return response.data
  }
}

export default new ApiService()