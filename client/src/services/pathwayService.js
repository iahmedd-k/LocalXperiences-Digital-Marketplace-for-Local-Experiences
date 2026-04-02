import api from '../config/api.js'

export const getPathways = (params) => {
  const query = new URLSearchParams(params).toString()
  return api.get(`/pathways?${query}`)
}

export const getPathwayById = (id) => api.get(`/pathways/${id}`)

export const createPathway = (data) => api.post('/pathways', data)

export const updatePathway = (id, data) => api.put(`/pathways/${id}`, data)

export const deletePathway = (id) => api.delete(`/pathways/${id}`)

export const toggleSavePathway = (id) => api.post(`/pathways/${id}/save`)
