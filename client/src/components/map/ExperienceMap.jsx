import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { useNavigate } from 'react-router-dom'
import { useEffect }   from 'react'
import L from 'leaflet'
import { formatPrice } from '../../utils/formatters.js'

// City fallback coordinates for when geocoding fails/returns [0,0]
export const CITY_COORDS = {
  lahore:    [31.5497, 74.3436],
  karachi:   [24.8607, 67.0011],
  islamabad: [33.6844, 73.0479],
  peshawar:  [34.0151, 71.5249],
  multan:    [30.1575, 71.5249],
  quetta:    [30.1798, 66.9750],
  rawalpindi:[33.5651, 73.0169],
  faisalabad:[31.4504, 73.1350],
}

const getCenter = (experiences, propCenter) => {
  if (propCenter) return propCenter

  // Try valid coords from first experience
  const firstWithCoords = experiences?.find((e) => {
    const c = e.location?.coordinates?.coordinates
    return c && c[0] !== 0 && c[1] !== 0
  })
  if (firstWithCoords) {
    const c = firstWithCoords.location.coordinates.coordinates
    return [c[1], c[0]]
  }

  // Fall back to city name lookup
  const city = experiences?.[0]?.location?.city?.toLowerCase().trim()
  return CITY_COORDS[city] || [30.3753, 69.3451]
}

const createPin = (price) => L.divIcon({
  className: '',
  html: `<div style="background:#f97316;color:white;font-family:sans-serif;font-size:12px;font-weight:700;padding:4px 10px;border-radius:20px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.25);border:2px solid white;cursor:pointer;">${formatPrice(price)}</div>`,
  iconAnchor: [24, 12],
})

const MapRecenter = ({ center, zoom }) => {
  const map = useMap()
  useEffect(() => { map.setView(center, zoom) }, [center[0], center[1]])
  return null
}

const ExperiencePopup = ({ exp, navigate }) => (
  <div className="w-48 cursor-pointer" onClick={() => navigate(`/experiences/${exp._id}`)}>
    <div className="h-24 bg-orange-100 rounded-lg mb-2 flex items-center justify-center text-3xl overflow-hidden">
      {exp.photos?.[0] ? <img src={exp.photos[0]} alt={exp.title} className="w-full h-full object-cover rounded-lg"/> : '📍'}
    </div>
    <p className="font-bold text-sm text-gray-900 leading-tight mb-1">{exp.title}</p>
    <p className="text-xs text-gray-500">{exp.location?.city} · {exp.duration} min</p>
    <p className="text-orange-500 font-bold text-sm mt-1">{formatPrice(exp.price)} / person</p>
  </div>
)

const ExperienceMap = ({ experiences = [], center }) => {
  const navigate  = useNavigate()
  const mapCenter = getCenter(experiences, center)
  const zoom      = center ? 13 : experiences?.length === 1 ? 13 : 11

  return (
    <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }} zoomControl={true}>
      <MapRecenter center={mapCenter} zoom={zoom} />
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='© OpenStreetMap contributors'/>

      {experiences.map((exp) => {
        const coords = exp.location?.coordinates?.coordinates
        const hasValidCoords = coords && coords[0] !== 0 && coords[1] !== 0

        const position = hasValidCoords
          ? [coords[1], coords[0]]
          : CITY_COORDS[exp.location?.city?.toLowerCase().trim()]

        if (!position) return null

        return (
          <Marker key={exp._id} position={position} icon={createPin(exp.price)}>
            <Popup><ExperiencePopup exp={exp} navigate={navigate} /></Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}

export default ExperienceMap