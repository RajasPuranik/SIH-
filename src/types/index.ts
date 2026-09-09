export type Language = 'en' | 'hi' | 'pa' | 'mr';

export type UserRole = 'farmer' | 'mandi_officer' | 'corporate_buyer';

export type ActivePillar = 'govt' | 'exchange';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  avatar: string;
  state: string;
  district: string;
  primaryMandi: string;
  createdAt: string;

  // Kissan / Farmer specific
  aadhaarMasked?: string;
  khasraNumber?: string; // Land registry ID
  landSizeAcres?: number;
  primaryCrop?: string;
  bankName?: string;
  accountMasked?: string;
  ifscCode?: string;
  dbtVerified?: boolean;

  // Officer specific
  employeeId?: string;
  designation?: string;
  department?: string;
  assignedGate?: string;
  assignedRamp?: string;

  // Corporate Buyer specific
  companyName?: string;
  gstin?: string;
  tradeLicenseNo?: string;
  buyerType?: 'Corporate' | 'Flour Mill' | 'Oil Expeller' | 'Exporter';
  escrowBalance?: number;
}

export interface CropInfo {
  id: string;
  name: string;
  hindiName: string;
  category: 'Rabi' | 'Kharif' | 'Zaid';
  mspRate: number; // in INR per Quintal
  currentPrivatePrice: number; // in INR per Quintal
  priceChange24h: number; // percentage
  trend: 'up' | 'down' | 'stable';
  minSupportPriceYear: string;
  moistureStandardMax: number; // percentage
  faqStandards: string;
}

export type SlotStatus = 
  | 'BOOKED'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_GATE'
  | 'QUALITY_VERIFIED'
  | 'WEIGHED'
  | 'MSP_BILLED'
  | 'PAYMENT_COMPLETED';

export interface SlotBooking {
  id: string;
  tokenNumber: string;
  farmerName: string;
  farmerPhone: string;
  aadhaarMasked: string;
  state: string;
  district: string;
  mandiName: string;
  cropId: string;
  cropName: string;
  estimatedQuantityQuintals: number;
  vehicleType: 'Tractor Trolley' | 'Pickup / Mini Truck' | 'Truck' | 'Bullock Cart';
  vehicleNumber: string;
  bookingDate: string;
  scheduledTimeSlot: string;
  status: SlotStatus;
  statusHistory: {
    stage: SlotStatus;
    timestamp: string;
    remarks: string;
    officerName?: string;
  }[];
  qualityCheck?: {
    moisturePercent: number;
    foreignMatterPercent: number;
    grainGrade: 'Grade-A' | 'Grade-B' | 'Rejected';
    inspectorRemarks: string;
  };
  weighbridge?: {
    grossWeightKg: number;
    tareWeightKg: number;
    netWeightKg: number;
    netWeightQuintals: number;
  };
  paymentDetails?: {
    mspRatePerQuintal: number;
    totalGrossAmount: number;
    deductions: number;
    netPayableAmount: number;
    bankName: string;
    accountMasked: string;
    ifscCode: string;
    pfmsReferenceId: string;
    dbtStatus: 'INITIATED' | 'PROCESSING' | 'SUCCESS';
    disbursedAt?: string;
  };
}

export interface OrderBookItem {
  id: string;
  type: 'BUY' | 'SELL';
  cropId: string;
  pricePerQuintal: number;
  quantityQuintals: number;
  buyerOrSellerName: string;
  buyerType: 'Corporate' | 'Flour Mill' | 'Oil Expeller' | 'Exporter' | 'Farmer';
  mandiLocation: string;
  timestamp: string;
}

export interface AIPredictionData {
  cropId: string;
  currentAvgPrice: number;
  predictedPrice7Days: number;
  recommendation: 'STRONG_HOLD' | 'HOLD' | 'SELL_NOW' | 'SPLIT_SELL';
  confidenceScore: number; // e.g. 92%
  forecastData: {
    day: string;
    actualPrice?: number;
    predictedPrice: number;
    upperBand: number;
    lowerBand: number;
  }[];
  drivingFactors: {
    title: string;
    impact: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
}

export interface DistrictMandiRate {
  district: string;
  mandiName: string;
  cropId: string;
  modalPrice: number; // avg selling rate
  minPrice: number;
  maxPrice: number;
  arrivalVolumeQuintals: number;
  distanceKmFromUser: number;
  estimatedFreightPerQuintal: number;
  netRealizationPerQuintal: number;
  congestionLevel: 'Low' | 'Moderate' | 'High';
  estimatedWaitMinutes: number;
}
