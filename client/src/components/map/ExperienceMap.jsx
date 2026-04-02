import { useEffect, useMemo } from 'react';
import { divIcon } from 'leaflet';
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet';

const DEFAULT_CENTER = [30.3753, 69.3451];

const isValidLatLng = (value) => {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    Number.isFinite(value[0]) &&
    Number.isFinite(value[1])
  );
};

const buildMarkerIcon = (label) => {
  const isTerminal = label === 'Start' || label === 'End';
  const bgColor = isTerminal ? '#facc15' : '#064e3b';
  const textColor = isTerminal ? '#0f172a' : '#ffffff';
  const borderColor = isTerminal ? '#ca8a04' : '#022c22';

  return divIcon({
    className: 'itinerary-pin-wrap',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    html: `<div style="height:34px;width:34px;border-radius:9999px;display:flex;align-items:center;justify-content:center;background:${bgColor};color:${textColor};font-size:12px;font-weight:700;border:2px solid ${borderColor};box-shadow:0 6px 16px rgba(15,23,42,0.22);">${label}</div>`,
  });
};

const ViewportController = ({ center, markers, polyline }) => {
  const map = useMap();

  const markerKey = markers.map((marker) => marker.position.join(',')).join('|');
  const lineKey = polyline.map((point) => point.join(',')).join('|');

  useEffect(() => {
    if (polyline.length > 1) {
      map.fitBounds(polyline, { padding: [35, 35] });
      return;
    }

    if (markers.length > 0) {
      map.setView(markers[0].position, 12);
      return;
    }

    map.setView(center, 11);
  }, [map, center, markerKey, lineKey, markers, polyline]);

  return null;
};

export default function ExperienceMap({ center = DEFAULT_CENTER, markers = [], polyline = [] }) {
  const safeCenter = isValidLatLng(center) ? center : DEFAULT_CENTER;

  const normalizedMarkers = useMemo(
    () => markers.filter((marker) => isValidLatLng(marker?.position)),
    [markers]
  );

  const normalizedPolyline = useMemo(
    () => polyline.filter((point) => isValidLatLng(point)),
    [polyline]
  );

  return (
    <MapContainer center={safeCenter} zoom={11} className="h-full w-full" scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ViewportController center={safeCenter} markers={normalizedMarkers} polyline={normalizedPolyline} />

      {normalizedPolyline.length > 1 ? (
        <Polyline positions={normalizedPolyline} pathOptions={{ color: '#0f766e', weight: 4, opacity: 0.85 }} />
      ) : null}

      {normalizedMarkers.map((marker, index) => (
        <Marker
          key={marker.key || `${marker.label || 'marker'}-${index}`}
          position={marker.position}
          icon={buildMarkerIcon(marker.label || `${index + 1}`)}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            {marker.label || `Stop ${index + 1}`}
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
