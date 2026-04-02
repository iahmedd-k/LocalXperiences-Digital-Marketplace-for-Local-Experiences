import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null,
    token:           null,
    isAuthenticated: false,
    isInitializing:  true, // Flag to prevent redirect during rehydration
  },
  reducers: {
    setCredentials(state, { payload }) {
      state.user            = payload.user
      state.token           = payload.token
      state.isAuthenticated = true
      state.isInitializing  = false
      localStorage.setItem('token', payload.token)
      localStorage.setItem('user',  JSON.stringify(payload.user))
    },
    updateUser(state, { payload }) {
      state.user = { ...state.user, ...payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    logout(state) {
      state.user            = null
      state.token           = null
      state.isAuthenticated = false
      state.isInitializing  = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    finishInitializing(state) {
      state.isInitializing = false
    },
  },
})

export const { setCredentials, updateUser, logout, finishInitializing } = authSlice.actions
export default authSlice.reducer