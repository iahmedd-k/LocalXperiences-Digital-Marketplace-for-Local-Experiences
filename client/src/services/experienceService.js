import api from '../config/api.js'
import { buildQueryString } from '../utils/helpers.js'

export const getExperiences    = (params) => api.get(`/experiences?${buildQueryString(params)}`)
export const getFeatured       = ()       => api.get('/experiences/featured')
export const getExperienceById = (id)     => api.get(`/experiences/${id}`)
export const getHostExperiences= ()       => api.get('/experiences/host/my-listings')
export const createExperience  = (data)   => api.post('/experiences', data)
export const updateExperience  = (id, data) => api.put(`/experiences/${id}`, data)
export const deleteExperience  = (id)     => api.delete(`/experiences/${id}`)
export const updateAvailability= (id, data) => api.put(`/experiences/${id}/availability`, data)