import api from '../config/api.js'

export const getRewardsConfig = () => api.get('/rewards')
