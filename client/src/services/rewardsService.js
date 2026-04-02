import api from '../config/api.js'

export const getUserRewards = (userId) => api.get(`/checkins/user/${userId}`)
