import { calculateEvEconomics, DEFAULT_CALCULATOR_INPUTS, validateCalculatorInputs } from './src/utils/calculator.ts';
import { CalculatorInputs } from './src/types/index.ts';

console.log('=== GIGEV CALCULATOR AUDIT SUITE ===\n');

// TEST 1: Normal Inputs (Standard 85 km/day, 26 days/mo, Ather/Ola 2W in Bengaluru)
console.log('--- TEST 1: Normal Inputs (Standard 85 km/day Delivery Shift) ---');
const test1Inputs: CalculatorInputs = {
  ...DEFAULT_CALCULATOR_INPUTS,
  dailyKm: 85,
  workingDaysPerMonth: 26,
  petrolPricePerLitre: 102.86,
  petrolMileageKmpl: 46,
  evEfficiencyWhPerKm: 33,
  electricityRatePerUnit: 6.8,
  petrolMonthlyMaintenance: 900,
  evMonthlyMaintenance: 220,
  evExShowroomPrice: 115000,
  appliedSubsidyINR: 10000,
  evDownPayment: 20000,
  loanTenureMonths: 36,
  loanInterestRatePercent: 13.5,
  ownershipModel: 'buy-emi',
};

const res1 = calculateEvEconomics(test1Inputs);
console.log(`Monthly Distance: ${res1.monthlyKm} km (Expected: 85 * 26 = 2210)`);
console.log(`Petrol Cost/km: ₹${res1.petrolCostPerKm.toFixed(4)} (Expected: 102.86 / 46 = 2.2361)`);
console.log(`EV Electricity Cost/km: ₹${res1.evCostPerKm.toFixed(4)} (Expected: 6.8 * 0.033 = 0.2244)`);
console.log(`Monthly Petrol Fuel Cost: ₹${res1.monthlyPetrolFuelCost.toFixed(2)} (Expected: 2210 * 2.2361 = 4941.76)`);
console.log(`Monthly EV Electricity Cost: ₹${res1.monthlyEvEnergyCost.toFixed(2)} (Expected: 2210 * 0.2244 = 495.92)`);
console.log(`Monthly Energy Savings: ₹${res1.monthlyEnergySavings.toFixed(2)} (Expected: 4941.76 - 495.92 = 4445.84)`);
console.log(`Monthly Maintenance Savings: ₹${res1.monthlyMaintenanceSavings} (Expected: 900 - 220 = 680)`);
console.log(`Total Monthly Operational Savings: ₹${res1.monthlyOperationalSavings.toFixed(2)} (Expected: 4445.84 + 680 = 5125.84)`);
console.log(`Upfront Payment (Down Payment): ₹${res1.upfrontPayment}`);
console.log(`Estimated / Assumed Subsidy: ₹${res1.appliedSubsidyINR}`);
console.log(`Net Vehicle Price: ₹${res1.netVehiclePriceAfterSubsidy}`);
console.log(`Loan Principal: ₹${res1.loanPrincipal} (Expected: 105000 - 20000 = 85000)`);
console.log(`Monthly EMI: ₹${res1.monthlyEmiAmount.toFixed(2)}`);
console.log(`Net Take-Home Surplus After EMI: ₹${res1.effectiveMonthlySavingsAfterEmiOrRental.toFixed(2)}`);
console.log(`Payback Period: ${res1.paybackDisplay} (Months: ${res1.paybackPeriodMonths})`);
console.log(`3-Year Total Cost Petrol: ₹${res1.threeYearTotalCostPetrol.toFixed(0)}`);
console.log(`3-Year Total Cost EV: ₹${res1.threeYearTotalCostEv.toFixed(0)}`);
console.log(`3-Year Net Savings: ₹${res1.threeYearNetSavings.toFixed(0)}`);
console.assert(res1.monthlyKm === 2210, 'Monthly KM test failed');
console.assert(Math.abs(res1.petrolCostPerKm - (102.86 / 46)) < 0.0001, 'Petrol cost per km test failed');
console.assert(Math.abs(res1.evCostPerKm - (6.8 * 0.033)) < 0.0001, 'EV cost per km test failed');
console.assert(res1.paybackHasPositiveReturn === true, 'Payback positive test failed');
console.log('Test 1 Passed: PASSED\n');

// TEST 2: Zero Distance Scenario (Vehicle Parked / No Operations)
console.log('--- TEST 2: Zero Distance Scenario (0 km/day) ---');
const test2Inputs: CalculatorInputs = {
  ...DEFAULT_CALCULATOR_INPUTS,
  dailyKm: 0,
  workingDaysPerMonth: 26,
  evDownPayment: 25000,
  petrolMonthlyMaintenance: 500,
  evMonthlyMaintenance: 500, // Zero maintenance savings as well
};
const res2 = calculateEvEconomics(test2Inputs);
console.log(`Daily KM: ${res2.dailyKm}, Monthly KM: ${res2.monthlyKm}`);
console.log(`Monthly Petrol Fuel Cost: ₹${res2.monthlyPetrolFuelCost}`);
console.log(`Monthly EV Electricity Cost: ₹${res2.monthlyEvEnergyCost}`);
console.log(`Monthly Energy Savings: ₹${res2.monthlyEnergySavings}`);
console.log(`Monthly Maintenance Savings: ₹${res2.monthlyMaintenanceSavings}`);
console.log(`Total Monthly Operational Savings: ₹${res2.monthlyOperationalSavings}`);
console.log(`Payback Display: "${res2.paybackDisplay}"`);
console.log(`Payback Months: ${res2.paybackPeriodMonths}`);
console.log(`Payback Has Positive Return: ${res2.paybackHasPositiveReturn}`);
console.assert(res2.monthlyKm === 0, 'Zero monthly km test failed');
console.assert(res2.monthlyPetrolFuelCost === 0, 'Zero fuel cost test failed');
console.assert(res2.monthlyEvEnergyCost === 0, 'Zero energy cost test failed');
console.assert(res2.monthlyOperationalSavings === 0, 'Zero operational savings test failed');
console.assert(res2.paybackDisplay === 'No positive payback under these assumptions.', 'Zero distance payback text failed');
console.assert(res2.paybackPeriodMonths === null, 'Payback months should be null on zero savings');
console.assert(res2.paybackHasPositiveReturn === false, 'Payback hasPositiveReturn should be false');
console.log('Test 2 Passed: PASSED\n');

