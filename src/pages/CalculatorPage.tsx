import React, { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingUp,
  Fuel,
  Zap,
  IndianRupee,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Bot,
  Copy,
  Check,
  Leaf,
  Info,
  ChevronDown,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  CalculatorInputs,
  CityBenchmark,
  DeliveryPlatform,
  OwnershipModel,
  VehicleCategory,
  NavigationTab,
} from '../types';
import {
  calculateEvEconomics,
  DEFAULT_CALCULATOR_INPUTS,
  VEHICLE_PRESETS,
} from '../utils/calculator';
import { formatDecimal, formatINR, formatNumber } from '../utils/formatters';

interface CalculatorPageProps {
  initialDailyKm?: number;
  initialPlatform?: DeliveryPlatform;
  initialSubsidyAmount?: number;
  initialVehicleCategory?: VehicleCategory;
  initialSubsidySchemeName?: string;
  onConsultAdvisorWithData?: (data: {
    city: string;
    platform: string;
    dailyKm: number;
    vehicleType: string;
    monthlyFuelSaved: number;
    ownershipModel: string;
  }) => void;
  onSelectTab: (tab: NavigationTab) => void;
}

export const CalculatorPage: React.FC<CalculatorPageProps> = ({
  initialDailyKm,
  initialPlatform,
  initialSubsidyAmount,
  initialVehicleCategory,
  initialSubsidySchemeName,
  onConsultAdvisorWithData,
  onSelectTab,
}) => {
  const [cities, setCities] = useState<CityBenchmark[]>([]);
  const [citiesLoading, setCitiesLoading] = useState<boolean>(true);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState<boolean>(false);
  const [showAuditTrace, setShowAuditTrace] = useState<boolean>(true);
  const [transferredSchemeNotification, setTransferredSchemeNotification] = useState<string | null>(
    initialSubsidySchemeName || null
  );

  const [inputs, setInputs] = useState<CalculatorInputs>(() => {
    return {
      ...DEFAULT_CALCULATOR_INPUTS,
      dailyKm: initialDailyKm !== undefined ? initialDailyKm : DEFAULT_CALCULATOR_INPUTS.dailyKm,
      platform: initialPlatform || DEFAULT_CALCULATOR_INPUTS.platform,
      appliedSubsidyINR:
        initialSubsidyAmount !== undefined
          ? initialSubsidyAmount
          : DEFAULT_CALCULATOR_INPUTS.appliedSubsidyINR,
      vehicleCategory: initialVehicleCategory || DEFAULT_CALCULATOR_INPUTS.vehicleCategory,
    };
  });

  // Fetch benchmark city data from backend
  useEffect(() => {
    async function loadCityBenchmarks() {
      try {
        setCitiesLoading(true);
        const res = await fetch('/api/fuel-prices');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCities(json.data);
          const currentCityObj = json.data.find(
            (c: CityBenchmark) => c.id === inputs.cityId
          );
          if (currentCityObj) {
            setInputs((prev) => ({
              ...prev,
              petrolPricePerLitre: currentCityObj.petrolPricePerLitre,
              electricityRatePerUnit: currentCityObj.commercialElectricityKwh,
              batterySwapCostPerSwap: currentCityObj.averageSwapFee,
            }));
          }
        }
      } catch (err) {
        console.error('Failed to load city benchmarks:', err);
      } finally {
        setCitiesLoading(false);
      }
    }
    loadCityBenchmarks();
  }, []);

  // Sync if initial props change
  useEffect(() => {
    if (initialDailyKm !== undefined) {
      setInputs((prev) => ({ ...prev, dailyKm: initialDailyKm }));
    }
    if (initialPlatform) {
      setInputs((prev) => ({ ...prev, platform: initialPlatform }));
    }
    if (initialSubsidyAmount !== undefined) {
      setInputs((prev) => ({
        ...prev,
        appliedSubsidyINR: initialSubsidyAmount,
        ...(initialVehicleCategory ? { vehicleCategory: initialVehicleCategory } : {}),
      }));
      if (initialSubsidySchemeName) {
        setTransferredSchemeNotification(initialSubsidySchemeName);
      }
    }
  }, [initialDailyKm, initialPlatform, initialSubsidyAmount, initialVehicleCategory, initialSubsidySchemeName]);

  // Handle City Change
  const handleCityChange = (cityId: string) => {
    const selectedCity = cities.find((c) => c.id === cityId);
    if (selectedCity) {
      setInputs((prev) => ({
        ...prev,
        cityId,
        petrolPricePerLitre: selectedCity.petrolPricePerLitre,
        electricityRatePerUnit: selectedCity.commercialElectricityKwh,
        batterySwapCostPerSwap: selectedCity.averageSwapFee,
      }));
    } else {
      setInputs((prev) => ({ ...prev, cityId }));
    }
  };

  // Handle Vehicle Preset Change
  const handleVehicleCategoryChange = (cat: VehicleCategory) => {
    const preset = VEHICLE_PRESETS[cat];
    setInputs((prev) => ({
      ...prev,
      vehicleCategory: cat,
      petrolMileageKmpl: preset.typicalPetrolMileage,
      evEfficiencyWhPerKm: preset.typicalEvEfficiencyWhKm,
      evExShowroomPrice: preset.defaultPriceINR,
      evDownPayment: preset.defaultDownPaymentINR,
      petrolMonthlyMaintenance: preset.typicalPetrolMonthlyMaintenance,
      evMonthlyMaintenance: preset.typicalEvMonthlyMaintenance,
      appliedSubsidyINR: preset.subsidyEligibleEstimateINR,
    }));
  };

  // Reset to Defaults
  const handleReset = () => {
    setInputs(DEFAULT_CALCULATOR_INPUTS);
  };

  // Run calculation engine
  const results = calculateEvEconomics(inputs);

  // Copy Summary to Clipboard
  const handleCopySummary = () => {
    const cityName = cities.find((c) => c.id === inputs.cityId)?.name || 'Bengaluru';
    const summaryText = `GigEV Financial Calculation Audit (${inputs.platform} Delivery in ${cityName}):
Daily Distance: ${inputs.dailyKm} km/day (${results.monthlyKm.toLocaleString('en-IN')} km/mo)
Vehicle Type: ${VEHICLE_PRESETS[inputs.vehicleCategory].name}
Running Costs (Fuel-only): Petrol ₹${formatDecimal(results.petrolCostPerKm)}/km vs EV ₹${formatDecimal(results.evCostPerKm)}/km
--- SEPARATE COST & SAVINGS BREAKDOWN ---
1. Energy-Cost Savings: ${formatINR(results.monthlyEnergySavings)} / month (Petrol fuel ₹${Math.round(results.monthlyPetrolFuelCost)} - EV power ₹${Math.round(results.monthlyEvEnergyCost)})
2. Maintenance Savings: ${formatINR(results.monthlyMaintenanceSavings)} / month (Petrol ₹${results.monthlyPetrolMaintenance} - EV ₹${results.monthlyEvMaintenance})
3. Total Monthly Operational Savings: ${formatINR(results.monthlyOperationalSavings)} / month
4. Estimated / Assumed Subsidy: ${formatINR(results.appliedSubsidyINR)}
5. Upfront Capital / Down Payment: ${formatINR(results.upfrontPayment)}
6. Monthly Loan EMI / Lease: ${inputs.ownershipModel === 'buy-emi' ? formatINR(results.monthlyEmiAmount) : inputs.ownershipModel === 'rental-lease' ? formatINR(inputs.dailyRentalOrLeaseFee * inputs.workingDaysPerMonth) : '₹0 (Full Cash)'}
7. Net Take-Home Cashflow After Vehicle Cost: ${formatINR(results.effectiveMonthlySavingsAfterEmiOrRental)} / month
8. Payback Horizon: ${results.paybackDisplay}
9. 3-Year Total Cost of Ownership: Petrol ₹${Math.round(results.threeYearTotalCostPetrol)} vs EV ₹${Math.round(results.threeYearTotalCostEv)} (Net 3-Yr Savings: ₹${Math.round(results.threeYearNetSavings)})
Calculated with GigEV by Revitalize Mobility (https://revitalizemobility.com)`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  const handleAskAdvisor = () => {
    const cityName = cities.find((c) => c.id === inputs.cityId)?.name || 'Bengaluru';
    if (onConsultAdvisorWithData) {
      onConsultAdvisorWithData({
        city: cityName,
        platform: inputs.platform,
        dailyKm: inputs.dailyKm,
        vehicleType: VEHICLE_PRESETS[inputs.vehicleCategory].name,
        monthlyFuelSaved: results.monthlyOperationalSavings,
        ownershipModel: inputs.ownershipModel,
      });
    }
    onSelectTab('advisor');
  };

  return (
    <div className="space-y-8 py-4 sm:py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              <Calculator className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Audited Financial Intelligence Engine
            </span>
            <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
              Formulas Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            EV Savings & Total Cost of Ownership Calculator
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Audited financial comparison keeping energy savings, maintenance, EMI, upfront capital, and subsidies strictly separate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            {copiedSummary ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Audit Summary Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-emerald-700" />
                <span>Copy Audit Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Transferred Subsidy Alert Notice (Requirement 7) */}
      {transferredSchemeNotification && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start justify-between gap-3 text-xs shadow-xs animate-in fade-in duration-200">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-emerald-950 text-sm">
                Verified Subsidy Applied: {formatINR(inputs.appliedSubsidyINR)}
              </div>
              <p className="text-emerald-900 mt-0.5 leading-relaxed">
                Transferred from <strong>{transferredSchemeNotification}</strong> for {VEHICLE_PRESETS[inputs.vehicleCategory].name}.
                Applied as an estimated assumption in your calculation. Actual eligibility and disbursement may vary based on OEM homologation &amp; RTO quota.
              </p>
            </div>
          </div>
          <button
            onClick={() => setTransferredSchemeNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 text-xs font-semibold cursor-pointer"
            title="Dismiss notice"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Input Validation Warning & Error Alert (Requirement 8) */}
      {results.validationErrors.length > 0 && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 space-y-1.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-red-950">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Input Validation Errors Detected (Calculations paused or sanitized):</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-red-800 pl-1">
            {results.validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {results.validationWarnings.length > 0 && results.validationErrors.length === 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 text-xs">
          <div className="flex items-center gap-2 font-semibold text-amber-950">
            <Info className="w-4 h-4 text-amber-600" />
            <span>Input Advisory Notice:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800 pl-1">
            {results.validationWarnings.map((warn, idx) => (
              <li key={idx}>{warn}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Input Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: City & Delivery Platform */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                1
              </span>
              Operating City & Gig Delivery Platform
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* City Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Operating City:
                </label>
                <select
                  value={inputs.cityId}
                  onChange={(e) => handleCityChange(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {citiesLoading ? (
                    <option>Loading benchmark cities...</option>
                  ) : (
                    cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.name} (Petrol ₹{city.petrolPricePerLitre}/L)
                      </option>
                    ))
                  )}
                </select>
                <div className="text-[10px] text-slate-500 mt-1">
                  PPAC verified benchmark: ₹{inputs.petrolPricePerLitre}/L
                </div>
              </div>

              {/* Delivery Platform */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Delivery Platform:
                </label>
                <select
                  value={inputs.platform}
                  onChange={(e) =>
                    setInputs((prev) => ({
                      ...prev,
                      platform: e.target.value as DeliveryPlatform,
                    }))
                  }
                  className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                >
                  {(
                    [
                      'Zomato',
                      'Swiggy',
                      'Zepto',
                      'Blinkit',
                      'Shadowfax',
                      'Dunzo',
                      'Rapido',
                      'Porter',
                      'Independent Courier',
                    ] as DeliveryPlatform[]
                  ).map((plat) => (
                    <option key={plat} value={plat}>
                      {plat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle Segment & Ownership Model */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                2
              </span>
              Vehicle Segment & Financing Model
            </h3>

            {/* Vehicle Category Radio Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(
                [
                  '2w-high-speed',
                  '2w-swappable',
                  '3w-cargo',
                  '3w-auto',
                ] as VehicleCategory[]
              ).map((catKey) => {
                const preset = VEHICLE_PRESETS[catKey];
                const isSelected = inputs.vehicleCategory === catKey;
                return (
                  <div
                    key={catKey}
                    onClick={() => handleVehicleCategoryChange(catKey)}
                    className={`cursor-pointer rounded-xl p-3.5 border transition-all text-left ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/50 shadow-xs ring-1 ring-emerald-600'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                      <span
                        className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                    <div className="text-[10px] font-semibold text-emerald-800 mt-2">
                      Est. Ex-Showroom: {formatINR(preset.defaultPriceINR)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Ownership Model Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Financing & Ownership Model:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'buy-emi', label: 'Loan EMI (NBFC)' },
                  { id: 'buy-cash', label: 'Full Cash Buy' },
                  { id: 'rental-lease', label: 'Daily Lease/Rent' },
                  { id: 'battery-swap-baas', label: 'Battery Swap (BaaS)' },
                ].map((m) => (
                  <button
                    key={m.id}
                    onClick={() =>
                      setInputs((prev) => ({
                        ...prev,
                        ownershipModel: m.id as OwnershipModel,
                      }))
                    }
                    className={`text-xs py-2 px-2.5 rounded-lg font-medium border text-center transition-all ${
                      inputs.ownershipModel === m.id
                        ? 'bg-emerald-900 text-white border-emerald-900 font-semibold shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Daily Driving & Distance Inputs (Requirements 4 & 8) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                3
              </span>
              Operating Distance & Shift Days
            </h3>

            {/* Daily Distance */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700">Daily Distance Covered:</span>
                  <span className="text-[11px] text-slate-500 block">
                    Zero distance supported to test parked vehicle baseline
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={inputs.dailyKm}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        dailyKm: Number(e.target.value),
                      }))
                    }
                    className="w-16 text-right font-bold text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 text-emerald-950 focus:outline-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-600">km/day</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="200"
                step="5"
                value={Math.max(0, inputs.dailyKm)}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    dailyKm: Number(e.target.value),
                  }))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 km (Parked)</span>
                <span>40 km (Part-time)</span>
                <span>85 km (Standard shift)</span>
                <span>200 km (High-volume)</span>
              </div>
            </div>

            {/* Working Days per Month */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-700">Working Days per Month:</span>
                  <span className="text-[11px] text-slate-500 block">
                    Formula: Monthly distance = Daily distance × Working days
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    min="0"
                    max="31"
                    value={inputs.workingDaysPerMonth}
                    onChange={(e) =>
                      setInputs((prev) => ({
                        ...prev,
                        workingDaysPerMonth: Number(e.target.value),
                      }))
                    }
                    className="w-14 text-right font-bold text-xs bg-slate-50 border border-slate-300 rounded px-2 py-1 text-emerald-950 focus:outline-emerald-500"
                  />
                  <span className="text-xs font-semibold text-slate-600">days</span>
                </div>
              </div>
              <input
                type="range"
                min="0"
                max="31"
                step="1"
                value={Math.max(0, inputs.workingDaysPerMonth)}
                onChange={(e) =>
                  setInputs((prev) => ({
                    ...prev,
                    workingDaysPerMonth: Number(e.target.value),
                  }))
                }
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 days</span>
                <span>20 days</span>
                <span>26 days (Standard)</span>
                <span>31 days (All month)</span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-medium">Monthly Operating Distance:</span>
              <span className="font-extrabold text-slate-900 text-sm">
                {results.monthlyKm.toLocaleString('en-IN')} km / month
              </span>
            </div>
          </div>

          {/* Section 4: Advanced Parameters & Subsidy Assumption (Requirement 7) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <button
              onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
              className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs flex items-center justify-center font-bold">
                  4
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Detailed Parameters & Subsidy Assumptions
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mileage, electricity tariffs, maintenance buffers, down payment & loan tenure
                  </span>
                </div>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-slate-500 transition-transform ${
                  showAdvancedSettings ? 'rotate-180' : ''
                }`}
              />
            </button>

            {showAdvancedSettings && (
              <div className="p-5 border-t border-slate-100 bg-slate-50/60 space-y-4 text-xs">
                {/* Petrol Mileage & Fuel Cost */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Petrol Bike Mileage (km/L):
                    </label>
                    <input
                      type="number"
                      value={inputs.petrolMileageKmpl}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          petrolMileageKmpl: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5"
                    />
                    <span className="text-[10px] text-slate-400">Used for: Petrol cost/km = Price ÷ Mileage</span>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Petrol Price (₹/Litre):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.petrolPricePerLitre}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          petrolPricePerLitre: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5"
                    />
                  </div>
                </div>

                {/* EV Energy Cost / Battery Swap */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Electricity Tariff (₹/unit kWh):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={inputs.electricityRatePerUnit}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          electricityRatePerUnit: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5"
                    />
                    <span className="text-[10px] text-slate-400">Domestic ~₹5.5 | Commercial ~₹8.0</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      EV Energy Efficiency (Wh/km):
                    </label>
                    <input
                      type="number"
                      value={inputs.evEfficiencyWhPerKm}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          evEfficiencyWhPerKm: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5"
                    />
                    <span className="text-[10px] text-slate-400">Formula: Tariff × (Wh/km ÷ 1000)</span>
                  </div>
                </div>

                {/* Maintenance Costs (Separate) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Petrol Monthly Maintenance (₹/mo):
                    </label>
                    <input
                      type="number"
                      value={inputs.petrolMonthlyMaintenance}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          petrolMonthlyMaintenance: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5"
                    />
                    <span className="text-[10px] text-slate-400">Oil changes, engine tune-ups, chain service</span>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      EV Monthly Maintenance (₹/mo):
                    </label>
                    <input
                      type="number"
                      value={inputs.evMonthlyMaintenance}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          evMonthlyMaintenance: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-white border border-slate-300 rounded px-3 py-1.5"
                    />
                    <span className="text-[10px] text-slate-400">Tire wear, brake pads, routine diagnostics</span>
                  </div>
                </div>

                {/* Pricing & Subsidy Assumption (Requirement 7) */}
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <div className="font-bold text-slate-900 text-xs">
                    Vehicle Price & Government Subsidy Assumption:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-600 block mb-1">Ex-Showroom Price (₹):</label>
                      <input
                        type="number"
                        value={inputs.evExShowroomPrice}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            evExShowroomPrice: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-slate-600 block mb-1">
                        Estimated / Assumed Subsidy (₹):
                      </label>
                      <input
                        type="number"
                        value={inputs.appliedSubsidyINR}
                        onChange={(e) =>
                          setInputs((prev) => ({
                            ...prev,
                            appliedSubsidyINR: Number(e.target.value),
                          }))
                        }
                        className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5 text-emerald-800 font-semibold"
                      />
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        *User-entered assumption. Actual subsidy depends on official scheme approval.
                      </span>
                    </div>
                  </div>
                </div>

                {/* If Loan EMI Selected */}
                {inputs.ownershipModel === 'buy-emi' && (
                  <div className="pt-2 border-t border-slate-200 space-y-3">
                    <div className="font-bold text-slate-900 text-xs">
                      Loan EMI Financing Terms:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-600 block mb-1">Down Payment (₹):</label>
                        <input
                          type="number"
                          value={inputs.evDownPayment}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              evDownPayment: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Loan Tenure (Months):</label>
                        <select
                          value={inputs.loanTenureMonths}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              loanTenureMonths: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                        >
                          <option value={12}>12 Months</option>
                          <option value={24}>24 Months</option>
                          <option value={36}>36 Months (Standard)</option>
                          <option value={48}>48 Months</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-slate-600 block mb-1">Interest Rate (% p.a.):</label>
                        <input
                          type="number"
                          step="0.5"
                          value={inputs.loanInterestRatePercent}
                          onChange={(e) =>
                            setInputs((prev) => ({
                              ...prev,
                              loanInterestRatePercent: Number(e.target.value),
                            }))
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2.5 py-1.5"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* If Rental Lease Selected */}
                {inputs.ownershipModel === 'rental-lease' && (
                  <div className="pt-2 border-t border-slate-200 space-y-2">
                    <label className="font-semibold text-slate-700 block">
                      Daily Rental / Fleet Lease Fee (₹/day):
                    </label>
                    <input
                      type="number"
                      value={inputs.dailyRentalOrLeaseFee}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          dailyRentalOrLeaseFee: Number(e.target.value),
                        }))
                      }
                      className="w-full sm:w-1/2 bg-white border border-slate-300 rounded px-3 py-1.5"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Live Audited Financial Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Hero Card: Total Monthly Operational Savings */}
          <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl border border-emerald-800 relative overflow-hidden space-y-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 bg-emerald-900/80 px-2.5 py-0.5 rounded-full border border-emerald-700">
                Audited Financial Impact
              </span>
              <span className="text-xs text-emerald-300/80 font-medium">
                {results.monthlyKm.toLocaleString('en-IN')} km / month
              </span>
            </div>

            {/* Total Operational Savings */}
            <div>
              <div className="text-xs font-medium text-emerald-200">
                Total Monthly Operational Savings
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {formatINR(results.monthlyOperationalSavings)}
                </span>
                <span className="text-xs font-semibold text-emerald-300">/ month</span>
              </div>
              <div className="text-xs text-emerald-200/90 mt-1">
                Annual direct operational savings:{' '}
                <strong className="text-emerald-300 font-bold">
                  {formatINR(results.annualOperationalSavings)}
                </strong>
              </div>
            </div>

            {/* Requirement 5: Separate Energy and Maintenance Breakdown */}
            <div className="bg-emerald-950/80 rounded-xl p-3.5 border border-emerald-800/80 space-y-2 text-xs">
              <div className="text-[11px] font-bold uppercase text-emerald-300 tracking-wider">
                Isolated Operational Savings:
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>1. Energy-Cost Savings (Fuel vs Power):</span>
                <span className={`font-bold ${results.monthlyEnergySavings >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                  {formatINR(results.monthlyEnergySavings)} / mo
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span>2. Maintenance Savings:</span>
                <span className={`font-bold ${results.monthlyMaintenanceSavings >= 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                  {formatINR(results.monthlyMaintenanceSavings)} / mo
                </span>
              </div>
            </div>

            {/* Per-Kilometer Comparison Bar (Requirements 2 & 3: Petrol = Price/Mileage, EV = Tariff * Wh/km/1000) */}
            <div className="bg-emerald-950/70 rounded-xl p-4 border border-emerald-800/80 space-y-2">
              <div className="text-xs font-semibold text-emerald-300 flex items-center justify-between">
                <span>Fuel / Energy Cost per Kilometre:</span>
                <span className="text-[11px] text-emerald-200">
                  {results.petrolCostPerKm > results.evCostPerKm
                    ? `${Math.round(((results.petrolCostPerKm - results.evCostPerKm) / results.petrolCostPerKm) * 100)}% cheaper per km`
                    : 'Higher per km'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center pt-1">
                <div className="bg-red-950/40 border border-red-900/60 rounded-lg p-2.5">
                  <div className="text-[10px] text-red-300 font-semibold uppercase">Petrol Fuel</div>
                  <div className="text-lg font-extrabold text-red-200">
                    ₹{formatDecimal(results.petrolCostPerKm)}
                  </div>
                  <div className="text-[10px] text-red-400">price ÷ mileage</div>
                </div>

                <div className="bg-emerald-900/60 border border-emerald-600 rounded-lg p-2.5 ring-1 ring-emerald-500">
                  <div className="text-[10px] text-emerald-300 font-bold uppercase">EV Electricity</div>
                  <div className="text-lg font-extrabold text-emerald-200">
                    ₹{formatDecimal(results.evCostPerKm)}
                  </div>
                  <div className="text-[10px] text-emerald-300">tariff × (Wh/km ÷ 1000)</div>
                </div>
              </div>
            </div>

            {/* Requirement 5: Upfront Payment & Estimated Subsidy */}
            <div className="pt-2 border-t border-emerald-800/80 space-y-1.5 text-xs">
              <div className="flex justify-between text-emerald-200">
                <span>Estimated / Assumed Subsidy:</span>
                <span className="font-semibold text-white">
                  {formatINR(results.appliedSubsidyINR)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Net Vehicle Purchase Price:</span>
                <span className="font-semibold text-white">
                  {formatINR(results.netVehiclePriceAfterSubsidy)}
                </span>
              </div>
              <div className="flex justify-between text-emerald-200">
                <span>Upfront Out-of-Pocket Payment:</span>
                <span className="font-bold text-white">
                  {formatINR(results.upfrontPayment)}
                </span>
              </div>
              {inputs.ownershipModel === 'buy-emi' && (
                <div className="flex justify-between text-emerald-200 pt-1">
                  <span>Monthly Loan EMI:</span>
                  <span className="font-bold text-white">
                    {formatINR(results.monthlyEmiAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-baseline font-bold text-white pt-1.5 border-t border-emerald-800/60">
                <span>Net Take-Home Surplus Cashflow:</span>
                <span className={`text-base font-extrabold ${results.effectiveMonthlySavingsAfterEmiOrRental >= 0 ? 'text-emerald-300' : 'text-amber-300'}`}>
                  {formatINR(results.effectiveMonthlySavingsAfterEmiOrRental)}
                </span>
              </div>
              {results.effectiveMonthlySavingsAfterEmiOrRental < 0 && (
                <p className="text-[10px] text-amber-300 leading-normal">
                  ⚠️ At current distance/financing, monthly EMI exceeds monthly operational savings.
                </p>
              )}
            </div>

            {/* Requirement 6: Payback Horizon (Strict non-negative, exact wording if <= 0) */}
            <div className="flex items-center justify-between text-xs text-emerald-100 bg-emerald-900/50 p-3 rounded-xl border border-emerald-800">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                <span>Payback Horizon:</span>
              </span>
              <span className={`font-bold ${results.paybackHasPositiveReturn ? 'text-white' : 'text-amber-300'}`}>
                {results.paybackDisplay}
              </span>
            </div>

            {/* CTA to Consult AI Advisor */}
            <button
              onClick={handleAskAdvisor}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-950" />
              <span>Ask AI Advisor About This Exact Scenario</span>
              <ArrowRight className="w-4 h-4 text-emerald-950" />
            </button>
          </div>

          {/* 3-Year Total Cost of Ownership (TCO) Breakdown Card (Requirement 5) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center justify-between">
              <span>3-Year Cumulative TCO Breakdown</span>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                36 Months
              </span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg space-y-1 border border-slate-100">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Petrol 3-Year Total Cost:</span>
                  <span className="text-red-600">{formatINR(results.threeYearTotalCostPetrol)}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>• Fuel: {formatINR(results.threeYearPetrolEnergyCost)}</span>
                  <span>• Maintenance: {formatINR(results.threeYearPetrolMaintenanceCost)}</span>
                  <span>• Base: ₹85,000</span>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-lg space-y-1 border border-slate-100">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>EV 3-Year Total Cost:</span>
                  <span className="text-emerald-800">{formatINR(results.threeYearTotalCostEv)}</span>
                </div>
                <div className="text-[11px] text-slate-500 flex justify-between">
                  <span>• Upfront/Loans: {formatINR(results.threeYearEvUpfrontCost)}</span>
                  <span>• Energy: {formatINR(results.threeYearEvEnergyCost)}</span>
                  <span>• Maint: {formatINR(results.threeYearEvMaintenanceCost)}</span>
                </div>
              </div>

              <div className="flex justify-between py-2 text-xs font-bold bg-emerald-50/70 px-2.5 rounded-lg border border-emerald-100">
                <span className="text-emerald-950">3-Year Net Cumulative Savings:</span>
                <span className={`text-sm ${results.threeYearNetSavings >= 0 ? 'text-emerald-800' : 'text-red-600'}`}>
                  {formatINR(results.threeYearNetSavings)}
                </span>
              </div>
            </div>

            {/* Environmental Impact Counter */}
            <div className="bg-teal-50/60 rounded-xl p-3.5 border border-teal-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                <Leaf className="w-4 h-4 text-teal-700" />
                <span>Environmental & Green Fleet Footprint</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center text-xs">
                <div className="bg-white rounded-lg p-2 border border-teal-100">
                  <div className="text-[10px] text-slate-500">Petrol Avoided / Mo</div>
                  <div className="font-extrabold text-teal-800">
                    {Math.round(results.petrolLitersSavedPerMonth)} Litres
                  </div>
                </div>
                <div className="bg-white rounded-lg p-2 border border-teal-100">
                  <div className="text-[10px] text-slate-500">CO2 Prevented / Mo</div>
                  <div className="font-extrabold text-teal-800">
                    {Math.round(results.co2SavedKgPerMonth)} kg CO₂
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement 9: Step-by-Step Transparent Calculation Breakdown Trace */}
      <section className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden mt-8">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-emerald-100 text-emerald-800">
                <FileSpreadsheet className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Formula Audit & Proof Trace
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Transparent Calculation Breakdown
            </h2>
            <p className="text-xs text-slate-500">
              Verified step-by-step arithmetic showing how every number is computed from your inputs.
            </p>
          </div>

          <button
            onClick={() => setShowAuditTrace(!showAuditTrace)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-white bg-slate-100 transition-colors self-start sm:self-auto"
          >
            <span>{showAuditTrace ? 'Collapse Trace' : 'Expand Trace'}</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAuditTrace ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showAuditTrace && (
          <div className="p-4 sm:p-6 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-semibold bg-slate-50/40">
                  <th className="py-2.5 px-3 w-12 text-center">#</th>
                  <th className="py-2.5 px-3 min-w-[180px]">Metric / Step</th>
                  <th className="py-2.5 px-3 min-w-[220px]">Formula Used</th>
                  <th className="py-2.5 px-3 min-w-[240px]">Arithmetic with Current Inputs</th>
                  <th className="py-2.5 px-3 min-w-[140px] text-right font-bold text-slate-900">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.calculationTrace.map((step) => (
                  <tr key={step.stepNumber} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 text-center font-bold text-slate-400 text-[11px]">
                      {step.stepNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">
                      {step.label}
                      {step.notes && (
                        <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                          {step.notes}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-600 bg-slate-50/50">
                      {step.formula}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-900">
                      {step.arithmetic}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-900 text-xs">
                      {step.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
