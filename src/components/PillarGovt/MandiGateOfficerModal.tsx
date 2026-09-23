import React, { useEffect, useState } from 'react';
import { Camera, X, CheckCircle2, AlertTriangle, Scan, Scale, Droplet, Sprout } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useApp } from '../../context/AppContext';

const API_BASE = (window as any).Capacitor && (window as any).Capacitor.isNative ? 'https://kisantrack.vercel.app' : '';

export const MandiGateOfficerModal: React.FC = () => {
  const { isOfficerScannerOpen, setIsOfficerScannerOpen, bookings, createBooking, playFeedbackTone, activePillar, updateBookingStatus } = useApp();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const bookingsRef = React.useRef(bookings);
  const isProcessingScanRef = React.useRef(false);
  
  // Quality Assay State
  const [actualWeight, setActualWeight] = useState('');
  const [moisture, setMoisture] = useState('');
  const [brokenGrains, setBrokenGrains] = useState('');

  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  const scannerRef = React.useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // If URL has ?scan=... auto trigger
    const params = new URLSearchParams(window.location.search);
    const token = params.get('scan');
    if (token && isOfficerScannerOpen) {
      setTimeout(() => {
        handleTokenScanned(token);
        window.history.replaceState({}, '', '/');
      }, 50);
    }
  }, [isOfficerScannerOpen]);

  useEffect(() => {
    if (!isOfficerScannerOpen || scanResult) return;

    isProcessingScanRef.current = false;

    let isMounted = true;
    let scanner: Html5QrcodeScanner | null = null;

    // Use a small delay to avoid React 18 Strict Mode double initialization
    const timer = setTimeout(() => {
      if (!isMounted) return;
      try {
        scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }, false);
        scannerRef.current = scanner;
        scanner.render((text) => {
          handleTokenScanned(text);
        }, () => {});
      } catch (e) {
        console.error("Scanner init error:", e);
      }
    }, 50);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [isOfficerScannerOpen, scanResult]);

  if (!isOfficerScannerOpen) return null;

  const handleTokenScanned = (tokenText: string) => {
    if (isProcessingScanRef.current) return;
    isProcessingScanRef.current = true;

    tokenText = (tokenText || "").trim().toUpperCase();
    
    // If it's a URL from the QR code (e.g. https://kisantrack.vercel.app/?scan=KT-MP-2026-1234)
    if (tokenText.includes('SCAN=')) {
      const match = tokenText.match(/SCAN=(KT-[A-Z]{2}-\d{4}-[A-Z0-9]{4})/i);
      if (match && match[1]) {
        tokenText = match[1].toUpperCase();
      }
    } else if (tokenText.includes('KT-')) {
      const match = tokenText.match(/(KT-[A-Z]{2}-\d{4}-[A-Z0-9]{4})/i);
      if (match && match[1]) {
        tokenText = match[1].toUpperCase();
      }
    }

    let booking = bookingsRef.current.find(b => b.tokenNumber === tokenText || b.id === tokenText);
    
    if (!booking) {
      setErrorMsg('Invalid QR Code: Token not found in database.');
      playFeedbackTone('alert');
      setTimeout(() => {
        setErrorMsg('');
        isProcessingScanRef.current = false;
      }, 3000);
      return;
    }

    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    setScanResult(booking.tokenNumber);
    playFeedbackTone('success');
  };

  const currentBooking = bookings.find(b => b.tokenNumber === scanResult);
  
  const isAssayRequired = currentBooking?.status === 'ARRIVED_AT_GATE';

  const handleAssaySubmit = () => {
    const moistVal = parseFloat(moisture);
    const brokenVal = parseFloat(brokenGrains);
    
    if (!actualWeight || !moisture || !brokenGrains) {
      setErrorMsg('Please fill all quality assay fields.');
      return;
    }
    
    const payload = {
      actualWeight,
      moisture: moistVal,
      brokenGrains: brokenVal,
      rejected: moistVal > 12 || brokenVal > 2
    };

    if (currentBooking) {
      if (payload.rejected) {
        updateBookingStatus(
          currentBooking.id, 
          'REJECTED' as any, 
          `Your crop doesn't meet the required standards. Token expired. (Moisture: ${payload.moisture}%, Broken: ${payload.brokenGrains}%)`, 
          'APMC Quality Assay', 
          false
        );
      } else {
        updateBookingStatus(
          currentBooking.id, 
          'QUALITY_VERIFIED', 
          `Moisture ${payload.moisture}%, Grade-A verified`, 
          'APMC Quality Assay', 
          false, 
          { estimatedQuantityQuintals: parseFloat(actualWeight) }
        );
      }
    }
    
    setScanResult(null);
    setActualWeight('');
    setMoisture('');
    setBrokenGrains('');
  };

  return (
    <div className="fixed inset-0 z-50 sm:flex sm:items-center sm:justify-center sm:p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-none sm:rounded-2xl shadow-2xl overflow-hidden border-0 sm:border border-slate-200 max-h-dvh sm:max-h-[90vh] flex flex-col animate-slide-up sm:animate-none">
        <div className="bg-blue-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/30 text-blue-300 flex items-center justify-center">
              <Scan className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Gate Pass Scanner</h3>
              <p className="text-[11px] text-blue-200">Auto-Update Status Progression</p>
            </div>
          </div>
          <button
            onClick={() => { setIsOfficerScannerOpen(false); setScanResult(null); }}
            className="text-blue-300 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {errorMsg}
            </div>
          )}

          <div className={scanResult ? 'hidden' : 'space-y-4'}>
            <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden p-2">
              <div id="qr-reader" className="w-full"></div>
            </div>
            <p className="text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-1">
              <Camera className="w-3.5 h-3.5" /> Point camera at Farmer's QR Gate Pass
            </p>
          </div>

          {scanResult && currentBooking ? (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto border-4 border-emerald-50">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">Successfully Scanned!</h3>
                <p className="text-sm font-mono font-bold text-emerald-700 mt-1">{currentBooking.tokenNumber}</p>
                <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-left text-sm space-y-2">
                  <div className="flex justify-between"><span className="text-slate-500">Farmer:</span> <span className="font-bold">{currentBooking.farmerName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Crop:</span> <span className="font-bold">{currentBooking.cropName}</span></div>
                  {!isAssayRequired && (
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-slate-500">New Status:</span> 
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{currentBooking.status}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {isAssayRequired ? (
                <div className="text-left space-y-3 bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                    <Droplet className="w-4 h-4" /> Quality Assay & Weighing
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Actual Weight (Qtl)</label>
                      <div className="relative">
                        <Scale className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                        <input type="number" value={actualWeight} onChange={e => { setActualWeight(e.target.value); setErrorMsg(''); }} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="e.g. 50" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Moisture (%)</label>
                      <div className="relative">
                        <Droplet className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                        <input type="number" value={moisture} onChange={e => { setMoisture(e.target.value); setErrorMsg(''); }} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Max 12%" />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Broken Grains (%)</label>
                    <div className="relative">
                      <Sprout className="w-4 h-4 absolute left-2.5 top-2.5 text-slate-400" />
                      <input type="number" value={brokenGrains} onChange={e => { setBrokenGrains(e.target.value); setErrorMsg(''); }} className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Max 2%" />
                    </div>
                  </div>
                  <button 
                    onClick={handleAssaySubmit}
                    className="w-full py-2.5 mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm"
                  >
                    Submit Quality & Weight
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => {
                    if (currentBooking) {
                      let nextStatus: any = 'IN_TRANSIT';
                      let remarks = 'Token verified.';
                      let officer = 'APMC Officer';
                      
                      if (currentBooking.status === 'BOOKED') {
                        nextStatus = 'IN_TRANSIT'; remarks = 'Proceeding to Mandi Gate.'; officer = 'APMC Dispatch Officer';
                      } else if (currentBooking.status === 'IN_TRANSIT') {
                        nextStatus = 'ARRIVED_AT_GATE'; remarks = 'Arrived at Gate 3.'; officer = 'APMC Entry Officer';
                      } else if (currentBooking.status === 'QUALITY_VERIFIED') {
                        nextStatus = 'WEIGHED'; remarks = 'Electronic Weighbridge Complete.'; officer = 'Weighbridge Operator';
                      } else if (currentBooking.status === 'WEIGHED') {
                        nextStatus = 'PAYMENT_COMPLETED'; remarks = 'PFMS DBT Payment Cleared'; officer = 'Treasury Officer';
                      }
                      
                      const chars = 'BCDFGHJKLMNPQRSTVWXYZ0123456789';
                      const randomSuffix = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
                      const newToken = `KT-${(currentBooking.state || 'MP').slice(0, 2).toUpperCase()}-2026-${randomSuffix}`;
                      
                      updateBookingStatus(
                        currentBooking.id, 
                        nextStatus, 
                        remarks, 
                        officer, 
                        false, 
                        { tokenNumber: newToken }
                      );
                    }
                    setScanResult(null);
                  }}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  Scan Next Token
                </button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
