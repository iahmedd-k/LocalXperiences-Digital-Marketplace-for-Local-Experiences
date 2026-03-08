import { configureStore } from '@reduxjs/toolkit'
import authReducer      from '../slices/authSlice.js'
import locationReducer  from '../slices/locationSlice.js'
import searchReducer    from '../slices/searchSlice.js'
import itineraryReducer from '../slices/itinerarySlice.js'

export const store = configureStore({
  reducer: {
    auth:      authReducer,
    location:  locationReducer,
    search:    searchReducer,
    itinerary: itineraryReducer,
  },
})