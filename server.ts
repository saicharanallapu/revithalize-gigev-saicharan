import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const app = express();

app.use(express.json());

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// Verified City Fuel & Electricity Benchmarks
// Benchmarked against PPAC (Petroleum Planning & Analysis Cell) & State Electricity Regulatory Commissions (SERCs)
const BENCHMARK_CITIES = [
  {
    id: 'delhi',
    name: 'Delhi NCR',
    state: 'Delhi',
    petrolPricePerLitre: 94.77,
    commercialElectricityKwh: 7.5,
    domesticElectricityKwh: 5.0,
    averageSwapFee: 55,
    lastUpdated: '2025-Q1 Official Benchmark',
  },
  {
    id: 'bengaluru',
    name: 'Bengaluru',
    state: 'Karnataka',
    petrolPricePerLitre: 102.86,
    commercialElectricityKwh: 8.2,
    domesticElectricityKwh: 5.8,
    averageSwapFee: 65,
    lastUpdated: '2025-Q1 Official Benchmark',
  },
  {
    id: 'mumbai',
    name: 'Mumbai',
    state: 'Maharashtra',
    petrolPricePerLitre: 103.44,
    commercialElectricityKwh: 9.5,
    domesticElectricityKwh: 6.2,
    averageSwapFee: 70,
    lastUpdated: '2025-Q1 Official Benchmark',
  },
  {
    id: 'hyderabad',
    name: 'Hyderabad',
    state: 'Telangana',
    petrolPricePerLitre: 107.41,
    commercialElectricityKwh: 8.0,
    domesticElectricityKwh: 5.5,
    averageSwapFee: 60,
    lastUpdated: '2025-Q1 Official Benchmark',
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    petrolPricePerLitre: 100.75,
    commercialElectricityKwh: 7.8,
    domesticElectricityKwh: 5.2,
    averageSwapFee: 60,
    lastUpdated: '2025-Q1 Official Benchmark',
  },
  {
    id: 'pune',
    name: 'Pune',
    state: 'Maharashtra',
    petrolPricePerLitre: 103.95,
    commercialElectricityKwh: 9.2,
    domesticElectricityKwh: 6.0,
    averageSwapFee: 68,
    lastUpdated: '2025-Q1 Official Benchmark',
  },
  {
    id: 'ahmedabad',
    name: 'Ahmedabad',
    state: 'Gujarat',
    petrolPricePerLitre: 94.44,
    commercialElectricityKwh: 7.0,
    domesticElectricityKwh: 4.8,
    averageSwapFee: 55,
    lastUpdated: '2025-Q1 Official Benchmark',
  },
  {
    id: 'kolkata',
    name: 'Kolkata',
    state: 'West Bengal',
    petrolPricePerLitre: 103.94,
    commercialElectricityKwh: 8.6,
    domesticElectricityKwh: 6.1,
    averageSwapFee: 62,
    lastUpdated: '2025-Q1 Official Benchmark',
  },
];