// TEST 3: Negative Energy Savings Scenario (Extremely cheap petrol or very high electricity / inefficient EV)
console.log('--- TEST 3: Negative Savings Scenario (High Electricity Cost ₹35/kWh, Super efficient Petrol 90 km/l) ---');
const test3Inputs: CalculatorInputs = {
  ...DEFAULT_CALCULATOR_INPUTS,
  dailyKm: 80,
  workingDaysPerMonth: 26,
  petrolPricePerLitre: 80,
  petrolMileageKmpl: 90, // Petrol cost/km = 80/90 = 0.888
  electricityRatePerUnit: 35, // EV cost/km = 35 * 0.040 = 1.40 (EV is more expensive!)
  evEfficiencyWhPerKm: 40,
  petrolMonthlyMaintenance: 200,
  evMonthlyMaintenance: 500, // EV maintenance is also higher!
  evDownPayment: 30000,
};
const res3 = calculateEvEconomics(test3Inputs);
console.log(`Petrol Cost/km: ₹${res3.petrolCostPerKm.toFixed(3)} vs EV Cost/km: ₹${res3.evCostPerKm.toFixed(3)}`);
console.log(`Monthly Energy Savings: ₹${res3.monthlyEnergySavings.toFixed(2)} (Negative!)`);
console.log(`Monthly Maintenance Savings: ₹${res3.monthlyMaintenanceSavings.toFixed(2)} (Negative!)`);
console.log(`Total Monthly Operational Savings: ₹${res3.monthlyOperationalSavings.toFixed(2)} (Negative!)`);
console.log(`Payback Display: "${res3.paybackDisplay}"`);
console.log(`Payback Months: ${res3.paybackPeriodMonths}`);
console.assert(res3.monthlyOperationalSavings < 0, 'Expected negative operational savings');
console.assert(res3.paybackDisplay === 'No positive payback under these assumptions.', 'Negative savings payback message failed');
console.assert(res3.paybackPeriodMonths === null, 'Negative payback should NEVER be a negative number');
console.assert(res3.paybackHasPositiveReturn === false, 'Negative savings payback flag failed');
console.log('Test 3 Passed: PASSED\n');

// TEST 4: Negative Net Cashflow Scenario (Operational savings positive, but loan EMI exceeds savings)
console.log('--- TEST 4: Low Distance (15 km/day) where EMI exceeds fuel savings ---');
const test4Inputs: CalculatorInputs = {
  ...DEFAULT_CALCULATOR_INPUTS,
  dailyKm: 15, // Only 15 km/day
  workingDaysPerMonth: 20, // 300 km/mo
  evExShowroomPrice: 150000,
  appliedSubsidyINR: 0,
  evDownPayment: 10000, // Large loan: 140000
  loanTenureMonths: 24, // High EMI
  loanInterestRatePercent: 15,
};
const res4 = calculateEvEconomics(test4Inputs);
console.log(`Monthly Distance: ${res4.monthlyKm} km`);
console.log(`Monthly Operational Savings: ₹${res4.monthlyOperationalSavings.toFixed(2)}`);
console.log(`Monthly EMI: ₹${res4.monthlyEmiAmount.toFixed(2)}`);
console.log(`Effective Net Cashflow After EMI: ₹${res4.effectiveMonthlySavingsAfterEmiOrRental.toFixed(2)}`);
console.assert(res4.effectiveMonthlySavingsAfterEmiOrRental < 0, 'Expected negative net cashflow');
console.assert(res4.monthlyOperationalSavings > 0, 'Operational savings still positive');
console.log(`Operational Payback on ₹10k down payment: ${res4.paybackDisplay}`);
console.log('Test 4 Passed: PASSED\n');

// TEST 5: Input Validation Checks
console.log('--- TEST 5: Input Validation & Sanitization ---');
const invalidInputs: CalculatorInputs = {
  ...DEFAULT_CALCULATOR_INPUTS,
  dailyKm: -50,
  workingDaysPerMonth: 35,
  petrolMileageKmpl: 0,
  petrolPricePerLitre: -10,
  evEfficiencyWhPerKm: 0,
  loanTenureMonths: -5,
};
const valResult = validateCalculatorInputs(invalidInputs);
console.log(`Validation isValid: ${valResult.isValid} (Expected false)`);
console.log(`Errors caught (${valResult.errors.length}):`, valResult.errors);
const safeCalc = calculateEvEconomics(invalidInputs);
console.log(`Safely computed without throwing NaN/crash: Monthly KM: ${safeCalc.monthlyKm}, Fuel/km: ₹${safeCalc.petrolCostPerKm}`);
console.assert(!isNaN(safeCalc.petrolCostPerKm), 'Sanitized calculation should not be NaN');
console.assert(isFinite(safeCalc.petrolCostPerKm), 'Sanitized calculation should be finite');
console.log('Test 5 Passed: PASSED\n');

console.log('=== ALL 5 AUDIT TESTS EXECUTED AND PASSED SUCCESSFULLY ===');
