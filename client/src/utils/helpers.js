// Build query string from object — skips empty values
export const buildQueryString = (params = {}) => {
  const query = new URLSearchParams()
  Object.entries(params).forEach(([key, val]) => {
    if (val !== '' && val !== null && val !== undefined) query.append(key, val)
  })
  return query.toString()
}

// Get error message from axios error
export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.message || 'Something went wrong'

// Generate avatar color from name
export const getAvatarColor = (name = '') => {
  const colors = ['#f97316','#10b981','#3b82f6','#8b5cf6','#ef4444','#f59e0b','#06b6d4','#ec4899']
  const firstChar = name.trim().charAt(0) || 'L'
  const index  = firstChar.toUpperCase().charCodeAt(0) % colors.length
  return colors[index]
}

// Get initials from a full name
export const getInitials = (name = '') => {
  if (!name) return 'LX'
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.charAt(0) || ''
  const second = parts[1]?.charAt(0) || ''
  const initials = (first + second).toUpperCase()
  return initials || 'LX'
}

// Scroll to top
export const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })