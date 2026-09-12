const fs = require('fs');

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf-8');

// 1. Fix syncWithBackend to correctly notify users when status changes
content = content.replace(
  `          const dbBookings = await res.json();
          if (dbBookings && dbBookings.length > 0) {
            setBookings(dbBookings);`,
  `          const dbBookings = await res.json();
          if (dbBookings && dbBookings.length > 0) {
            setBookings(prev => {
              let changed = false;
              const merged = [...prev];
              for (const dbB of dbBookings) {
                const existingIdx = merged.findIndex(b => b.id === dbB.id);
                if (existingIdx >= 0) {
                  if (merged[existingIdx].status !== dbB.status) {
                    changed = true;
                    merged[existingIdx] = dbB;
                    
                    // We can't access currentUser reliably in this closure because the effect has [] deps.
                    // But we can rely on localStorage "kt_current_user".
                    try {
                      const cuStr = localStorage.getItem('kt_current_user');
                      if (cuStr) {
                        const cu = JSON.parse(cuStr);
                        // Using a simple regex to match last 10 digits
                        const cleanPhone = p => p ? p.replace(/\\D/g, '').slice(-10) : '';
                        if (cu.role === 'farmer' && cleanPhone(dbB.farmerPhone) === cleanPhone(cu.phone)) {
                           // Triggering a native push notification or letting the UI know
                           console.log('Farmer token updated: ' + dbB.tokenNumber);
                           // To show notification, we could append to kt_notifications or we can just update a global event
                           window.dispatchEvent(new CustomEvent('token-updated', { detail: dbB }));
                        }
                      }
                    } catch(e){}
                  } else if (JSON.stringify(merged[existingIdx]) !== JSON.stringify(dbB)) {
                    changed = true;
                    merged[existingIdx] = dbB;
                  }
                } else {
                  changed = true;
                  merged.push(dbB);
                }
              }
              return changed ? merged : prev;
            });`
);

// 2. Add token-updated listener in AppContext to trigger addNotification
content = content.replace(
  `  const [notifications, setNotifications] = useState<NotificationItem[]>([`,
  `  useEffect(() => {
    const handler = (e: any) => {
      const dbB = e.detail;
      let stageName = dbB.status.replace(/_/g, ' ');
      if (dbB.status === 'ARRIVED_AT_GATE') stageName = 'Arrived at Gate';
      if (dbB.status === 'QUALITY_VERIFIED') stageName = 'Quality Verified';
      if (dbB.status === 'WEIGHED') stageName = 'Weighed';
      if (dbB.status === 'PAYMENT_COMPLETED') stageName = 'Payment Completed';

      addNotification({
        type: 'SMS',
        title: \`Token \${dbB.tokenNumber} Updated\`,
        message: \`Your token has successfully advanced to the '\${stageName}' stage.\`
      });
      playFeedbackTone('success');
    };
    window.addEventListener('token-updated', handler);
    return () => window.removeEventListener('token-updated', handler);
  }, []);

  const [notifications, setNotifications] = useState<NotificationItem[]>([`
);

// 3. Update updateBookingStatus to sync with backend
content = content.replace(
  `  const updateBookingStatus = (
    id: string,
    newStatus: SlotStatus,
    remarks: string = '',
    officerName?: string,
    skipBroadcast: boolean = false
  ) => {
    setBookings((prev) =>
      prev.map((booking) => {`,
  `  const updateBookingStatus = (
    id: string,
    newStatus: SlotStatus,
    remarks: string = '',
    officerName?: string,
    skipBroadcast: boolean = false
  ) => {
    let finalUpdatedBooking: SlotBooking | null = null;
    
    setBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== id && booking.tokenNumber !== id) return booking;`
);

content = content.replace(
  `        if (newStatus === 'PAYMENT_COMPLETED' && updatedBooking.paymentDetails) {
          updatedBooking.paymentDetails.dbtStatus = 'SUCCESS';
          updatedBooking.paymentDetails.disbursedAt = new Date().toLocaleDateString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
        return updatedBooking;
      })
    );
    playFeedbackTone('success');

    // Notify the farmer
    const booking = bookings.find(b => b.id === id || b.tokenNumber === id);
    if (booking) {
      let stageName = newStatus.replace(/_/g, ' ');
      if (newStatus === 'ARRIVED_AT_GATE') stageName = 'Arrived at Gate';
      if (newStatus === 'QUALITY_VERIFIED') stageName = 'Quality Verified';
      if (newStatus === 'WEIGHED') stageName = 'Weighed';
      if (newStatus === 'PAYMENT_COMPLETED') stageName = 'Payment Completed';

      addNotification({
        type: 'SMS',
        title: \`Token \${booking.tokenNumber} Updated\`,
        message: \`Your token has successfully advanced to the '\${stageName}' stage. \${remarks}\`
      });
    }

    if (!skipBroadcast) {
      fetch('https://ntfy.sh/kisantrack-sih-2026-demo-sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'UPDATE_STATUS', id, newStatus, remarks, officerName })
      }).catch(e => console.warn('ntfy err', e));
    }`,
  `        if (newStatus === 'PAYMENT_COMPLETED' && updatedBooking.paymentDetails) {
          updatedBooking.paymentDetails.dbtStatus = 'SUCCESS';
          updatedBooking.paymentDetails.disbursedAt = new Date().toLocaleDateString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
        finalUpdatedBooking = updatedBooking;
        return updatedBooking;
      })
    );
    
    // React 18 setState might be batched, so calculate if not set
    if (!finalUpdatedBooking) {
        const booking = bookings.find(b => b.id === id || b.tokenNumber === id);
        if (booking) {
            finalUpdatedBooking = { ...booking, status: newStatus };
        }
    }

    playFeedbackTone('success');

    if (finalUpdatedBooking) {
      let stageName = newStatus.replace(/_/g, ' ');
      if (newStatus === 'ARRIVED_AT_GATE') stageName = 'Arrived at Gate';
      if (newStatus === 'QUALITY_VERIFIED') stageName = 'Quality Verified';
      if (newStatus === 'WEIGHED') stageName = 'Weighed';
      if (newStatus === 'PAYMENT_COMPLETED') stageName = 'Payment Completed';

      addNotification({
        type: 'SMS',
        title: \`Token \${finalUpdatedBooking.tokenNumber} Updated\`,
        message: \`Your token has successfully advanced to the '\${stageName}' stage. \${remarks}\`
      });

      // Synchronize with backend database
      fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalUpdatedBooking)
      }).catch(e => console.warn('Failed to sync booking status to backend', e));
    }

    if (!skipBroadcast) {
      fetch('https://ntfy.sh/kisantrack-sih-2026-demo-sync', {
        method: 'POST',
        body: JSON.stringify({ action: 'UPDATE_STATUS', id, newStatus, remarks, officerName })
      }).catch(e => console.warn('ntfy err', e));
    }`
);

fs.writeFileSync('src/context/AppContext.tsx', content);
