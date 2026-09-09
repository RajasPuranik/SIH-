import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ShieldCheck, 
  ArrowRight, 
  Sun, 
  Warehouse, 
  CheckCircle2,
  BrainCircuit
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AI_PREDICTION_MODELS } from '../../data/mockData';

export const AIPredictionCard: React.FC = () => {
  const { crops, selectedCropId, setActivePillar } = useApp();
  const currentCrop = crops.find(c => c.id === selectedCropId) || crops[0];
  const prediction = AI_PREDICTION_MODELS[selectedCropId] || AI_PREDICTION_MODELS.wheat;

  const priceDiff = prediction.predictedPrice7Days - prediction.currentAvgPrice;
  const percentGain = ((priceDiff / prediction.currentAvgPrice) * 100).toFixed(1);

  const isHold = prediction.recommendation.includes('HOLD');
  const isPrivateBelowMSP = currentCrop.currentPrivatePrice < currentCrop.mspRate;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden border border-indigo-800/40">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-indigo-800/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide">AgroAI Decision Intelligence</h3>
            <p className="text-[11px] text-indigo-300">Predictive Machine Learning Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 border border-indigo-400/30 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{prediction.confidenceScore}% Confidence</span>
        </div>
      </div>

      {/* Main Verdict & Target */}
      <div className="py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-bold text-indigo-300 tracking-wider block">
            Harvest Advisory Recommendation
          </span>
          <div className="flex items-center gap-3 mt-1">
            <span className={`text-2xl sm:text-3xl font-black px-3 py-1 rounded-xl tracking-tight shadow-md ${
              isHold
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-400 text-slate-950'
            }`}>
              {prediction.recommendation.replace('_', ' ')}
            </span>

            <div className="text-xs font-medium text-slate-200">
              {isHold ? (
                <span className="text-emerald-400 flex items-center gap-1 font-bold">
                  <TrendingUp className="w-4 h-4" /> Projected +{percentGain}% Gain in 7 Days
                </span>
              ) : (
                <span className="text-amber-300 flex items-center gap-1 font-bold">
                  <TrendingDown className="w-4 h-4" /> Softening Prices Ahead
                </span>
              )}
              <span className="text-[11px] text-slate-400 block">
                Target: ₹{prediction.predictedPrice7Days}/Qtl (Currently: ₹{prediction.currentAvgPrice})
              </span>
            </div>
          </div>
        </div>

        {/* Special Banner if Private Price is Below MSP */}
        {isPrivateBelowMSP && (
          <div className="bg-rose-950/80 border border-rose-600/50 p-3.5 rounded-xl max-w-xs">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Private Rate Below Govt MSP!</span>
            </div>
            <p className="text-[11px] text-rose-200 mt-1">
              Private buyers offering ₹{currentCrop.currentPrivatePrice}, but Govt MSP is ₹{currentCrop.mspRate}. Switch to Pillar 1 to lock in the higher price.
            </p>
            <button
              onClick={() => setActivePillar('govt')}
              className="mt-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-600 px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1"
            >
              <span>Book Pillar 1 MSP Slot →</span>
            </button>
          </div>
        )}
      </div>

      {/* Driving Factors List */}
      <div className="border-t border-indigo-800/40 pt-4 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 block">
          Key Market Drivers Analyzed by AI:
        </span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {prediction.drivingFactors.map((factor, i) => (
            <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-200 mb-1">
                <span>{factor.title}</span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                  factor.impact === 'positive' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                    : factor.impact === 'negative' 
                    ? 'bg-rose-950 text-rose-300 border border-rose-800' 
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {factor.impact}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {factor.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
