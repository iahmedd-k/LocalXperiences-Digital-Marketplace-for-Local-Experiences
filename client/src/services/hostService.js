import api from '../config/api.js'

export const getHostProfile = (id) => api.get(`/hosts/${id}`)
