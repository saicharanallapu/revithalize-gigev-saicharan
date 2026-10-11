import {
  CalculationTraceStep,
  CalculatorInputs,
  CalculatorOutputs,
  VehicleCategory,
  FleetComparisonVehicle,
  FleetVehicleCalculation,
} from '../types';

export const VEHICLE_PRESETS: Record<
  VehicleCategory,
  {
    name: string;
    description: string;
    typicalPetrolMileage: number;
    typicalEvEfficiencyWhKm: number;
    defaultPriceINR: number;
    defaultDownPaymentINR: number;
    typicalPetrolMonthlyMaintenance: number;
    typicalEvMonthlyMaintenance: number;
    subsidyEligibleEstimateINR: number;
  }
> = {
  '2w-high-speed': {
    name: 'High-Speed Electric Scooter (Ather / Ola / TVS)',
    description: 'Top speed > 70 km/h, fixed lithium battery, range ~90-120 km. Ideal for full-shift food & quick commerce delivery.',
    typicalPetrolMileage: 46, // Petrol 110cc scooter mileage
    typicalEvEfficiencyWhKm: 33, // ~3.3 units per 100km
    defaultPriceINR: 115000,
    defaultDownPaymentINR: 20000,
    typicalPetrolMonthlyMaintenance: 900,
    typicalEvMonthlyMaintenance: 220,
    subsidyEligibleEstimateINR: 10000,
  },
  '2w-swappable': {
    name: 'Swappable Battery 2W (Zypp / Battery Smart / Yulu)',
    description: 'Quick 2-minute battery swap at hub stations. Zero charging waiting downtime during peak delivery surge hours.',
    typicalPetrolMileage: 50,
    typicalEvEfficiencyWhKm: 28,
    defaultPriceINR: 75000,
    defaultDownPaymentINR: 12000,
    typicalPetrolMonthlyMaintenance: 850,
    typicalEvMonthlyMaintenance: 180,
    subsidyEligibleEstimateINR: 8000,
  },
  '3w-cargo': {
    name: '3-Wheeler Electric Cargo Loader (Euler / Mahindra / Piaggio)',
    description: 'Payload 500-650 kg for Porter, Zomato Hyperpure, and bulk parcel hubs. Replaces diesel/CNG/petrol 3Ws.',
    typicalPetrolMileage: 24, // Petrol/CNG 3W equivalent
    typicalEvEfficiencyWhKm: 85, // ~8.5 kWh per 100 km
    defaultPriceINR: 340000,
    defaultDownPaymentINR: 50000,
    typicalPetrolMonthlyMaintenance: 2200,
    typicalEvMonthlyMaintenance: 650,
    subsidyEligibleEstimateINR: 35000,
  },
  '3w-auto': {
    name: '3-Wheeler Passenger Electric Auto (Mahindra Treo / Bajaj RE)',
    description: 'Last-mile passenger commute for Ola/Uber Auto and metro feeder routes.',
    typicalPetrolMileage: 26,
    typicalEvEfficiencyWhKm: 75,
    defaultPriceINR: 295000,
    defaultDownPaymentINR: 40000,
    typicalPetrolMonthlyMaintenance: 2000,
    typicalEvMonthlyMaintenance: 600,
    subsidyEligibleEstimateINR: 30000,
  },
};

export const DEFAULT_CALCULATOR_INPUTS: CalculatorInputs = {
  cityId: 'bengaluru',
  platform: 'Zomato',
  vehicleCategory: '2w-high-speed',
  ownershipModel: 'buy-emi',
  dailyKm: 85,
  workingDaysPerMonth: 26,
  petrolMileageKmpl: 46,
  petrolPricePerLitre: 102.86,
  evEfficiencyWhPerKm: 33,
  electricityRatePerUnit: 6.8,
  batterySwapCostPerSwap: 65,
  batterySwapRangePerSwap: 65,
  petrolMonthlyMaintenance: 900,
  evMonthlyMaintenance: 220,
  evExShowroomPrice: 115000,
  evDownPayment: 20000,
  loanTenureMonths: 36,
  loanInterestRatePercent: 13.5,
  appliedSubsidyINR: 10000,
  dailyRentalOrLeaseFee: 310,
};

