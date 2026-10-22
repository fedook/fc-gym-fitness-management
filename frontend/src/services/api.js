import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: {
    Accept: 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gym_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/login')) {
      localStorage.removeItem('gym_token')
      localStorage.removeItem('gym_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

export function getErrorMessage(error) {
  if (error.response) {
    const data = error.response.data
    if (data?.errors) {
      return Object.values(data.errors).flat().join(' ')
    }
    return data?.message || `Request failed (${error.response.status})`
  }
  if (error.request) {
    return 'Unable to reach the server. Please check your connection.'
  }
  return error.message || 'An unexpected error occurred.'
}

export default api
