import api from '../config/api.js'

export const getMyItineraries  = ()          => api.get('/itineraries')
export const getItineraryById  = (id)        => api.get(`/itineraries/${id}`)
export const createItinerary   = (data)      => api.post('/itineraries', data)
export const updateItinerary   = (id, data)  => api.put(`/itineraries/${id}`, data)
export const deleteItinerary   = (id)        => api.delete(`/itineraries/${id}`)
export const addExperience     = (id, expId) => api.post(`/itineraries/${id}/experiences`, { experienceId: expId })
export const removeExperience  = (id, expId) => api.delete(`/itineraries/${id}/experiences/${expId}`)
export const shareItinerary    = (id)        => api.post(`/itineraries/${id}/share`)
export const getSharedItinerary= (token)     => api.get(`/itineraries/shared/${token}`)