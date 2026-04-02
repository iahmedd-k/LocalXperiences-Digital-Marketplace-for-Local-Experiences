import api from '../config/api.js'
import { buildQueryString } from '../utils/helpers.js'

export const createPaymentIntent = (data) => api.post('/bookings/create-payment-intent', data)
export const confirmBooking      = (data) => api.post('/bookings', data)
export const getMyBookings       = (params = {}) => api.get(`/bookings?${buildQueryString(params)}`)
export const getHostBookings     = (params = {}) => api.get(`/bookings/host?${buildQueryString(params)}`)
export const getBookingById      = (id)   => api.get(`/bookings/${id}`)
export const cancelBooking       = (id)   => api.put(`/bookings/${id}/cancel`)
export const completeHostBooking = (id)   => api.put(`/bookings/${id}/complete`)
export const cancelHostBooking   = (id)   => api.put(`/bookings/${id}/cancel`)
export const checkInBooking      = (id, data = {})   => api.put(`/bookings/${id}/check-in`, data)
export const overrideBookingStatus = (id, status) => api.put(`/bookings/${id}/status`, { status })

const collectAllPages = async (fetchPage) => {
	let page = 1
	let totalPages = 1
	const items = []

	while (page <= totalPages) {
		const res = await fetchPage(page)
		const pageItems = res?.data?.data || []
		const pagination = res?.data?.pagination || {}

		items.push(...pageItems)
		totalPages = Math.max(totalPages, Number(pagination.totalPages || 1))
		page += 1

		if (!pagination.totalPages && pageItems.length === 0) break
		if (page > 100) break
	}

	return items
}

export const getAllMyBookings = async (params = {}) => collectAllPages((page) =>
	getMyBookings({ ...params, page, limit: params.limit || 50 })
)

export const getAllHostBookings = async (params = {}) => collectAllPages((page) =>
	getHostBookings({ ...params, page, limit: params.limit || 50 })
)
