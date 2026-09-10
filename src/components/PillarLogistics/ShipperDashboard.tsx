import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MapPin, Truck, CheckCircle2, XCircle, Navigation, DollarSign } from 'lucide-react';
import { Shipment } from '../../types';

export const ShipperDashboard: React.FC = () => {
  const { shipments, updateShipmentStatus, currentUser } = useApp();
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(shipments[0] || null);

  const availableShipments = shipments.filter(s => s.status === 'PENDING_ACCEPTANCE');
  const myShipments = shipments.filter(s => s.shipperId === currentUser?.id);

  const handleAccept = (id: string) => {
    updateShipmentStatus(id, 'IN_TRANSIT');
    setSelectedShipment(prev => prev?.id === id ? { ...prev, status: 'IN_TRANSIT' } : prev);
  };

  const handleDeliver = (id: string) => {
    updateShipmentStatus(id, 'DELIVERED');
    setSelectedShipment(prev => prev?.id === id ? { ...prev, status: 'DELIVERED' } : prev);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Truck className="w-6 h-6 text-orange-600" /> Transporter & Logistics Dashboard
        </h2>
        <p className="text-sm text-slate-500 mt-1">Accept delivery jobs and navigate routes in real-time.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Job Board */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4 max-h-[600px] overflow-y-auto">
          <h3 className="font-bold text-slate-800 border-b pb-2">Available Jobs ({availableShipments.length})</h3>
          
          {availableShipments.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">No pending delivery requests.</p>
          )}

          {availableShipments.map(s => (
            <div 
              key={s.id} 
              onClick={() => setSelectedShipment(s)}
              className={`p-4 rounded-xl border cursor-pointer transition ${selectedShipment?.id === s.id ? 'border-orange-500 bg-orange-50' : 'border-slate-200 hover:border-orange-300'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-500 uppercase">{s.id}</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> {s.priceOffered.toLocaleString('en-IN')}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm mb-1">{s.cropName} • {s.quantityQuintals} Qtl</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-red-500"/> {s.pickupLocation.address}</div>
                <div className="flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-500"/> {s.dropoffLocation.address}</div>
              </div>
            </div>
          ))}

          <h3 className="font-bold text-slate-800 border-b pb-2 pt-4">My Deliveries ({myShipments.length})</h3>
          {myShipments.map(s => (
            <div 
              key={s.id}
              onClick={() => setSelectedShipment(s)}
              className={`p-4 rounded-xl border cursor-pointer transition ${selectedShipment?.id === s.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-500">{s.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${s.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {s.status}
                </span>
              </div>
              <h4 className="font-bold text-slate-900 text-sm">{s.cropName}</h4>
            </div>
          ))}
        </div>

        {/* Map View */}
        <div className="lg:col-span-2 bg-slate-100 rounded-2xl border border-slate-200 p-2 relative min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Simulated Map Visual */}
          <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=20.5937,78.9629&zoom=5&size=800x600&maptype=roadmap&key=mock')] opacity-30 bg-cover bg-center pointer-events-none" />
          
          {selectedShipment ? (
            <div className="absolute inset-4 bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-xl border border-slate-200 flex flex-col z-10">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Route Details</h3>
              
              <div className="flex-1 space-y-6 relative">
                {/* Route visualization */}
                <div className="absolute left-3 top-6 bottom-6 w-0.5 bg-slate-300"></div>
                
                <div className="flex items-start gap-4 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-red-100 border-2 border-red-500 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-600 uppercase">Pickup Location</div>
                    <div className="font-bold text-slate-800">{selectedShipment.pickupLocation.address}</div>
                    <div className="text-xs text-slate-500">Farmer: {selectedShipment.farmerName}</div>
                  </div>
                </div>

                <div className="flex items-start gap-4 relative z-10 pt-4">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 border-2 border-emerald-500 flex items-center justify-center mt-0.5 shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-emerald-600 uppercase">Dropoff Location</div>
                    <div className="font-bold text-slate-800">{selectedShipment.dropoffLocation.address}</div>
                    <div className="text-xs text-slate-500">Distance: {selectedShipment.distanceKm} km</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-200 flex gap-3">
                {selectedShipment.status === 'PENDING_ACCEPTANCE' && (
                  <>
                    <button 
                      onClick={() => handleAccept(selectedShipment.id)}
                      className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-5 h-5" /> Accept Job for ₹{selectedShipment.priceOffered.toLocaleString('en-IN')}
                    </button>
                    <button className="px-6 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                      <XCircle className="w-5 h-5" /> Reject
                    </button>
                  </>
                )}
                {selectedShipment.status === 'IN_TRANSIT' && (
                  <button 
                    onClick={() => handleDeliver(selectedShipment.id)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <Navigation className="w-5 h-5" /> Mark as Delivered
                  </button>
                )}
                {selectedShipment.status === 'DELIVERED' && (
                  <div className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> Delivery Completed
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-slate-500">Select a job to view route details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
