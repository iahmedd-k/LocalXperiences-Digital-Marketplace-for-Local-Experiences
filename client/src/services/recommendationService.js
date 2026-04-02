import api from '../config/api.js'

export const getRecommendations = () => api.get('/recommendations')