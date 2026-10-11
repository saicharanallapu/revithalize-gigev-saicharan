export type NavigationTab =
  | 'home'
  | 'calculator'
  | 'subsidies'
  | 'fleet'
  | 'advisor'
  | 'about';

export type DeliveryPlatform =
  | 'Zomato'
  | 'Swiggy'
  | 'Zepto'
  | 'Blinkit'
  | 'Shadowfax'
  | 'Dunzo'
  | 'Rapido'
  | 'Porter'
  | 'Independent Courier';

export type VehicleCategory =
  | '2w-high-speed'
  | '2w-swappable'
  | '3w-cargo'
  | '3w-auto';

export type OwnershipModel =
  | 'buy-emi'
  | 'buy-cash'
  | 'rental-lease'
  | 'battery-swap-baas';

export interface CityBenchmark {
  id: string;
  name: string;
  state: string;
  petrolPricePerLitre: number;
  commercialElectricityKwh: number;
  domesticElectricityKwh: number;
  averageSwapFee: number;
  lastUpdated: string;
}

export type SubsidyVehicleCategory =
  | 'electric-2w'
  | 'electric-3w-passenger'
  | 'electric-3w-cargo';

export interface SubsidyScheme {
  id: string;
  title: string;
  schemeName: string;
  level: 'Central Government' | 'State Government';
  jurisdiction: string;
  stateCode: string;
  stateName: string;
  segment: string;
  applicableCategories: SubsidyVehicleCategory[];
  demandIncentiveText: string;
  calculationMethod: string;
  incentiveAmount2WINR: number | null;
  incentiveAmount3WPassengerINR: number | null;
  incentiveAmount3WCargoINR: number | null;
  maxAmountINR: number;
  maxAmount3WINR?: number;
  roadTaxExemption: string;
  registrationWaiver: string;
  commercialPermitExemption: boolean | string;
  validUntil: string;
  eligibilityCriteria: string[];
  sourcePortalName: string;
  sourcePortalUrl: string;
  officialPolicyDocumentUrl?: string;
  officialPolicyDocumentName?: string;
  officialNotificationNumber?: string;
  officialNotificationUrl?: string;
  verifiedDate: string;
  verificationStatus: 'verified' | 'unverified';
  category: 'central' | 'state';
  hasDirectCashSubsidy: boolean;
  directCashSubsidyNote?: string;
  vehicleVolumeCaps?: string[];
  geographicConditions?: string;
  confirmationNotice?: string;
  note?: string;
}

export interface FleetComparisonVehicle {
  id: string;
  name: string;
  vehicleCategory: VehicleCategory;
  purchasePriceINR: number;
  dailyDistanceKm: number;
  workingDaysPerMonth: number;
  electricityConsumptionWhKm: number;
  electricityTariffINR: number;
  evMonthlyMaintenanceINR: number;
  ownershipModel: OwnershipModel;
  downPaymentINR: number;
  loanTenureMonths: number;
  loanInterestRatePercent: number;
  dailyLeaseFeeINR?: number;
  petrolPricePerLitre: number;
  petrolMileageKmpl: number;
  petrolMonthlyMaintenanceINR: number;
  isSampleExample?: boolean;
}

export interface FleetVehicleCalculation {
  vehicle: FleetComparisonVehicle;
  monthlyDistanceKm: number;
  electricityCostPerKm: number;
  monthlyElectricityCostINR: number;
  monthlyOperatingCostINR: number;
  baselinePetrolCostPerKm: number;
  baselineMonthlyPetrolFuelCostINR: number;
  baselineMonthlyOperatingCostINR: number;
  monthlyOperatingSavingsINR: number;
  monthlyFinancingCostINR: number;
  netMonthlySavingsINR: number;
  upfrontCapitalRequiredINR: number;
}

export interface FleetVehicle {
  id: string;
  model: string;
  plateNumber: string;
  type: string;
  driverName: string;
  platform: string;
  socPercent: number;
  estimatedRangeKm: number;
  batteryHealthSoC: number;
  dailyKmToday: number;
  dailyLeaseFeeINR: number;
  paymentStatus: 'PAID' | 'DUE' | 'INSPECTION';
  status: 'ON_ROUTE' | 'LOW_BATTERY' | 'CHARGING_AT_HUB' | 'IN_MAINTENANCE';
  lastPingLocation: string;
  batterySwapCapable: boolean;
}

