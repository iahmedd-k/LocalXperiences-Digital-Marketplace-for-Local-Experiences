import api from '../config/api.js'

export const getQnA       = (experienceId) => api.get(`/qna/${experienceId}`)
export const askQuestion  = (data)         => api.post('/qna', data)
export const answerQuestion=(id, data)     => api.put(`/qna/${id}/answer`, data)
export const deleteQuestion=(id)           => api.delete(`/qna/${id}`)