import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation } from 'lucide-react';

// Fix Leaflet's default icon path issues in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Mock Mandi locations
const MANDI_LOCATIONS = [
  { id: 'indore', name: 'Indore APMC Mandi', lat: 22.7196, lon: 75.8577 },
  { id: 'bhopal', name: 'Bhopal Karond Mandi', lat: 23.2599, lon: 77.4126 },
  { id: 'ujjain', name: 'Ujjain Krishi Upaj Mandi', lat: 23.1765, lon: 75.7885 },
];

export const GeoTrackingMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [nearestMandi, setNearestMandi] = useState<typeof MANDI_LOCATIONS[0] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation([latitude, longitude]);

        // Find nearest mandi
        let closest = MANDI_LOCATIONS[0];
        let minDistance = Infinity;

        MANDI_LOCATIONS.forEach((mandi) => {
          const dist = Math.sqrt(
            Math.pow(mandi.lat - latitude, 2) + Math.pow(mandi.lon - longitude, 2)
          );
          if (dist < minDistance) {
            minDistance = dist;
            closest = mandi;
          }
        });

        setNearestMandi(closest);
      },
      (err) => {
        setError('Unable to retrieve your location');
        console.error(err);
      }
    );
  }, []);

  if (error) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-slate-500 font-medium">{error}</p>
      </div>
    );
  }

  if (!userLocation || !nearestMandi) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center animate-pulse">
        <MapPin className="w-8 h-8 text-emerald-300 mb-2" />
        <p className="text-slate-500 font-medium text-sm">Locating you & finding nearest Mandi...</p>
      </div>
    );
  }

  const route: [number, number][] = [
    userLocation,
    [nearestMandi.lat, nearestMandi.lon]
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col mt-6">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-600" />
          <h3 className="font-bold text-slate-800">Live Journey Tracking</h3>
        </div>
        <div className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
          Navigating to {nearestMandi.name}
        </div>
      </div>
      
      <div className="h-[400px] w-full relative z-0">
        <MapContainer 
          center={userLocation} 
          zoom={10} 
          scrollWheelZoom={false} 
          style={{ width: '100%', height: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={userLocation}>
            <Popup>
              <div className="font-bold text-slate-800">Your Location</div>
            </Popup>
          </Marker>
          <Marker position={[nearestMandi.lat, nearestMandi.lon]}>
            <Popup>
              <div className="font-bold text-emerald-700">{nearestMandi.name}</div>
            </Popup>
          </Marker>
          <Polyline positions={route} color="#059669" weight={4} dashArray="8, 10" />
        </MapContainer>
      </div>
    </div>
  );
};
