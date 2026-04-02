import api, { API_BASE_URL } from '../config/api.js'

export const login    = (data)  => api.post('/auth/login',  data)
export const signup   = (data)  => api.post('/auth/signup', data)
export const getMe    = ()      => api.get('/auth/me')
export const updateProfile = (data) => api.put('/auth/profile', data)
export const becomeHost    = ()     => api.post('/auth/become-host')
export const changePassword = (data) => api.put('/auth/change-password', data)

export const googleLogin = () => {
  window.location.href = `${API_BASE_URL}/auth/google`
}