const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

content = content.replace("farmerId: 'f-1'", "farmerId: 'usr-kisan-01'");
content = content.replace("farmerName: 'Rameshwar Patidar',", "farmerName: 'Rameshwar Patidar',\n      buyerId: 'usr-corp-01',");

fs.writeFileSync('src/context/AppContext.tsx', content);

// Let's also patch GeoTrackingMap to fallback to first shipment if no specific one matches, so new accounts can see the demo!
let mapContent = fs.readFileSync('src/components/Map/GeoTrackingMap.tsx', 'utf8');
const searchMap = /const activeShipment = shipments\.find[\s\S]*?\]\);/;
const replaceMap = `const activeShipment = shipments.find(s => 
    (s.farmerId === currentUser?.id || s.buyerId === currentUser?.id || s.shipperId === currentUser?.id) && 
    (s.status === 'IN_TRANSIT' || s.status === 'PENDING_ACCEPTANCE')
  ) || shipments.find(s => s.status === 'IN_TRANSIT' || s.status === 'PENDING_ACCEPTANCE');`;

mapContent = mapContent.replace(searchMap, replaceMap);
fs.writeFileSync('src/components/Map/GeoTrackingMap.tsx', mapContent);
