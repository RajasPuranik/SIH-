const fs = require('fs');

let content = fs.readFileSync('src/types/index.ts', 'utf8');

content = content.replace("export type UserRole = 'farmer' | 'mandi_officer' | 'corporate_buyer' | 'admin';", "export type UserRole = 'farmer' | 'mandi_officer' | 'corporate_buyer' | 'admin' | 'shipper';");

const shipmentInterface = `
export interface Shipment {
  id: string;
  farmerId: string;
  farmerName?: string;
  buyerId?: string;
  pickupLocation: { lat: number; lng: number; address: string };
  dropoffLocation: { lat: number; lng: number; address: string };
  status: 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'IN_TRANSIT' | 'DELIVERED';
  shipperId?: string;
  priceOffered: number;
  cropName: string;
  quantityQuintals: number;
  distanceKm: number;
}
`;

content = content + '\n' + shipmentInterface;
fs.writeFileSync('src/types/index.ts', content);
