import { createSlice } from '@reduxjs/toolkit'

const itinerarySlice = createSlice({
  name: 'itinerary',
  initialState: { list: [], active: null },
  reducers: {
    setItineraries(state, { payload }) { state.list   = payload },
    setActive(state,      { payload }) { state.active = payload },
    addItinerary(state,   { payload }) { state.list.unshift(payload) },
    removeItinerary(state,{ payload }) { state.list = state.list.filter(i => i._id !== payload) },
  },
})

export const { setItineraries, setActive, addItinerary, removeItinerary } = itinerarySlice.actions
export default itinerarySlice.reducer