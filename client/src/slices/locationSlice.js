import { createSlice } from '@reduxjs/toolkit'

const locationSlice = createSlice({
  name: 'location',
  initialState: { city: '', lat: null, lng: null, detected: false },
  reducers: {
    setLocation(state, { payload }) {
      state.city     = payload.city
      state.lat      = payload.lat
      state.lng      = payload.lng
      state.detected = true
    },
    clearLocation(state) {
      state.city = ''; state.lat = null; state.lng = null; state.detected = false
    },
  },
})

export const { setLocation, clearLocation } = locationSlice.actions
export default locationSlice.reducer