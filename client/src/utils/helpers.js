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
  const colors = ['#00AA6C','#10b981','#0f766e','#16a34a','#3b82f6','#06b6d4','#0ea5e9','#14b8a6']
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