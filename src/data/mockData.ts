import { CropInfo, SlotBooking, OrderBookItem, AIPredictionData, DistrictMandiRate } from '../types';

export const CROPS_DATA: CropInfo[] = [
  {
    id: 'wheat',
    name: 'Wheat (गेहूँ)',
    hindiName: 'गेहूँ',
    category: 'Rabi',
    mspRate: 2425,
    currentPrivatePrice: 2580,
    priceChange24h: 1.85,
    trend: 'up',
    minSupportPriceYear: 'RMS 2025-26',
    moistureStandardMax: 12.0,
    faqStandards: 'Fair Average Quality (FAQ) - max 12% moisture, broken grains < 2%'
  },
  {
    id: 'mustard',
    name: 'Mustard / Sarson (सरसों)',
    hindiName: 'सरसों',
    category: 'Rabi',
    mspRate: 5950,
    currentPrivatePrice: 6240,
    priceChange24h: 2.4,
    trend: 'up',
    minSupportPriceYear: 'RMS 2025-26',
    moistureStandardMax: 8.0,
    faqStandards: 'Oil content > 38%, moisture max 8%'
  },
  {
    id: 'soybean',
    name: 'Soybean (सोयाबीन)',
    hindiName: 'सोयाबीन',
    category: 'Kharif',
    mspRate: 4892,
    currentPrivatePrice: 4620,
    priceChange24h: -0.9,
    trend: 'down',
    minSupportPriceYear: 'KMS 2025-26',
    moistureStandardMax: 10.0,
    faqStandards: 'Yellow variety, max 10% moisture'
  },
  {
    id: 'chana',
    name: 'Gram / Chana (चना)',
    hindiName: 'चना',
    category: 'Rabi',
    mspRate: 5650,
    currentPrivatePrice: 6150,
    priceChange24h: 3.1,
    trend: 'up',
    minSupportPriceYear: 'RMS 2025-26',
    moistureStandardMax: 10.5,
    faqStandards: 'FAQ grade, foreign matter < 1%'
  },
  {
    id: 'cotton',
    name: 'Cotton Medium Staple (कपास)',
    hindiName: 'कपास',
    category: 'Kharif',
    mspRate: 7121,
    currentPrivatePrice: 7350,
    priceChange24h: 0.65,
    trend: 'up',
    minSupportPriceYear: 'KMS 2025-26',
    moistureStandardMax: 8.5,
    faqStandards: 'Moisture < 8.5%, staple length > 27.5mm'
  },
  {
    id: 'paddy',
    name: 'Paddy Common (धान)',
    hindiName: 'धान',
    category: 'Kharif',
    mspRate: 2300,
    currentPrivatePrice: 2280,
    priceChange24h: -0.3,
    trend: 'down',
    minSupportPriceYear: 'KMS 2025-26',
    moistureStandardMax: 17.0,
    faqStandards: 'Moisture max 17%, inorganic matter < 1%'
  }
];

