import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { setCredentials, finishInitializing } from './slices/authSlice.js'
import AppRouter from './routes/AppRouter.jsx'
import { DEFAULT_RADIUS } from './config/constants.js'
import useGeolocation from './hooks/useGeolocation.js'
import { getExperiences } from './services/experienceService.js'

const App = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  // Capture GPS pinpoint once per session; stored in Redux and shared everywhere
  const location = useGeolocation()
  const hasCoords = Number.isFinite(location?.lat) && Number.isFinite(location?.lng)

  // Rehydrate auth from localStorage on app load
  useEffect(() => {
    const token = localStorage.getItem('token')
    const user  = localStorage.getItem('user')
    if (token && user) {
      try {
        dispatch(setCredentials({ token, user: JSON.parse(user) }))
      } catch {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        dispatch(finishInitializing())
      }
      return
    }

    // No token found, mark initialization as complete
    dispatch(finishInitializing())
  }, [dispatch])

  useEffect(() => {
    if (!hasCoords) return

    const buildNearbyQuery = (sort) => ({
      queryKey: ['searchExperiences', '', 'All', true, sort, location.lat, location.lng],
      queryFn: async () => {
        const res = await getExperiences({
          lat: location.lat,
          lng: location.lng,
          radius: DEFAULT_RADIUS,
          limit: 100,
          sort,
        })
        return res.data.data || []
      },
    })

    queryClient.prefetchQuery(buildNearbyQuery('rating'))
    queryClient.prefetchQuery(buildNearbyQuery('nearest'))
  }, [hasCoords, location?.lat, location?.lng, queryClient])

  return <AppRouter />
}

export default App