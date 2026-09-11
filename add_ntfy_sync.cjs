const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. Add skipBroadcast to createBooking
const createBookingRegex = /const createBooking = \(\n\s*newBookingData: Omit<SlotBooking, 'id' \| 'tokenNumber' \| 'status' \| 'statusHistory'> & \{ tokenNumber\?: string \}\n\s*\): SlotBooking => \{/;
const newCreateBooking = `const createBooking = (
    newBookingData: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'> & { tokenNumber?: string },
    skipBroadcast: boolean = false
  ): SlotBooking => {`;
txt = txt.replace(createBookingRegex, newCreateBooking);

// Add broadcast to end of createBooking
const endCreateRegex = /setBookings\(\(prev\) => \[newBooking, \.\.\.prev\]\);\n\s*setActiveBookingId\(newId\);\n\s*return newBooking;/;
const newEndCreate = `setBookings((prev) => [newBooking, ...prev]);
    setActiveBookingId(newId);
    
    if (!skipBroadcast) {
      fetch('https://ntfy.sh/kisantrack-sih-2026-demo-sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'CREATE_BOOKING', booking: newBooking })
      }).catch(e => console.warn('ntfy err', e));
    }
    
    return newBooking;`;
txt = txt.replace(endCreateRegex, newEndCreate);

// 2. Add skipBroadcast to updateBookingStatus
const updateRegex = /const updateBookingStatus = \(\n\s*id: string,\n\s*newStatus: SlotStatus,\n\s*remarks: string = '',\n\s*officerName\?: string\n\s*\) => \{/;
const newUpdate = `const updateBookingStatus = (
    id: string,
    newStatus: SlotStatus,
    remarks: string = '',
    officerName?: string,
    skipBroadcast: boolean = false
  ) => {`;
txt = txt.replace(updateRegex, newUpdate);

// Add broadcast to end of updateBookingStatus
const endUpdateRegex = /addNotification\(\{\n\s*type: 'SYSTEM',\n\s*title: `Token \$\{booking\.tokenNumber\} Updated`,\n\s*message: `Your token has successfully advanced to the '\$\{stageName\}' stage\. \$\{remarks\}`\n\s*\}\);\n\s*\}\n\s*\};/;
const newEndUpdate = `addNotification({
        type: 'SYSTEM',
        title: \`Token \${booking.tokenNumber} Updated\`,
        message: \`Your token has successfully advanced to the '\${stageName}' stage. \${remarks}\`
      });
    }

    if (!skipBroadcast) {
      fetch('https://ntfy.sh/kisantrack-sih-2026-demo-sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'UPDATE_STATUS', id, newStatus, remarks, officerName })
      }).catch(e => console.warn('ntfy err', e));
    }
  };`;
txt = txt.replace(endUpdateRegex, newEndUpdate);

// 3. Add SSE Listener Effect
const providerRegex = /const \[bookings, setBookings\] = usePersistentState<SlotBooking\[\]>\('kt_bookings', INITIAL_BOOKINGS\);\n\s*const \[activeBookingId, setActiveBookingId\] = useState<string>\(INITIAL_BOOKINGS\[0\]\?\.id \|\| ''\);/;
const newProvider = `const [bookings, setBookings] = usePersistentState<SlotBooking[]>('kt_bookings', INITIAL_BOOKINGS);
  const [activeBookingId, setActiveBookingId] = useState<string>(INITIAL_BOOKINGS[0]?.id || '');

  // Cross-device demo sync via ntfy.sh
  useEffect(() => {
    const eventSource = new EventSource('https://ntfy.sh/kisantrack-sih-2026-demo-sync/sse');
    eventSource.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.event === 'message') {
          const payload = JSON.parse(data.message);
          
          if (payload.action === 'CREATE_BOOKING') {
            setBookings(prev => {
              if (prev.some(b => b.tokenNumber === payload.booking.tokenNumber)) return prev;
              return [payload.booking, ...prev];
            });
          }
          
          if (payload.action === 'UPDATE_STATUS') {
             // We need to call updateBookingStatus but we can't easily reference it here without dependency cycles if it's not wrapped in useCallback.
             // Instead, let's just duplicate the update state logic or use a ref.
             // Actually, since updateBookingStatus is defined below, we can't use it directly here.
             // We can just manually do setBookings!
             setBookings(prev => prev.map(booking => {
                if (booking.id !== payload.id && booking.tokenNumber !== payload.id) return booking;
                
                // Don't duplicate if already updated
                if (booking.status === payload.newStatus) return booking;

                const updatedHistory = [
                  ...booking.statusHistory,
                  {
                    stage: payload.newStatus,
                    timestamp: new Date().toLocaleDateString('en-GB', {
                      year: 'numeric', month: '2-digit', day: '2-digit',
                      hour: '2-digit', minute: '2-digit',
                    }),
                    remarks: payload.remarks || 'Status advanced to ' + payload.newStatus,
                    officerName: payload.officerName,
                  },
                ];
                
                const updatedBooking = { ...booking, status: payload.newStatus, statusHistory: updatedHistory };
                
                if (payload.newStatus === 'QUALITY_VERIFIED' && !updatedBooking.qualityCheck) {
                  updatedBooking.qualityCheck = {
                    moisturePercent: 11.4, foreignMatterPercent: 0.6,
                    grainGrade: 'Grade-A', inspectorRemarks: 'Passed moisture assay & purity guidelines.'
                  };
                }
                if (payload.newStatus === 'WEIGHED' && !updatedBooking.weighbridge) {
                  const netKg = booking.estimatedQuantityQuintals * 100;
                  updatedBooking.weighbridge = {
                    grossWeightKg: netKg + 2800, tareWeightKg: 2800,
                    netWeightKg: netKg, netWeightQuintals: booking.estimatedQuantityQuintals,
                  };
                }
                if (payload.newStatus === 'PAYMENT_COMPLETED' && updatedBooking.paymentDetails) {
                  updatedBooking.paymentDetails.dbtStatus = 'SUCCESS';
                  updatedBooking.paymentDetails.disbursedAt = new Date().toLocaleDateString('en-GB', { hour: '2-digit', minute: '2-digit' });
                }
                return updatedBooking;
             }));
          }
        }
      } catch (err) {}
    };
    return () => eventSource.close();
  }, []);`;

txt = txt.replace(providerRegex, newProvider);

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Added ntfy SSE sync logic');
