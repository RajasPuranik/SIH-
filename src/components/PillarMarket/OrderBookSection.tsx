import React, { useState } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  PlusCircle, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Lock,
  Building,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderBookItem } from '../../types';

export const OrderBookSection: React.FC = () => {
  const { 
    orderBook, 
    selectedCropId, 
    crops, 
    executeTrade, 
    addOrderItem 
  } = useApp();

  const currentCrop = crops.find(c => c.id === selectedCropId) || crops[0];

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [newOrderQuantity, setNewOrderQuantity] = useState('50');
  const [newOrderPrice, setNewOrderPrice] = useState(String(currentCrop.currentPrivatePrice + 20));
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('SELL');
  const [traderName, setTraderName] = useState('My Farm Produce Collective');

  // Filter book by selected crop
  const cropOrders = orderBook.filter(o => o.cropId === selectedCropId);
  const buyOrders = cropOrders.filter(o => o.type === 'BUY').sort((a, b) => b.pricePerQuintal - a.pricePerQuintal);
  const sellOrders = cropOrders.filter(o => o.type === 'SELL').sort((a, b) => a.pricePerQuintal - b.pricePerQuintal);

  const handleMatchOrder = (order: OrderBookItem) => {
    const confirmed = window.confirm(
      `Confirm instant trade match?\n\nBuyer: ${order.buyerOrSellerName}\nCommodity: ${currentCrop.name}\nQuantity: ${order.quantityQuintals} Quintals\nRate: ₹${order.pricePerQuintal}/Qtl\nTotal Gross: ₹${(order.quantityQuintals * order.pricePerQuintal).toLocaleString('en-IN')}\n\nFunds will be instantly locked in Agri-Escrow account.`
    );
    if (confirmed) {
      executeTrade(order.id, order.quantityQuintals);
    }
  };

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = parseFloat(newOrderQuantity) || 0;
    const price = parseFloat(newOrderPrice) || 0;

    if (qty <= 0 || price <= 0) {
      alert('Please enter valid quantity and price');
      return;
    }

    addOrderItem({
      type: orderType,
      cropId: selectedCropId,
      pricePerQuintal: price,
      quantityQuintals: qty,
      buyerOrSellerName: traderName,
      buyerType: orderType === 'SELL' ? 'Farmer' : 'Corporate',
      mandiLocation: 'Indore Mandi Terminal'
    });

    setIsPlacingOrder(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Order Book & Matching Engine
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Lock className="w-2.5 h-2.5" /> 100% Escrow Guaranteed
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mt-1">
            Institutional Buy Bids & Farmer Sell Asks: {currentCrop.name}
          </h3>
        </div>

        <button
          onClick={() => setIsPlacingOrder(!isPlacingOrder)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isPlacingOrder ? 'Cancel Order' : 'Place Limit Order on Exchange'}</span>
        </button>
      </div>

      {/* Place Order Form Drawer */}
      {isPlacingOrder && (
        <form onSubmit={handleCreateOrder} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between font-bold text-xs text-slate-800">
            <span>List Your Trade Order</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOrderType('SELL')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  orderType === 'SELL' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Sell Produce (Ask)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('BUY')}
                className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                  orderType === 'BUY' ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                Buy Produce (Bid)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Entity / Farmer Group</label>
              <input
                type="text"
                value={traderName}
                onChange={(e) => setTraderName(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Quantity (Quintals)</label>
              <input
                type="number"
                value={newOrderQuantity}
                onChange={(e) => setNewOrderQuantity(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold"
              />
            </div>
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Target Price (₹/Quintal)</label>
              <input
                type="number"
                value={newOrderPrice}
                onChange={(e) => setNewOrderPrice(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg font-bold text-indigo-700"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
            >
              Post Order to Live Exchange
            </button>
          </div>
        </form>
      )}

      {/* Dual Column Depth Book */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* BUY BIDS (Institutional Corporate Demand) */}
        <div className="border border-emerald-200 rounded-xl overflow-hidden bg-emerald-50/20">
          <div className="bg-emerald-700 text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4 text-emerald-300" />
              <span className="font-bold text-xs uppercase tracking-wider">
                Active Buy Bids (Institutional Buyers)
              </span>
            </div>
            <span className="text-[10px] text-emerald-200 font-semibold">
              Highest Price First
            </span>
          </div>

          <div className="divide-y divide-emerald-100">
            {buyOrders.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">No active buy bids</p>
            ) : (
              buyOrders.map((order) => (
                <div key={order.id} className="p-3.5 hover:bg-emerald-50/70 transition flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{order.buyerOrSellerName}</span>
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                        {order.buyerType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {order.mandiLocation} • Volume: <strong className="text-slate-800">{order.quantityQuintals} Qtl</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-emerald-700 block">
                        ₹{order.pricePerQuintal}/Qtl
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{order.timestamp}</span>
                    </div>

                    <button
                      onClick={() => handleMatchOrder(order)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-2xs"
                      title="Sell instantly at this buyer's bid"
                    >
                      Sell Now
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SELL ASKS (Farmer / FPO Offers) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          <div className="bg-slate-800 text-white px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ArrowDownRight className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-xs uppercase tracking-wider">
                Active Sell Asks (Farmers & FPOs)
              </span>
            </div>
            <span className="text-[10px] text-slate-300 font-semibold">
              Lowest Price First
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {sellOrders.length === 0 ? (
              <p className="p-4 text-xs text-slate-400 text-center">No active sell asks</p>
            ) : (
              sellOrders.map((order) => (
                <div key={order.id} className="p-3.5 hover:bg-slate-100/70 transition flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{order.buyerOrSellerName}</span>
                      <span className="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[9px] font-bold">
                        {order.buyerType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {order.mandiLocation} • Volume: <strong className="text-slate-800">{order.quantityQuintals} Qtl</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm font-bold font-mono text-indigo-700 block">
                        ₹{order.pricePerQuintal}/Qtl
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{order.timestamp}</span>
                    </div>

                    <button
                      onClick={() => handleMatchOrder(order)}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs transition cursor-pointer shadow-2xs"
                      title="Buy at this asking price"
                    >
                      Buy Lot
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
