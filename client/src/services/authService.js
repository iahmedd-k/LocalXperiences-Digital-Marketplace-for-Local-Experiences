import api from '../config/api.js'

export const login    = (data)  => api.post('/auth/login',  data)
export const signup   = (data)  => api.post('/auth/signup', data)
export const getMe    = ()      => api.get('/auth/me')
export const updateProfile = (data) => api.put('/auth/profile', data)
export const changePassword = (data) => api.put('/auth/change-password', data)

export const googleLogin = () => {
  window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/google`
}