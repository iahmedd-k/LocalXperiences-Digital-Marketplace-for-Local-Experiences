import { createSlice } from '@reduxjs/toolkit'

const locationSlice = createSlice({
  name: 'location',
  initialState: { city: '', lat: null, lng: null, detected: false, geocoded: false },
  reducers: {
    setLocation(state, { payload }) {
      state.city     = payload.city ?? state.city
      state.lat      = payload.lat
      state.lng      = payload.lng
      state.detected = true
    },
    setCityName(state, { payload }) {
      state.city     = payload
      state.geocoded = true
    },
    clearLocation(state) {
      state.city = ''; state.lat = null; state.lng = null; state.detected = false; state.geocoded = false
    },
  },
})

export const { setLocation, setCityName, clearLocation } = locationSlice.actions
export default locationSlice.reducer