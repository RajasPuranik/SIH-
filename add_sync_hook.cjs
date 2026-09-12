const fs = require('fs');
let lines = fs.readFileSync('src/context/AppContext.tsx', 'utf8').split('\n');

const syncHook = `  useEffect(() => {
    const syncWithBackend = async () => {
      try {
        const res = await fetch('/api/bookings');
        if (res.ok) {
          const dbBookings = await res.json();
          if (dbBookings && dbBookings.length > 0) {
            setBookings(dbBookings);
          }
        }
      } catch (e) {
        console.warn('Backend sync failed', e);
      }
    };
    syncWithBackend();
    const interval = setInterval(syncWithBackend, 3000);
    return () => clearInterval(interval);
  }, []);`;

lines.splice(204, 0, syncHook);
fs.writeFileSync('src/context/AppContext.tsx', lines.join('\n'), 'utf8');
console.log('Added sync hook to AppContext');
