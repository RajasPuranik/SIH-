import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Database,
  Download,
  FileText,
  Activity,
  Users,
  Search,
  Check,
  RefreshCw,
  Building2,
  Server,
  DollarSign,
  TrendingUp,
  Clock,
  Filter,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Sliders,
  Table,
} from 'lucide-react';
import { useApp, DEMO_PROFILES } from '../../context/AppContext';
import { SlotBooking, SlotStatus, CropInfo } from '../../types';

export const AdminView: React.FC = () => {
  const {
    crops,
    updateCropMSP,
    bookings,
    updateBookingStatus,
    currentUser,
    orderBook,
    addNotification,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'data' | 'tokens' | 'pricing' | 'users'>('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  
  // Price editing state
  const [editingCropId, setEditingCropId] = useState<string | null>(null);
  const [editMspValue, setEditMspValue] = useState<number>(0);
  const [editPrivatePrice, setEditPrivatePrice] = useState<number>(0);

  // Export functions
  const exportData = (type: 'bookings' | 'crops' | 'users' | 'orderbook', format: 'json' | 'csv') => {
    let data: any[] = [];
    let filename = `kisantrack-${type}-${new Date().toISOString().split('T')[0]}`;

    if (type === 'bookings') data = bookings;
    else if (type === 'crops') data = crops;
    else if (type === 'users') data = Object.values(DEMO_PROFILES);
    else if (type === 'orderbook') data = orderBook;

    let content = '';
    let mimeType = '';

    if (format === 'json') {
      content = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
      filename += '.json';
    } else {
      if (data.length === 0) {
        alert('No data available to export');
        return;
      }
      const keys = Object.keys(data[0]);
      const csvRows = [
        keys.join(','),
        ...data.map((row) =>
          keys
            .map((k) => {
              const val = row[k];
              const escaped = (typeof val === 'object' ? JSON.stringify(val) : String(val ?? '')).replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(',')
        ),
      ];
      content = csvRows.join('\n');
      mimeType = 'text/csv';
      filename += '.csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    addNotification({
      type: 'SYSTEM',
      title: 'Data Export Generated',
      message: `Downloaded ${filename} successfully.`,
    });
  };

  // Filtered bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        b.tokenNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.cropName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.mandiName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = selectedStatusFilter === 'ALL' || b.status === selectedStatusFilter;
      return matchSearch && matchStatus;
    });
  }, [bookings, searchTerm, selectedStatusFilter]);

  // Handle MSP update
  const handleSaveMSP = (cropId: string) => {
    updateCropMSP(cropId, editMspValue, editPrivatePrice);
    setEditingCropId(null);
  };

  const startEditCrop = (c: CropInfo) => {
    setEditingCropId(c.id);
    setEditMspValue(c.mspRate);
    setEditPrivatePrice(c.currentPrivatePrice);
  };

  // Metrics
  const totalQuintalsProcured = bookings.reduce((sum, b) => sum + (b.estimatedQuantityQuintals || 0), 0);
  const activeTokensCount = bookings.filter((b) => b.status !== 'PAYMENT_COMPLETED').length;
  const totalDbtDisbursed = bookings
    .filter((b) => b.status === 'PAYMENT_COMPLETED' || b.status === 'MSP_BILLED')
    .reduce((sum, b) => sum + (b.estimatedQuantityQuintals || 0) * 2275, 0);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 text-white rounded-xl p-6 border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-semibold mb-2 border border-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Central Administrator Control Center
          </div>
          <h1 className="text-2xl font-bold tracking-tight">National Mandi Administration</h1>
          <p className="text-slate-400 text-xs mt-1">
            Real-time APMC oversight, token queue audit, price benchmarks & platform data export.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => exportData('bookings', 'json')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 transition cursor-pointer"
            title="Download full JSON dataset"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={() => exportData('bookings', 'csv')}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
            title="Download CSV spreadsheet"
          >
            <Table className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto no-scrollbar pb-1 text-xs font-semibold">
        {[
          { id: 'overview', label: 'System Overview', icon: BarChart3 },
          { id: 'data', label: 'Data Hub & Raw Export', icon: Database },
          { id: 'tokens', label: 'Token Queue & Audit', icon: Activity },
          { id: 'pricing', label: 'MSP & Price Master', icon: Sliders },
          { id: 'users', label: 'User Directory', icon: Users },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: SYSTEM OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metric Tiles */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Total Procurement Volume</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {totalQuintalsProcured.toLocaleString()} <span className="text-xs font-normal text-slate-500">Qtl</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-2 font-medium">
                <TrendingUp className="w-3 h-3" /> +14.2% vs yesterday
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Active Mandi Queue</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">
                {activeTokensCount} <span className="text-xs font-normal text-slate-500">Tokens In-Flight</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2 font-medium">
                <Clock className="w-3 h-3 text-slate-400" /> Avg Gate Delay: 14 Mins
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">Total DBT Direct Disbursed</span>
              <span className="text-2xl font-bold text-emerald-700 mt-1 block">
                ₹{(totalDbtDisbursed / 100000).toFixed(1)} <span className="text-xs font-normal text-slate-500">Lakhs</span>
              </span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 mt-2 font-medium">
                <CheckCircle2 className="w-3 h-3" /> 100% Aadhaar-linked
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-medium text-slate-500 block">APMC Mandis Monitored</span>
              <span className="text-2xl font-bold text-slate-900 mt-1 block">18 <span className="text-xs font-normal text-slate-500">Centers</span></span>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2 font-medium">
                <Building2 className="w-3 h-3 text-slate-400" /> 100% Gates Live
              </div>
            </div>
          </div>

          {/* System Telemetry & Pipeline Health */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Helpline & Voice Bot Telemetry</h3>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  All Systems Normal
                </span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Track AI Status</span>
                  <span className="font-semibold text-emerald-600">Active (Full-Duplex Interruption Ready)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">STT Regional Dialect Engines</span>
                  <span className="font-semibold text-slate-700">5 Dialects Online (HI, MR, PA, TA, TE)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">TTS Audio Streaming Latency</span>
                  <span className="font-semibold text-slate-700">~45ms (Streaming)</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Barge-in Interruption Threshold</span>
                  <span className="font-semibold text-slate-700">35ms (Auto Voice Activity Detection)</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-slate-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Gate Congestion Summary</h3>
                </div>
                <span className="text-[10px] text-slate-400">Refreshed just now</span>
              </div>
              <div className="space-y-3 text-xs">
                {[
                  { name: 'Indore APMC (Chhavani)', wait: '12 min', status: 'Low Congestion', color: 'bg-emerald-500' },
                  { name: 'Ujjain Krishi Upaj Mandi', wait: '28 min', status: 'Moderate Flow', color: 'bg-amber-500' },
                  { name: 'Bhopal Karond Mandi', wait: '18 min', status: 'Optimal Flow', color: 'bg-emerald-500' },
                  { name: 'Dhar Grain Mandi', wait: '45 min', status: 'Peak Inflow', color: 'bg-rose-500' },
                ].map((mandi, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${mandi.color}`} />
                      <span className="font-medium text-slate-800">{mandi.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-right">
                      <span className="font-bold text-slate-900">{mandi.wait}</span>
                      <span className="text-[10px] text-slate-500">{mandi.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATA HUB & EXPORT */}
      {activeTab === 'data' && (
        <div className="space-y-5">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm mb-1">Central Data Export Engine</h3>
            <p className="text-xs text-slate-500 mb-4">
              Direct access to raw system databases. Export audit-ready datasets in standard CSV or JSON format.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: 'Farmer Bookings & Tokens', desc: `${bookings.length} total entries with timestamps & assay`, type: 'bookings' as const },
                { title: 'Commodity & MSP Matrix', desc: `${crops.length} crop benchmarks & market spreads`, type: 'crops' as const },
                { title: 'User & Profile Directory', desc: `Farmers, Officers, Buyers registry`, type: 'users' as const },
                { title: 'Exchange Order Book', desc: `${orderBook.length} active live bids & orders`, type: 'orderbook' as const },
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs">{item.title}</h4>
                    <p className="text-[11px] text-slate-500 mt-1">{item.desc}</p>
                  </div>
                  <div className="flex gap-2 mt-4 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => exportData(item.type, 'csv')}
                      className="flex-1 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[11px] rounded border border-slate-300 transition cursor-pointer text-center"
                    >
                      CSV
                    </button>
                    <button
                      onClick={() => exportData(item.type, 'json')}
                      className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[11px] rounded transition cursor-pointer text-center"
                    >
                      JSON
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Raw Data Preview Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-xs">Raw Bookings Database (Live Snapshot)</h3>
              <span className="text-[10px] text-slate-400 font-mono">Records: {bookings.length}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="px-4 py-3">Token #</th>
                    <th className="px-4 py-3">Farmer</th>
                    <th className="px-4 py-3">Crop</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Mandi Hub</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Vehicle</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.slice(0, 8).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono font-bold text-emerald-700">{b.tokenNumber}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium">{b.farmerName}</td>
                      <td className="px-4 py-3 text-slate-600">{b.cropName}</td>
                      <td className="px-4 py-3 font-semibold">{b.estimatedQuantityQuintals} Qtl</td>
                      <td className="px-4 py-3 text-slate-500">{b.mandiName}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {b.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">{b.vehicleNumber}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TOKEN QUEUE & AUDIT */}
      {activeTab === 'tokens' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Token Queue Oversight & Audit</h3>
              <p className="text-xs text-slate-500 mt-0.5">Filter, inspect, and manually advance or resolve token stages.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search token, farmer, crop..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 border border-slate-200 rounded-lg text-xs w-56 focus:outline-none focus:border-slate-400"
                />
              </div>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="BOOKED">BOOKED</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="ARRIVED_AT_GATE">ARRIVED_AT_GATE</option>
                <option value="QUALITY_VERIFIED">QUALITY_VERIFIED</option>
                <option value="WEIGHED">WEIGHED</option>
                <option value="MSP_BILLED">MSP_BILLED</option>
                <option value="PAYMENT_COMPLETED">PAYMENT_COMPLETED</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-4 py-3">Token #</th>
                  <th className="px-4 py-3">Farmer & Phone</th>
                  <th className="px-4 py-3">Slot Time</th>
                  <th className="px-4 py-3">Crop / Qty</th>
                  <th className="px-4 py-3">Current Status</th>
                  <th className="px-4 py-3 text-right">Audit Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-emerald-700">{b.tokenNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{b.farmerName}</div>
                      <div className="text-[10px] text-slate-400">{b.farmerPhone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{b.bookingDate}</div>
                      <div className="text-[10px] text-slate-400">{b.scheduledTimeSlot}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">{b.cropName}</span>
                      <span className="text-[10px] text-slate-500 block">{b.estimatedQuantityQuintals} Qtl</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        {b.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-1">
                      {b.status !== 'PAYMENT_COMPLETED' && (
                        <button
                          onClick={() => {
                            const nextStageMap: Record<SlotStatus, SlotStatus> = {
                              BOOKED: 'IN_TRANSIT',
                              IN_TRANSIT: 'ARRIVED_AT_GATE',
                              ARRIVED_AT_GATE: 'QUALITY_VERIFIED',
                              QUALITY_VERIFIED: 'WEIGHED',
                              WEIGHED: 'MSP_BILLED',
                              MSP_BILLED: 'PAYMENT_COMPLETED',
                              PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
                            };
                            updateBookingStatus(b.id, nextStageMap[b.status], 'Admin Override', 'Admin Supervisor');
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded text-[11px] font-medium transition cursor-pointer"
                        >
                          Advance Status
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: PRICING & MSP MASTER */}
      {activeTab === 'pricing' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Government MSP Master & Baseline Controls</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates made here directly propagate to farmer pricing, APMC calculation engines, and voicebot answers.
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="px-4 py-3">Crop Name</th>
                  <th className="px-4 py-3">Season</th>
                  <th className="px-4 py-3">Current MSP Rate</th>
                  <th className="px-4 py-3">Private Benchmark Rate</th>
                  <th className="px-4 py-3">Quality Tolerance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {crops.map((c) => {
                  const isEditing = editingCropId === c.id;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[10px] text-slate-400">{c.hindiName}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {c.category}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">₹</span>
                            <input
                              type="number"
                              value={editMspValue}
                              onChange={(e) => setEditMspValue(Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-slate-900"
                            />
                          </div>
                        ) : (
                          <span className="font-bold text-emerald-700 text-sm">₹{c.mspRate} / Qtl</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400">₹</span>
                            <input
                              type="number"
                              value={editPrivatePrice}
                              onChange={(e) => setEditPrivatePrice(Number(e.target.value))}
                              className="w-20 px-2 py-1 border border-slate-300 rounded text-xs font-bold text-slate-900"
                            />
                          </div>
                        ) : (
                          <span className="font-medium text-slate-700">₹{c.currentPrivatePrice} / Qtl</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        Max Moisture: {c.moistureStandardMax}%
                      </td>
                      <td className="px-4 py-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSaveMSP(c.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold cursor-pointer"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingCropId(null)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs cursor-pointer"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditCrop(c)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium cursor-pointer"
                          >
                            Edit Rate
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: USER DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">System User Registry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Authorized stakeholder accounts registered on the KisanTrack digital grid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.values(DEMO_PROFILES).map((usr) => (
              <div key={usr.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xl shrink-0">
                    {usr.avatar}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs">{usr.name}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">{usr.phone} • {usr.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-800 uppercase">
                        {usr.role}
                      </span>
                      <span className="text-[10px] text-slate-500">{usr.district}, {usr.state}</span>
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
