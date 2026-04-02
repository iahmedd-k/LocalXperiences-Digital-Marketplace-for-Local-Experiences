import api from '../config/api.js'
import { buildQueryString } from '../utils/helpers.js'

export const getStories = (params = {}) => api.get(`/stories?${buildQueryString(params)}`)
export const getStoryBySlug = (slug) => api.get(`/stories/${slug}`)
export const getHostStories = () => api.get('/stories/host/my-stories')
export const createStory = (data) => api.post('/stories', data)
