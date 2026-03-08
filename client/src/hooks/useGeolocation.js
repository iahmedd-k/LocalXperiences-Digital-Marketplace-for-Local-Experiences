import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setLocation } from '../slices/locationSlice.js'

const useGeolocation = () => {
  const dispatch = useDispatch()
  const location = useSelector((s) => s.location)

  useEffect(() => {
    if (location.detected) return // already have it

    if (!navigator.geolocation) return

    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const res  = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { 'User-Agent': 'LocalXperiences/1.0' } }
          )
          const data = await res.json()
          const city = data.address?.city || data.address?.town || data.address?.state || ''
          dispatch(setLocation({ city, lat, lng }))
        } catch {
          dispatch(setLocation({ city: '', lat, lng }))
        }
      },
      () => {} // silently ignore denied
    )
  }, [])

  return location
}

export default useGeolocation