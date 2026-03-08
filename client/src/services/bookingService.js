import api from '../config/api.js'

export const createPaymentIntent = (data) => api.post('/bookings/create-payment-intent', data)
export const confirmBooking      = (data) => api.post('/bookings', data)
export const getMyBookings       = ()     => api.get('/bookings')
export const getHostBookings     = ()     => api.get('/bookings/host')
export const getBookingById      = (id)   => api.get(`/bookings/${id}`)
export const cancelBooking       = (id)   => api.put(`/bookings/${id}/cancel`)