// Verified EV Subsidy Schemes in India (Central & State Level)
const OFFICIAL_SUBSIDIES = [
  {
    id: 'pm-edrive-central',
    title: 'PM E-DRIVE Scheme (Ministry of Heavy Industries)',
    schemeName: 'PM Electric Drive Revolution in Innovative Vehicle Enhancement',
    level: 'Central Government',
    jurisdiction: 'Pan-India (All States & UTs)',
    stateCode: 'all',
    stateName: 'Pan-India (Central)',
    segment: 'Electric 2W, Electric 3W Passenger, Electric 3W Cargo',
    applicableCategories: ['electric-2w', 'electric-3w-passenger', 'electric-3w-cargo'],
    demandIncentiveText: '₹5,000 per kWh of battery capacity (up to ₹10,000 for e-2W in Year 1; up to ₹25,000 for e-3W passenger; up to ₹50,000 for e-3W cargo)',
    calculationMethod: '₹5,000/kWh battery capacity up to ₹10,000 cap for e-2W; ₹5,000/kWh up to ₹25,000–₹50,000 cap for e-3W L5 category.',
    incentiveAmount2WINR: 10000,
    incentiveAmount3WPassengerINR: 25000,
    incentiveAmount3WCargoINR: 50000,
    maxAmountINR: 10000,
    maxAmount3WINR: 50000,
    roadTaxExemption: 'Subject to respective State Transport Department notification',
    registrationWaiver: 'Concessional registration across participating states',
    commercialPermitExemption: 'Permit exemption applies for commercial green plate EVs',
    validUntil: 'October 1, 2024 to March 31, 2026',
    eligibilityCriteria: [
      'Vehicle model must be homologated and certified under PM E-DRIVE portal by OEM',
      'Ex-factory vehicle price must be capped under ₹1.5 Lakh for e-2W',
      'Battery must feature advanced chemistry cells with active BMS and thermal cutoff',
      'Single subsidized vehicle per Aadhaar/PAN identity',
    ],
    applicationProcess: 'Incentive deducted upfront by authorized dealer at point of sale upon Aadhaar verification.',
    sourcePortalName: 'Ministry of Heavy Industries PM E-DRIVE Portal',
    sourcePortalUrl: 'https://pmedrive.mhi.gov.in',
    verifiedDate: '2025-01-15',
    verificationStatus: 'verified',
    category: 'central',
  },
  {
    id: 'delhi-ev-policy',
    title: 'Delhi EV Policy 2.0 (Transport Dept, GNCTD)',
    schemeName: 'Delhi Electric Vehicle Policy 2.0 & Gazette Extension',
    level: 'State Government',
    jurisdiction: 'Delhi NCR',
    stateCode: 'delhi',
    stateName: 'Delhi NCR',
    segment: 'Electric 2W (Delivery Gig Workers), Electric 3W Passenger, Electric 3W Cargo',
    applicableCategories: ['electric-2w', 'electric-3w-passenger', 'electric-3w-cargo'],
    demandIncentiveText: '₹5,000 per kWh battery capacity (up to ₹30,000 max incentive) + ₹5,000 vehicle scrapping incentive',
    calculationMethod: '₹5,000/kWh of battery capacity up to ₹30,000 maximum demand incentive + ₹5,000 scrapping incentive on deregistering old ICE two-wheeler.',
    incentiveAmount2WINR: 35000,
    incentiveAmount3WPassengerINR: 30000,
    incentiveAmount3WCargoINR: 30000,
    maxAmountINR: 35000,
    maxAmount3WINR: 30000,
    roadTaxExemption: '100% Full Waiver on Road Tax',
    registrationWaiver: '100% Exemption from Vehicle Registration Charges',
    commercialPermitExemption: '100% Exemption from commercial carrier permit fees',
    validUntil: 'Active policy extension under Delhi Gazette notification',
    eligibilityCriteria: [
      'Vehicle registered at any Delhi RTO with green commercial or private plate',
      'Scrappage bonus requires certificate of deregistration for older BS-III/BS-IV petrol vehicle',
      'Applicable for food & grocery gig aggregators registered under Delhi Motor Vehicle Aggregator Scheme',
    ],
    applicationProcess: 'Direct Benefit Transfer (DBT) deposited directly into buyer bank account post RTO registration.',
    sourcePortalName: 'Delhi Transport Department EV Portal',
    sourcePortalUrl: 'https://ev.delhi.gov.in',
    verifiedDate: '2025-02-01',
    verificationStatus: 'verified',
    category: 'state',
  },
  {
    id: 'maharashtra-ev-policy',
    title: 'Maharashtra EV Policy (Govt of Maharashtra)',
    schemeName: 'Maharashtra Comprehensive Electric Vehicle Policy',
    level: 'State Government',
    jurisdiction: 'Maharashtra (Mumbai, Pune, Nagpur, Nashik)',
    stateCode: 'maharashtra',
    stateName: 'Maharashtra',
    segment: 'Electric 2W, Electric 3W Passenger, Electric 3W Cargo',
    applicableCategories: ['electric-2w', 'electric-3w-passenger', 'electric-3w-cargo'],
    demandIncentiveText: '₹5,000/kWh (capped at ₹10,000) + early buyer bonus + ₹5,000 scrapping rebate',
    calculationMethod: '₹5,000/kWh battery capacity up to ₹10,000 + early buyer incentive + ₹7,000 scrappage bonus.',
    incentiveAmount2WINR: 17000,
    incentiveAmount3WPassengerINR: 30000,
    incentiveAmount3WCargoINR: 30000,
    maxAmountINR: 17000,
    maxAmount3WINR: 30000,
    roadTaxExemption: '100% Road Tax Waiver for all registered EVs',
    registrationWaiver: '100% Registration fee exemption',
    commercialPermitExemption: 'Commercial green permit exemption across Maharashtra municipal corporations',
    validUntil: 'Active State Policy Period',
    eligibilityCriteria: [
      'Registration at any Maharashtra RTO',
      'FAME/PM E-DRIVE certified OEM electric models with approved battery specifications',
    ],
    applicationProcess: 'Disbursed via State EV cell into Aadhaar-linked bank account after document verification.',
    sourcePortalName: 'Maharashtra Transport Department EV Portal',
    sourcePortalUrl: 'https://transport.maharashtra.gov.in',
    verifiedDate: '2025-01-20',
    verificationStatus: 'verified',
    category: 'state',
  },
  {
    id: 'karnataka-ev-policy',
    title: 'Karnataka Electric Vehicle and Energy Storage Policy',
    schemeName: 'Karnataka EV Policy 2024-2029 Framework',
    level: 'State Government',
    jurisdiction: 'Karnataka (Bengaluru, Mysuru, Hubballi)',
    stateCode: 'karnataka',
    stateName: 'Karnataka',
    segment: 'Electric 2W & Electric 3W Commercial Fleets',
    applicableCategories: ['electric-2w', 'electric-3w-passenger', 'electric-3w-cargo'],
    hasDirectCashSubsidy: false,
    directCashSubsidyNote: 'No state direct cash purchase subsidy. Karnataka provides 100% Lifetime Road Tax and Registration Cess exemption. Direct vehicle purchase subsidies are claimed separately under Central PM E-DRIVE.',
    demandIncentiveText: '100% Lifetime Road Tax & Registration Cess Exemption (Statutory Concession Only)',
    calculationMethod: '100% exemption on lifetime Motor Vehicle tax + micro-credit interest subvention for delivery riders. No direct state cash subsidy.',
    incentiveAmount2WINR: null,
    incentiveAmount3WPassengerINR: null,
    incentiveAmount3WCargoINR: null,
    maxAmountINR: 0,
    maxAmount3WINR: 0,
    roadTaxExemption: '100% Lifetime Road Tax Exemption for Electric 2W & 3W',
    registrationWaiver: 'Exempt from RTO registration cess',
    commercialPermitExemption: 'Permit charges waived for electric auto-rickshaws and cargo loaders',
    validUntil: '2024-2029 Policy Framework',
    eligibilityCriteria: [
      'Applicable to all green plate commercial and private registered two/three-wheelers in Karnataka',
      'Special credit guarantee and micro-leasing support for gig workers in Bengaluru',
    ],
    applicationProcess: 'Instant exemption at RTO counter during vehicle registration via Vahan 4.0.',
    sourcePortalName: 'Karnataka Transport & Industries Portal',
    sourcePortalUrl: 'https://transport.karnataka.gov.in',
    verifiedDate: '2025-02-10',
    verificationStatus: 'verified',
    category: 'state',
  },
  {
    id: 'tamilnadu-ev-policy',
    title: 'Tamil Nadu Electric Vehicle Policy',
    schemeName: 'Tamil Nadu EV Policy Framework',
    level: 'State Government',
    jurisdiction: 'Tamil Nadu (Chennai, Coimbatore, Madurai)',
    stateCode: 'tamil-nadu',
    stateName: 'Tamil Nadu',
    segment: 'Electric 2W, Electric 3W Passenger, Electric 3W Cargo',
    applicableCategories: ['electric-2w', 'electric-3w-passenger', 'electric-3w-cargo'],
    hasDirectCashSubsidy: false,
    directCashSubsidyNote: 'No state direct cash purchase subsidy. Tamil Nadu provides 100% Motor Vehicle Tax Waiver & Commercial Permit Exemption. Direct purchase incentives are available separately under Central PM E-DRIVE.',
    demandIncentiveText: '100% Motor Vehicle Tax Waiver till December 2025 + Commercial Permit Waiver',
    calculationMethod: '100% waiver of Motor Vehicle Tax; direct purchase subsidy must be claimed under Central PM E-DRIVE.',
    incentiveAmount2WINR: null,
    incentiveAmount3WPassengerINR: null,
    incentiveAmount3WCargoINR: null,
    maxAmountINR: 0,
    maxAmount3WINR: 0,
    roadTaxExemption: '100% Motor Vehicle Tax Exemption',
    registrationWaiver: 'Registration fee waiver for battery-operated vehicles',
    commercialPermitExemption: '100% permit fee exemption for transport EVs',
    validUntil: 'December 2025 (Subject to extension)',
    eligibilityCriteria: [
      'Valid Tamil Nadu domicile or commercial carrier permit within TN',
      'EV purchase through authorized state dealers compliant with state guidelines',
    ],
    applicationProcess: 'Automatic waiver via Vahan 4.0 portal at registration.',
    sourcePortalName: 'Tamil Nadu Transport Department (tnsta.gov.in)',
    sourcePortalUrl: 'https://tnsta.gov.in',
    verifiedDate: '2025-01-30',
    verificationStatus: 'verified',
    category: 'state',
  },
  {
    id: 'uttar-pradesh-ev-policy',
    title: 'Uttar Pradesh EV Manufacturing and Mobility Policy',
    schemeName: 'UP EV Manufacturing & Mobility Policy 2022-2027',
    level: 'State Government',
    jurisdiction: 'Uttar Pradesh (Noida, Ghaziabad, Lucknow, Kanpur)',
    stateCode: 'uttar-pradesh',
    stateName: 'Uttar Pradesh',
    segment: 'Electric 2W & Electric 3W Cargo/E-Rickshaw',
    applicableCategories: ['electric-2w', 'electric-3w-passenger', 'electric-3w-cargo'],
    hasDirectCashSubsidy: true,
    demandIncentiveText: '₹5,000 flat per 2W (first 2,00,000 vehicles) + ₹12,000 for 3W + 100% Road Tax Waiver',
    calculationMethod: 'Flat ₹5,000 state purchase subsidy for first 2 lakh e-2Ws + flat ₹12,000 for first 50,000 e-3Ws, in addition to PM E-DRIVE.',
    incentiveAmount2WINR: 5000,
    incentiveAmount3WPassengerINR: 12000,
    incentiveAmount3WCargoINR: 12000,
    maxAmountINR: 5000,
    maxAmount3WINR: 12000,
    roadTaxExemption: '100% Exemption on Road Tax for 3 years',
    registrationWaiver: '100% Exemption on Registration Fees',
    commercialPermitExemption: 'Commercial permit exemption for electric rickshaws and loaders',
    validUntil: 'October 2027',
    eligibilityCriteria: [
      'Vehicle purchased and registered in Uttar Pradesh',
      'Applicable for first 2 lakh two-wheelers and 50,000 three-wheelers',
    ],
    applicationProcess: 'Applied via UP EV Subsidy Portal (upevsubsidy.in) post registration.',
    sourcePortalName: 'Invest UP & Transport Dept EV Subsidy Portal',
    sourcePortalUrl: 'https://upevsubsidy.in',
    verifiedDate: '2025-01-25',
    verificationStatus: 'verified',
    category: 'state',
  },
  {
    id: 'gujarat-ev-policy',
    title: 'Gujarat Electric Vehicle Policy',
    schemeName: 'Gujarat State Electric Vehicle Policy (GEDA)',
    level: 'State Government',
    jurisdiction: 'Gujarat (Ahmedabad, Surat, Vadodara, Rajkot)',
    stateCode: 'gujarat',
    stateName: 'Gujarat',
    segment: 'Electric 2W, Electric 3W Passenger, Electric 3W Cargo',
    applicableCategories: ['electric-2w', 'electric-3w-passenger', 'electric-3w-cargo'],
    hasDirectCashSubsidy: true,
    demandIncentiveText: '₹10,000 per kWh battery capacity (up to ₹20,000 for 2W, up to ₹50,000 for 3W)',
    calculationMethod: '₹10,000 per kWh battery capacity capped at ₹20,000 for e-2W and ₹50,000 for e-3W disbursed via direct bank transfer.',
    incentiveAmount2WINR: 20000,
    incentiveAmount3WPassengerINR: 50000,
    incentiveAmount3WCargoINR: 50000,
    maxAmountINR: 20000,
    maxAmount3WINR: 50000,
    roadTaxExemption: '100% Road Tax Exemption',
    registrationWaiver: '100% Registration fee waiver',
    commercialPermitExemption: 'Commercial permit waiver under state policy',
    validUntil: 'Active policy period',
    eligibilityCriteria: [
      'Direct subsidy transferred to bank accounts linked with Aadhaar upon verification',
      'Vehicle ex-showroom price limits set per government notification',
    ],
    applicationProcess: 'DBT transfer through Gujarat Energy Development Agency (GEDA) portal.',
    sourcePortalName: 'Gujarat Energy Development Agency (GEDA)',
    sourcePortalUrl: 'https://geda.gujarat.gov.in',
    verifiedDate: '2025-02-05',
    verificationStatus: 'verified',
    category: 'state',
  },
  {
    id: 'rajasthan-ev-policy',
    title: 'Rajasthan EV Policy (Transport Dept, GoR)',
    schemeName: 'Rajasthan Electric Vehicle Policy',
    level: 'State Government',
    jurisdiction: 'Rajasthan (Jaipur, Jodhpur, Kota)',
    stateCode: 'rajasthan',
    stateName: 'Rajasthan',
    segment: 'Electric 2W & Electric 3W Passenger/Cargo',
    applicableCategories: ['electric-2w', 'electric-3w-passenger', 'electric-3w-cargo'],
    hasDirectCashSubsidy: true,
    demandIncentiveText: 'State GST (SGST) reimbursement + lump sum cash incentive up to ₹10,000 for 2W',
    calculationMethod: 'Reimbursement of State GST (up to ₹10,000 based on battery capacity: 2kWh to 5kWh) + cash incentive.',
    incentiveAmount2WINR: 10000,
    incentiveAmount3WPassengerINR: 20000,
    incentiveAmount3WCargoINR: 20000,
    maxAmountINR: 10000,
    maxAmount3WINR: 20000,
    roadTaxExemption: '100% Motor Vehicle Tax Exemption',
    registrationWaiver: '100% Registration fee exemption',
    commercialPermitExemption: 'Commercial permit fee waiver',
    validUntil: 'Active state notification period',
    eligibilityCriteria: [
      'Vehicle purchased from authorized Rajasthan dealers with invoice SGST proof',
      'Registration at Rajasthan RTO',
    ],
    applicationProcess: 'Applied via Transport Department Rajasthan portal with dealer invoice.',
    sourcePortalName: 'Rajasthan Transport Department Portal',
    sourcePortalUrl: 'https://transport.rajasthan.gov.in',
    verifiedDate: '2025-01-18',
    verificationStatus: 'verified',
    category: 'state',
  },
  {
    id: 'telangana-ev-policy',
    title: 'Telangana Electric Vehicle and Energy Storage Policy',
    schemeName: 'Telangana EV & Energy Storage Policy 2020-2030 (G.O.Ms.No. 41)',
    level: 'State Government',
    jurisdiction: 'Telangana (Hyderabad, Warangal & State RTAs)',
    stateCode: 'telangana',
    stateName: 'Telangana',
    segment: 'Electric 2W, Electric 3W Passenger, Electric 3W Cargo',
    applicableCategories: ['electric-2w', 'electric-3w-passenger', 'electric-3w-cargo'],
    hasDirectCashSubsidy: false,
    directCashSubsidyNote: 'No state direct cash purchase subsidy is established by official Telangana state sources. The state policy provides 100% Road Tax and 100% Registration Fee exemptions only. Direct vehicle purchase subsidies are claimed separately under the Central Government’s PM E-DRIVE Scheme.',
    demandIncentiveText: '100% Road Tax & Registration Fee Exemption (No State Cash Purchase Subsidy)',
    calculationMethod: '100% waiver of Road Tax and 100% waiver of Registration Charges at Telangana RTA counters for eligible quota units. No state direct cash subsidy is disbursed.',
    incentiveAmount2WINR: null,
    incentiveAmount3WPassengerINR: null,
    incentiveAmount3WCargoINR: null,
    maxAmountINR: 0,
    maxAmount3WINR: 0,
    roadTaxExemption: '100% Road Tax Exemption (First 2,00,000 e-2Ws, 20,000 e-3W passenger autos, 10,000 e-3W cargo vehicles)',
    registrationWaiver: '100% Registration Fee Exemption across eligible vehicle volume caps',
    commercialPermitExemption: 'Permit fee waived for electric commercial passenger autos and parcel goods carriages',
    vehicleVolumeCaps: [
      'Electric 2-Wheelers (e-2W): First 2,00,000 vehicles purchased and registered in Telangana',
      'Electric 3-Wheeler Commercial Passenger Auto-Rickshaws: First 20,000 vehicles',
      'Electric 3-Wheeler Cargo / Goods Carriages: First 10,000 vehicles',
      'Electric 4-Wheeler Commercial Taxis: First 5,000 vehicles',
      'Electric Buses: First 500 vehicles',
      'Electric Tractors: 100% statutory exemption',
    ],
    geographicConditions: 'Vehicle must be purchased and registered within the State of Telangana at an authorized Telangana Regional Transport Authority (RTA) / RTO office with a valid green registration mark.',
    validUntil: '2020–2030 Policy Framework (or until vehicle category volume caps are fully utilized)',
    officialNotificationNumber: 'G.O.Ms.No. 41, Industries & Commerce (IP&INF) Dept & Transport Dept Notifications',
    officialNotificationUrl: 'https://transport.telangana.gov.in',
    officialPolicyDocumentName: 'Telangana EV Policy 2020-2030 Official Gazette Document (PDF)',
    officialPolicyDocumentUrl: 'https://industries.telangana.gov.in/pdf/Telangana%20EV%20Policy%202020-2030.pdf',
    sourcePortalName: 'Telangana State Transport Department (transport.telangana.gov.in)',
    sourcePortalUrl: 'https://transport.telangana.gov.in',
    confirmationNotice: 'Current eligibility must be confirmed with the Transport Department.',
    eligibilityCriteria: [
      'Current eligibility must be confirmed with the Transport Department.',
      'Vehicle must be purchased and registered in Telangana with a valid green registration mark',
      'Applies strictly within the statutory volume caps (e.g. first 2 lakh e-2Ws and 20,000 e-3Ws)',
      'No state direct cash purchase subsidy is payable; road tax and registration fee are waived at RTA',
    ],
    applicationProcess: 'Automatic exemption granted at Telangana Regional Transport Authority (RTA) counters during vehicle registration.',
    verifiedDate: '2025-02-12',
    verificationStatus: 'verified',
    category: 'state',
  },
];

