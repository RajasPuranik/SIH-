const fs = require('fs');

let content = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

// 1. Add import for Shipment
content = content.replace("OrderBookItem,", "OrderBookItem,\n  Shipment,");

// 2. Add to AppContextType
content = content.replace("orderBook: OrderBookItem[];", "orderBook: OrderBookItem[];\n  shipments: Shipment[];\n  updateShipmentStatus: (id: string, status: Shipment['status']) => void;");

// 3. Add to AppProvider
const stateRegex = /const \[orderBook, setOrderBook\] = usePersistentState<OrderBookItem\[\]>\('kt_orderbook', \[\]\);/;
const stateReplacement = `const [orderBook, setOrderBook] = usePersistentState<OrderBookItem[]>('kt_orderbook', []);
  const [shipments, setShipments] = usePersistentState<Shipment[]>('kt_shipments', [
    {
      id: 'ship-101',
      farmerId: 'f-1',
      farmerName: 'Rameshwar Patidar',
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

// 4. Export in provider value
content = content.replace("orderBook,", "orderBook,\n          shipments,\n          updateShipmentStatus,");

fs.writeFileSync('src/context/AppContext.tsx', content);
