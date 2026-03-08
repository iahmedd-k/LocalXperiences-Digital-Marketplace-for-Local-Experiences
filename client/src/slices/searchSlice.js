import { createSlice } from '@reduxjs/toolkit'

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    keyword:  '',
    city:     '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort:     'createdAt',
  },
  reducers: {
    setSearchParams(state, { payload }) { return { ...state, ...payload } },
    resetSearch()                       { return { keyword: '', city: '', category: '', minPrice: '', maxPrice: '', sort: 'createdAt' } },
  },
})

export const { setSearchParams, resetSearch } = searchSlice.actions
export default searchSlice.reducer