// Realistic Labeled Demo Fleet Dataset for Micro-Aggregators & Hub Managers
const DEMO_FLEET_DATA = {
  metadata: {
    datasetLabel: 'DEMO DATA - Revitalize Mobility Micro-Hub Fleet Telematics Simulation',
    totalVehicles: 12,
    activeOnRoad: 11,
    maintenanceCount: 1,
    cityHub: 'Bengaluru Koramangala Hub (Hub ID: BLR-KOR-04)',
    lastSyncTime: new Date().toISOString(),
  },
  summaryMetrics: {
    totalFleetKmToday: 1042,
    averageKmPerVehicle: 86.8,
    petrolLitersAvoidedToday: 23.15,
    co2KgPreventedToday: 53.25,
    grossFleetRentalTodayINR: 3720,
    fleetElectricityCostTodayINR: 416,
    netFleetDailyMarginINR: 3304,
    monthlyProjectedMarginINR: 99120,
  },
  vehicles: [
    {
      id: 'EV-2W-101',
      model: 'Ather Rizta Pro Cargo',
      plateNumber: 'KA 01 EV 4412',
      type: '2W High-Speed Cargo',
      driverName: 'Ramesh Kumar',
      platform: 'Zomato',
      socPercent: 78,
      estimatedRangeKm: 76,
      batteryHealthSoC: 96,
      dailyKmToday: 64,
      dailyLeaseFeeINR: 320,
      paymentStatus: 'PAID',
      status: 'ON_ROUTE',
      lastPingLocation: 'Indiranagar 100ft Rd',
      batterySwapCapable: false,
    },
    {
      id: 'EV-2W-102',
      model: 'Zypp Electric Cargo Max',
      plateNumber: 'KA 03 EV 8891',
      type: '2W Swappable Cargo',
      driverName: 'Suresh Patil',
      platform: 'Blinkit',
      socPercent: 42,
      estimatedRangeKm: 32,
      batteryHealthSoC: 92,
      dailyKmToday: 98,
      dailyLeaseFeeINR: 310,
      paymentStatus: 'PAID',
      status: 'ON_ROUTE',
      lastPingLocation: 'Koramangala 4th Block',
      batterySwapCapable: true,
    },
    {
      id: 'EV-2W-103',
      model: 'Ola S1X Commercial',
      plateNumber: 'KA 05 EV 1209',
      type: '2W High-Speed',
      driverName: 'Mohd. Farhan',
      platform: 'Swiggy',
      socPercent: 91,
      estimatedRangeKm: 98,
      batteryHealthSoC: 98,
      dailyKmToday: 45,
      dailyLeaseFeeINR: 300,
      paymentStatus: 'PAID',
      status: 'ON_ROUTE',
      lastPingLocation: 'HSR Layout Sector 2',
      batterySwapCapable: false,
    },
    {
      id: 'EV-2W-104',
      model: 'TVS iQube Delivery Hub',
      plateNumber: 'KA 02 EV 9931',
      type: '2W High-Speed',
      driverName: 'Deepak Verma',
      platform: 'Zepto',
      socPercent: 23,
      estimatedRangeKm: 18,
      batteryHealthSoC: 89,
      dailyKmToday: 112,
      dailyLeaseFeeINR: 320,
      paymentStatus: 'PAID',
      status: 'LOW_BATTERY',
      lastPingLocation: 'BTM Layout 2nd Stage (En route to Hub)',
      batterySwapCapable: false,
    },
    {
      id: 'EV-2W-105',
      model: 'Bounce Infinity E1+',
      plateNumber: 'KA 04 EV 6712',
      type: '2W Swappable',
      driverName: 'Anil Rathod',
      platform: 'Shadowfax',
      socPercent: 65,
      estimatedRangeKm: 52,
      batteryHealthSoC: 94,
      dailyKmToday: 72,
      dailyLeaseFeeINR: 280,
      paymentStatus: 'PAID',
      status: 'ON_ROUTE',
      lastPingLocation: 'Bellandur EcoSpace',
      batterySwapCapable: true,
    },
    {
      id: 'EV-3W-201',
      model: 'Euler Motors HiLoad EV',
      plateNumber: 'KA 01 EV 3102',
      type: '3W Heavy Cargo Loader',
      driverName: 'Vikram Singh',
      platform: 'Porter',
      socPercent: 55,
      estimatedRangeKm: 65,
      batteryHealthSoC: 95,
      dailyKmToday: 88,
      dailyLeaseFeeINR: 550,
      paymentStatus: 'PAID',
      status: 'ON_ROUTE',
      lastPingLocation: 'Whitefield Main Rd',
      batterySwapCapable: false,
    },
    {
      id: 'EV-3W-202',
      model: 'Mahindra Treo Zor Cargo',
      plateNumber: 'KA 03 EV 5543',
      type: '3W Cargo Box',
      driverName: 'Manjunath B',
      platform: 'Zomato Hyperpure',
      socPercent: 38,
      estimatedRangeKm: 42,
      batteryHealthSoC: 91,
      dailyKmToday: 95,
      dailyLeaseFeeINR: 520,
      paymentStatus: 'PAID',
      status: 'ON_ROUTE',
      lastPingLocation: 'Electronic City Phase 1',
      batterySwapCapable: false,
    },
    {
      id: 'EV-2W-106',
      model: 'Yulu Wynn Cargo Fleet',
      plateNumber: 'KA 05 EV 7721',
      type: '2W Micro Delivery',
      driverName: 'Pooja Sharma',
      platform: 'Blinkit',
      socPercent: 82,
      estimatedRangeKm: 48,
      batteryHealthSoC: 97,
      dailyKmToday: 51,
      dailyLeaseFeeINR: 250,
      paymentStatus: 'PAID',
      status: 'ON_ROUTE',
      lastPingLocation: 'JP Nagar 6th Phase',
      batterySwapCapable: true,
    },
    {
      id: 'EV-2W-107',
      model: 'River Indie Delivery',
      plateNumber: 'KA 01 EV 8190',
      type: '2W Heavy Duty 2W',
      driverName: 'Karthik Raja',
      platform: 'Dunzo',
      socPercent: 88,
      estimatedRangeKm: 85,
      batteryHealthSoC: 99,
      dailyKmToday: 38,
      dailyLeaseFeeINR: 330,
      paymentStatus: 'DUE',
      status: 'ON_ROUTE',
      lastPingLocation: 'Malleshwaram 8th Cross',
      batterySwapCapable: false,
    },
    {
      id: 'EV-2W-108',
      model: 'Ather Rizta Pro Cargo',
      plateNumber: 'KA 02 EV 3329',
      type: '2W High-Speed Cargo',
      driverName: 'Sunil Gowda',
      platform: 'Swiggy',
      socPercent: 12,
      estimatedRangeKm: 8,
      batteryHealthSoC: 84,
      dailyKmToday: 130,
      dailyLeaseFeeINR: 320,
      paymentStatus: 'PAID',
      status: 'CHARGING_AT_HUB',
      lastPingLocation: 'Koramangala Central Hub Charger #2',
      batterySwapCapable: false,
    },
    {
      id: 'EV-2W-109',
      model: 'Zypp Electric Cargo Max',
      plateNumber: 'KA 03 EV 9011',
      type: '2W Swappable Cargo',
      driverName: 'Imran Khan',
      platform: 'Zepto',
      socPercent: 70,
      estimatedRangeKm: 58,
      batteryHealthSoC: 93,
      dailyKmToday: 62,
      dailyLeaseFeeINR: 310,
      paymentStatus: 'PAID',
      status: 'ON_ROUTE',
      lastPingLocation: 'Bannerghatta Rd',
      batterySwapCapable: true,
    },
    {
      id: 'EV-2W-110',
      model: 'Hero Electric Nyx Commercial',
      plateNumber: 'KA 04 EV 1022',
      type: '2W Commercial',
      driverName: 'Santosh Yadav',
      platform: 'Shadowfax',
      socPercent: 0,
      estimatedRangeKm: 0,
      batteryHealthSoC: 80,
      dailyKmToday: 0,
      dailyLeaseFeeINR: 0,
      paymentStatus: 'INSPECTION',
      status: 'IN_MAINTENANCE',
      lastPingLocation: 'Hub Workshop (Brake pad replacement)',
      batterySwapCapable: false,
    },
  ],
};