export const INITIAL_BOOKINGS: SlotBooking[] = [
  {
    id: 'bk-101',
    tokenNumber: 'KT-MP-2026-9041',
    farmerName: 'Rameshwar Patidar (रामेश्वर पाटीदार)',
    farmerPhone: '+91 98260 41239',
    aadhaarMasked: 'XXXX-XXXX-8921',
    state: 'Madhya Pradesh',
    district: 'Indore',
    mandiName: 'Indore APMC Mandi (Chhavani)',
    cropId: 'wheat',
    cropName: 'Wheat (गेहूँ Sharbati)',
    estimatedQuantityQuintals: 65,
    vehicleType: 'Tractor Trolley',
    vehicleNumber: 'MP-09-AB-4821',
    bookingDate: '2026-09-10',
    scheduledTimeSlot: '10:30 AM - 11:45 AM',
    status: 'QUALITY_VERIFIED',
    statusHistory: [
      {
        stage: 'BOOKED',
        timestamp: '2026-09-09 08:30 AM',
        remarks: 'Slot booked online via KisanTrack Portal. Token assigned.'
      },
      {
        stage: 'IN_TRANSIT',
        timestamp: '2026-09-10 09:15 AM',
        remarks: 'Farmer initiated journey with vehicle MP-09-AB-4821.'
      },
      {
        stage: 'ARRIVED_AT_GATE',
        timestamp: '2026-09-10 10:18 AM',
        remarks: 'Gate No. 3 Scanner verified QR token. Queue token #24.',
        officerName: 'Vikram Singh (Security In-Charge)'
      },
      {
        stage: 'QUALITY_VERIFIED',
        timestamp: '2026-09-10 10:45 AM',
        remarks: 'Lab moisture test passed. Grade A certified.',
        officerName: 'Dr. Sunita Chouhan (Quality Assay Officer)'
      }
    ],
    qualityCheck: {
      moisturePercent: 11.2,
      foreignMatterPercent: 0.8,
      grainGrade: 'Grade-A',
      inspectorRemarks: 'Sharbati grain quality premium. Within FAQ moisture tolerance (< 12%).'
    },
    weighbridge: {
      grossWeightKg: 9240,
      tareWeightKg: 2740,
      netWeightKg: 6500,
      netWeightQuintals: 65.0
    },
    paymentDetails: {
      mspRatePerQuintal: 2425,
      totalGrossAmount: 157625,
      deductions: 0,
      netPayableAmount: 157625,
      bankName: 'State Bank of India (Indore Agri Branch)',
      accountMasked: '•••• •••• 5612',
      ifscCode: 'SBIN0001245',
      pfmsReferenceId: 'PFMS-2026-MP09-88391',
      dbtStatus: 'PROCESSING'
    }
  },
  {
    id: 'bk-102',
    tokenNumber: 'KT-PB-2026-3812',
    farmerName: 'Gurpreet Singh Brar (ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ)',
    farmerPhone: '+91 94172 88190',
    aadhaarMasked: 'XXXX-XXXX-3341',
    state: 'Punjab',
    district: 'Ludhiana',
    mandiName: 'Khanna Grain Mandi',
    cropId: 'wheat',
    cropName: 'Wheat (गेहूँ HD-2967)',
    estimatedQuantityQuintals: 110,
    vehicleType: 'Truck',
    vehicleNumber: 'PB-10-CD-9902',
    bookingDate: '2026-09-08',
    scheduledTimeSlot: '09:00 AM - 10:30 AM',
    status: 'PAYMENT_COMPLETED',
    statusHistory: [
      {
        stage: 'BOOKED',
        timestamp: '2026-09-07 04:20 PM',
        remarks: 'Digital slot confirmed.'
      },
      {
        stage: 'IN_TRANSIT',
        timestamp: '2026-09-08 07:45 AM',
        remarks: 'Driver in transit.'
      },
      {
        stage: 'ARRIVED_AT_GATE',
        timestamp: '2026-09-08 08:52 AM',
        remarks: 'Checked in at North Gate 1.'
      },
      {
        stage: 'QUALITY_VERIFIED',
        timestamp: '2026-09-08 09:20 AM',
        remarks: 'Grade A approved.'
      },
      {
        stage: 'WEIGHED',
        timestamp: '2026-09-08 09:55 AM',
        remarks: 'Net weight: 108.5 Quintals recorded.'
      },
      {
        stage: 'MSP_BILLED',
        timestamp: '2026-09-08 10:15 AM',
        remarks: 'J-Form generated: #J-PB-KHN-9021.'
      },
      {
        stage: 'PAYMENT_COMPLETED',
        timestamp: '2026-09-09 11:30 AM',
        remarks: 'DBT credit successful directly to farmer bank account via PFMS.'
      }
    ],
    qualityCheck: {
      moisturePercent: 11.8,
      foreignMatterPercent: 0.9,
      grainGrade: 'Grade-A',
      inspectorRemarks: 'Clean dry harvest.'
    },
    weighbridge: {
      grossWeightKg: 15450,
      tareWeightKg: 4600,
      netWeightKg: 10850,
      netWeightQuintals: 108.5
    },
    paymentDetails: {
      mspRatePerQuintal: 2425,
      totalGrossAmount: 263112.5,
      deductions: 0,
      netPayableAmount: 263112.5,
      bankName: 'Punjab National Bank (Khanna)',
      accountMasked: '•••• •••• 9012',
      ifscCode: 'PUNB0182700',
      pfmsReferenceId: 'PFMS-2026-PB10-44910',
      dbtStatus: 'SUCCESS',
      disbursedAt: '2026-09-09 11:30 AM'
    }
  },
  {
    id: 'bk-103',
    tokenNumber: 'KT-MH-2026-1182',
    farmerName: 'Dnyaneshwar Jadhav (ज्ञानेश्वर जाधव)',
    farmerPhone: '+91 97654 22091',
    aadhaarMasked: 'XXXX-XXXX-6120',
    state: 'Maharashtra',
    district: 'Latur',
    mandiName: 'Latur Krishi Utpanna Bajar Samiti',
    cropId: 'soybean',
    cropName: 'Soybean (सोयाबीन JS-335)',
    estimatedQuantityQuintals: 40,
    vehicleType: 'Pickup / Mini Truck',
    vehicleNumber: 'MH-24-D-7210',
    bookingDate: '2026-09-11',
    scheduledTimeSlot: '11:00 AM - 12:15 PM',
    status: 'BOOKED',
    statusHistory: [
      {
        stage: 'BOOKED',
        timestamp: '2026-09-09 07:15 PM',
        remarks: 'Slot booked. Gate slot reserved with minimal queue wait.'
      }
    ],
    paymentDetails: {
      mspRatePerQuintal: 4892,
      totalGrossAmount: 195680,
      deductions: 0,
      netPayableAmount: 195680,
      bankName: 'Bank of Maharashtra (Latur)',
      accountMasked: '•••• •••• 4421',
      ifscCode: 'MAHB0000318',
      pfmsReferenceId: 'PFMS-PENDING-ALLOCATION',
      dbtStatus: 'INITIATED'
    }
  }
];