export interface InputValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCalculatorInputs(inputs: CalculatorInputs): InputValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Distance & Days
  if (inputs.dailyKm < 0) {
    errors.push('Daily distance cannot be negative.');
  }
  if (inputs.workingDaysPerMonth < 0 || inputs.workingDaysPerMonth > 31) {
    errors.push('Working days per month must be between 0 and 31.');
  }

  // Petrol parameters
  if (inputs.petrolMileageKmpl <= 0) {
    errors.push('Petrol mileage must be greater than 0 km/l.');
  } else if (inputs.petrolMileageKmpl < 10 || inputs.petrolMileageKmpl > 100) {
    warnings.push(`Unusual petrol mileage entered (${inputs.petrolMileageKmpl} km/l). Normal two-wheeler range is 35–65 km/l.`);
  }

  if (inputs.petrolPricePerLitre < 0) {
    errors.push('Petrol price cannot be negative.');
  }

  // EV parameters
  if (inputs.ownershipModel === 'battery-swap-baas') {
    if (inputs.batterySwapRangePerSwap <= 0) {
      errors.push('Battery swap range must be greater than 0 km.');
    }
    if (inputs.batterySwapCostPerSwap < 0) {
      errors.push('Battery swap cost cannot be negative.');
    }
  } else {
    if (inputs.evEfficiencyWhPerKm <= 0) {
      errors.push('EV energy efficiency must be greater than 0 Wh/km.');
    } else if (inputs.evEfficiencyWhPerKm > 250) {
      warnings.push(`High EV energy consumption entered (${inputs.evEfficiencyWhPerKm} Wh/km). Typical 2W consumes 25–45 Wh/km.`);
    }

    if (inputs.electricityRatePerUnit < 0) {
      errors.push('Electricity rate cannot be negative.');
    }
  }

  // Maintenance
  if (inputs.petrolMonthlyMaintenance < 0) {
    errors.push('Petrol monthly maintenance cannot be negative.');
  }
  if (inputs.evMonthlyMaintenance < 0) {
    errors.push('EV monthly maintenance cannot be negative.');
  }

  // Pricing & Financing
  if (inputs.evExShowroomPrice < 0) {
    errors.push('Vehicle price cannot be negative.');
  }
  if (inputs.appliedSubsidyINR < 0) {
    errors.push('Subsidy amount cannot be negative.');
  }
  if (inputs.appliedSubsidyINR > inputs.evExShowroomPrice) {
    warnings.push('Assumed subsidy exceeds vehicle ex-showroom price. Net price will be capped at ₹0.');
  }
  if (inputs.evDownPayment < 0) {
    errors.push('Down payment cannot be negative.');
  }
  if (inputs.ownershipModel === 'buy-emi') {
    if (inputs.loanTenureMonths < 1) {
      errors.push('Loan tenure must be at least 1 month.');
    }
    if (inputs.loanInterestRatePercent < 0) {
      errors.push('Loan interest rate cannot be negative.');
    }
  }

  if (inputs.ownershipModel === 'rental-lease' && inputs.dailyRentalOrLeaseFee < 0) {
    errors.push('Daily lease/rental fee cannot be negative.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function calculateEvEconomics(inputs: CalculatorInputs): CalculatorOutputs {
  const validation = validateCalculatorInputs(inputs);

  // Sanitized safe inputs (prevent NaN / Infinity even if inputs are invalid)
  const safeDailyKm = Math.max(0, isNaN(inputs.dailyKm) ? 0 : inputs.dailyKm);
  const safeWorkingDays = Math.max(0, Math.min(31, isNaN(inputs.workingDaysPerMonth) ? 0 : inputs.workingDaysPerMonth));
  const safePetrolMileage = Math.max(0.1, isNaN(inputs.petrolMileageKmpl) || inputs.petrolMileageKmpl <= 0 ? 46 : inputs.petrolMileageKmpl);
  const safePetrolPrice = Math.max(0, isNaN(inputs.petrolPricePerLitre) ? 0 : inputs.petrolPricePerLitre);
  const safeEvEfficiency = Math.max(0.1, isNaN(inputs.evEfficiencyWhPerKm) || inputs.evEfficiencyWhPerKm <= 0 ? 33 : inputs.evEfficiencyWhPerKm);
  const safeElecRate = Math.max(0, isNaN(inputs.electricityRatePerUnit) ? 0 : inputs.electricityRatePerUnit);
  const safeSwapCost = Math.max(0, isNaN(inputs.batterySwapCostPerSwap) ? 0 : inputs.batterySwapCostPerSwap);
  const safeSwapRange = Math.max(1, isNaN(inputs.batterySwapRangePerSwap) || inputs.batterySwapRangePerSwap <= 0 ? 65 : inputs.batterySwapRangePerSwap);
  const safePetrolMaint = Math.max(0, isNaN(inputs.petrolMonthlyMaintenance) ? 0 : inputs.petrolMonthlyMaintenance);
  const safeEvMaint = Math.max(0, isNaN(inputs.evMonthlyMaintenance) ? 0 : inputs.evMonthlyMaintenance);
  const safeExShowroomPrice = Math.max(0, isNaN(inputs.evExShowroomPrice) ? 0 : inputs.evExShowroomPrice);
  const safeSubsidy = Math.max(0, isNaN(inputs.appliedSubsidyINR) ? 0 : inputs.appliedSubsidyINR);
  const safeDownPayment = Math.max(0, isNaN(inputs.evDownPayment) ? 0 : inputs.evDownPayment);
  const safeTenureMonths = Math.max(1, isNaN(inputs.loanTenureMonths) || inputs.loanTenureMonths < 1 ? 36 : inputs.loanTenureMonths);
  const safeInterestRate = Math.max(0, isNaN(inputs.loanInterestRatePercent) ? 0 : inputs.loanInterestRatePercent);
  const safeDailyLease = Math.max(0, isNaN(inputs.dailyRentalOrLeaseFee) ? 0 : inputs.dailyRentalOrLeaseFee);

  // 1. Monthly & Annual Distance (Requirement 4: daily distance × working days per month)
  const monthlyKm = safeDailyKm * safeWorkingDays;
  const annualKm = monthlyKm * 12;

  // 2. Petrol Cost per Kilometre (Requirement 2: petrol price ÷ petrol mileage)
  const petrolCostPerKm = safePetrolPrice / safePetrolMileage;

  // 3. EV Electricity Cost per Kilometre (Requirement 3: electricity tariff × (Wh/km ÷ 1000))
  let evCostPerKm = 0;
  if (inputs.ownershipModel === 'battery-swap-baas') {
    evCostPerKm = safeSwapCost / safeSwapRange;
  } else {
    evCostPerKm = safeElecRate * (safeEvEfficiency / 1000);
  }

  // 4. Energy-Cost Breakdown (Requirement 5: Keep energy, maintenance, EMI, upfront, subsidy separate)
  const monthlyPetrolFuelCost = monthlyKm * petrolCostPerKm;
  const monthlyEvEnergyCost = monthlyKm * evCostPerKm;
  const monthlyEnergySavings = monthlyPetrolFuelCost - monthlyEvEnergyCost;

  // 5. Maintenance Savings Breakdown
  const monthlyPetrolMaintenance = safePetrolMaint;
  const monthlyEvMaintenance = safeEvMaint;
  const monthlyMaintenanceSavings = monthlyPetrolMaintenance - monthlyEvMaintenance;

  // 6. Total Operational Savings
  const monthlyOperationalSavings = monthlyEnergySavings + monthlyMaintenanceSavings;
  const annualOperationalSavings = monthlyOperationalSavings * 12;

  // 7. Capital, Subsidy (Requirement 7: Assumed/Estimated) & Financing
  const netVehiclePriceAfterSubsidy = Math.max(0, safeExShowroomPrice - safeSubsidy);

  let upfrontPayment = 0;
  let loanPrincipal = 0;
  let monthlyEmiAmount = 0;

  if (inputs.ownershipModel === 'buy-emi') {
    upfrontPayment = Math.min(safeDownPayment, netVehiclePriceAfterSubsidy);
    loanPrincipal = Math.max(0, netVehiclePriceAfterSubsidy - upfrontPayment);
    if (loanPrincipal > 0 && safeTenureMonths > 0) {
      const monthlyRate = (safeInterestRate / 100) / 12;
      const n = safeTenureMonths;
      if (monthlyRate > 0) {
        monthlyEmiAmount =
          (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
          (Math.pow(1 + monthlyRate, n) - 1);
      } else {
        monthlyEmiAmount = loanPrincipal / n;
      }
    }
  } else if (inputs.ownershipModel === 'buy-cash') {
    upfrontPayment = netVehiclePriceAfterSubsidy;
    loanPrincipal = 0;
    monthlyEmiAmount = 0;
  } else if (inputs.ownershipModel === 'rental-lease') {
    upfrontPayment = 5000; // Standard refundable security deposit
    loanPrincipal = 0;
    monthlyEmiAmount = 0;
  } else {
    // battery-swap-baas
    upfrontPayment = Math.min(safeDownPayment, netVehiclePriceAfterSubsidy);
    loanPrincipal = Math.max(0, netVehiclePriceAfterSubsidy - upfrontPayment);
    if (loanPrincipal > 0 && safeTenureMonths > 0) {
      const monthlyRate = (safeInterestRate / 100) / 12;
      const n = safeTenureMonths;
      if (monthlyRate > 0) {
        monthlyEmiAmount =
          (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, n)) /
          (Math.pow(1 + monthlyRate, n) - 1);
      } else {
        monthlyEmiAmount = loanPrincipal / n;
      }
    }
  }

  // 8. Effective Monthly Savings After Deductions (Net Cashflow)
  let effectiveMonthlySavingsAfterEmiOrRental = monthlyOperationalSavings;
  if (inputs.ownershipModel === 'buy-emi' || inputs.ownershipModel === 'battery-swap-baas') {
    effectiveMonthlySavingsAfterEmiOrRental = monthlyOperationalSavings - monthlyEmiAmount;
  } else if (inputs.ownershipModel === 'rental-lease') {
    const monthlyLeasePaid = safeDailyLease * safeWorkingDays;
    const petrolMonthlyRunning = monthlyPetrolFuelCost + monthlyPetrolMaintenance;
    const evMonthlyRunning = monthlyLeasePaid + monthlyEvEnergyCost;
    effectiveMonthlySavingsAfterEmiOrRental = petrolMonthlyRunning - evMonthlyRunning;
  }

  // 9. Payback Calculation (Requirement 6: Never display negative; if net savings <= 0, display exact phrase)
  let paybackPeriodMonths: number | null = null;
  let paybackDisplay = '';
  let paybackHasPositiveReturn = false;

  // Evaluate the operational payback on upfront capital:
  if (monthlyOperationalSavings <= 0) {
    paybackPeriodMonths = null;
    paybackDisplay = 'No positive payback under these assumptions.';
    paybackHasPositiveReturn = false;
  } else if (upfrontPayment <= 0) {
    paybackPeriodMonths = 0;
    paybackDisplay = 'Immediate (0 Months - No Upfront Capital)';
    paybackHasPositiveReturn = true;
  } else {
    const rawPayback = upfrontPayment / monthlyOperationalSavings;
    if (rawPayback <= 0 || !isFinite(rawPayback) || isNaN(rawPayback)) {
      paybackPeriodMonths = null;
      paybackDisplay = 'No positive payback under these assumptions.';
      paybackHasPositiveReturn = false;
    } else {
      paybackPeriodMonths = Math.round(rawPayback * 10) / 10;
      paybackDisplay = `~${paybackPeriodMonths.toFixed(1)} Months`;
      paybackHasPositiveReturn = true;
    }
  }

  // 10. 3-Year Total Cost of Ownership (36 Months)
  const threeYearsMonths = 36;
  const petrolBaselineAcquisition = 85000; // Benchmark purchase price for a standard 110cc commuter
  const threeYearPetrolEnergyCost = 36 * monthlyPetrolFuelCost;
  const threeYearPetrolMaintenanceCost = 36 * monthlyPetrolMaintenance;
  const threeYearTotalCostPetrol =
    petrolBaselineAcquisition + threeYearPetrolEnergyCost + threeYearPetrolMaintenanceCost;

  let threeYearEvUpfrontCost = 0;
  if (inputs.ownershipModel === 'buy-cash') {
    threeYearEvUpfrontCost = netVehiclePriceAfterSubsidy;
  } else if (inputs.ownershipModel === 'buy-emi' || inputs.ownershipModel === 'battery-swap-baas') {
    threeYearEvUpfrontCost = upfrontPayment + monthlyEmiAmount * Math.min(36, safeTenureMonths);
  } else if (inputs.ownershipModel === 'rental-lease') {
    threeYearEvUpfrontCost = 36 * (safeDailyLease * safeWorkingDays);
  }

  const threeYearEvEnergyCost = 36 * monthlyEvEnergyCost;
  const threeYearEvMaintenanceCost = inputs.ownershipModel === 'rental-lease' ? 0 : 36 * monthlyEvMaintenance;
  const threeYearTotalCostEv =
    threeYearEvUpfrontCost + threeYearEvEnergyCost + threeYearEvMaintenanceCost;

  const threeYearNetSavings = threeYearTotalCostPetrol - threeYearTotalCostEv;

  // 11. Environmental Impact
  const petrolLitersSavedPerMonth = safePetrolMileage > 0 ? monthlyKm / safePetrolMileage : 0;
  const co2SavedKgPerMonth = petrolLitersSavedPerMonth * 1.85;

  // 12. Transparent Calculation Breakdown Trace (Requirement 9)
  const calculationTrace: CalculationTraceStep[] = [
    {
      stepNumber: 1,
      label: 'Monthly Operating Distance',
      formula: 'Daily Distance (km) × Working Days per Month',
      arithmetic: `${safeDailyKm} km/day × ${safeWorkingDays} days/month`,
      result: `${monthlyKm.toLocaleString('en-IN')} km / month`,
      notes: safeDailyKm === 0 ? 'Zero distance input: vehicle is parked.' : undefined,
    },
    {
      stepNumber: 2,
      label: 'Petrol Fuel Cost per Kilometre',
      formula: 'Petrol Price (₹/L) ÷ Petrol Mileage (km/L)',
      arithmetic: `₹${safePetrolPrice.toFixed(2)} / ${safePetrolMileage.toFixed(1)} km/L`,
      result: `₹${petrolCostPerKm.toFixed(2)} / km`,
      notes: 'Fuel-only cost per km (excludes maintenance).',
    },
    {
      stepNumber: 3,
      label: 'EV Energy Cost per Kilometre',
      formula: inputs.ownershipModel === 'battery-swap-baas'
        ? 'Swap Fee (₹) ÷ Range per Swap (km)'
        : 'Electricity Tariff (₹/kWh) × (EV Efficiency Wh/km ÷ 1000)',
      arithmetic: inputs.ownershipModel === 'battery-swap-baas'
        ? `₹${safeSwapCost.toFixed(2)} / ${safeSwapRange} km`
        : `₹${safeElecRate.toFixed(2)}/kWh × (${safeEvEfficiency} Wh/km ÷ 1000)`,
      result: `₹${evCostPerKm.toFixed(2)} / km`,
      notes: 'Electricity or battery swap energy consumption cost per km.',
    },
    {
      stepNumber: 4,
      label: 'Monthly Fuel vs Electricity Expense',
      formula: 'Monthly Distance × Cost per km (Petrol vs EV)',
      arithmetic: `Petrol: ${monthlyKm} km × ₹${petrolCostPerKm.toFixed(2)} = ₹${monthlyPetrolFuelCost.toFixed(0)} | EV: ${monthlyKm} km × ₹${evCostPerKm.toFixed(2)} = ₹${monthlyEvEnergyCost.toFixed(0)}`,
      result: `Petrol ₹${Math.round(monthlyPetrolFuelCost).toLocaleString('en-IN')} vs EV ₹${Math.round(monthlyEvEnergyCost).toLocaleString('en-IN')}`,
    },
    {
      stepNumber: 5,
      label: 'Monthly Energy-Cost Savings',
      formula: 'Monthly Petrol Fuel Cost - Monthly EV Electricity Cost',
      arithmetic: `₹${Math.round(monthlyPetrolFuelCost).toLocaleString('en-IN')} - ₹${Math.round(monthlyEvEnergyCost).toLocaleString('en-IN')}`,
      result: `₹${Math.round(monthlyEnergySavings).toLocaleString('en-IN')} / month`,
      notes: monthlyEnergySavings < 0 ? 'Warning: Under these assumptions, EV energy cost exceeds petrol!' : undefined,
    },
    {
      stepNumber: 6,
      label: 'Monthly Maintenance Savings',
      formula: 'Petrol Monthly Maintenance - EV Monthly Maintenance',
      arithmetic: `₹${safePetrolMaint.toLocaleString('en-IN')} - ₹${safeEvMaint.toLocaleString('en-IN')}`,
      result: `₹${Math.round(monthlyMaintenanceSavings).toLocaleString('en-IN')} / month`,
      notes: 'Regular servicing, engine oil, chain lubrication & brake wear difference.',
    },
    {
      stepNumber: 7,
      label: 'Total Monthly Operational Savings',
      formula: 'Energy Savings + Maintenance Savings',
      arithmetic: `₹${Math.round(monthlyEnergySavings).toLocaleString('en-IN')} + ₹${Math.round(monthlyMaintenanceSavings).toLocaleString('en-IN')}`,
      result: `₹${Math.round(monthlyOperationalSavings).toLocaleString('en-IN')} / month`,
      notes: monthlyOperationalSavings <= 0 ? 'Total operational savings are zero or negative.' : undefined,
    },
    {
      stepNumber: 8,
      label: 'Vehicle Pricing & Assumed Subsidy',
      formula: 'Ex-Showroom Price - Estimated / Assumed Subsidy',
      arithmetic: `₹${safeExShowroomPrice.toLocaleString('en-IN')} - ₹${safeSubsidy.toLocaleString('en-IN')}`,
      result: `Net ₹${netVehiclePriceAfterSubsidy.toLocaleString('en-IN')}`,
      notes: 'Subsidy is user-entered estimate based on indicative central/state guidelines.',
    },
    {
      stepNumber: 9,
      label: 'Financing & Loan EMI',
      formula: inputs.ownershipModel === 'buy-emi'
        ? `Principal: (Net Price - Down Payment) = ₹${loanPrincipal.toLocaleString('en-IN')}, EMI formula at ${safeInterestRate}% for ${safeTenureMonths} mo`
        : inputs.ownershipModel === 'rental-lease'
        ? `Daily Lease ₹${safeDailyLease} × ${safeWorkingDays} working days`
        : 'Full upfront payment (no ongoing loan)',
      arithmetic: inputs.ownershipModel === 'buy-emi'
        ? `Loan Principal ₹${loanPrincipal.toLocaleString('en-IN')} @ ${safeInterestRate}% p.a. for ${safeTenureMonths} months`
        : inputs.ownershipModel === 'rental-lease'
        ? `₹${safeDailyLease} × ${safeWorkingDays} days = ₹${(safeDailyLease * safeWorkingDays).toLocaleString('en-IN')}/mo`
        : '₹0 / month EMI',
      result: inputs.ownershipModel === 'buy-emi'
        ? `₹${Math.round(monthlyEmiAmount).toLocaleString('en-IN')} / month`
        : inputs.ownershipModel === 'rental-lease'
        ? `₹${Math.round(safeDailyLease * safeWorkingDays).toLocaleString('en-IN')} / month lease`
        : '₹0 EMI',
    },
    {
      stepNumber: 10,
      label: 'Net Monthly Cashflow Impact (Take-Home Surplus)',
      formula: inputs.ownershipModel === 'buy-emi'
        ? 'Total Operational Savings - Monthly EMI'
        : inputs.ownershipModel === 'rental-lease'
        ? 'Petrol Running Cost - (Daily Lease + EV Electricity)'
        : 'Total Operational Savings (No EMI)',
      arithmetic: inputs.ownershipModel === 'buy-emi'
        ? `₹${Math.round(monthlyOperationalSavings).toLocaleString('en-IN')} - ₹${Math.round(monthlyEmiAmount).toLocaleString('en-IN')}`
        : `Net take-home difference: ₹${Math.round(effectiveMonthlySavingsAfterEmiOrRental).toLocaleString('en-IN')}`,
      result: `₹${Math.round(effectiveMonthlySavingsAfterEmiOrRental).toLocaleString('en-IN')} / month`,
      notes: effectiveMonthlySavingsAfterEmiOrRental < 0 ? 'Monthly outflow (EMI/Lease) exceeds operational savings.' : 'Surplus cash in driver’s pocket after all vehicle expenses.',
    },
    {
      stepNumber: 11,
      label: 'Payback Period',
      formula: 'Upfront Capital Investment ÷ Monthly Operational Savings',
      arithmetic: monthlyOperationalSavings > 0
        ? `₹${upfrontPayment.toLocaleString('en-IN')} ÷ ₹${Math.round(monthlyOperationalSavings).toLocaleString('en-IN')}/mo`
        : `Upfront ₹${upfrontPayment.toLocaleString('en-IN')} with monthly savings of ₹${Math.round(monthlyOperationalSavings).toLocaleString('en-IN')}`,
      result: paybackDisplay,
      notes: !paybackHasPositiveReturn ? 'No positive payback under these assumptions.' : undefined,
    },
    {
      stepNumber: 12,
      label: '3-Year Total Cost of Ownership (TCO)',
      formula: 'Petrol (Acquisition + Fuel + Maintenance) vs EV (Upfront/EMI + Energy + Maintenance)',
      arithmetic: `Petrol: ₹${Math.round(threeYearTotalCostPetrol).toLocaleString('en-IN')} | EV: ₹${Math.round(threeYearTotalCostEv).toLocaleString('en-IN')}`,
      result: `3-Year Difference: ₹${Math.round(threeYearNetSavings).toLocaleString('en-IN')} ${threeYearNetSavings >= 0 ? 'Saved' : 'Loss'}`,
    },
  ];

  return {
    dailyKm: safeDailyKm,
    workingDaysPerMonth: safeWorkingDays,
    monthlyKm,
    annualKm,
    petrolCostPerKm,
    evCostPerKm,
    monthlyPetrolFuelCost,
    monthlyEvEnergyCost,
    monthlyEnergySavings,
    monthlyPetrolMaintenance,
    monthlyEvMaintenance,
    monthlyMaintenanceSavings,
    monthlyOperationalSavings,
    annualOperationalSavings,
    evExShowroomPrice: safeExShowroomPrice,
    appliedSubsidyINR: safeSubsidy,
    netVehiclePriceAfterSubsidy,
    upfrontPayment,
    loanPrincipal,
    monthlyEmiAmount,
    effectiveMonthlySavingsAfterEmiOrRental,
    paybackPeriodMonths,
    paybackDisplay,
    paybackHasPositiveReturn,
    petrolLitersSavedPerMonth,
    co2SavedKgPerMonth,
    threeYearPetrolEnergyCost,
    threeYearPetrolMaintenanceCost,
    threeYearTotalCostPetrol,
    threeYearEvUpfrontCost,
    threeYearEvEnergyCost,
    threeYearEvMaintenanceCost,
    threeYearTotalCostEv,
    threeYearNetSavings,
    calculationTrace,
    validationErrors: validation.errors,
    validationWarnings: validation.warnings,
  };
}

export function validateFleetVehicle(v: Partial<FleetComparisonVehicle>): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!v.name || v.name.trim() === '') {
    errors.push('Vehicle name is required.');
  }
  if (!v.vehicleCategory) {
    errors.push('Vehicle category is required.');
  }
  if (v.purchasePriceINR === undefined || isNaN(v.purchasePriceINR) || v.purchasePriceINR <= 0) {
    errors.push('Purchase price must be greater than ₹0.');
  }
  if (v.dailyDistanceKm === undefined || isNaN(v.dailyDistanceKm) || v.dailyDistanceKm <= 0) {
    errors.push('Daily distance must be greater than 0 km.');
  } else if (v.dailyDistanceKm > 400) {
    warnings.push(
      `High daily distance entered (${v.dailyDistanceKm} km). Verify battery range or mid-day charging capability.`
    );
  }
  if (
    v.workingDaysPerMonth === undefined ||
    isNaN(v.workingDaysPerMonth) ||
    v.workingDaysPerMonth < 1 ||
    v.workingDaysPerMonth > 31
  ) {
    errors.push('Working days per month must be between 1 and 31.');
  }
  if (
    v.electricityConsumptionWhKm === undefined ||
    isNaN(v.electricityConsumptionWhKm) ||
    v.electricityConsumptionWhKm <= 0
  ) {
    errors.push('Electricity consumption (Wh/km) must be greater than 0.');
  }
  if (
    v.electricityTariffINR === undefined ||
    isNaN(v.electricityTariffINR) ||
    v.electricityTariffINR <= 0
  ) {
    errors.push('Electricity tariff must be greater than ₹0/kWh.');
  }
  if (
    v.evMonthlyMaintenanceINR === undefined ||
    isNaN(v.evMonthlyMaintenanceINR) ||
    v.evMonthlyMaintenanceINR < 0
  ) {
    errors.push('EV monthly maintenance cannot be negative.');
  }

  // Financing details
  if (v.ownershipModel === 'buy-emi') {
    if (v.downPaymentINR === undefined || isNaN(v.downPaymentINR) || v.downPaymentINR < 0) {
      errors.push('Down payment cannot be negative.');
    } else if (v.purchasePriceINR !== undefined && v.downPaymentINR > v.purchasePriceINR) {
      errors.push('Down payment cannot exceed vehicle purchase price.');
    }
    if (
      v.loanTenureMonths === undefined ||
      isNaN(v.loanTenureMonths) ||
      v.loanTenureMonths < 1 ||
      v.loanTenureMonths > 84
    ) {
      errors.push('Loan tenure must be between 1 and 84 months.');
    }
    if (
      v.loanInterestRatePercent === undefined ||
      isNaN(v.loanInterestRatePercent) ||
      v.loanInterestRatePercent < 0 ||
      v.loanInterestRatePercent > 40
    ) {
      errors.push('Loan interest rate must be between 0% and 40%.');
    }
  }

  // Baseline comparison parameters
  if (
    v.petrolPricePerLitre === undefined ||
    isNaN(v.petrolPricePerLitre) ||
    v.petrolPricePerLitre <= 0
  ) {
    errors.push('Baseline petrol price must be greater than ₹0/L.');
  }
  if (
    v.petrolMileageKmpl === undefined ||
    isNaN(v.petrolMileageKmpl) ||
    v.petrolMileageKmpl <= 0
  ) {
    errors.push('Baseline petrol mileage must be greater than 0 km/l.');
  }
  if (
    v.petrolMonthlyMaintenanceINR === undefined ||
    isNaN(v.petrolMonthlyMaintenanceINR) ||
    v.petrolMonthlyMaintenanceINR < 0
  ) {
    errors.push('Baseline petrol maintenance cannot be negative.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

export function calculateFleetVehicle(v: FleetComparisonVehicle): FleetVehicleCalculation {
  const calcInputs: CalculatorInputs = {
    cityId: 'bengaluru',
    platform: 'Zomato',
    vehicleCategory: v.vehicleCategory,
    ownershipModel: v.ownershipModel,
    dailyKm: Math.max(0, v.dailyDistanceKm || 0),
    workingDaysPerMonth: Math.max(0, Math.min(31, v.workingDaysPerMonth || 0)),
    petrolMileageKmpl: Math.max(0.1, v.petrolMileageKmpl || 45),
    petrolPricePerLitre: Math.max(0, v.petrolPricePerLitre || 102.86),
    evEfficiencyWhPerKm: Math.max(0.1, v.electricityConsumptionWhKm || 33),
    electricityRatePerUnit: Math.max(0, v.electricityTariffINR || 6.8),
    batterySwapCostPerSwap: 65,
    batterySwapRangePerSwap: 65,
    petrolMonthlyMaintenance: Math.max(0, v.petrolMonthlyMaintenanceINR || 0),
    evMonthlyMaintenance: Math.max(0, v.evMonthlyMaintenanceINR || 0),
    evExShowroomPrice: Math.max(0, v.purchasePriceINR || 0),
    evDownPayment: Math.max(0, v.downPaymentINR || 0),
    loanTenureMonths: Math.max(1, v.loanTenureMonths || 36),
    loanInterestRatePercent: Math.max(0, v.loanInterestRatePercent || 13.5),
    appliedSubsidyINR: 0,
    dailyRentalOrLeaseFee: v.dailyLeaseFeeINR || 310,
  };

  const outputs = calculateEvEconomics(calcInputs);

  const monthlyDistanceKm = outputs.monthlyKm;
  const electricityCostPerKm = outputs.evCostPerKm;
  const monthlyElectricityCostINR = outputs.monthlyEvEnergyCost;
  const monthlyOperatingCostINR = outputs.monthlyEvEnergyCost + (v.evMonthlyMaintenanceINR || 0);

  const baselinePetrolCostPerKm = outputs.petrolCostPerKm;
  const baselineMonthlyPetrolFuelCostINR = outputs.monthlyPetrolFuelCost;
  const baselineMonthlyOperatingCostINR =
    outputs.monthlyPetrolFuelCost + (v.petrolMonthlyMaintenanceINR || 0);

  const monthlyOperatingSavingsINR = outputs.monthlyOperationalSavings;
  const monthlyFinancingCostINR =
    v.ownershipModel === 'rental-lease'
      ? (v.dailyLeaseFeeINR || 310) * (v.workingDaysPerMonth || 26)
      : outputs.monthlyEmiAmount;

  const netMonthlySavingsINR = outputs.effectiveMonthlySavingsAfterEmiOrRental;
  const upfrontCapitalRequiredINR = outputs.upfrontPayment;

  return {
    vehicle: v,
    monthlyDistanceKm,
    electricityCostPerKm,
    monthlyElectricityCostINR,
    monthlyOperatingCostINR,
    baselinePetrolCostPerKm,
    baselineMonthlyPetrolFuelCostINR,
    baselineMonthlyOperatingCostINR,
    monthlyOperatingSavingsINR,
    monthlyFinancingCostINR,
    netMonthlySavingsINR,
    upfrontCapitalRequiredINR,
  };
}

export const DEFAULT_FLEET_SAMPLE_VEHICLES: FleetComparisonVehicle[] = [
  {
    id: 'sample-fleet-1',
    name: 'Ather 450X Commercial Spec',
    vehicleCategory: '2w-high-speed',
    purchasePriceINR: 125000,
    dailyDistanceKm: 85,
    workingDaysPerMonth: 26,
    electricityConsumptionWhKm: 33,
    electricityTariffINR: 6.8,
    evMonthlyMaintenanceINR: 220,
    ownershipModel: 'buy-emi',
    downPaymentINR: 25000,
    loanTenureMonths: 36,
    loanInterestRatePercent: 13.5,
    petrolPricePerLitre: 102.86,
    petrolMileageKmpl: 46,
    petrolMonthlyMaintenanceINR: 900,
    isSampleExample: true,
  },
  {
    id: 'sample-fleet-2',
    name: 'Euler HiLoad EV Cargo Flatbed',
    vehicleCategory: '3w-cargo',
    purchasePriceINR: 360000,
    dailyDistanceKm: 95,
    workingDaysPerMonth: 26,
    electricityConsumptionWhKm: 85,
    electricityTariffINR: 6.8,
    evMonthlyMaintenanceINR: 650,
    ownershipModel: 'buy-emi',
    downPaymentINR: 60000,
    loanTenureMonths: 36,
    loanInterestRatePercent: 14.0,
    petrolPricePerLitre: 102.86,
    petrolMileageKmpl: 24,
    petrolMonthlyMaintenanceINR: 2200,
    isSampleExample: true,
  },
  {
    id: 'sample-fleet-3',
    name: 'Mahindra Treo Passenger Auto',
    vehicleCategory: '3w-auto',
    purchasePriceINR: 295000,
    dailyDistanceKm: 110,
    workingDaysPerMonth: 26,
    electricityConsumptionWhKm: 75,
    electricityTariffINR: 6.8,
    evMonthlyMaintenanceINR: 600,
    ownershipModel: 'buy-emi',
    downPaymentINR: 45000,
    loanTenureMonths: 36,
    loanInterestRatePercent: 13.5,
    petrolPricePerLitre: 102.86,
    petrolMileageKmpl: 26,
    petrolMonthlyMaintenanceINR: 2000,
    isSampleExample: true,
  },
];
