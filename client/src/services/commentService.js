import api from '../config/api.js'

export const getComments   = (experienceId) => api.get(`/comments/${experienceId}`)
export const createComment = (data)         => api.post('/comments', data)
export const deleteComment = (id)           => api.delete(`/comments/${id}`)