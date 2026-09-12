const fs = require('fs');
let txt = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const regex = /\/\* \u2500\u2500\u2500 LIVE PRICE SIMULATION \u2500\u2500\u2500 \*\/\n[\s\S]*?\/\/ 24h cron simulator/;
const altRegex = /\/\/ \u2500\u2500\u2500 LIVE PRICE SIMULATION \u2500\u2500\u2500[\s\S]*?\/\/ 24h cron simulator/;

const replacement = `// \u2500\u2500\u2500 LIVE PRICE SIMULATION \u2500\u2500\u2500
  // DAILY GOV MSP RATES SYNC
  useEffect(() => {
    const fetchGovMspRates = async () => {
      try {
        console.log('[Agri Ticker] Grabbing present live MSP rates from gov sources & Google search based on location...');
        const res = await fetch('/api/msp-rates?location=Madhya%20Pradesh');
        if (res.ok) {
          const data = await res.json();
          setCrops(prev => prev.map(crop => {
            const liveRate = data.rates[crop.id] || crop.mspRate;
            return {
              ...crop,
              mspRate: liveRate
            };
          }));
        }
      } catch (e) {
        console.warn('Failed to fetch gov MSP rates', e);
      }
    };

    fetchGovMspRates();
    // 24h cron simulator`;

txt = txt.replace(altRegex, replacement);

fs.writeFileSync('src/context/AppContext.tsx', txt, 'utf8');
console.log('Replaced MSP mock with API call');
