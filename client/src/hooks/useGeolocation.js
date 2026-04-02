import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLocation, setCityName } from '../slices/locationSlice.js'

const useGeolocation = () => {
  const dispatch = useDispatch()
  const location = useSelector((s) => s.location)

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        // 1. Immediately store coords so UI can react
        dispatch(setLocation({ lat, lng }))

        // 2. Reverse-geocode to get city name (async, non-blocking)
        fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
        )
          .then((r) => r.json())
          .then((data) => {
            const city = data.city || data.locality || data.principalSubdivision || ''
            if (city) dispatch(setCityName(city))
          })
          .catch(() => {}) // silently fail — coords are still available
      },
      () => {
        // Permission denied or error — mark as detected with no coords
        dispatch(setLocation({ city: '', lat: null, lng: null }))
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }, [dispatch])

  useEffect(() => {
    if (location.detected) return
    requestLocation()
  }, [location.detected, requestLocation])

  return { ...location, requestLocation }
}

export default useGeolocation