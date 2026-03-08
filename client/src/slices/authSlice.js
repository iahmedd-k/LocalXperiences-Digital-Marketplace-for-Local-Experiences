import { createSlice } from '@reduxjs/toolkit'

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            null,
    token:           null,
    isAuthenticated: false,
  },
  reducers: {
    setCredentials(state, { payload }) {
      state.user            = payload.user
      state.token           = payload.token
      state.isAuthenticated = true
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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
  },
})

export const { setCredentials, updateUser, logout } = authSlice.actions
export default authSlice.reducer