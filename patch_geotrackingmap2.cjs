const fs = require('fs');
let content = fs.readFileSync('src/components/Map/GeoTrackingMap.tsx', 'utf8');

const regex = /const activeShipment = shipments\.find\(s => \n    \(s\.farmerId === currentUser\?\.id \|\| s\.buyerId === currentUser\?\.id \|\| s\.shipperId === currentUser\?\.id\) && \n    \(s\.status === 'IN_TRANSIT' \|\| s\.status === 'PENDING_ACCEPTANCE'\)\n  \);/;

const replacement = `const activeShipment = shipments.find(s => 
    (s.farmerId === currentUser?.id || s.buyerId === currentUser?.id || s.shipperId === currentUser?.id) && 
    (s.status === 'IN_TRANSIT' || s.status === 'PENDING_ACCEPTANCE')
  ) || shipments.find(s => s.status === 'IN_TRANSIT' || s.status === 'PENDING_ACCEPTANCE');`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/Map/GeoTrackingMap.tsx', content);
