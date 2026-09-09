import React, { useState } from 'react';
import { 
  PhoneCall, 
  MessageSquare, 
  X, 
  Send, 
  Mic, 
  Volume2, 
  CheckCheck, 
  PhoneForwarded, 
  PhoneOff,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const IVRSMSSimulatorModal: React.FC = () => {
  const { isIVRModalOpen, setIsIVRModalOpen, bookings, crops, playFeedbackTone } = useApp();
  const [activeTab, setActiveTab] = useState<'sms' | 'ivr'>('sms');

  // SMS Simulator State
  const [smsInput, setSmsInput] = useState('STATUS KT-MP-2026-9041');
  const [smsMessages, setSmsMessages] = useState<{ sender: 'farmer' | 'system'; text: string; time: string }[]>([
    {
      sender: 'system',
      text: 'KisanTrack SMS Gateway (56161): Reply STATUS <Token> to check status, or MSP <Crop> for today\'s price.',
      time: '10:00 AM'
    }
  ]);

  // IVR Simulator State
  const [callActive, setCallActive] = useState(false);
  const [callLog, setCallLog] = useState<string[]>([
    'Dial 1800-180-1551 (Toll-Free Kisan Call Center) to begin...'
  ]);

  if (!isIVRModalOpen) return null;

  const handleSendSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!smsInput.trim()) return;

    const query = smsInput.trim().toUpperCase();
    const userMsg = smsInput.trim();
    setSmsInput('');
    playFeedbackTone('ping');

    setSmsMessages(prev => [
      ...prev,
      { sender: 'farmer', text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);

    setTimeout(() => {
      let reply = '';
      if (query.startsWith('STATUS')) {
        const token = query.replace('STATUS', '').trim();
        const found = bookings.find(b => b.tokenNumber.toUpperCase().includes(token));
        if (found) {
          reply = `KisanTrack: Token ${found.tokenNumber} is at [${found.status.replace(/_/g, ' ')}]. Mandi: ${found.mandiName}. Ramp: 4A. Gate wait: ~12m. Guaranteed MSP: ₹${found.paymentDetails?.mspRatePerQuintal}/Qtl.`;
        } else {
          reply = `KisanTrack: Token ${token || 'specified'} not found. Example syntax: STATUS KT-MP-2026-9041.`;
        }
      } else if (query.startsWith('MSP')) {
        const cropName = query.replace('MSP', '').trim().toLowerCase();
        const crop = crops.find(c => c.id.toLowerCase().includes(cropName) || c.name.toLowerCase().includes(cropName));
        if (crop) {
          reply = `KisanTrack MSP: ${crop.name} official MSP is ₹${crop.mspRate}/Qtl (${crop.minSupportPriceYear}). Private market rate: ₹${crop.currentPrivatePrice}/Qtl.`;
        } else {
          reply = `KisanTrack MSP: Wheat ₹2425/Qtl, Mustard ₹5950/Qtl, Chana ₹5650/Qtl, Soybean ₹4892/Qtl.`;
        }
      } else {
        reply = 'KisanTrack: Invalid keyword. Text STATUS <Token> (e.g. STATUS KT-MP-2026-9041) or MSP <Crop> (e.g. MSP WHEAT).';
      }

      setSmsMessages(prev => [
        ...prev,
        { sender: 'system', text: reply, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
      playFeedbackTone('success');
    }, 600);
  };

  const startCall = () => {
    setCallActive(true);
    playFeedbackTone('ping');
    setCallLog([
      'Connected to 1800-180-1551 (KisanTrack Automated Interactive Voice Portal)',
      '🔊 "नमस्ते किसान भाई! किसानट्रैक में आपका स्वागत है।"',
      '🔊 "Press 1 for Token Status | प्रेस 1: टोकन स्थिति जानने के लिए"',
      '🔊 "Press 2 for Today\'s Mandi MSP Rates | प्रेस 2: आज के न्यूनतम समर्थन मूल्य के लिए"',
      '🔊 "Press 3 to Speak with APMC Helpdesk | प्रेस 3: मंडी अधिकारी से बात करने के लिए"'
    ]);
  };

  const handleKeypadPress = (digit: string) => {
    playFeedbackTone('ping');
    if (digit === '1') {
      const b = bookings[0];
      setCallLog(prev => [
        ...prev,
        `[You pressed 1]`,
        `🔊 "आपका टोकन ${b.tokenNumber} जाँचा जा रहा है..."`,
        `🔊 "वर्तमान स्थिति: ${b.status.replace(/_/g, ' ')}. मंडी: ${b.mandiName}. अनुमानित प्रतीक्षा समय: 15 मिनट।"`
      ]);
    } else if (digit === '2') {
      setCallLog(prev => [
        ...prev,
        `[You pressed 2]`,
        `🔊 "आज के सरकारी भाव: गेहूँ ₹2,425 प्रति क्विंटल, सरसों ₹5,950 प्रति क्विंटल, सोयाबीन ₹4,892 प्रति क्विंटल।"`
      ]);
    } else if (digit === '3') {
      setCallLog(prev => [
        ...prev,
        `[You pressed 3]`,
        `🔊 "आपकी कॉल इंदौर मंडी सहायता केंद्र अधिकारी को स्थानांतरित की जा रही है... कृपया प्रतीक्षा करें।"`,
        `Connected to Mandi Desk: "नमस्ते, आपकी क्या सहायता कर सकते हैं?"`
      ]);
    }
  };

  const endCall = () => {
    setCallActive(false);
    playFeedbackTone('alert');
    setCallLog(prev => [...prev, 'Call disconnected.']);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Feature Phone Multi-Channel Simulator</h3>
              <p className="text-[11px] text-slate-400">Offline & 2G Voice/SMS Support for Rural Farmers</p>
            </div>
          </div>
          <button 
            onClick={() => setIsIVRModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('sms')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'sms'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Interactive SMS (56161)</span>
          </button>
          <button
            onClick={() => setActiveTab('ivr')}
            className={`py-3 flex items-center justify-center gap-2 border-b-2 transition cursor-pointer ${
              activeTab === 'ivr'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>Toll-Free IVR (1800-180-1551)</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4">
          {activeTab === 'sms' ? (
            <div className="space-y-3">
              <div className="h-64 overflow-y-auto bg-slate-100 rounded-xl p-3 space-y-2 text-xs">
                {smsMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col ${msg.sender === 'farmer' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-2.5 rounded-xl ${
                        msg.sender === 'farmer'
                          ? 'bg-emerald-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 rounded-bl-none shadow-xs border border-slate-200'
                      }`}
                    >
                      <p>{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Suggestions */}
              <div className="flex gap-1.5 flex-wrap text-[10px]">
                <button
                  type="button"
                  onClick={() => setSmsInput('STATUS KT-MP-2026-9041')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300"
                >
                  STATUS KT-MP-2026-9041
                </button>
                <button
                  type="button"
                  onClick={() => setSmsInput('MSP WHEAT')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300"
                >
                  MSP WHEAT
                </button>
                <button
                  type="button"
                  onClick={() => setSmsInput('MSP MUSTARD')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md border border-slate-300"
                >
                  MSP MUSTARD
                </button>
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendSMS} className="flex gap-2">
                <input
                  type="text"
                  value={smsInput}
                  onChange={(e) => setSmsInput(e.target.value)}
                  placeholder="Type SMS (e.g. STATUS KT-MP-2026-9041)..."
                  className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-48 overflow-y-auto bg-slate-900 text-emerald-400 p-3 rounded-xl font-mono text-xs space-y-1.5 border border-slate-800">
                {callLog.map((line, idx) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>

              {/* Call Control and Keypad */}
              {!callActive ? (
                <button
                  onClick={startCall}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <PhoneForwarded className="w-4 h-4" />
                  <span>Dial Toll-Free 1800-180-1551</span>
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    {['1', '2', '3'].map((digit) => (
                      <button
                        key={digit}
                        onClick={() => handleKeypadPress(digit)}
                        className="py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-emerald-100 text-slate-800 font-bold rounded-lg text-sm border border-slate-300 transition cursor-pointer"
                      >
                        {digit}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={endCall}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <PhoneOff className="w-4 h-4" />
                    <span>Hang Up / End Call</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
