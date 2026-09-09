import React, { useState } from 'react';
import { 
  MapPin, 
  Truck, 
  Clock, 
  Calculator, 
  ArrowRight, 
  Info, 
  CheckCircle2,
  Navigation
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DISTRICT_RATES } from '../../data/mockData';

export const DistrictRateMap: React.FC = () => {
  const { selectedCropId, crops } = useApp();
  const currentCrop = crops.find(c => c.id === selectedCropId) || crops[0];

  const [farmerDistance, setFarmerDistance] = useState<number>(15);
  const [dieselFreightPerKmQtl, setDieselFreightPerKmQtl] = useState<number>(1.2); // ₹1.2 per quintal per km

  // Filter rates for current crop or fallback to wheat
  const rates = DISTRICT_RATES.filter(r => r.cropId === selectedCropId);
  const displayRates = rates.length > 0 ? rates : DISTRICT_RATES.filter(r => r.cropId === 'wheat');

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              District-Wise Mandi Comparison
            </span>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-[10px] font-bold">
              Regional Price Disparity Engine
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Compare Live Mandi Rates for {currentCrop.name}
          </h3>
          <p className="text-xs text-slate-500">
            Compare prices across neighboring district yards and factor in your transportation costs.
          </p>
        </div>

        {/* Dynamic Freight Calculator Inputs */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold text-slate-700">Estimated Transport Cost:</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-slate-500 font-mono">₹{dieselFreightPerKmQtl} / Qtl / Km</span>
          </div>
        </div>
      </div>

      {/* Mandis Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-4">District & Mandi Name</th>
              <th className="py-3 px-3">Modal Rate (₹/Qtl)</th>
              <th className="py-3 px-3">Range (Min - Max)</th>
              <th className="py-3 px-3">Arrival Volume</th>
              <th className="py-3 px-3">Distance & Freight</th>
              <th className="py-3 px-3">Net Realization</th>
              <th className="py-3 px-4">Queue Congestion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {displayRates.map((mandi, idx) => {
              const freight = Math.round(mandi.distanceKmFromUser * dieselFreightPerKmQtl);
              const netPrice = mandi.modalPrice - freight;

              const isBestNet = idx === 0 || netPrice >= 2560;

              return (
                <tr key={mandi.mandiName} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-bold text-slate-900 block">{mandi.mandiName}</span>
                        <span className="text-[11px] text-slate-500">{mandi.district} District</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 font-mono font-bold text-slate-900 text-sm">
                    ₹{mandi.modalPrice}
                  </td>

                  <td className="py-3.5 px-3 text-slate-500 font-mono">
                    ₹{mandi.minPrice} - ₹{mandi.maxPrice}
                  </td>

                  <td className="py-3.5 px-3 font-mono text-slate-700">
                    {mandi.arrivalVolumeQuintals.toLocaleString()} Qtl
                  </td>

                  <td className="py-3.5 px-3 text-slate-600">
                    <span className="font-semibold text-slate-800">{mandi.distanceKmFromUser} km</span>
                    <span className="block text-[10px] text-slate-400">(-₹{freight}/Qtl freight)</span>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-emerald-700 text-sm">
                        ₹{netPrice}/Qtl
                      </span>
                      {isBestNet && (
                        <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold uppercase">
                          Best Net Return
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        mandi.congestionLevel === 'Low' 
                          ? 'bg-emerald-500' 
                          : mandi.congestionLevel === 'Moderate' 
                          ? 'bg-amber-500' 
                          : 'bg-rose-500'
                      }`} />
                      <span className="text-slate-700 font-semibold">{mandi.congestionLevel}</span>
                      <span className="text-[11px] text-slate-400">({mandi.estimatedWaitMinutes}m wait)</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Advisory Callout */}
      <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200 flex items-start gap-3 text-xs">
        <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-indigo-950">
            Smart Logistics Advisory: Don't just chase the highest sticker price!
          </span>
          <p className="text-indigo-800 text-[11px] mt-0.5">
            Dhar Mandi offers ₹2,640/Qtl, but requires 62 km transport (-₹70 freight) and has a 75-minute queue. Indore Mandi (12 km away) yields a net in-hand realization of ₹2,555/Qtl with only 20 minutes wait.
          </p>
        </div>
      </div>
    </div>
  );
};