export interface FleetSummary {
  metadata: {
    datasetLabel: string;
    totalVehicles: number;
    activeOnRoad: number;
    maintenanceCount: number;
    cityHub: string;
    lastSyncTime: string;
  };
  summaryMetrics: {
    totalFleetKmToday: number;
    averageKmPerVehicle: number;
    petrolLitersAvoidedToday: number;
    co2KgPreventedToday: number;
    grossFleetRentalTodayINR: number;
    fleetElectricityCostTodayINR: number;
    netFleetDailyMarginINR: number;
    monthlyProjectedMarginINR: number;
  };
  vehicles: FleetVehicle[];
}

export interface CalculatorInputs {
  cityId: string;
  platform: DeliveryPlatform;
  vehicleCategory: VehicleCategory;
  ownershipModel: OwnershipModel;
  dailyKm: number;
  workingDaysPerMonth: number;
  petrolMileageKmpl: number; // e.g. 45 kmpl
  petrolPricePerLitre: number; // e.g. 102.86
  evEfficiencyWhPerKm: number; // e.g. 33 Wh/km
  electricityRatePerUnit: number; // e.g. 6.50
  batterySwapCostPerSwap: number; // e.g. 65
  batterySwapRangePerSwap: number; // e.g. 65 km
  petrolMonthlyMaintenance: number; // e.g. 900
  evMonthlyMaintenance: number; // e.g. 250
  evExShowroomPrice: number; // e.g. 1,15,000
  evDownPayment: number; // e.g. 20,000
  loanTenureMonths: number; // e.g. 36
  loanInterestRatePercent: number; // e.g. 13.5
  appliedSubsidyINR: number; // e.g. 10,000 (Estimated / Assumed)
  dailyRentalOrLeaseFee: number; // e.g. 320
}

export interface CalculationTraceStep {
  stepNumber: number;
  label: string;
  formula: string;
  arithmetic: string;
  result: string;
  notes?: string;
}

export interface CalculatorOutputs {
  dailyKm: number;
  workingDaysPerMonth: number;
  monthlyKm: number;
  annualKm: number;

  // Running costs per km (pure energy)
  petrolCostPerKm: number; // Fuel cost: petrolPrice / petrolMileage
  evCostPerKm: number; // Electricity/swap cost: electricityTariff * (Wh/km / 1000)

  // Energy cost breakdown
  monthlyPetrolFuelCost: number;
  monthlyEvEnergyCost: number;
  monthlyEnergySavings: number; // Separate energy savings

  // Maintenance cost breakdown
  monthlyPetrolMaintenance: number;
  monthlyEvMaintenance: number;
  monthlyMaintenanceSavings: number; // Separate maintenance savings

  // Operational totals
  monthlyOperationalSavings: number; // Energy savings + Maintenance savings
  annualOperationalSavings: number;

  // Capital, subsidy & financing
  evExShowroomPrice: number;
  appliedSubsidyINR: number; // User-entered / estimated subsidy
  netVehiclePriceAfterSubsidy: number;
  upfrontPayment: number; // Down payment or cash price
  loanPrincipal: number;
  monthlyEmiAmount: number;
  effectiveMonthlySavingsAfterEmiOrRental: number; // Net cash flow after EMI/lease

  // Payback metrics
  paybackPeriodMonths: number | null;
  paybackDisplay: string; // "No positive payback under these assumptions." if <= 0
  paybackHasPositiveReturn: boolean;

  // Environmental impact
  petrolLitersSavedPerMonth: number;
  co2SavedKgPerMonth: number;

  // 3-Year Total Cost of Ownership (TCO) breakdown
  threeYearPetrolEnergyCost: number;
  threeYearPetrolMaintenanceCost: number;
  threeYearTotalCostPetrol: number;
  threeYearEvUpfrontCost: number;
  threeYearEvEnergyCost: number;
  threeYearEvMaintenanceCost: number;
  threeYearTotalCostEv: number;
  threeYearNetSavings: number;

  // Audit trace & validations
  calculationTrace: CalculationTraceStep[];
  validationErrors: string[];
  validationWarnings: string[];
}

export interface SavedScenario {
  id: string;
  name: string;
  createdAt: string;
  type: 'calculator' | 'fleet';
  calculatorInputs?: CalculatorInputs;
  fleetVehicles?: FleetComparisonVehicle[];
  notes?: string;
  summaryHighlights: {
    monthlySavingsINR: number;
    monthlyDistanceKm: number;
    vehicleDescription: string;
  };
}

export interface AdvisorContextPayload {
  city: string;
  platform: string;
  dailyKm: number;
  vehicleType: string;
  monthlyFuelSaved?: number;
  ownershipModel?: string;
  fleetSummary?: {
    totalVehicles: number;
    totalMonthlyDistanceKm: number;
    monthlyOperatingCostINR: number;
    monthlySavingsINR: number;
    monthlyFinancingCostINR: number;
  };
}

