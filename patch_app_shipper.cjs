const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Add import
content = content.replace("import { AdminView } from './components/Admin/AdminView';", "import { AdminView } from './components/Admin/AdminView';\nimport { ShipperDashboard } from './components/PillarLogistics/ShipperDashboard';");

// Replace rendering logic
const renderRegex = /\{userRole === 'admin' \? \([\s\S]*?\) : userRole === 'corporate_buyer' \? \([\s\S]*?\) : \([\s\S]*?\}\)/;

const replacement = `{userRole === 'admin' ? (
          <AdminView />
        ) : userRole === 'shipper' ? (
          <ShipperDashboard />
        ) : userRole === 'corporate_buyer' ? (
          <CropStockExchangeView />
        ) : (
          <GovtProcurementView />
        )}`;

content = content.replace(renderRegex, replacement);
fs.writeFileSync('src/App.tsx', content);
