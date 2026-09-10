const fs = require('fs');
let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. Add import for Shipment
content = content.replace("OrderBookItem,", "OrderBookItem,\n  Shipment,");

// 2. Add to AppContextType
content = content.replace("orderBook: OrderBookItem[];", "orderBook: OrderBookItem[];\n  shipments: Shipment[];\n  updateShipmentStatus: (id: string, status: Shipment['status']) => void;");

// 3. Add to AppProvider (carefully after orderBook declaration)
const stateRegex = /const \[orderBook, setOrderBook\] = usePersistentState<OrderBookItem\[\]>\('kt_orderBook', INITIAL_ORDER_BOOK\);/;
const stateReplacement = `const [orderBook, setOrderBook] = usePersistentState<OrderBookItem[]>('kt_orderBook', INITIAL_ORDER_BOOK);
  const [shipments, setShipments] = usePersistentState<Shipment[]>('kt_shipments', [
    {
      id: 'ship-101',
      farmerId: 'usr-kisan-01',
      farmerName: 'Rameshwar Patidar',
      buyerId: 'usr-corp-01',
      pickupLocation: { lat: 22.7196, lng: 75.8577, address: 'Indore APMC Mandi' },
      dropoffLocation: { lat: 19.0760, lng: 72.8777, address: 'ITC Warehouse, Mumbai' },
      status: 'PENDING_ACCEPTANCE',
      priceOffered: 14500,
      cropName: 'Wheat (Sharbati)',
      quantityQuintals: 65,
      distanceKm: 580
    }
  ]);

  const updateShipmentStatus = (id: string, status: Shipment['status']) => {
    setShipments(prev => prev.map(s => (s.id === id ? { ...s, status, shipperId: currentUser?.id } : s)));
  };
`;
content = content.replace(stateRegex, stateReplacement);

// 4. Export in provider value (Find the orderBook, exactly in the value object)
content = content.replace(/          orderBook,\n          addOrderItem,/, "          orderBook,\n          shipments,\n          updateShipmentStatus,\n          addOrderItem,");

// 5. Add shipper to DEMO_PROFILES
const demoRegex = /export const DEMO_PROFILES: Record<UserRole, UserProfile> = \{/;
const demoReplacement = `export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
  shipper: {
    id: 'usr-ship-01',
    name: 'Raju Transports',
    phone: '+91 99999 88888',
    email: 'raju.transports@gmail.com',
    role: 'shipper',
    avatar: 'https://ui-avatars.com/api/?name=Raju+Transports&background=ea580c&color=fff',
    state: 'Maharashtra',
    district: 'Mumbai',
    primaryMandi: 'APMC Mumbai',
    createdAt: '2026-01-01',
    aadhaarMasked: 'XXXX-XXXX-1111'
  },`;
content = content.replace(demoRegex, demoReplacement);

fs.writeFileSync('src/context/AppContext.tsx', content);
