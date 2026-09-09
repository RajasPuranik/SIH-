import React from 'react';
import { 
  TrendingUp, 
  Sparkles, 
  BarChart2, 
  Users, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import { PriceChartSection } from './PriceChartSection';
import { AIPredictionCard } from './AIPredictionCard';
import { OrderBookSection } from './OrderBookSection';
import { DistrictRateMap } from './DistrictRateMap';
import { useApp } from '../../context/AppContext';
import { useLanguage } from '../../context/LanguageContext';

export const CropStockExchangeView: React.FC = () => {
  const { crops, selectedCropId, setSelectedCropId } = useApp();
  const { t } = useLanguage();

  const currentCrop = crops.find(c => c.id === selectedCropId) || crops[0];

  return (
    <div className="space-y-6">
      {/* Pillar Header Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Background decorative watermark */}
        <div className="absolute right-4 bottom-2 opacity-10 pointer-events-none text-9xl">
          📈
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider mb-3">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Pillar 2: Crop Stock Exchange (Private Market)</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Market-Driven Bids, Real-Time Depth & AI Forecasts
          </h1>

          <p className="mt-2 text-indigo-100 text-sm sm:text-base leading-relaxed">
            Sell directly to top flour mills, food processors, edible oil extractors, and institutional buyers (ITC, Cargill, Adani). Match bids with guaranteed Agri-Escrow lock and benefit from AI harvest price projections.
          </p>

          {/* Quick Metrics Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-indigo-800/60">
            <div>
              <span className="text-[11px] text-indigo-300 font-medium block">Market Dynamics</span>
              <span className="text-sm sm:text-base font-bold text-white">
                Market-Driven Price
              </span>
            </div>

            <div>
              <span className="text-[11px] text-indigo-300 font-medium block">Participating Buyers</span>
              <span className="text-sm sm:text-base font-bold text-amber-300">
                100+ Verified Mills
              </span>
            </div>

            <div>
              <span className="text-[11px] text-indigo-300 font-medium block">Matching Engine</span>
              <span className="text-sm sm:text-base font-bold text-emerald-400">
                Real-Time Match
              </span>
            </div>

            <div>
              <span className="text-[11px] text-indigo-300 font-medium block">Payment Security</span>
              <span className="text-sm sm:text-base font-bold text-white flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Agri-Escrow Lock
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Commodity Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
          Select Commodity:
        </span>
        {crops.map((crop) => (
          <button
            key={crop.id}
            onClick={() => setSelectedCropId(crop.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer ${
              crop.id === selectedCropId
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs'
            }`}
          >
            <span>{crop.name}</span>
            <span className="font-mono opacity-80">₹{crop.currentPrivatePrice}</span>
          </button>
        ))}
      </div>

      {/* Grid: AI Decision Card + Main Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChartSection />
        </div>
        <div>
          <AIPredictionCard />
        </div>
      </div>

      {/* Order Book & Matching Engine */}
      <OrderBookSection />

      {/* District-wise Rates & Freight Calculator */}
      <DistrictRateMap />
    </div>
  );
};