export const INITIAL_ORDER_BOOK: OrderBookItem[] = [
  // Buy Orders (Bids) - Private buyers looking to purchase
  {
    id: 'ob-b1',
    type: 'BUY',
    cropId: 'wheat',
    pricePerQuintal: 2610,
    quantityQuintals: 300,
    buyerOrSellerName: 'ITC e-Choupal / Aashirvaad Foods',
    buyerType: 'Corporate',
    mandiLocation: 'Indore Mandi Hub',
    timestamp: '10:42:15'
  },
  {
    id: 'ob-b2',
    type: 'BUY',
    cropId: 'wheat',
    pricePerQuintal: 2595,
    quantityQuintals: 150,
    buyerOrSellerName: 'Shree Ram Roller Flour Mill',
    buyerType: 'Flour Mill',
    mandiLocation: 'Ujjain Gate',
    timestamp: '10:40:02'
  },
  {
    id: 'ob-b3',
    type: 'BUY',
    cropId: 'wheat',
    pricePerQuintal: 2580,
    quantityQuintals: 500,
    buyerOrSellerName: 'Adani Agri-Logistics Silo Unit',
    buyerType: 'Corporate',
    mandiLocation: 'Dewas Depot',
    timestamp: '10:38:44'
  },
  {
    id: 'ob-b4',
    type: 'BUY',
    cropId: 'wheat',
    pricePerQuintal: 2565,
    quantityQuintals: 220,
    buyerOrSellerName: 'Cargill India Procurement Hub',
    buyerType: 'Exporter',
    mandiLocation: 'Khandwa Mandi',
    timestamp: '10:35:10'
  },
  // Sell Orders (Asks) - Farmers/Aggregators listing batches
  {
    id: 'ob-s1',
    type: 'SELL',
    cropId: 'wheat',
    pricePerQuintal: 2620,
    quantityQuintals: 85,
    buyerOrSellerName: 'Kisan Producer Co. (Dhar)',
    buyerType: 'Farmer',
    mandiLocation: 'Dhar APMC',
    timestamp: '10:41:50'
  },
  {
    id: 'ob-s2',
    type: 'SELL',
    cropId: 'wheat',
    pricePerQuintal: 2635,
    quantityQuintals: 120,
    buyerOrSellerName: 'Malwa Organic Farmer Group',
    buyerType: 'Farmer',
    mandiLocation: 'Indore Yard B',
    timestamp: '10:39:12'
  },
  {
    id: 'ob-s3',
    type: 'SELL',
    cropId: 'wheat',
    pricePerQuintal: 2650,
    quantityQuintals: 250,
    buyerOrSellerName: 'Narmada Agro Collective',
    buyerType: 'Farmer',
    mandiLocation: 'Hoshangabad Mandi',
    timestamp: '10:36:00'
  },
  // Mustard items
  {
    id: 'ob-m1',
    type: 'BUY',
    cropId: 'mustard',
    pricePerQuintal: 6280,
    quantityQuintals: 180,
    buyerOrSellerName: 'Adani Wilmar (Fortune Oil)',
    buyerType: 'Corporate',
    mandiLocation: 'Morena Mandi',
    timestamp: '10:43:00'
  },
  {
    id: 'ob-m2',
    type: 'BUY',
    cropId: 'mustard',
    pricePerQuintal: 6240,
    quantityQuintals: 90,
    buyerOrSellerName: 'Patanjali Agro Extraction',
    buyerType: 'Oil Expeller',
    mandiLocation: 'Alwar APMC',
    timestamp: '10:39:30'
  },
  {
    id: 'ob-m3',
    type: 'SELL',
    cropId: 'mustard',
    pricePerQuintal: 6300,
    quantityQuintals: 70,
    buyerOrSellerName: 'Sheopur Farmer Syndicate',
    buyerType: 'Farmer',
    mandiLocation: 'Sheopur APMC',
    timestamp: '10:41:20'
  }
];

