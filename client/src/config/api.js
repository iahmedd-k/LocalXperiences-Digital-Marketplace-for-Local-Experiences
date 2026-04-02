import axios from 'axios'

const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000'
const sanitizedBaseUrl = rawBaseUrl.replace(/\/+$/, '')
export const API_BASE_URL = sanitizedBaseUrl.endsWith('/api')
  ? sanitizedBaseUrl
  : `${sanitizedBaseUrl}/api`
const LOCAL_API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL:         API_BASE_URL,
  withCredentials: false,
})

// Attach JWT and Language on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

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
    const isDnsError =
      err?.code === 'ERR_NETWORK' &&
      (String(err?.message || '').includes('ERR_NAME_NOT_RESOLVED') ||
        String(err?.message || '').includes('Network Error'))

    if (isDnsError && err.config && !err.config.__retriedLocal && API_BASE_URL !== LOCAL_API_BASE_URL) {
      const retryConfig = {
        ...err.config,
        __retriedLocal: true,
        baseURL: LOCAL_API_BASE_URL,
      }
      return api.request(retryConfig)
    }

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