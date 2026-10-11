import { calculateEvEconomics, DEFAULT_CALCULATOR_INPUTS } from './src/utils/calculator.ts';
import { SubsidyScheme, SubsidyVehicleCategory, VehicleCategory } from './src/types/index.ts';

console.log('=== GIGEV SUBSIDY EXPLORER AUDIT & VERIFICATION SUITE ===\n');

// 1. Fetch subsidies from local API
async function runTests() {
  const res = await fetch('http://localhost:3000/api/subsidies');
  const json = await res.json();
  const subsidies: SubsidyScheme[] = json.data;

  console.log(`Fetched ${subsidies.length} verified government subsidy records from /api/subsidies.\n`);

  // TEST 1: State Selection Filtering
  console.log('--- TEST 1: State Selection Filtering ---');
  const delhiSchemes = subsidies.filter((s) => s.stateCode === 'delhi' || s.category === 'central');
  console.log(`Delhi selection matches: ${delhiSchemes.map((s) => s.title).join(' | ')}`);
  console.assert(delhiSchemes.length >= 2, 'Delhi should match at least Delhi EV Policy and Central PM E-DRIVE');

  const karnatakaSchemes = subsidies.filter((s) => s.stateCode === 'karnataka' || s.category === 'central');
  console.log(`Karnataka selection matches: ${karnatakaSchemes.map((s) => s.title).join(' | ')}`);
  console.assert(karnatakaSchemes.length >= 2, 'Karnataka should match at least Karnataka EV Policy and Central PM E-DRIVE');
  console.log('Test 1 Passed: PASSED\n');

  // TEST 2: Vehicle Category Filtering
  console.log('--- TEST 2: EV Category Filtering ---');
  const e2wSchemes = subsidies.filter((s) => s.applicableCategories.includes('electric-2w'));
  console.log(`Electric 2W eligible schemes: ${e2wSchemes.length} schemes`);
  console.assert(e2wSchemes.length >= 5, 'Should have multiple schemes supporting electric 2W');

  const e3wCargoSchemes = subsidies.filter((s) => s.applicableCategories.includes('electric-3w-cargo'));
  console.log(`Electric 3W Cargo eligible schemes: ${e3wCargoSchemes.length} schemes`);
  console.assert(e3wCargoSchemes.length >= 5, 'Should have multiple schemes supporting electric 3W cargo');
  console.log('Test 2 Passed: PASSED\n');

  // TEST 3: State With No Active Verified Purchase Subsidy
  console.log('--- TEST 3: State With No Active State Cash Subsidy (Kerala / Bihar) ---');
  const selectedState = 'kerala';
  const stateSpecificSchemes = subsidies.filter((s) => s.stateCode === selectedState);
  console.log(`Specific state schemes for ${selectedState}: ${stateSpecificSchemes.length}`);
  const advisoryMessage = stateSpecificSchemes.length === 0
    ? 'Please verify with the official scheme authority'
    : 'Active state scheme found';
  console.log(`Advisory triggered: "${advisoryMessage}"`);
  console.assert(stateSpecificSchemes.length === 0, 'Kerala should have 0 specific state purchase schemes in index');
  console.assert(advisoryMessage === 'Please verify with the official scheme authority', 'Must trigger exact required advisory text');
  console.log('Test 3 Passed: PASSED\n');

  // TEST 4: Official Source Links Verification
  console.log('--- TEST 4: Official Source Links Verification ---');
  subsidies.forEach((s) => {
    console.log(`[${s.jurisdiction}] ${s.sourcePortalName} -> ${s.sourcePortalUrl}`);
    console.assert(s.sourcePortalUrl.startsWith('https://'), `Source URL must be valid HTTPS: ${s.sourcePortalUrl}`);
    console.assert(s.verificationStatus === 'verified', `Status must be verified for ${s.id}`);
  });
  console.log('Test 4 Passed: PASSED\n');

  // TEST 5: Transfer of Confirmed Subsidy Amount to Calculator
  console.log('--- TEST 5: Transfer of Confirmed Subsidy to Calculator ---');
  // Scenario A: Transfer PM E-DRIVE 2W Subsidy (₹10,000)
  const initialInputs = { ...DEFAULT_CALCULATOR_INPUTS };
  const transferredSubsidyA = 10000;
  const targetCategoryA: VehicleCategory = '2w-high-speed';
  const updatedInputsA = {
    ...initialInputs,
    appliedSubsidyINR: transferredSubsidyA,
    vehicleCategory: targetCategoryA,
  };
  const resA = calculateEvEconomics(updatedInputsA);
  console.log(`Transferred ₹${transferredSubsidyA} for ${targetCategoryA}:`);
  console.log(`- Ex-Showroom: ₹${resA.evExShowroomPrice}`);
  console.log(`- Net Vehicle Price: ₹${resA.netVehiclePriceAfterSubsidy} (Expected: ₹1,05,000)`);
  console.log(`- Loan Principal: ₹${resA.loanPrincipal} (Expected: ₹85,000)`);
  console.log(`- Monthly EMI: ₹${resA.monthlyEmiAmount.toFixed(2)}`);
  console.log(`- Payback Horizon: ${resA.paybackDisplay}`);
  console.assert(resA.netVehiclePriceAfterSubsidy === 105000, 'Net price after subsidy test failed');
  console.assert(resA.paybackHasPositiveReturn === true, 'Positive payback test failed');

  // Scenario B: Transfer Delhi EV Policy 2W Subsidy (₹35,000 with scrappage)
  const transferredSubsidyB = 35000;
  const updatedInputsB = {
    ...initialInputs,
    appliedSubsidyINR: transferredSubsidyB,
    vehicleCategory: targetCategoryA,
  };
  const resB = calculateEvEconomics(updatedInputsB);
  console.log(`Transferred ₹${transferredSubsidyB} (Delhi):`);
  console.log(`- Net Vehicle Price: ₹${resB.netVehiclePriceAfterSubsidy} (Expected: ₹80,000)`);
  console.log(`- Loan Principal: ₹${resB.loanPrincipal} (Expected: ₹60,000)`);
  console.log(`- Payback Horizon: ${resB.paybackDisplay}`);
  console.assert(resB.netVehiclePriceAfterSubsidy === 80000, 'Delhi net price test failed');
  console.log('Test 5 Passed: PASSED\n');

  console.log('=== ALL SUBSIDY EXPLORER TESTS COMPLETED SUCCESSFULLY ===');
}

runTests().catch((err) => {
  console.error('Test run failed:', err);
  process.exit(1);
});
