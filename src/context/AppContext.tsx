import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  ActivePillar,
  UserRole,
  SlotBooking,
  OrderBookItem,
  Shipment,
  SlotStatus,
  CropInfo,
  UserProfile,
} from '../types';
import { CROPS_DATA, INITIAL_BOOKINGS, INITIAL_ORDER_BOOK } from '../data/mockData';
import { usePersistentState } from '../hooks/usePersistentState';

export interface NotificationItem {
  id: string;
  type: 'SMS' | 'WHATSAPP' | 'SYSTEM';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export const DEMO_PROFILES: Record<UserRole, UserProfile> = {
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
  },
  farmer: {
    id: 'usr-kisan-01',
    name: 'Rameshwar Patidar (\u0930\u093e\u092e\u0947\u0936\u094d\u0935\u0930 \u092a\u093e\u091f\u0940\u0926\u093e\u0930)',
    phone: '+91 98260 41239',
    email: 'rameshwar.kisan@agrimail.in',
    role: 'farmer',
    avatar: '\ud83d\udc68\u200d\ud83c\udf3e',
    state: 'Madhya Pradesh',
    district: 'Indore',
    primaryMandi: 'Indore APMC Mandi (Chhavani)',
    createdAt: '2024-03-15',
    aadhaarMasked: 'XXXX-XXXX-8921',
    khasraNumber: 'MP-IND-8921/2021',
    landSizeAcres: 18.5,
    primaryCrop: 'Wheat (Sharbati) & Soybean',
    bankName: 'State Bank of India (Indore Agri Branch)',
    accountMasked: '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 5612',
    ifscCode: 'SBIN0001245',
    dbtVerified: true,
  },
  mandi_officer: {
    id: 'usr-officer-01',
    name: 'Dr. Sunita Chouhan (\u0921\u0949. \u0938\u0941\u0928\u0940\u0924\u093e \u091a\u094c\u0939\u093e\u0928)',
    phone: '+91 94250 11920',
    email: 'sunita.chouhan@mpmandi.gov.in',
    role: 'mandi_officer',
    avatar: '\ud83d\udc69\u200d\ud83d\udcbc',
    state: 'Madhya Pradesh',
    district: 'Indore',
    primaryMandi: 'Indore APMC Mandi (Chhavani)',
    createdAt: '2022-08-10',
    employeeId: 'APMC-MP-IND-042',
    designation: 'Chief Quality Assay & Gate Inspector',
    department: 'Department of Agricultural Marketing & Mandi Board',
    assignedGate: 'Gate No. 3 (North Entry)',
    assignedRamp: 'Ramp 4A',
  },
  corporate_buyer: {
    id: 'usr-buyer-01',
    name: 'Vikram Singhania (\u0935\u093f\u0915\u094d\u0930\u092e \u0938\u093f\u0902\u0918\u093e\u0928\u093f\u092f\u093e)',
    phone: '+91 98110 55432',
    email: 'procurement@itcagri.com',
    role: 'corporate_buyer',
    avatar: '\ud83c\udfe2',
    state: 'Madhya Pradesh',
    district: 'Indore',
    primaryMandi: 'Indore Mandi Hub',
    createdAt: '2023-05-19',
    companyName: 'ITC e-Choupal / Aashirvaad Agrotech Ltd.',
    gstin: '23AAACI1245P1Z3',
    tradeLicenseNo: 'APMC-TR-IND-2025-9941',
    buyerType: 'Corporate',
    escrowBalance: 1850000,
  },
  admin: {
    id: 'usr-admin-01',
    name: 'Rajesh Sharma (Central APMC Admin)',
    phone: '+91 99999 00001',
    email: 'admin.board@kisantrack.gov.in',
    role: 'admin',
    avatar: '🛡️',
    state: 'Central Jurisdiction',
    district: 'New Delhi / Central HQ',
    primaryMandi: 'All Mandis (National Regulator)',
    createdAt: '2022-01-01',
    designation: 'Chief Director of Agricultural Market Intelligence',
    department: 'Department of Agriculture & Farmers Welfare',
    adminRoleTitle: 'Super Administrator',
    permissions: ['all_mandis_read_write', 'price_master_override', 'token_audit', 'data_export'],
    accessLevel: 'Super Admin',
  },
};