export const AI_PREDICTION_MODELS: Record<string, AIPredictionData> = {
  wheat: {
    cropId: 'wheat',
    currentAvgPrice: 2580,
    predictedPrice7Days: 2710,
    recommendation: 'STRONG_HOLD',
    confidenceScore: 92,
    forecastData: [
      { day: 'Day 1 (Today)', actualPrice: 2580, predictedPrice: 2580, upperBand: 2610, lowerBand: 2560 },
      { day: 'Day 2', actualPrice: 2595, predictedPrice: 2600, upperBand: 2630, lowerBand: 2570 },
      { day: 'Day 3', actualPrice: undefined, predictedPrice: 2625, upperBand: 2660, lowerBand: 2590 },
      { day: 'Day 4', actualPrice: undefined, predictedPrice: 2650, upperBand: 2690, lowerBand: 2610 },
      { day: 'Day 5', actualPrice: undefined, predictedPrice: 2675, upperBand: 2720, lowerBand: 2630 },
      { day: 'Day 6', actualPrice: undefined, predictedPrice: 2695, upperBand: 2750, lowerBand: 2640 },
      { day: 'Day 7', actualPrice: undefined, predictedPrice: 2710, upperBand: 2770, lowerBand: 2650 }
    ],
    drivingFactors: [
      {
        title: 'Export Demand Surge & Flour Mill Procurement',
        impact: 'positive',
        description: 'Southern and Western flour mills are actively building 30-day inventory buffers, pushing spot mandi rates up ₹130/qtl above MSP.'
      },
      {
        title: 'Low Arrival Pressure This Week',
        impact: 'positive',
        description: 'Mandi arrival volumes in MP and Haryana are 18% lower than 5-year average due to delayed harvesting in central belts.'
      },
      {
        title: 'Weather & Moisture Stability',
        impact: 'neutral',
        description: 'Clear sunny weather expected over the next 6 days; low risk of moisture damage during transit and open storage.'
      }
    ]
  },
  mustard: {
    cropId: 'mustard',
    currentAvgPrice: 6240,
    predictedPrice7Days: 6380,
    recommendation: 'HOLD',
    confidenceScore: 88,
    forecastData: [
      { day: 'Day 1 (Today)', actualPrice: 6240, predictedPrice: 6240, upperBand: 6280, lowerBand: 6200 },
      { day: 'Day 2', actualPrice: 6265, predictedPrice: 6270, upperBand: 6310, lowerBand: 6220 },
      { day: 'Day 3', actualPrice: undefined, predictedPrice: 6300, upperBand: 6350, lowerBand: 6250 },
      { day: 'Day 4', actualPrice: undefined, predictedPrice: 6325, upperBand: 6380, lowerBand: 6270 },
      { day: 'Day 5', actualPrice: undefined, predictedPrice: 6350, upperBand: 6410, lowerBand: 6290 },
      { day: 'Day 6', actualPrice: undefined, predictedPrice: 6365, upperBand: 6430, lowerBand: 6300 },
      { day: 'Day 7', actualPrice: undefined, predictedPrice: 6380, upperBand: 6460, lowerBand: 6310 }
    ],
    drivingFactors: [
      {
        title: 'Global Edible Oil Import Tariffs',
        impact: 'positive',
        description: 'Govt duty restructuring on imported palm oil is supporting domestic mustard crushing margins.'
      },
      {
        title: 'Crusher Demand in Rajasthan & MP',
        impact: 'positive',
        description: 'High recovery rate of seed oil (40.2%) attracting bids from large extraction units.'
      }
    ]
  },
  soybean: {
    cropId: 'soybean',
    currentAvgPrice: 4620,
    predictedPrice7Days: 4540,
    recommendation: 'SELL_NOW',
    confidenceScore: 86,
    forecastData: [
      { day: 'Day 1 (Today)', actualPrice: 4620, predictedPrice: 4620, upperBand: 4660, lowerBand: 4580 },
      { day: 'Day 2', actualPrice: undefined, predictedPrice: 4600, upperBand: 4640, lowerBand: 4560 },
      { day: 'Day 3', actualPrice: undefined, predictedPrice: 4585, upperBand: 4620, lowerBand: 4540 },
      { day: 'Day 4', actualPrice: undefined, predictedPrice: 4570, upperBand: 4610, lowerBand: 4530 },
      { day: 'Day 5', actualPrice: undefined, predictedPrice: 4555, upperBand: 4590, lowerBand: 4510 },
      { day: 'Day 6', actualPrice: undefined, predictedPrice: 4545, upperBand: 4580, lowerBand: 4500 },
      { day: 'Day 7', actualPrice: undefined, predictedPrice: 4540, upperBand: 4580, lowerBand: 4490 }
    ],
    drivingFactors: [
      {
        title: 'Private Price Trading Below Govt MSP (₹4,892)',
        impact: 'negative',
        description: 'Recommendation: Strongly consider selling under Pillar 1 Govt MSP Scheme to lock in ₹4,892/qtl rather than taking losses on private exchange.'
      },
      {
        title: 'Heavy Inflow Expected from Maharashtra & MP',
        impact: 'negative',
        description: 'Arrivals to jump 35% next week, which may soften open market auction bids.'
      }
    ]
  }
};

