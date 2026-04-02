export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export const isValidPassword = (password) => password?.length >= 8

export const isValidPhone = (phone) => /^\+?[\d\s-]{10,15}$/.test(phone)