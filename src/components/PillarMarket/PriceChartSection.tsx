import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  ReferenceLine,
  Legend
} from 'recharts';
import { Sparkles, TrendingUp, Calendar, Info, BarChart2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AI_PREDICTION_MODELS } from '../../data/mockData';

export const PriceChartSection: React.FC = () => {
  const { crops, selectedCropId } = useApp();
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1W');

  const currentCrop = crops.find(c => c.id === selectedCropId) || crops[0];
  const prediction = AI_PREDICTION_MODELS[selectedCropId] || AI_PREDICTION_MODELS.wheat;

  // Chart data formatting
  const chartData = prediction.forecastData.map(item => ({
    name: item.day,
    actual: item.actualPrice,
    predicted: item.predictedPrice,
    upperBand: item.upperBand,
    lowerBand: item.lowerBand,
    msp: currentCrop.mspRate
  }));

  const mspSpread = currentCrop.currentPrivatePrice - currentCrop.mspRate;

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md text-[11px] font-bold">
              AgroAI Forecast Engine
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Historical Spot + 7-Day Machine Learning Projection
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1.5">
            <span className="text-2xl font-black font-mono text-slate-900">
              ₹{currentCrop.currentPrivatePrice.toLocaleString('en-IN')}/Qtl
            </span>
            <span className={`text-xs font-bold flex items-center gap-0.5 ${
              currentCrop.priceChange24h >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}>
              <TrendingUp className="w-3.5 h-3.5" />
              {currentCrop.priceChange24h >= 0 ? `+${currentCrop.priceChange24h}%` : `${currentCrop.priceChange24h}%`} (24h)
            </span>
            <span className="text-xs font-semibold text-slate-500">
              MSP Baseline: <span className="font-mono text-slate-700">₹{currentCrop.mspRate}/Qtl</span>
              <span className={`ml-1 font-bold ${mspSpread >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                ({mspSpread >= 0 ? `+₹${mspSpread}` : `-₹${Math.abs(mspSpread)}`})
              </span>
            </span>
          </div>
        </div>

        {/* Timeframe Toggles */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto">
          {(['1D', '1W', '1M', '1Y'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                timeframe === tf
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 sm:h-80 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 15, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="predictedBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 11, fill: '#64748b' }} 
              axisLine={{ stroke: '#cbd5e1' }}
            />
            <YAxis 
              domain={['dataMin - 150', 'dataMax + 150']} 
              tick={{ fontSize: 11, fill: '#64748b' }}
              axisLine={{ stroke: '#cbd5e1' }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '12px',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                padding: '10px 14px'
              }}
              formatter={(value: any, name: any) => {
                if (name === 'actual') return [`₹${value}/Qtl`, 'Actual Spot Price'];
                if (name === 'predicted') return [`₹${value}/Qtl`, 'AI Forecast'];
                if (name === 'upperBand') return [`₹${value}/Qtl`, 'Forecast Ceiling'];
                if (name === 'lowerBand') return [`₹${value}/Qtl`, 'Forecast Floor'];
                if (name === 'msp') return [`₹${value}/Qtl`, 'Govt MSP Baseline'];
                return [value, name];
              }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }}
            />

            {/* Govt MSP Reference Line */}
            <ReferenceLine 
              y={currentCrop.mspRate} 
              stroke="#e11d48" 
              strokeDasharray="4 4" 
              label={{ value: `Official MSP ₹${currentCrop.mspRate}`, fill: '#e11d48', fontSize: 11, position: 'right' }} 
            />

            {/* AI Confidence Band */}
            <Area 
              type="monotone" 
              dataKey="upperBand" 
              stroke="transparent" 
              fill="url(#predictedBand)" 
              name="Confidence Range" 
            />

            {/* Actual Spot Price (solid line) */}
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke="#10b981" 
              strokeWidth={3} 
              dot={{ r: 4, fill: '#10b981' }} 
              name="Actual Spot Price" 
            />

            {/* AI Predicted Curve (dashed purple line) */}
            <Line 
              type="monotone" 
              dataKey="predicted" 
              stroke="#6366f1" 
              strokeWidth={3} 
              strokeDasharray="5 5" 
              dot={{ r: 4, fill: '#6366f1' }} 
              name="AI Predicted Trajectory" 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Insight Note */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Actual Mandi Price</span>
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 ml-2"></span>
          <span>7-Day AI Projection</span>
          <span className="w-3 h-0.5 bg-rose-500 ml-2"></span>
          <span>Govt MSP Floor</span>
        </div>
        <span className="text-indigo-700 font-semibold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" />
          Model Confidence: {prediction.confidenceScore}% (Updated every 15 min)
        </span>
      </div>
    </div>
  );
};
