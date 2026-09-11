import React, { useState, useEffect, useRef } from 'react';
import { Phone, X, Mic, MicOff, Volume2, PhoneOff } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const IVRModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { userRole, currentUser, bookings } = useApp();
  
  const [callState, setCallState] = useState<'IDLE' | 'LANG_SELECT' | 'MAIN_MENU' | 'ACTION' | 'ENDED'>('IDLE');
  const [lang, setLang] = useState<'en' | 'hi' | 'mr'>('en');
  const [transcript, setTranscript] = useState<{sender: 'bot' | 'user', text: string}[]>([]);
  
  const synth = window.speechSynthesis;

  useEffect(() => {
    if (isOpen) {
      startCall();
    } else {
      endCall();
    }
  }, [isOpen]);

  const speak = (text: string, language: 'en' | 'hi' | 'mr' = 'en') => {
    if (!synth) return;
    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Attempt to set language voices
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'mr') utterance.lang = 'mr-IN';
    else utterance.lang = 'en-IN';
    
    utterance.rate = 0.9;
    synth.speak(utterance);
    
    setTranscript(prev => [...prev, { sender: 'bot', text }]);
  };

  const startCall = () => {
    setTranscript([]);
    setCallState('LANG_SELECT');
    speak("Welcome to Kisan Track IVR. For English, press 1. Hindi ke liye, 2 dabaye. Marathi sathi, 3 daba.");
  };

  const endCall = () => {
    synth?.cancel();
    setCallState('ENDED');
    setTimeout(() => {
      onClose();
      setCallState('IDLE');
    }, 1500);
  };

  const handleKeyPress = (key: string) => {
    if (callState === 'ENDED' || callState === 'IDLE') return;
    
    synth?.cancel(); // Stop current speech
    setTranscript(prev => [...prev, { sender: 'user', text: `Pressed ${key}` }]);

    if (callState === 'LANG_SELECT') {
      if (key === '1') {
        setLang('en');
        handleMainMenu('en');
      } else if (key === '2') {
        setLang('hi');
        handleMainMenu('hi');
      } else if (key === '3') {
        setLang('mr');
        handleMainMenu('mr');
      } else {
        speak("Invalid input. For English press 1, Hindi ke liye 2, Marathi sathi 3.", 'en');
      }
    } else if (callState === 'MAIN_MENU') {
      handleActionSelection(key);
    } else if (callState === 'ACTION') {
      if (key === '9') {
        handleMainMenu(lang);
      } else if (key === '0') {
        speak(getGoodbye(lang), lang);
        endCall();
      }
    }
  };

  const getGoodbye = (l: string) => {
    if (l === 'hi') return "Kisan Track me call karne ke liye dhanyawad.";
    if (l === 'mr') return "Kisan Track madhye call kelyabaddal dhanyawad.";
    return "Thank you for calling Kisan Track.";
  }

  const handleMainMenu = (l: string) => {
    setCallState('MAIN_MENU');
    let menuText = "";

    if (userRole === 'farmer') {
      if (l === 'hi') menuText = "Mandi slot book karne ke liye 1 dabaye. Apne token ka status janne ke liye 2 dabaye. Fasal ke daam janne ke liye 3 dabaye.";
      else if (l === 'mr') menuText = "Mandi slot book karnyasaathi 1 daba. Token status pahanyasaathi 2 daba. Pikache bhav pahanyasaathi 3 daba.";
      else menuText = "To book a Mandi slot, press 1. To track your token status, press 2. For latest crop prices, press 3.";
    } else if (userRole === 'mandi_officer') {
      if (l === 'hi') menuText = "Queue status janne ke liye 1 dabaye. Kisano ko alert bhejne ke liye 2 dabaye.";
      else menuText = "To hear live gate queue status, press 1. To broadcast delay alerts to farmers, press 2.";
    } else if (userRole === 'corporate_buyer') {
      menuText = "To check your active bids, press 1. To track incoming shipments, press 2.";
    } else if (userRole === 'shipper') {
      menuText = "To hear pending delivery jobs, press 1. To update your current transit status, press 2.";
    } else {
      menuText = "To hear system analytics, press 1.";
    }

    speak(`Main Menu. ${menuText}`, l as any);
  };

  const handleActionSelection = (key: string) => {
    setCallState('ACTION');
    let response = "";

    if (userRole === 'farmer') {
      if (key === '1') response = lang === 'hi' ? "Aapka slot kal subah 9 baje ke liye book kar diya gaya hai. SMS check karein." : "Your slot has been successfully booked for tomorrow at 9 AM. Please check your SMS.";
      else if (key === '2') {
        const myBookings = bookings.filter(b => b.farmerPhone === currentUser?.phone || b.id === currentUser?.id);
        if (myBookings.length > 0) {
          response = lang === 'hi' ? `Aapka current status hai: ${myBookings[0].status.replace(/_/g, ' ')}.` : `Your active token status is ${myBookings[0].status.replace(/_/g, ' ')}.`;
        } else {
          response = lang === 'hi' ? "Aapka koi active token nahi hai." : "You have no active tokens currently.";
        }
      }
      else if (key === '3') response = lang === 'hi' ? "Gehu ka MSP rate aaj 2425 rupaye prathi quintal hai." : "Today's MSP rate for Wheat is 2425 rupees per quintal.";
      else response = lang === 'hi' ? "Galat vikalp." : "Invalid choice.";
    } 
    else if (userRole === 'mandi_officer') {
      if (key === '1') response = "There are currently 42 vehicles in the Mandi yard. Weighbridge 2 has a 15 minute delay.";
      else if (key === '2') response = "Alert broadcast sent to 14 scheduled farmers advising them of a 30 minute delay.";
      else response = "Invalid choice.";
    }
    else if (userRole === 'corporate_buyer') {
      if (key === '1') response = "You have 2 active bids for Wheat at Indore APMC. Both are currently winning.";
      else if (key === '2') response = "You have 1 incoming shipment from farmer Rameshwar Patidar. Status: In Transit.";
      else response = "Invalid choice.";
    }
    else if (userRole === 'shipper') {
      if (key === '1') response = "There is 1 new delivery job from Indore Mandi to ITC Warehouse. Payout is 14,500 rupees.";
      else if (key === '2') response = "Your transit status has been updated. GPS tracking is live.";
      else response = "Invalid choice.";
    }
    else {
      response = "Action executed successfully.";
    }

    const postAction = lang === 'hi' ? " Main menu me wapas jane ke liye 9 dabaye, call katne ke liye 0 dabaye." : " Press 9 to return to the main menu, or 0 to disconnect.";
    speak(response + postAction, lang);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-slate-900 w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden border-4 border-slate-800 relative flex flex-col h-[600px]">
        
        {/* Phone Header */}
        <div className="bg-slate-800 px-6 py-4 flex justify-between items-center text-slate-300">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold tracking-wider">IVR CALL IN PROGRESS</span>
          </div>
          <button onClick={endCall} className="p-1 hover:bg-slate-700 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Screen/Transcript Area */}
        <div className="flex-1 bg-slate-950 p-4 overflow-y-auto space-y-3 font-mono text-xs flex flex-col">
          {transcript.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-xl ${
                msg.sender === 'user' 
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 rounded-br-sm' 
                  : 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 rounded-bl-sm'
              }`}>
                {msg.sender === 'bot' && <Volume2 className="w-3 h-3 mb-1 opacity-50" />}
                {msg.text}
              </div>
            </div>
          ))}
          {callState === 'ENDED' && (
            <div className="text-center text-red-400 font-bold mt-4">Call Disconnected</div>
          )}
        </div>

        {/* Dialpad */}
        <div className="bg-slate-900 p-6 pb-8 border-t border-slate-800">
          <div className="grid grid-cols-3 gap-4 mb-6">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="w-16 h-16 mx-auto rounded-full bg-slate-800 border border-slate-700 text-slate-200 text-2xl font-bold flex items-center justify-center hover:bg-slate-700 active:bg-slate-600 active:scale-95 transition"
              >
                {key}
              </button>
            ))}
          </div>
          
          <div className="flex justify-center">
            <button 
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-500 active:scale-95 transition"
            >
              <PhoneOff className="w-6 h-6" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
