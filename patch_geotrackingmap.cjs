const fs = require('fs');
let content = fs.readFileSync('src/components/Map/GeoTrackingMap.tsx', 'utf8');

// We will overwrite the entire file because it's a small file and we want to add a lot of logic for Shipments
const newContent = `import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation, Truck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Fix Leaflet's default icon path issues in Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const truckIcon = L.divIcon({
  html: '<div style="font-size: 20px; background: white; border: 2px solid #ea580c; border-radius: 50%; padding: 4px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">🚚</div>',
  className: 'truck-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16]
});

export const GeoTrackingMap: React.FC = () => {
  const { shipments, currentUser } = useApp();
  
  // Find an active shipment for the user
  const activeShipment = shipments.find(s => 
    (s.farmerId === currentUser?.id || s.buyerId === currentUser?.id || s.shipperId === currentUser?.id) && 
    (s.status === 'IN_TRANSIT' || s.status === 'PENDING_ACCEPTANCE')
  );

  const [truckPos, setTruckPos] = useState<[number, number] | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!activeShipment || activeShipment.status !== 'IN_TRANSIT') return;
    
    // Simulate moving from pickup to dropoff over 30 seconds
    const duration = 30000;
    const updateInterval = 100;
    const steps = duration / updateInterval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep >= steps) {
        clearInterval(timer);
        return;
      }
      
      const p = currentStep / steps;
      setProgress(p * 100);
      
      const lat = activeShipment.pickupLocation.lat + (activeShipment.dropoffLocation.lat - activeShipment.pickupLocation.lat) * p;
      const lng = activeShipment.pickupLocation.lng + (activeShipment.dropoffLocation.lng - activeShipment.pickupLocation.lng) * p;
      
      setTruckPos([lat, lng]);
    }, updateInterval);

    return () => clearInterval(timer);
  }, [activeShipment]);

  if (!activeShipment) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center h-[500px]">
        <MapPin className="w-12 h-12 text-slate-300 mb-4" />
        <h3 className="text-lg font-bold text-slate-700">No Active Shipments</h3>
        <p className="text-slate-500 font-medium text-sm mt-1">You don't have any shipments currently in transit.</p>
      </div>
    );
  }

  const start: [number, number] = [activeShipment.pickupLocation.lat, activeShipment.pickupLocation.lng];
  const end: [number, number] = [activeShipment.dropoffLocation.lat, activeShipment.dropoffLocation.lng];
  const route: [number, number][] = [start, end];

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Truck className="w-5 h-5 text-orange-600" /> 
            Live Shipment Tracking
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">Status: <span className="font-bold text-orange-600">{activeShipment.status}</span></p>
        </div>
        {activeShipment.status === 'IN_TRANSIT' && (
          <div className="text-right">
            <div className="text-xs font-bold text-slate-600 mb-1">Transit Progress</div>
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 transition-all duration-100" style={{ width: \`\${progress}%\` }}></div>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative z-0 h-[450px]">
        <MapContainer 
          center={start} 
          zoom={6} 
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <Marker position={start}>
            <Popup>
              <div className="font-bold">Pickup Location</div>
              <div className="text-xs">{activeShipment.pickupLocation.address}</div>
            </Popup>
          </Marker>

          <Marker position={end}>
            <Popup>
              <div className="font-bold">Dropoff Location</div>
              <div className="text-xs">{activeShipment.dropoffLocation.address}</div>
            </Popup>
          </Marker>

          {truckPos && activeShipment.status === 'IN_TRANSIT' && (
            <Marker position={truckPos} icon={truckIcon}>
              <Popup>
                <div className="font-bold text-orange-600">Delivery Truck</div>
                <div className="text-xs">In Transit to Destination</div>
              </Popup>
            </Marker>
          )}

          <Polyline 
            positions={route} 
            color="#0ea5e9" 
            weight={4}
            opacity={0.6}
            dashArray="10, 10"
          />
        </MapContainer>
      </div>
    </div>
  );
};
`;

fs.writeFileSync('src/components/Map/GeoTrackingMap.tsx', newContent);
