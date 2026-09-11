import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  ShieldCheck, 
  Scan, 
  CheckCircle2, 
  AlertTriangle,
  Camera
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Html5QrcodeScanner } from 'html5-qrcode';

export const MandiGateOfficerModal: React.FC = () => {
  const { 
    isOfficerScannerOpen, 
    setIsOfficerScannerOpen, 
    bookings, 
    updateBookingStatus, 
    playFeedbackTone 
  } = useApp();

  const [scanResult, setScanResult] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  
  const bookingsRef = useRef(bookings);
  useEffect(() => {
    bookingsRef.current = bookings;
  }, [bookings]);

  // Handle URL parameter on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('scan');
    if (token) {
      handleTokenScanned(token);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  // Initialize Scanner
  useEffect(() => {
    if (!isOfficerScannerOpen || scanResult) return;
    
    // Slight delay to ensure DOM is ready
    const timer = setTimeout(() => {
      try {
        const scanner = new Html5QrcodeScanner(
          "qr-reader", 
          { fps: 10, qrbox: { width: 250, height: 250 } }, 
          false
        );
        
        scanner.render((text) => {
          scanner.clear();
          
          // The QR code now contains a URL like https://domain/?scan=KT-1234
          // We need to extract the token if it's a URL
          let finalToken = text;
          try {
            const url = new URL(text);
            const scanParam = url.searchParams.get('scan');
            if (scanParam) finalToken = scanParam;
          } catch (e) {
            // Not a URL, use raw text
          }
          handleTokenScanned(finalToken.trim());
        }, (error) => {
          // Ignore frequent scan errors
        });

        return () => {
          scanner.clear().catch(() => {});
        };
      } catch (err) {
        console.error(err);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [isOfficerScannerOpen, scanResult]);

  if (!isOfficerScannerOpen) return null;

  const handleTokenScanned = (tokenText: string) => {
    const booking = bookingsRef.current.find(b => b.tokenNumber === tokenText || b.id === tokenText);
    
    if (!booking) {
      setErrorMsg('Invalid QR Code: Token not found in database.');
      playFeedbackTone('alert');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    setScanResult(booking.tokenNumber);
    playFeedbackTone('success');

    // Auto-advance status
    if (booking.status === 'BOOKED') {
      updateBookingStatus(booking.id, 'ARRIVED_AT_GATE', 'Officer scanned entry pass at Gate 3', 'APMC Entry Officer');
    } else if (booking.status === 'ARRIVED_AT_GATE') {
      updateBookingStatus(booking.id, 'QUALITY_VERIFIED', 'Moisture 11.5%, Grade-A verified', 'APMC Quality Assay');
    } else if (booking.status === 'QUALITY_VERIFIED') {
      updateBookingStatus(booking.id, 'WEIGHED', 'Gross 9200kg, Tare 2700kg. Net: 65 Qtl', 'Weighbridge Operator');
    } else if (booking.status === 'WEIGHED') {
      updateBookingStatus(booking.id, 'PAYMENT_COMPLETED', 'PFMS DBT Payment Cleared', 'Treasury Officer');
    }
  };

  const currentBooking = bookings.find(b => b.tokenNumber === scanResult);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
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
            onClick={() => setIsOfficerScannerOpen(false)}
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

          {!scanResult ? (
            <div className="space-y-4">
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl overflow-hidden p-2">
                <div id="qr-reader" className="w-full"></div>
              </div>
              <p className="text-center text-xs font-bold text-slate-500 flex items-center justify-center gap-1">
                <Camera className="w-3.5 h-3.5" /> Point camera at Farmer's QR Gate Pass
              </p>
            </div>
          ) : currentBooking ? (
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
                  <div className="flex justify-between border-t pt-2 mt-2">
                    <span className="text-slate-500">New Status:</span> 
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">{currentBooking.status}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setScanResult(null)}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              >
                Scan Next Token
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
