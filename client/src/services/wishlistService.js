import api from '../config/api.js'

export const getWishlist = () => api.get('/wishlist')
export const addToWishlist = (experienceId) => api.post(`/wishlist/${experienceId}`)
export const removeFromWishlist = (experienceId) => api.delete(`/wishlist/${experienceId}`)
