import api from '../config/api.js'

export const getReviews    = (experienceId) => api.get(`/reviews/${experienceId}`)
export const getMyReviews  = ()             => api.get('/reviews/me')
export const createReview  = (data)         => api.post('/reviews', data)
export const replyToReview = (id, data)     => api.put(`/reviews/${id}/reply`, data)
export const getHostReviews= ()             => api.get('/reviews/host/my-reviews')