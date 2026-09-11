const fs = require('fs');
let txt = fs.readFileSync('src/services/phoneBotEngine.ts', 'utf8');

const cropQuickActions = `[
            { label: language === 'hi' ? '🌾 गेहूँ' : language === 'mr' ? '🌾 गहू' : '🌾 Wheat', action: 'wheat' },
            { label: language === 'hi' ? '🌿 सरसों' : language === 'mr' ? '🌿 मोहरी' : '🌿 Mustard', action: 'mustard' },
            { label: language === 'hi' ? '🌱 सोयाबीन' : language === 'mr' ? '🌱 सोयाबीन' : '🌱 Soybean', action: 'soybean' },
            { label: language === 'hi' ? '🌰 चना' : language === 'mr' ? '🌰 हरभरा' : '🌰 Gram', action: 'gram' },
            { label: language === 'hi' ? '☁️ कपास' : language === 'mr' ? '☁️ कापूस' : '☁️ Cotton', action: 'cotton' },
            { label: language === 'hi' ? '🌾 धान' : language === 'mr' ? '🌾 धान' : '🌾 Paddy', action: 'paddy' },
          ]`;

// Replace crops in Initiation block
txt = txt.replace(
  /quickActions:\s*\[\s*\{\s*label:\s*'🌾 Wheat',[\s\S]*?\]/g,
  `quickActions: ${cropQuickActions}`
);

// Quantity
const qtyRegex = /quickActions:\s*\[\s*\{\s*label:\s*'10 Qtl'[\s\S]*?\]/;
const qtyActions = `quickActions: [
          { label: language === 'hi' ? '10 क्विंटल' : language === 'mr' ? '10 क्विंटल' : '10 Qtl', action: '10' },
          { label: language === 'hi' ? '25 क्विंटल' : language === 'mr' ? '25 क्विंटल' : '25 Qtl', action: '25' },
          { label: language === 'hi' ? '50 क्विंटल' : language === 'mr' ? '50 क्विंटल' : '50 Qtl', action: '50' },
          { label: language === 'hi' ? '100 क्विंटल' : language === 'mr' ? '100 क्विंटल' : '100 Qtl', action: '100' },
        ]`;
txt = txt.replace(qtyRegex, qtyActions);

// Vehicle
const vehicleRegex = /quickActions:\s*\[\s*\{\s*label:\s*'🚜 Tractor'[\s\S]*?\]/;
const vehicleActions = `quickActions: [
          { label: language === 'hi' ? '🚜 ट्रैक्टर' : language === 'mr' ? '🚜 ट्रॅक्टर' : '🚜 Tractor', action: 'Tractor' },
          { label: language === 'hi' ? '🚚 ट्रक' : language === 'mr' ? '🚚 ट्रक' : '🚚 Truck', action: 'Truck' },
          { label: language === 'hi' ? '🛻 पिकअप' : language === 'mr' ? '🛻 पिकअप' : '🛻 Pickup', action: 'Pickup' },
        ]`;
txt = txt.replace(vehicleRegex, vehicleActions);

// VRN - remove quick actions completely since we have text box now
const vrnRegex = /quickActions:\s*\[\s*\{\s*label:\s*'MP-09-XX-0000'[\s\S]*?\]/;
txt = txt.replace(vrnRegex, 'quickActions: []');

// Time
const timeRegex = /quickActions:\s*\[\s*\{\s*label:\s*'08:30 AM - 10:00 AM'[\s\S]*?\]/;
const timeActions = `quickActions: [
          { label: language === 'hi' ? '08:30 सुबह' : language === 'mr' ? '08:30 सकाळ' : '08:30 AM', action: '08:30 AM - 10:00 AM' },
          { label: language === 'hi' ? '10:15 सुबह' : language === 'mr' ? '10:15 सकाळ' : '10:15 AM', action: '10:15 AM - 11:45 AM' },
          { label: language === 'hi' ? '12:00 दोपहर' : language === 'mr' ? '12:00 दुपार' : '12:00 PM', action: '12:00 PM - 01:30 PM' },
          { label: language === 'hi' ? '02:30 दोपहर' : language === 'mr' ? '02:30 दुपार' : '02:30 PM', action: '02:30 PM - 04:00 PM' },
        ]`;
txt = txt.replace(timeRegex, timeActions);

fs.writeFileSync('src/services/phoneBotEngine.ts', txt, 'utf8');
console.log('Translated quick actions');