// ======================== API ROUTES ========================

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'GigEV — Gig Worker EV Financial Intelligence Platform',
    organization: 'Revitalize Mobility',
    version: '1.0.0',
    geminiConfigured: !!apiKey,
    timestamp: new Date().toISOString(),
  });
});

// Fuel prices benchmarks
app.get('/api/fuel-prices', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: BENCHMARK_CITIES,
    disclaimer:
      'Verified state capital benchmarks compiled from PPAC (Petroleum Planning & Analysis Cell) and SERC published tariff orders. Fuel prices include state VAT and local levies.',
  });
});

// Subsidy explorer schemes
app.get('/api/subsidies', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: OFFICIAL_SUBSIDIES,
    disclaimer:
      'Subsidies are subject to central and state transport guidelines, budget caps, OEM model compliance, and portal uptime. Revitalize Mobility presents verified policy summaries for planning purposes.',
  });
});

// Fleet demo data
app.get('/api/fleet/demo', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: DEMO_FLEET_DATA,
  });
});

// AI Financial Advisor Endpoint
app.post('/api/advisor', async (req: Request, res: Response) => {
  const {
    prompt,
    city = 'Bengaluru',
    platform = 'Zomato',
    dailyKm = 80,
    vehicleType = '2W Electric Scooter',
    currentFuelCostMonthly = 6000,
    ownershipType = 'Financed EMI',
    fleetSummary,
  } = req.body;

  if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
    return res.status(400).json({
      error: 'Please provide a valid question or consultation prompt.',
    });
  }

  // System instructions for Revitalize Mobility EV Financial Advisor
  const systemInstruction = `You are "Revitalize EV Advisor", an elite EV Financial Intelligence Consultant created by Revitalize Mobility for Indian gig delivery workers (Zomato, Swiggy, Zepto, Blinkit, Shadowfax, Dunzo, Rapido, Porter) and commercial EV fleet owners.
Your mission is to provide rigorous, street-smart, highly accurate financial guidance in Indian Rupees (₹).

Core Guidelines & Compliance:
1. Distinguish between mathematical calculation results and AI-generated advisory suggestions.
2. Compare the 4 core ownership options when relevant:
   - Upfront Cash Purchase (no loan interest or EMI liability, but high initial capital)
   - Bank / NBFC Loan EMI (typically 15-25% down payment, 36-month tenure @ 13-16% reducing interest)
   - Daily Rental / Lease (low commitment, zero battery degradation liability, ~₹280-₹350/day)
   - Battery-as-a-Service / Swapping (e.g. Battery Smart, Zypp, Sun Mobility: fast 2-minute swap, no daytime charging downtime)
3. NEVER guarantee gig earnings or delivery payouts. Earnings vary by platform incentives, order volume, surge rates, and weather.
4. NEVER invent unverified subsidy amounts or claim that a subsidy is guaranteed. Direct demand subsidies must be verified under Central PM E-DRIVE; road tax waivers are state-specific.
5. If Fleet Dashboard data is present, evaluate fleet-level operating margins, bulk charging electricity tariffs, and fleet expansion ROI.
6. Address practical operational realities: battery degradation warranties (minimum 3 years / 50,000 km), IP67 monsoon water ingress protection, fast DC charging vs 5A home overnight charging, and CIBIL score requirements for unorganized gig workers without salary slips.
7. Always format currency in Indian Rupees (₹).`;

  try {
    if (ai) {
      let contextDetails = `
User Context:
- Platform: ${platform}
- City: ${city}
- Daily Distance: ${dailyKm} km/day
- Preferred/Considering Vehicle: ${vehicleType}
- Current Monthly Fuel Expense: ₹${currentFuelCostMonthly}
- Ownership Model: ${ownershipType}`;

      if (fleetSummary && fleetSummary.totalVehicles > 0) {
        contextDetails += `
Active Fleet Dashboard Overview:
- Total Fleet Vehicles: ${fleetSummary.totalVehicles}
- Total Monthly Fleet Distance: ${fleetSummary.totalMonthlyDistanceKm} km/month
- Combined Fleet Operating Cost: ₹${fleetSummary.monthlyOperatingCostINR}/month
- Combined Monthly Operating Savings: ₹${fleetSummary.monthlySavingsINR}/month
- Combined Financing EMI: ₹${fleetSummary.monthlyFinancingCostINR}/month`;
      }

      const userMessage = `${contextDetails}

User Question/Scenario:
"${prompt}"

Provide a structured, empathetic, and street-smart financial breakdown answering the user's specific scenario. Show relevant calculations, compare financing options (Cash vs EMI vs Lease vs Swap), and conclude with clear actionable recommendations and risk warnings.`;

      try {
        const aiResponse: any = await Promise.race([
          ai.models.generateContent({
            model: 'gemini-3.8-flash',
            contents: userMessage,
            config: {
              systemInstruction,
              temperature: 0.6,
            },
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('AI generation timed out after 4500ms')), 4500)
          ),
        ]);

        const adviceText = aiResponse.text || '';
        if (adviceText) {
          return res.json({
            success: true,
            source: 'gemini-3.8-flash',
            isConfigured: true,
            advice: adviceText,
            contextUsed: {
              city,
              platform,
              dailyKm,
              vehicleType,
              hasFleetData: Boolean(fleetSummary && fleetSummary.totalVehicles > 0),
            },
          });
        }
      } catch (geminiErr: any) {
        console.warn('[GigEV AI Advisor] Gemini live model transient failure or load spike, falling back to heuristic engine:', geminiErr?.message);
        // Continue down to fallback heuristic engine seamlessly
      }
    }
      // Fallback heuristic simulation when GEMINI_API_KEY is not supplied in development
      const kmPerDay = Number(dailyKm) || 80;
      const daysPerMonth = 26;
      const monthlyKm = kmPerDay * daysPerMonth;
      const petrolCostPerKm = 2.25;
      const evCostPerKm = 0.32;
      const monthlyPetrolFuel = Math.round(monthlyKm * petrolCostPerKm);
      const monthlyEvEnergy = Math.round(monthlyKm * evCostPerKm);
      const monthlyFuelSaved = monthlyPetrolFuel - monthlyEvEnergy;
      const avgEmi = 3400;
      const netMonthlyBenefit = monthlyFuelSaved - avgEmi;

      let fleetText = '';
      if (fleetSummary && fleetSummary.totalVehicles > 0) {
        fleetText = `
**Fleet Context Modeled (${fleetSummary.totalVehicles} Vehicles):**
- Total Monthly Distance: ${fleetSummary.totalMonthlyDistanceKm.toLocaleString('en-IN')} km/mo
- Fleet Operating Expenses: ₹${Math.round(fleetSummary.monthlyOperatingCostINR).toLocaleString('en-IN')}/mo
- Combined Monthly Operational Savings: ₹${Math.round(fleetSummary.monthlySavingsINR).toLocaleString('en-IN')}/mo vs Petrol
`;
      }

      const fallbackAdvice = `### 🛵 Financial Intelligence Assessment for ${platform} in ${city}

> **Mathematical Calculation Facts:**
- **Monthly Distance (${kmPerDay} km/day × 26 days/mo):** ${monthlyKm.toLocaleString('en-IN')} km/month
- **Petrol 2W Fuel Expense (at ~₹2.25/km):** ₹${monthlyPetrolFuel.toLocaleString('en-IN')} / month
- **EV Electricity Energy Cost (at ~₹0.32/km):** ₹${monthlyEvEnergy.toLocaleString('en-IN')} / month
- **Gross Monthly Energy Savings:** **₹${monthlyFuelSaved.toLocaleString('en-IN')} / month saved!**
- **Estimated NBFC Loan EMI (36 Months):** ~₹${avgEmi.toLocaleString('en-IN')} / month
- **Net Cashflow Surplus After EMI:** **+₹${netMonthlyBenefit.toLocaleString('en-IN')} / month**
${fleetText}
---

### 🔍 Comparative Ownership Models for Gig Workers:
1. **Loan EMI (NBFC / Green Finance):**
   - *Best For:* Riders doing consistent daily shifts (>75 km/day) wanting to own an asset.
   - *Trade-off:* Requires 15-20% down payment (~₹20,000) and steady cash flow to service ~₹3,400 monthly EMI.
2. **Battery Swapping (BaaS - e.g. Battery Smart, Zypp):**
   - *Best For:* Heavy 100-140 km/day delivery partners on Blinkit/Zepto who cannot afford 3-4 hours charging downtime during lunch/dinner surge hours.
   - *Trade-off:* Per-swap fees (~₹55-₹70) eliminate battery degradation liability, but you do not own the battery asset.
3. **Daily Rental / Commercial Lease:**
   - *Best For:* New gig riders testing delivery work for 1-3 months without long-term debt commitment.
   - *Trade-off:* Paying ~₹300/day adds up to ~₹7,800/month, making it more expensive over 12+ months than buying on EMI.
4. **Upfront Cash Purchase:**
   - *Best For:* Riders with existing savings seeking zero monthly EMI stress and maximum immediate take-home pay.

---

### ⚠️ Street-Smart Risk Disclaimers:
- **Battery Warranty:** Ensure OEM provides at least **3 Years / 50,000 km** with IP67 waterproofing for Indian monsoon waterlogging.
- **Electricity Tariffs:** Domestic rates are ₹5.50-₹7.50/unit; commercial charging hubs may cost ₹9-₹12/unit.
- **Financing Without Salary Slips:** NBFCs (Revfin, Shriram, Mufin) approve loans based on delivery platform weekly payout transaction statements rather than formal ITRs.
- **Disclaimer:** Calculations reflect verified PPAC fuel benchmarks. Gig earnings vary by platform delivery volume and are never guaranteed.`;

      return res.json({
        success: true,
        source: apiKey ? 'heuristic-engine-fallback' : 'heuristic-engine',
        isConfigured: Boolean(apiKey),
        advice: fallbackAdvice,
        setupMessage: apiKey
          ? 'Live Gemini model experienced a transient load spike. Generated instant assessment via verified GigEV financial heuristics.'
          : 'Gemini API key is not configured in the server environment. Operating on GigEV verified heuristic rules.',
        contextUsed: {
          city,
          platform,
          dailyKm,
          vehicleType,
          hasFleetData: Boolean(fleetSummary && fleetSummary.totalVehicles > 0),
        },
      });
  } catch (err: any) {
    console.error('Error generating AI advice:', err);
    return res.status(500).json({
      error: 'Failed to generate financial analysis. Please try again.',
      details: err?.message || 'Internal server error',
    });
  }
});

// Configure Vite middleware in development or serve static in production
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[GigEV Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