export const DISTRICT_RATES: DistrictMandiRate[] = [
  {
    district: 'Indore',
    mandiName: 'Indore APMC (Chhavani Yard)', lat: 22.7196, lon: 75.8577,
    cropId: 'wheat',
    modalPrice: 2580,
    minPrice: 2490,
    maxPrice: 2685,
    arrivalVolumeQuintals: 12400,
    distanceKmFromUser: 12,
    estimatedFreightPerQuintal: 25,
    netRealizationPerQuintal: 2555,
    congestionLevel: 'Low',
    estimatedWaitMinutes: 20
  },
  {
    district: 'Ujjain',
    mandiName: 'Ujjain Krishi Upaj Mandi', lat: 23.1765, lon: 75.7885,
    cropId: 'wheat',
    modalPrice: 2620,
    minPrice: 2520,
    maxPrice: 2710,
    arrivalVolumeQuintals: 8200,
    distanceKmFromUser: 54,
    estimatedFreightPerQuintal: 60,
    netRealizationPerQuintal: 2560,
    congestionLevel: 'Moderate',
    estimatedWaitMinutes: 45
  },
  {
    district: 'Dewas',
    mandiName: 'Dewas Main Mandi Yard', lat: 22.9676, lon: 76.0534,
    cropId: 'wheat',
    modalPrice: 2550,
    minPrice: 2470,
    maxPrice: 2630,
    arrivalVolumeQuintals: 5600,
    distanceKmFromUser: 38,
    estimatedFreightPerQuintal: 45,
    netRealizationPerQuintal: 2505,
    congestionLevel: 'Low',
    estimatedWaitMinutes: 15
  },
  {
    district: 'Dhar',
    mandiName: 'Dhar Krishi Upaj Mandi', lat: 22.5939, lon: 75.3051,
    cropId: 'wheat',
    modalPrice: 2640,
    minPrice: 2540,
    maxPrice: 2740,
    arrivalVolumeQuintals: 6900,
    distanceKmFromUser: 62,
    estimatedFreightPerQuintal: 70,
    netRealizationPerQuintal: 2570,
    congestionLevel: 'High',
    estimatedWaitMinutes: 75
  },
  {
    district: 'Sehore',
    mandiName: 'Sehore Sharbati Special Mandi', lat: 23.2032, lon: 77.0844,
    cropId: 'wheat',
    modalPrice: 2750,
    minPrice: 2600,
    maxPrice: 2950,
    arrivalVolumeQuintals: 9400,
    distanceKmFromUser: 140,
    estimatedFreightPerQuintal: 140,
    netRealizationPerQuintal: 2610,
    congestionLevel: 'Moderate',
    estimatedWaitMinutes: 40
  },
  // Mustard Rates
  {
    district: 'Morena',
    mandiName: 'Morena Oilseed APMC', lat: 26.4947, lon: 78.0000,
    cropId: 'mustard',
    modalPrice: 6320,
    minPrice: 6150,
    maxPrice: 6480,
    arrivalVolumeQuintals: 4800,
    distanceKmFromUser: 22,
    estimatedFreightPerQuintal: 30,
    netRealizationPerQuintal: 6290,
    congestionLevel: 'Low',
    estimatedWaitMinutes: 25
  },
  {
    district: 'Bhind',
    mandiName: 'Bhind Grain & Oilseed Mandi', lat: 26.5644, lon: 78.7891,
    cropId: 'mustard',
    modalPrice: 6260,
    minPrice: 6080,
    maxPrice: 6410,
    arrivalVolumeQuintals: 3200,
    distanceKmFromUser: 48,
    estimatedFreightPerQuintal: 55,
    netRealizationPerQuintal: 6205,
    congestionLevel: 'Moderate',
    estimatedWaitMinutes: 40
  }
];