interface AppContextType {
  activePillar: ActivePillar;
  setActivePillar: (pillar: ActivePillar) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedCropId: string;
  setSelectedCropId: (id: string) => void;
  crops: CropInfo[];
  updateCropMSP: (cropId: string, newMsp: number, newPrivatePrice?: number) => void;

  // User Auth & Profile
  users: UserProfile[];
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  isLoggedIn: boolean;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  loginUser: (role: UserRole, phoneOrId?: string, name?: string) => void;
  loginWithPhone: (phone: string) => { success: boolean; message: string };
  registerUser: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => { success: boolean; message: string };
  isPhoneRegistered: (phone: string) => boolean;
  logoutUser: () => void;
  updateUserProfile: (updated: Partial<UserProfile>) => void;

  // Bookings & Pillar 1 state
  bookings: SlotBooking[];
  activeBookingId: string;
  setActiveBookingId: (id: string) => void;
  getActiveBooking: () => SlotBooking | undefined;
  createBooking: (newBooking: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'>) => SlotBooking;
  updateBookingStatus: (id: string, newStatus: SlotStatus, remarks?: string, officerName?: string) => void;

  // Order Book & Pillar 2 state
  orderBook: OrderBookItem[];
  shipments: Shipment[];
  updateShipmentStatus: (id: string, status: Shipment['status']) => void;
  addOrderItem: (item: Omit<OrderBookItem, 'id' | 'timestamp'>) => void;
  executeTrade: (orderId: string, matchedQuantity: number) => { success: boolean; message: string };

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  addNotification: (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => void;

  // Active Modals
  isIVRModalOpen: boolean; isIVRDialpadOpen: boolean; setIsIVRDialpadOpen: (val: boolean) => void;
  setIsIVRModalOpen: (open: boolean) => void;
  isTokenModalOpen: boolean;
  setIsTokenModalOpen: (open: boolean) => void;
  isOfficerScannerOpen: boolean;
  setIsOfficerScannerOpen: (open: boolean) => void;
  isTradeModalOpen: boolean;
  setIsTradeModalOpen: (open: boolean) => void;
  isAudioAssistantOpen: boolean;
  setIsAudioAssistantOpen: (open: boolean) => void;
  isPhoneBotOpen: boolean;
  setIsPhoneBotOpen: (open: boolean) => void;
  phoneBotMode: 'inbound' | 'outbound';
  setPhoneBotMode: (mode: 'inbound' | 'outbound') => void;
  openPhoneBot: (mode?: 'inbound' | 'outbound') => void;

  // Sound feedback
  playFeedbackTone: (type?: 'success' | 'ping' | 'alert') => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activePillar, setActivePillar] = useState<ActivePillar>('govt');
  const [userRole, setUserRoleState] = useState<UserRole>('farmer');
  const [selectedCropId, setSelectedCropId] = useState<string>('wheat');
  const [crops, setCrops] = useState<CropInfo[]>(CROPS_DATA);
  const [bookings, setBookings] = usePersistentState<SlotBooking[]>('kt_bookings', INITIAL_BOOKINGS);
  const [activeBookingId, setActiveBookingId] = useState<string>(INITIAL_BOOKINGS[0].id);
  const [orderBook, setOrderBook] = usePersistentState<OrderBookItem[]>('kt_orderBook', INITIAL_ORDER_BOOK);
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


  // Auth State — null means not logged in; persisted so session survives refresh
  const [users, setUsers] = usePersistentState<UserProfile[]>('kt_users', []);
  const [currentUser, setCurrentUserState] = usePersistentState<UserProfile | null>('kt_current_user', null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isLoggedIn = currentUser !== null;

  const setUserRole = (role: UserRole) => setUserRoleState(role);

  // Wrapper that accepts UserProfile (for context value compat)
  const setCurrentUser = (user: UserProfile) => setCurrentUserState(user);

  const playFeedbackTone = (type: 'success' | 'ping' | 'alert' = 'ping') => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      if (type === 'success') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(330, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.15);
      }
    } catch {
      // audio context unavailable
    }
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      type: 'SMS',
      title: 'Slot Approved: KT-MP-2026-9041',
      message: 'Your wheat slot at Indore Mandi is confirmed for 10:30 AM tomorrow. Gate 3 entry with QR Token.',
      timestamp: '10 mins ago',
      read: false,
    },
    {
      id: 'notif-2',
      type: 'WHATSAPP',
      title: 'Private Buyer Alert: Premium Rs 2,610/qtl',
      message: 'ITC Choupal posted buy order for 300 Quintals of Sharbati Wheat at Rs 2,610/qtl above MSP.',
      timestamp: '25 mins ago',
      read: false,
    },
  ]);

  const addNotification = (notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: 'notif-' + Date.now(),
      timestamp: 'Just now',
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const isPhoneRegistered = (phone: string): boolean => {
    const normalized = phone.replace(/\D/g, '').slice(-10);
    return users.some(u => u.phone.replace(/\D/g, '').slice(-10) === normalized);
  };

  const getUserByPhone = (phone: string): UserProfile | null => {
    const normalized = phone.replace(/\D/g, '').slice(-10);
    return users.find(u => u.phone.replace(/\D/g, '').slice(-10) === normalized) ?? null;
  };

  const loginUser = (role: UserRole, phoneOrId?: string, name?: string) => {
    setUserRoleState(role);
    // If a phone is provided, check if user is already registered
    if (phoneOrId) {
      const existingUser = getUserByPhone(phoneOrId);
      if (existingUser) {
        setCurrentUserState(existingUser);
        setIsAuthModalOpen(false);
        setActivePillar(existingUser.role === 'corporate_buyer' ? 'exchange' : 'govt');
        playFeedbackTone('success');
        addNotification({
          type: 'SYSTEM',
          title: 'Welcome back, ' + existingUser.name.split(' ')[0] + '!',
          message: 'Logged in with your registered profile.',
        });
        return;
      }
    }
    const baseProfile = DEMO_PROFILES[role];
    const loggedUser: UserProfile = {
      ...baseProfile,
      name: name || baseProfile.name,
      phone: phoneOrId && phoneOrId.includes('+91') ? phoneOrId : baseProfile.phone,
    };
    setCurrentUserState(loggedUser);
    setIsAuthModalOpen(false);
    if (role === 'farmer') setActivePillar('govt');
    else if (role === 'corporate_buyer') setActivePillar('exchange');
    else setActivePillar('govt');
    playFeedbackTone('success');
    const roleTitle =
      role === 'farmer'
        ? 'Kissan'
        : role === 'mandi_officer'
        ? 'APMC Officer'
        : role === 'corporate_buyer'
        ? 'Corporate Buyer'
        : 'System Administrator';
    addNotification({
      type: 'SYSTEM',
      title: 'Welcome, ' + loggedUser.name.split(' ')[0] + '!',
      message: 'You are logged in as ' + roleTitle + '. Your dashboard is ready.',
    });
  };

  const loginWithPhone = (phone: string): { success: boolean; message: string } => {
    const user = getUserByPhone(phone);
    if (!user) {
      return { success: false, message: 'No account found for this phone number. Please register first.' };
    }
    setUserRoleState(user.role);
    setCurrentUserState(user);
    setIsAuthModalOpen(false);
    setActivePillar(user.role === 'corporate_buyer' ? 'exchange' : 'govt');
    playFeedbackTone('success');
    addNotification({
      type: 'SYSTEM',
      title: 'Welcome back, ' + user.name.split(' ')[0] + '!',
      message: 'You are logged in with your registered profile.',
    });
    return { success: true, message: 'Logged in successfully.' };
  };

  const registerUser = (newProfile: Omit<UserProfile, 'id' | 'createdAt'>): { success: boolean; message: string } => {
    const phone = newProfile.phone;
    if (isPhoneRegistered(phone)) {
      return { success: false, message: 'This phone number is already registered. Please login instead.' };
    }
    const registered: UserProfile = {
      ...newProfile,
      id: 'usr-' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setUsers((prev) => [...prev, registered]);
    setUserRoleState(registered.role);
    setCurrentUserState(registered);
    setIsAuthModalOpen(false);
    if (registered.role === 'farmer') setActivePillar('govt');
    else if (registered.role === 'corporate_buyer') setActivePillar('exchange');
    playFeedbackTone('success');
    addNotification({
      type: 'SYSTEM',
      title: 'Account Registered Successfully',
      message: 'Welcome to KisanTrack, ' + registered.name + '! Your profile has been saved.',
    });
    return { success: true, message: 'Registered successfully!' };
  };

  const logoutUser = () => {
    setCurrentUserState(null);
    setUserRoleState('farmer');
    setIsProfileModalOpen(false);
    playFeedbackTone('alert');
  };

  const updateUserProfile = (updated: Partial<UserProfile>) => {
    setCurrentUserState((prev) => (prev ? { ...prev, ...updated } : null));
    playFeedbackTone('success');
    addNotification({
      type: 'SYSTEM',
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully.',
    });
  };

  // Modals
  const [isIVRModalOpen, setIsIVRModalOpen] = useState(false);
  const [isIVRDialpadOpen, setIsIVRDialpadOpen] = useState(false);
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isOfficerScannerOpen, setIsOfficerScannerOpen] = useState(false);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isAudioAssistantOpen, setIsAudioAssistantOpen] = useState(false);
  const [isPhoneBotOpen, setIsPhoneBotOpen] = useState(false);
  const [phoneBotMode, setPhoneBotMode] = useState<'inbound' | 'outbound'>('inbound');

  const openPhoneBot = (mode: 'inbound' | 'outbound' = 'inbound') => {
    setPhoneBotMode(mode);
    setIsPhoneBotOpen(true);
  };

  // ─── LIVE PRICE SIMULATION ───
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const LIVE_BUYERS = ['Reliance Agri', 'Adani Foods', 'Marico Ltd', 'Emami Agrotech', 'DCM Shriram'];
    const LIVE_SELLERS = ['FPO Malwa', 'Narmada Collective', 'Kisan Syndicate', 'PACS Indore'];
    const LOCATIONS = ['Indore Mandi', 'Ujjain Gate', 'Dewas Depot', 'Morena APMC'];
    const QTY_OPTIONS = [50, 80, 100, 150, 200, 250];

    tickerRef.current = setInterval(() => {
      // Update live crop prices
      setCrops((prev) =>
        prev.map((crop) => {
          const volatility = crop.mspRate * 0.003;
          const delta = (Math.random() - 0.48) * volatility;
          const newPrice = Math.max(
            crop.mspRate * 0.95,
            Math.round((crop.currentPrivatePrice + delta) * 10) / 10
          );
          const change = parseFloat(((newPrice - crop.mspRate) / crop.mspRate * 100).toFixed(2));
          return {
            ...crop,
            currentPrivatePrice: newPrice,
            priceChange24h: change,
            trend: newPrice >= crop.currentPrivatePrice ? 'up' : 'down',
          };
        })
      );

      // 30% chance: add a new live order book entry
      if (Math.random() < 0.3) {
        const cropIds = ['wheat', 'mustard', 'soybean'];
        const cropId = cropIds[Math.floor(Math.random() * cropIds.length)];
        const isBuy = Math.random() > 0.5;
        const baseCrop = CROPS_DATA.find((c) => c.id === cropId);
        if (baseCrop) {
          const price = Math.round(baseCrop.currentPrivatePrice * (0.985 + Math.random() * 0.03));
          setOrderBook((prev) => {
            const trimmed = prev.slice(0, 18);
            return [
              {
                id: 'ob-live-' + Date.now(),
                type: isBuy ? 'BUY' : 'SELL',
                cropId,
                pricePerQuintal: price,
                quantityQuintals: QTY_OPTIONS[Math.floor(Math.random() * QTY_OPTIONS.length)],
                buyerOrSellerName: isBuy
                  ? LIVE_BUYERS[Math.floor(Math.random() * LIVE_BUYERS.length)]
                  : LIVE_SELLERS[Math.floor(Math.random() * LIVE_SELLERS.length)],
                buyerType: isBuy ? 'Corporate' : 'Farmer',
                mandiLocation: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
                timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
              },
              ...trimmed,
            ];
          });
        }
      }
    }, 4000);

    return () => {
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  const getActiveBooking = () => {
    if (!currentUser) return undefined;
    if (currentUser.role === 'mandi_officer' || currentUser.role === 'admin') {
      return bookings.find((b) => b.id === activeBookingId) || bookings[0];
    }
    const cleanPhone = (p?: string) => (p || '').replace(/\D/g, '').slice(-10);
    const myBookings = bookings.filter(b => cleanPhone(b.farmerPhone) === cleanPhone(currentUser.phone));
    if (myBookings.length === 0) return undefined;
    return myBookings.find(b => b.id === activeBookingId) || myBookings[0];
  };

  const createBooking = (
    newBookingData: Omit<SlotBooking, 'id' | 'tokenNumber' | 'status' | 'statusHistory'>
  ): SlotBooking => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const tokenNumber = 'KT-' + newBookingData.state.slice(0, 2).toUpperCase() + '-2026-' + randomNum;
    const newId = 'bk-' + Date.now();
    const crop = crops.find((c) => c.id === newBookingData.cropId);
    const mspPrice = crop ? crop.mspRate : 2425;
    const grossAmount = newBookingData.estimatedQuantityQuintals * mspPrice;

    const newBooking: SlotBooking = {
      ...newBookingData,
      id: newId,
      tokenNumber,
      status: 'BOOKED',
      statusHistory: [
        {
          stage: 'BOOKED',
          timestamp: new Date().toLocaleDateString('en-GB', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
          remarks: 'Slot booked successfully via KisanTrack Portal. Priority token allotted.',
        },
      ],
      paymentDetails: {
        mspRatePerQuintal: mspPrice,
        totalGrossAmount: grossAmount,
        deductions: 0,
        netPayableAmount: grossAmount,
        bankName: 'State Bank of India',
        accountMasked: '\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 7192',
        ifscCode: 'SBIN0004112',
        pfmsReferenceId: 'PFMS-2026-' + randomNum,
        dbtStatus: 'INITIATED',
      },
    };

    setBookings((prev) => [newBooking, ...prev]);
    setActiveBookingId(newId);
    playFeedbackTone('success');
    addNotification({
      type: 'SMS',
      title: 'Token Generated: ' + tokenNumber,
      message:
        'Your booking at ' +
        newBooking.mandiName +
        ' for ' +
        newBooking.cropName +
        ' is confirmed for ' +
        newBooking.bookingDate +
        ' (' +
        newBooking.scheduledTimeSlot +
        ').',
    });
    return newBooking;
  };

  const updateBookingStatus = (
    id: string,
    newStatus: SlotStatus,
    remarks: string = '',
    officerName?: string
  ) => {
    setBookings((prev) =>
      prev.map((booking) => {
        if (booking.id !== id && booking.tokenNumber !== id) return booking;
        const updatedHistory = [
          ...booking.statusHistory,
          {
            stage: newStatus,
            timestamp: new Date().toLocaleDateString('en-GB', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            }),
            remarks: remarks || 'Status advanced to ' + newStatus,
            officerName,
          },
        ];
        const updatedBooking = { ...booking, status: newStatus, statusHistory: updatedHistory };
        if (newStatus === 'QUALITY_VERIFIED' && !updatedBooking.qualityCheck) {
          updatedBooking.qualityCheck = {
            moisturePercent: 11.4,
            foreignMatterPercent: 0.6,
            grainGrade: 'Grade-A',
            inspectorRemarks: 'Passed moisture assay & purity guidelines.',
          };
        }
        if (newStatus === 'WEIGHED' && !updatedBooking.weighbridge) {
          const netKg = booking.estimatedQuantityQuintals * 100;
          updatedBooking.weighbridge = {
            grossWeightKg: netKg + 2800,
            tareWeightKg: 2800,
            netWeightKg: netKg,
            netWeightQuintals: booking.estimatedQuantityQuintals,
          };
        }
        if (newStatus === 'PAYMENT_COMPLETED' && updatedBooking.paymentDetails) {
          updatedBooking.paymentDetails.dbtStatus = 'SUCCESS';
          updatedBooking.paymentDetails.disbursedAt = new Date().toLocaleDateString('en-GB', {
            hour: '2-digit',
            minute: '2-digit',
          });
        }
        return updatedBooking;
      })
    );
    playFeedbackTone('success');

    // Notify the farmer
    const booking = bookings.find(b => b.id === id || b.tokenNumber === id);
    if (booking) {
      let stageName = newStatus.replace(/_/g, ' ');
      if (newStatus === 'ARRIVED_AT_GATE') stageName = 'Arrived at Gate';
      if (newStatus === 'QUALITY_VERIFIED') stageName = 'Quality Verified';
      if (newStatus === 'WEIGHED') stageName = 'Weighed';
      if (newStatus === 'PAYMENT_COMPLETED') stageName = 'Payment Completed';

      addNotification({
        type: 'SYSTEM',
        title: `Token ${booking.tokenNumber} Updated`,
        message: `Your token has successfully advanced to the '${stageName}' stage. ${remarks}`
      });
    }
  };

  const addOrderItem = (item: Omit<OrderBookItem, 'id' | 'timestamp'>) => {
    const newItem: OrderBookItem = {
      ...item,
      id: 'ob-' + Date.now(),
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };
    setOrderBook((prev) => [newItem, ...prev]);
    playFeedbackTone('success');
    addNotification({
      type: 'SYSTEM',
      title: 'Order Placed on Exchange',
      message:
        item.type +
        ' order for ' +
        item.quantityQuintals +
        ' Qtl of ' +
        item.cropId.toUpperCase() +
        ' @ Rs' +
        item.pricePerQuintal +
        '/Qtl listed.',
    });
  };

  const executeTrade = (orderId: string, matchedQuantity: number) => {
    const order = orderBook.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };
    setOrderBook((prev) => prev.filter((o) => o.id !== orderId));
    playFeedbackTone('success');
    addNotification({
      type: 'SYSTEM',
      title: 'Trade Matched & Escrow Locked!',
      message:
        'Executed ' +
        matchedQuantity +
        ' Quintals with ' +
        order.buyerOrSellerName +
        ' at Rs' +
        order.pricePerQuintal +
        '/Qtl. Funds in Agri-Escrow.',
    });
    return { success: true, message: 'Trade matched! Escrow deposit initiated.' };
  };

  const updateCropMSP = (cropId: string, newMsp: number, newPrivatePrice?: number) => {
    setCrops((prev) =>
      prev.map((c) =>
        c.id === cropId
          ? {
              ...c,
              mspRate: newMsp,
              currentPrivatePrice: newPrivatePrice !== undefined ? newPrivatePrice : c.currentPrivatePrice,
            }
          : c
      )
    );
    playFeedbackTone('success');
    addNotification({
      type: 'SYSTEM',
      title: 'MSP Benchmark Updated',
      message: `Updated MSP for ${cropId.toUpperCase()} to ₹${newMsp}/Quintal.`,
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  // Effective user for context (fallback to farmer profile when not logged in)
  const effectiveUser = currentUser ?? DEMO_PROFILES.farmer;

  return (
    <AppContext.Provider
      value={{
        activePillar,
        setActivePillar,
        userRole,
        setUserRole,
        selectedCropId,
        setSelectedCropId,
        crops,
        updateCropMSP,
        users,
        currentUser: effectiveUser,
        setCurrentUser,
        isLoggedIn,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isProfileModalOpen,
        setIsProfileModalOpen,
        loginUser,
        loginWithPhone,
        registerUser,
        isPhoneRegistered,
        logoutUser,
        updateUserProfile,
        bookings,
        activeBookingId,
        setActiveBookingId,
        getActiveBooking,
        createBooking,
        updateBookingStatus,
        orderBook,
        shipments,
        updateShipmentStatus,
        addOrderItem,
        executeTrade,
        notifications,
        markNotificationAsRead,
        addNotification,
        isIVRModalOpen,
        setIsIVRModalOpen,
        isIVRDialpadOpen,
        setIsIVRDialpadOpen,
        isTokenModalOpen,
        setIsTokenModalOpen,
        isOfficerScannerOpen,
        setIsOfficerScannerOpen,
        isTradeModalOpen,
        setIsTradeModalOpen,
        isAudioAssistantOpen,
        setIsAudioAssistantOpen,
        isPhoneBotOpen,
        setIsPhoneBotOpen,
        phoneBotMode,
        setPhoneBotMode,
        openPhoneBot,
        playFeedbackTone,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
