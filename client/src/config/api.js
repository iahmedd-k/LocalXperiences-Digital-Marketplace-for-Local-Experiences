import axios from 'axios'

const rawBaseUrl = String(import.meta.env.VITE_API_URL || '').trim()

const isPlaceholderUrl = (value) =>
  !value ||
  value.includes('your-vercel-api-url.com') ||
  value.includes('example.com')

const buildApiBaseUrl = () => {
  const sanitizedBaseUrl = rawBaseUrl.replace(/\/+$/, '')

  if (!isPlaceholderUrl(sanitizedBaseUrl)) {
    return sanitizedBaseUrl.endsWith('/api')
      ? sanitizedBaseUrl
      : `${sanitizedBaseUrl}/api`
  }

  if (import.meta.env.DEV) {
    return 'http://localhost:9000/api'
  }

  return '/api'
}

export const API_BASE_URL = buildApiBaseUrl()

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
})

const isPublicGetRequest = (config) => {
  const method = String(config?.method || 'get').toUpperCase()
  const url = String(config?.url || '')

  if (method !== 'GET') return false

  return [
    '/experiences',
    '/recommendations',
    '/pathways',
    '/currency',
    '/hosts',
    '/stories',
  ].some((prefix) => url.startsWith(prefix))
}

// Attach JWT and Language on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token && !isPublicGetRequest(config)) {
    config.headers.Authorization = `Bearer ${token}`
  }

  try {
    const langObj = JSON.parse(localStorage.getItem('lx_language'))
    if (langObj && langObj.code) {
      config.headers['Accept-Language'] = langObj.code
    }
  } catch (e) {
    // ignore
  }

  return config
})

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  async (err) => {


    if (err.response?.status === 401) {
      const requestUrl = String(err?.config?.url || '')
      const isAuthRequest = /\/auth\/(login|signup|google)/.test(requestUrl)
      const isAlreadyOnAuthPage = window.location.pathname === '/login' || window.location.pathname === '/signup'

      // Do not hard-redirect for expected auth failures (e.g. wrong password)
      // and avoid redirect loops if user is already on auth screens.
      if (isAuthRequest || isAlreadyOnAuthPage) {
        return Promise.reject(err)
      }

      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default api
