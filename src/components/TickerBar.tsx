import React from 'react';
import { TrendingUp, TrendingDown, ShieldAlert, Sparkles } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';

export const TickerBar: React.FC = () => {
  const { crops, selectedCropId, setSelectedCropId } = useApp();
  const { t } = useLanguage();

  const getCropTranslatedName = (cropId: string, fallbackName: string) => {
    const map: Record<string, string> = {
      wheat: 'cropWheat',
      mustard: 'cropMustard',
      soybean: 'cropSoybean',
      chana: 'cropChana',
      cotton: 'cropCotton',
      paddy: 'cropPaddy'
    };
    const key = map[cropId];
    return key ? t(key) : fallbackName.split(' ')[0];
  };

  return (
    <div className="bg-slate-900 text-slate-100 border-b border-slate-800 py-2.5 overflow-x-auto shadow-inner select-none">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between min-w-max gap-6">
        <div className="flex items-center gap-2 pr-4 border-r border-slate-700">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            {t('agriTickerLive')}:
          </span>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto py-0.5">
          {crops.map((crop) => {
            const spread = crop.currentPrivatePrice - crop.mspRate;
            const isAboveMSP = spread >= 0;
            const isSelected = crop.id === selectedCropId;
            const displayName = getCropTranslatedName(crop.id, crop.name);

            return (
              <div
                key={crop.id}
                onClick={() => setSelectedCropId(crop.id)}
                className={`flex items-center gap-2.5 px-3 py-1 rounded-lg text-xs cursor-pointer transition border ${
                  isSelected 
                    ? 'bg-slate-800 border-emerald-500/50 shadow-xs' 
                    : 'bg-slate-850 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="font-semibold text-slate-200">
                  {displayName}
                </div>

                <div className="font-mono font-bold text-white">
                  ₹{crop.currentPrivatePrice.toLocaleString('en-IN')}/Qtl
                </div>

                {crop.priceChange24h >= 0 ? (
                  <span className="flex items-center text-emerald-400 text-[11px] font-semibold">
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                    +{crop.priceChange24h}%
                  </span>
                ) : (
                  <span className="flex items-center text-rose-400 text-[11px] font-semibold">
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                    {crop.priceChange24h}%
                  </span>
                )}

                <div className="text-[10px] text-slate-400 border-l border-slate-700 pl-2">
                  MSP: <span className="font-mono text-slate-300">₹{crop.mspRate}</span>
                </div>

                {isAboveMSP ? (
                  <span className="text-[9px] px-1.5 py-0.2 bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 rounded font-medium">
                    +₹{spread} {t('vsMSP')}
                  </span>
                ) : (
                  <span className="text-[9px] px-1.5 py-0.2 bg-amber-950/80 text-amber-300 border border-amber-800/40 rounded font-medium flex items-center gap-0.5">
                    <ShieldAlert className="w-2.5 h-2.5" />
                    {t('sellOnGovtMSP')}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 pl-4 border-l border-slate-700">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('mandiSynced')}</span>
        </div>
      </div>
    </div>
  );
};
