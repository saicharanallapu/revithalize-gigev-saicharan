import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShieldCheck,
  BatteryCharging,
  TrendingUp,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Search,
  Filter,
  DollarSign,
  Fuel,
  Leaf,
  Layers,
  Clock,
  Sparkles,
  Plus,
  Trash2,
  Info,
  AlertCircle,
  IndianRupee,
  Calculator,
  RefreshCw,
  FileSpreadsheet,
  X,
  Check,
  HelpCircle,
  ChevronDown,
} from 'lucide-react';
import {
  FleetSummary,
  FleetVehicle,
  FleetComparisonVehicle,
  FleetVehicleCalculation,
  VehicleCategory,
  OwnershipModel,
} from '../types';
import {
  formatINR,
  formatNumber,
  formatDecimal,
} from '../utils/formatters';
import {
  calculateFleetVehicle,
  validateFleetVehicle,
  DEFAULT_FLEET_SAMPLE_VEHICLES,
  VEHICLE_PRESETS,
} from '../utils/calculator';

export const FleetDashboardPage: React.FC = () => {
  // Navigation sub-tab toggle: Multi-Vehicle Comparison (Primary) vs Live Telematics Roster
  const [activeFleetTab, setActiveFleetTab] = useState<'comparison' | 'telematics'>('comparison');

  // --- Multi-Vehicle Fleet Comparison State ---
  const [fleetVehicles, setFleetVehicles] = useState<FleetComparisonVehicle[]>(
    DEFAULT_FLEET_SAMPLE_VEHICLES
  );

  // Add vehicle modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [inspectVehicleCalc, setInspectVehicleCalc] = useState<FleetVehicleCalculation | null>(null);

  // New vehicle form inputs
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<VehicleCategory>('2w-high-speed');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(125000);
  const [formDailyDistance, setFormDailyDistance] = useState<number>(85);
  const [formWorkingDays, setFormWorkingDays] = useState<number>(26);
  const [formElectricityConsumption, setFormElectricityConsumption] = useState<number>(33);
  const [formElectricityTariff, setFormElectricityTariff] = useState<number>(6.8);
  const [formEvMaintenance, setFormEvMaintenance] = useState<number>(220);
  const [formOwnershipModel, setFormOwnershipModel] = useState<OwnershipModel>('buy-emi');
  const [formDownPayment, setFormDownPayment] = useState<number>(25000);
  const [formLoanTenure, setFormLoanTenure] = useState<number>(36);
  const [formLoanInterest, setFormLoanInterest] = useState<number>(13.5);
  const [formDailyLease, setFormDailyLease] = useState<number>(310);
  const [formPetrolPrice, setFormPetrolPrice] = useState<number>(102.86);
  const [formPetrolMileage, setFormPetrolMileage] = useState<number>(46);
  const [formPetrolMaintenance, setFormPetrolMaintenance] = useState<number>(900);

  // Form validation errors
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [formWarnings, setFormWarnings] = useState<string[]>([]);

  // --- Existing Live Telematics Dataset State ---
  const [fleetData, setFleetData] = useState<FleetSummary | null>(null);
  const [telematicsLoading, setTelematicsLoading] = useState<boolean>(true);
  const [telematicsError, setTelematicsError] = useState<string | null>(null);

  // Filters for vehicle roster
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Interactive Fleet Expansion Simulator
  const [simFleetSize, setSimFleetSize] = useState<number>(15);
  const [simDailyLeaseRate, setSimDailyLeaseRate] = useState<number>(320);
  const [simMonthlyWorkingDays, setSimMonthlyWorkingDays] = useState<number>(26);

  useEffect(() => {
    async function loadFleet() {
      try {
        setTelematicsLoading(true);
        const res = await fetch('/api/fleet/demo');
        const json = await res.json();
        if (json.success && json.data) {
          setFleetData(json.data);
        } else {
          setTelematicsError('Failed to fetch fleet simulation data.');
        }
      } catch (err: any) {
        setTelematicsError(err.message || 'Network error');
      } finally {
        setTelematicsLoading(false);
      }
    }
    loadFleet();
  }, []);

  // Quick preset loader in modal
  const handleApplyPreset = (cat: VehicleCategory) => {
    const preset = VEHICLE_PRESETS[cat];
    setFormCategory(cat);
    setFormPurchasePrice(preset.defaultPriceINR);
    setFormDownPayment(preset.defaultDownPaymentINR);
    setFormElectricityConsumption(preset.typicalEvEfficiencyWhKm);
    setFormEvMaintenance(preset.typicalEvMonthlyMaintenance);
    setFormPetrolMileage(preset.typicalPetrolMileage);
    setFormPetrolMaintenance(preset.typicalPetrolMonthlyMaintenance);
  };

  // Open modal with fresh state
  const handleOpenAddModal = () => {
    setFormName('');
    handleApplyPreset('2w-high-speed');
    setFormErrors([]);
    setFormWarnings([]);
    setIsAddModalOpen(true);
  };

  // Add vehicle to comparison with validation
  const handleSaveVehicle = () => {
    const candidateVehicle: FleetComparisonVehicle = {
      id: `custom-fleet-${Date.now()}`,
      name: formName.trim() || 'Custom Fleet EV',
      vehicleCategory: formCategory,
      purchasePriceINR: Number(formPurchasePrice),
      dailyDistanceKm: Number(formDailyDistance),
      workingDaysPerMonth: Number(formWorkingDays),
      electricityConsumptionWhKm: Number(formElectricityConsumption),
      electricityTariffINR: Number(formElectricityTariff),
      evMonthlyMaintenanceINR: Number(formEvMaintenance),
      ownershipModel: formOwnershipModel,
      downPaymentINR: Number(formDownPayment),
      loanTenureMonths: Number(formLoanTenure),
      loanInterestRatePercent: Number(formLoanInterest),
      dailyLeaseFeeINR: Number(formDailyLease),
      petrolPricePerLitre: Number(formPetrolPrice),
      petrolMileageKmpl: Number(formPetrolMileage),
      petrolMonthlyMaintenanceINR: Number(formPetrolMaintenance),
      isSampleExample: false,
    };

    const validation = validateFleetVehicle(candidateVehicle);
    if (!validation.isValid) {
      setFormErrors(validation.errors);
      setFormWarnings(validation.warnings);
      return;
    }

    setFleetVehicles((prev) => [...prev, candidateVehicle]);
    setIsAddModalOpen(false);
  };

  // Remove vehicle
  const handleRemoveVehicle = (id: string) => {
    setFleetVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  // Reset to sample vehicles
  const handleResetToSamples = () => {
    setFleetVehicles(DEFAULT_FLEET_SAMPLE_VEHICLES);
  };

  // Calculate economics for all fleet vehicles using verified calculator formulas
  const calculatedVehicles: FleetVehicleCalculation[] = fleetVehicles.map((v) =>
    calculateFleetVehicle(v)
  );

  // Summary Metrics across fleet (Feature 6)
  const totalFleetVehicles = calculatedVehicles.length;
  const totalFleetMonthlyDistanceKm = calculatedVehicles.reduce(
    (sum, c) => sum + c.monthlyDistanceKm,
    0
  );
  const totalFleetMonthlyElectricityCost = calculatedVehicles.reduce(
    (sum, c) => sum + c.monthlyElectricityCostINR,
    0
  );
  const totalFleetMonthlyOperatingCost = calculatedVehicles.reduce(
    (sum, c) => sum + c.monthlyOperatingCostINR,
    0
  );
  const totalFleetMonthlyFinancingCost = calculatedVehicles.reduce(
    (sum, c) => sum + c.monthlyFinancingCostINR,
    0
  );
  const totalFleetMonthlyOperatingSavings = calculatedVehicles.reduce(
    (sum, c) => sum + c.monthlyOperatingSavingsINR,
    0
  );
  const totalFleetMonthlyNetSavings = calculatedVehicles.reduce(
    (sum, c) => sum + c.netMonthlySavingsINR,
    0
  );
  const totalFleetAnnualOperatingSavings = totalFleetMonthlyOperatingSavings * 12;
  const totalFleetPurchasePrice = calculatedVehicles.reduce(
    (sum, c) => sum + c.vehicle.purchasePriceINR,
    0
  );
  const totalFleetUpfrontCapital = calculatedVehicles.reduce(
    (sum, c) => sum + c.upfrontCapitalRequiredINR,
    0
  );

  // Telematics calculations
  const simGrossMonthlyRevenue = simFleetSize * simDailyLeaseRate * simMonthlyWorkingDays;
  const simMonthlyElectricityCost = simFleetSize * 45 * simMonthlyWorkingDays;
  const simMonthlyMaintenanceBuffer = simFleetSize * 300;
  const simNetMonthlyHubProfit =
    simGrossMonthlyRevenue - simMonthlyElectricityCost - simMonthlyMaintenanceBuffer;

  const rawTelematicsVehicles = fleetData?.vehicles || [];
  const filteredTelematicsVehicles = rawTelematicsVehicles.filter((v) => {
    const matchPlatform =
      platformFilter === 'all' || v.platform.toLowerCase() === platformFilter.toLowerCase();
    const matchStatus =
      statusFilter === 'all' || v.status.toLowerCase() === statusFilter.toLowerCase();
    const matchSearch =
      searchQuery === '' ||
      v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.driverName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());

    return matchPlatform && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-8 py-4 sm:py-8">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <LayoutDashboard className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Fleet Intelligence &amp; Multi-Vehicle Comparison
          </span>
          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
            TCO Modeling Engine
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          Electric Vehicle Fleet Financial Intelligence Platform
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Add, configure, and compare multiple commercial electric vehicles side by side. Model total fleet operating costs, monthly fuel displacement savings, financing costs, and combined capital requirements using verified economic formulas.
        </p>
      </div>

      {/* Main Tab Toggle: Comparison Tool vs Live Telematics Roster */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveFleetTab('comparison')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeFleetTab === 'comparison'
              ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
          <span>Fleet Vehicle Comparison &amp; Modeling</span>
          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full">
            {fleetVehicles.length}
          </span>
        </button>

        <button
          onClick={() => setActiveFleetTab('telematics')}
          className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeFleetTab === 'telematics'
              ? 'border-emerald-700 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <BatteryCharging className="w-4 h-4 text-emerald-700" />
          <span>Live Hub Telematics &amp; Driver Roster</span>
          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded-full">
            Demo
          </span>
        </button>
      </div>

      {/* TAB 1: FLEET VEHICLE COMPARISON & MODELING */}
      {activeFleetTab === 'comparison' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Requirement 7: Assumptions Banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs leading-relaxed space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
              <Info className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Modeling Assumptions &amp; Verified Calculation Standard</span>
            </div>
            <p>
              Calculations for each vehicle are executed through GigEV&apos;s verified economic engine:
              <strong> Monthly Distance</strong> = Daily km × Working Days/mo;
              <strong> EV Cost/km</strong> = Electricity Tariff × (Wh/km ÷ 1000);
              <strong> Operating Cost</strong> = Monthly Electricity + EV Maintenance;
              <strong> Baseline Petrol Cost</strong> = (Monthly km × (Petrol Price ÷ Mileage)) + Petrol Maintenance;
              <strong> Monthly Savings</strong> = Baseline Petrol Operating Cost − EV Operating Cost.
              Financing costs reflect reducing-balance EMI schedules. Sample vehicles are illustrative industry benchmarks; actual commercial quotes must be verified with respective OEMs and financiers.
            </p>
          </div>

          {/* Requirement 6: Combined Fleet Summary KPI Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-700" />
                Total Fleet Economics Summary
              </span>
              <span className="text-xs text-slate-500">
                Combined figures for {totalFleetVehicles} vehicle{totalFleetVehicles !== 1 ? 's' : ''} in comparison
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Fleet Size</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {totalFleetVehicles}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                  Vehicles Modeled
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Monthly Fleet Run</div>
                <div className="text-2xl font-extrabold text-emerald-900 mt-1">
                  {formatNumber(totalFleetMonthlyDistanceKm)} km
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  ~{(totalFleetMonthlyDistanceKm * 12 / 1000).toFixed(0)}k km/year
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Fleet Operating Cost</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {formatINR(totalFleetMonthlyOperatingCost)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Energy: {formatINR(totalFleetMonthlyElectricityCost)}/mo
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Monthly Financing</div>
                <div className="text-2xl font-extrabold text-amber-900 mt-1">
                  {formatINR(totalFleetMonthlyFinancingCost)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Combined Monthly EMI
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Estimated Monthly Savings</div>
                <div className="text-2xl font-black text-emerald-800 mt-1">
                  {formatINR(totalFleetMonthlyOperatingSavings)}
                </div>
                <div className="text-[10px] text-emerald-700 font-bold mt-1">
                  vs Petrol Baseline
                </div>
              </div>

              <div className="bg-emerald-950 text-white rounded-xl p-4 border border-emerald-800 shadow-md">
                <div className="text-[11px] text-emerald-300 font-medium">Estimated Annual Savings</div>
                <div className="text-2xl font-black text-white mt-1">
                  {formatINR(totalFleetAnnualOperatingSavings)}
                </div>
                <div className="text-[10px] text-emerald-300 font-semibold mt-1">
                  Net Cashflow: {formatINR(totalFleetMonthlyNetSavings)}/mo
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar: Add Vehicle, Reset Samples, Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Multi-Vehicle Fleet Comparison Table
              </h2>
              <p className="text-xs text-slate-500">
                Compare operating costs, monthly energy expenses, and estimated savings across segments
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={handleResetToSamples}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                title="Restore default illustrative vehicle examples"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                <span>Reset to Sample Vehicles</span>
              </button>

              <button
                onClick={handleOpenAddModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Vehicle to Comparison</span>
              </button>
            </div>
          </div>

          {/* Requirement 4: Comparison Table */}
          {calculatedVehicles.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <Layers className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-800">
                  No Vehicles in Fleet Comparison
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Add your commercial delivery vehicles to model operating expenses and savings, or restore the illustrative sample fleet models.
                </p>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleResetToSamples}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Load Sample Vehicles
                </button>
                <button
                  onClick={handleOpenAddModal}
                  className="px-4 py-2 rounded-lg bg-emerald-600 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  Add Custom Vehicle
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    <tr>
                      <th scope="col" className="px-4 py-3.5">
                        Vehicle Name &amp; Segment
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-right">
                        Purchase Price
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-right">
                        Monthly Run (km)
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-right">
                        Electricity Cost
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-right">
                        Monthly Operating Cost
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-right">
                        Financing Cost
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-right">
                        Estimated Monthly Savings
                      </th>
                      <th scope="col" className="px-4 py-3.5 text-center">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {calculatedVehicles.map((item) => {
                      const v = item.vehicle;
                      return (
                        <tr
                          key={v.id}
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Name & Category */}
                          <td className="px-4 py-3.5 space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-slate-900 text-sm">
                                {v.name}
                              </span>
                              {v.isSampleExample && (
                                <span className="text-[9px] font-semibold bg-amber-50 text-amber-900 border border-amber-200 px-1.5 py-0.2 rounded">
                                  Illustrative Example
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span className="capitalize">
                                {v.vehicleCategory === '2w-high-speed'
                                  ? 'Electric 2W (High-Speed)'
                                  : v.vehicleCategory === '2w-swappable'
                                  ? 'Electric 2W (Battery Swap)'
                                  : v.vehicleCategory === '3w-cargo'
                                  ? 'Electric 3W Cargo Loader'
                                  : 'Electric 3W Passenger Auto'}
                              </span>
                              <span>•</span>
                              <span>
                                {v.dailyDistanceKm} km/day × {v.workingDaysPerMonth} d
                              </span>
                            </div>
                          </td>

                          {/* Purchase Price */}
                          <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                            <div>{formatINR(v.purchasePriceINR)}</div>
                            <div className="text-[10px] text-slate-400">
                              {v.ownershipModel === 'buy-emi'
                                ? `Down: ${formatINR(v.downPaymentINR)}`
                                : v.ownershipModel === 'rental-lease'
                                ? 'Rental/Lease'
                                : 'Full Cash'}
                            </div>
                          </td>

                          {/* Monthly Distance */}
                          <td className="px-4 py-3.5 text-right font-medium text-slate-800">
                            <div>{formatNumber(item.monthlyDistanceKm)} km</div>
                            <div className="text-[10px] text-slate-400">
                              {(item.monthlyDistanceKm * 12).toLocaleString('en-IN')} km/yr
                            </div>
                          </td>

                          {/* Electricity Cost */}
                          <td className="px-4 py-3.5 text-right font-medium text-slate-800">
                            <div>{formatINR(item.monthlyElectricityCostINR)}</div>
                            <div className="text-[10px] text-slate-400">
                              ₹{item.electricityCostPerKm.toFixed(2)}/km ({v.electricityConsumptionWhKm} Wh/km)
                            </div>
                          </td>

                          {/* Monthly Operating Cost (Energy + Maintenance) */}
                          <td className="px-4 py-3.5 text-right font-semibold text-slate-900">
                            <div className="text-slate-900 font-bold">
                              {formatINR(item.monthlyOperatingCostINR)}
                            </div>
                            <div className="text-[10px] text-slate-500">
                              Maint: {formatINR(v.evMonthlyMaintenanceINR)}
                            </div>
                          </td>

                          {/* Financing Cost */}
                          <td className="px-4 py-3.5 text-right font-medium text-amber-900">
                            {v.ownershipModel === 'buy-emi' ? (
                              <>
                                <div className="font-semibold">
                                  {formatINR(item.monthlyFinancingCostINR)}/mo
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {v.loanTenureMonths}m @ {v.loanInterestRatePercent}%
                                </div>
                              </>
                            ) : v.ownershipModel === 'rental-lease' ? (
                              <>
                                <div className="font-semibold">
                                  {formatINR(item.monthlyFinancingCostINR)}/mo
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  Daily Lease
                                </div>
                              </>
                            ) : (
                              <span className="text-slate-400 font-normal">
                                Nil (Cash Paid)
                              </span>
                            )}
                          </td>

                          {/* Estimated Monthly Savings */}
                          <td className="px-4 py-3.5 text-right space-y-0.5">
                            <div className="font-black text-emerald-800 text-sm">
                              {formatINR(item.monthlyOperatingSavingsINR)}
                            </div>
                            <div className="text-[10px] text-emerald-700">
                              Net: {formatINR(item.netMonthlySavingsINR)}/mo after financing
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => setInspectVehicleCalc(item)}
                                className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                title="Inspect mathematical calculation trace"
                              >
                                <Info className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleRemoveVehicle(v.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                title="Remove vehicle from fleet comparison"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Table Footer Totals Bar */}
              <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-600 font-medium">
                  Showing <strong>{calculatedVehicles.length}</strong> vehicles. Combined fleet acquisition value: <strong>{formatINR(totalFleetPurchasePrice)}</strong> (Upfront capital: {formatINR(totalFleetUpfrontCapital)}).
                </div>
                <div className="flex items-center gap-4 text-right">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Combined Monthly Operating:</span>
                    <strong className="text-slate-900 text-xs sm:text-sm">
                      {formatINR(totalFleetMonthlyOperatingCost)} / mo
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Combined Monthly Savings:</span>
                    <strong className="text-emerald-800 text-xs sm:text-sm">
                      {formatINR(totalFleetMonthlyOperatingSavings)} / mo
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Transparent Assumptions & Verified Benchmark Documentation */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4 text-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">
                Transparent Fleet Calculation Reference &amp; Formulas
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-600 leading-relaxed">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <strong className="text-slate-800 block text-[11px] uppercase tracking-wide">
                  1. Monthly Distance Formula
                </strong>
                <p>
                  <code>Monthly Distance (km) = Daily Distance (km) × Working Days per Month</code>.
                  Prevents inflated 365-day extrapolations by honoring active driver shifts (default: 26 days/month).
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <strong className="text-slate-800 block text-[11px] uppercase tracking-wide">
                  2. EV Electricity &amp; Operating Cost
                </strong>
                <p>
                  <code>EV Cost/km = Electricity Tariff (₹/kWh) × (Wh/km ÷ 1000)</code>.
                  Operating Cost = <code>(Monthly km × EV Cost/km) + EV Monthly Maintenance</code>.
                </p>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                <strong className="text-slate-800 block text-[11px] uppercase tracking-wide">
                  3. Savings vs Petrol Baseline
                </strong>
                <p>
                  <code>Baseline Petrol Cost = (Monthly km × (Petrol Price ÷ Mileage)) + Petrol Maintenance</code>.
                  Operating Savings = <code>Baseline Petrol Cost − EV Operating Cost</code>.
                </p>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              * Note: Sample models (Ather 450X, Euler HiLoad EV, Mahindra Treo) are illustrative examples demonstrating typical commercial 2W, 3W cargo, and 3W passenger economics in India. Do not treat specifications or prices as live manufacturer quotes without local dealer verification.
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE TELEMATICS & DRIVER ROSTER (PRESERVED DEMO) */}
      {activeFleetTab === 'telematics' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Demo Data Disclaimer Badge */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                <strong>Simulated Hub:</strong>{' '}
                {fleetData?.metadata.cityHub || 'Bengaluru Koramangala Hub (BLR-KOR-04)'}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Active Sync: Real-time simulation tick
            </span>
          </div>

          {/* Telematics KPI Strip */}
          {fleetData && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Active on Road</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {fleetData.metadata.activeOnRoad} / {fleetData.metadata.totalVehicles}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                  92% Fleet Utilization
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Fleet Run Today</div>
                <div className="text-2xl font-extrabold text-emerald-800 mt-1">
                  {formatNumber(fleetData.summaryMetrics.totalFleetKmToday)} km
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Avg {fleetData.summaryMetrics.averageKmPerVehicle.toFixed(1)} km/vehicle
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Petrol Displaced</div>
                <div className="text-2xl font-extrabold text-teal-700 mt-1">
                  {fleetData.summaryMetrics.petrolLitersAvoidedToday.toFixed(1)} L
                </div>
                <div className="text-[10px] text-teal-600 font-semibold mt-1">
                  {fleetData.summaryMetrics.co2KgPreventedToday.toFixed(1)} kg CO₂ cut
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Gross Lease Today</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {formatINR(fleetData.summaryMetrics.grossFleetRentalTodayINR)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">
                  100% Lease Recovery
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
                <div className="text-[11px] text-slate-500 font-medium">Electricity Cost</div>
                <div className="text-2xl font-extrabold text-amber-700 mt-1">
                  {formatINR(fleetData.summaryMetrics.fleetElectricityCostTodayINR)}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  Commercial Hub Slab
                </div>
              </div>

              <div className="bg-emerald-950 text-white rounded-xl p-4 border border-emerald-800 shadow-md">
                <div className="text-[11px] text-emerald-300 font-medium">Net Hub Daily Profit</div>
                <div className="text-2xl font-black text-white mt-1">
                  {formatINR(fleetData.summaryMetrics.netFleetDailyMarginINR)}
                </div>
                <div className="text-[10px] text-emerald-300 font-semibold mt-1">
                  ~{formatINR(fleetData.summaryMetrics.monthlyProjectedMarginINR)}/mo projected
                </div>
              </div>
            </div>
          )}

          {/* Fleet Expansion ROI Modeling Simulator */}
          <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white rounded-2xl p-6 border border-emerald-200 shadow-xs space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Interactive Planning Tool
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Fleet Size &amp; Monthly Lease Profitability Simulator
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                Simulate ROI before acquiring new vehicle lots
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Sliders */}
              <div className="space-y-4 md:col-span-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Fleet Size (Vehicles):</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {simFleetSize} Vehicles
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="60"
                    step="5"
                    value={simFleetSize}
                    onChange={(e) => setSimFleetSize(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>Daily Lease Rate per Driver (₹/day):</span>
                    <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                      {formatINR(simDailyLeaseRate)} / day
                    </span>
                  </div>
                  <input
                    type="range"
                    min="250"
                    max="450"
                    step="10"
                    value={simDailyLeaseRate}
                    onChange={(e) => setSimDailyLeaseRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                  />
                </div>
              </div>

              {/* Result Card */}
              <div className="bg-white rounded-xl p-5 border border-emerald-200 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">
                    Projected Net Monthly Hub Margin
                  </div>
                  <div className="text-3xl font-extrabold text-emerald-950 mt-1">
                    {formatINR(simNetMonthlyHubProfit)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Gross Collections: {formatINR(simGrossMonthlyRevenue)} / mo
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-3 text-[11px] text-slate-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Energy Cost:</span>
                    <span>-{formatINR(simMonthlyElectricityCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Maintenance Reserve:</span>
                    <span>-{formatINR(simMonthlyMaintenanceBuffer)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Real-Time Telematics Vehicle Roster */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Live Fleet Vehicle Status &amp; Driver Telematics
                </h3>
                <p className="text-xs text-slate-500">
                  Showing active delivery riders across Zomato, Swiggy, Zepto, Blinkit &amp; Porter
                </p>
              </div>

              {/* Search & Platform Filter */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search driver, ID, model..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-500"
                  />
                </div>

                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700"
                >
                  <option value="all">All Platforms</option>
                  <option value="zomato">Zomato</option>
                  <option value="swiggy">Swiggy</option>
                  <option value="zepto">Zepto</option>
                  <option value="blinkit">Blinkit</option>
                  <option value="porter">Porter</option>
                  <option value="shadowfax">Shadowfax</option>
                </select>
              </div>
            </div>

            {/* Vehicle Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {filteredTelematicsVehicles.map((vehicle) => {
                const isLowBattery = vehicle.socPercent < 25;
                const isCharging = vehicle.status === 'CHARGING_AT_HUB';
                const isMaintenance = vehicle.status === 'IN_MAINTENANCE';

                return (
                  <div
                    key={vehicle.id}
                    className={`rounded-xl p-4 border transition-all text-xs space-y-3 ${
                      isMaintenance
                        ? 'bg-slate-50/70 border-slate-300 opacity-75'
                        : isLowBattery
                        ? 'bg-red-50/30 border-red-200'
                        : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{vehicle.id}</span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          ({vehicle.plateNumber})
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isMaintenance
                            ? 'bg-slate-200 text-slate-700'
                            : isCharging
                            ? 'bg-blue-100 text-blue-800'
                            : isLowBattery
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {vehicle.status.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Model & Platform */}
                    <div>
                      <div className="font-semibold text-slate-800">{vehicle.model}</div>
                      <div className="text-slate-500 text-[11px] flex items-center justify-between mt-0.5">
                        <span>
                          Rider: <strong>{vehicle.driverName}</strong>
                        </span>
                        <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          {vehicle.platform}
                        </span>
                      </div>
                    </div>

                    {/* Battery SoC & Range */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-slate-600 flex items-center gap-1">
                          <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                          State of Charge:
                        </span>
                        <span
                          className={`font-bold ${
                            isLowBattery ? 'text-red-600' : 'text-emerald-800'
                          }`}
                        >
                          {vehicle.socPercent}% ({vehicle.estimatedRangeKm} km left)
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isLowBattery ? 'bg-red-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${vehicle.socPercent}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>Battery Health: {vehicle.batteryHealthSoC}%</span>
                        <span>Today&apos;s Run: {vehicle.dailyKmToday} km</span>
                      </div>
                    </div>

                    {/* Lease Status & Location */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span
                        className="text-slate-500 truncate max-w-[170px]"
                        title={vehicle.lastPingLocation}
                      >
                        📍 {vehicle.lastPingLocation}
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                          vehicle.paymentStatus === 'PAID'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {formatINR(vehicle.dailyLeaseFeeINR)} ({vehicle.paymentStatus})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ADD VEHICLE MODAL (Features 2, 5, 9) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Fleet Vehicle Configuration
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  Add Commercial Electric Vehicle to Fleet
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Validation Errors Box (Feature 9) */}
            {formErrors.length > 0 && (
              <div className="p-3.5 bg-red-50 rounded-xl border border-red-200 text-xs text-red-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  Please correct the following input errors:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-red-700">
                  {formErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Validation Warnings Box */}
            {formWarnings.length > 0 && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  Input Advisory:
                </div>
                <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                  {formWarnings.map((warn, idx) => (
                    <li key={idx}>{warn}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-4 text-xs max-h-[65vh] overflow-y-auto pr-1">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vehicle Name / Model:*
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ather Rizta Fleet Spec"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vehicle Category:*
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => {
                      const newCat = e.target.value as VehicleCategory;
                      handleApplyPreset(newCat);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 focus:bg-white"
                  >
                    <option value="2w-high-speed">Electric 2W (High-Speed Scooter/Bike)</option>
                    <option value="2w-swappable">Electric 2W (Battery Swapping)</option>
                    <option value="3w-cargo">Electric 3W Cargo Loader</option>
                    <option value="3w-auto">Electric 3W Passenger Auto</option>
                  </select>
                </div>
              </div>

              {/* Purchase Price & Usage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Purchase Price (₹):*
                  </label>
                  <input
                    type="number"
                    min="10000"
                    step="5000"
                    value={formPurchasePrice}
                    onChange={(e) => setFormPurchasePrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Daily Run (km/day):*
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="400"
                    value={formDailyDistance}
                    onChange={(e) => setFormDailyDistance(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Working Days / Mo:*
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formWorkingDays}
                    onChange={(e) => setFormWorkingDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 focus:bg-white font-mono"
                  />
                </div>
              </div>

              {/* Energy Specs & Tariffs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Efficiency (Wh/km):*
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="200"
                    value={formElectricityConsumption}
                    onChange={(e) => setFormElectricityConsumption(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 focus:bg-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    Typical 2W: 28-35 Wh/km; 3W: 70-90
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Electricity Tariff (₹/kWh):*
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="25"
                    step="0.1"
                    value={formElectricityTariff}
                    onChange={(e) => setFormElectricityTariff(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 focus:bg-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    Commercial hub: ₹6.50–₹7.50/unit
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    EV Monthly Maint (₹):*
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={formEvMaintenance}
                    onChange={(e) => setFormEvMaintenance(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 focus:bg-white font-mono"
                  />
                  <span className="text-[10px] text-slate-400">
                    Brake pads, tires, consumables
                  </span>
                </div>
              </div>

              {/* Financing Section */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Financing &amp; Ownership Structure:</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Reducing balance schedule
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Ownership Model:
                    </label>
                    <select
                      value={formOwnershipModel}
                      onChange={(e) => setFormOwnershipModel(e.target.value as OwnershipModel)}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-emerald-500 text-xs"
                    >
                      <option value="buy-emi">Buy on Bank EMI</option>
                      <option value="buy-cash">Full Cash Purchase</option>
                      <option value="rental-lease">Daily Rental / Lease</option>
                    </select>
                  </div>

                  {formOwnershipModel === 'buy-emi' ? (
                    <>
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Down Payment (₹):
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="5000"
                          value={formDownPayment}
                          onChange={(e) => setFormDownPayment(Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-emerald-500 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Tenure (Months):
                        </label>
                        <input
                          type="number"
                          min="6"
                          max="84"
                          value={formLoanTenure}
                          onChange={(e) => setFormLoanTenure(Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-emerald-500 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">
                          Interest Rate (% p.a.):
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="35"
                          step="0.5"
                          value={formLoanInterest}
                          onChange={(e) => setFormLoanInterest(Number(e.target.value))}
                          className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-emerald-500 font-mono text-xs"
                        />
                      </div>
                    </>
                  ) : formOwnershipModel === 'rental-lease' ? (
                    <div className="sm:col-span-3">
                      <label className="block font-semibold text-slate-700 mb-1">
                        Daily Lease Fee (₹/day):
                      </label>
                      <input
                        type="number"
                        min="100"
                        step="10"
                        value={formDailyLease}
                        onChange={(e) => setFormDailyLease(Number(e.target.value))}
                        className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-emerald-500 font-mono text-xs"
                      />
                    </div>
                  ) : (
                    <div className="sm:col-span-3 text-slate-500 flex items-center pt-5 text-xs">
                      Full upfront cash payment. No recurring EMI or lease interest.
                    </div>
                  )}
                </div>
              </div>

              {/* Baseline Comparison Benchmarks */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-900 text-xs flex items-center justify-between">
                  <span>Baseline Comparative Benchmark (Petrol ICE):</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Replaces this ICE vehicle
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Petrol Price (₹/L):
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formPetrolPrice}
                      onChange={(e) => setFormPetrolPrice(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-emerald-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ICE Mileage (km/L):
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={formPetrolMileage}
                      onChange={(e) => setFormPetrolMileage(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-emerald-500 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      ICE Monthly Maint (₹):
                    </label>
                    <input
                      type="number"
                      step="50"
                      value={formPetrolMaintenance}
                      onChange={(e) => setFormPetrolMaintenance(Number(e.target.value))}
                      className="w-full px-2.5 py-2 bg-white border border-slate-300 rounded-lg focus:outline-emerald-500 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVehicle}
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Save to Fleet Comparison</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT DETAILS MODAL */}
      {inspectVehicleCalc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Vehicle Economic Trace
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {inspectVehicleCalc.vehicle.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectVehicleCalc(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <div className="flex justify-between">
                  <span>Monthly Distance:</span>
                  <strong>{formatNumber(inspectVehicleCalc.monthlyDistanceKm)} km/mo</strong>
                </div>
                <div className="flex justify-between">
                  <span>EV Running Cost / km:</span>
                  <strong>₹{inspectVehicleCalc.electricityCostPerKm.toFixed(2)}/km</strong>
                </div>
                <div className="flex justify-between">
                  <span>Monthly Electricity Bill:</span>
                  <strong>{formatINR(inspectVehicleCalc.monthlyElectricityCostINR)}/mo</strong>
                </div>
                <div className="flex justify-between">
                  <span>EV Maintenance Buffer:</span>
                  <strong>{formatINR(inspectVehicleCalc.vehicle.evMonthlyMaintenanceINR)}/mo</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-emerald-200 text-slate-900 font-bold">
                  <span>Total EV Monthly Operating Cost:</span>
                  <span className="text-emerald-950 font-black">
                    {formatINR(inspectVehicleCalc.monthlyOperatingCostINR)}/mo
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Baseline Petrol Cost/km:</span>
                  <strong>₹{inspectVehicleCalc.baselinePetrolCostPerKm.toFixed(2)}/km</strong>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Baseline Monthly Fuel + Maint:</span>
                  <strong>{formatINR(inspectVehicleCalc.baselineMonthlyOperatingCostINR)}/mo</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-800 font-bold">
                  <span>Gross Operational Savings:</span>
                  <span className="font-extrabold">
                    {formatINR(inspectVehicleCalc.monthlyOperatingSavingsINR)}/mo
                  </span>
                </div>
              </div>

              {inspectVehicleCalc.monthlyFinancingCostINR > 0 && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                  <div className="flex justify-between">
                    <span>Monthly Financing (EMI / Lease):</span>
                    <strong>{formatINR(inspectVehicleCalc.monthlyFinancingCostINR)}/mo</strong>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-amber-200 text-emerald-900 font-bold">
                    <span>Net Cashflow After Financing:</span>
                    <span className="font-black text-sm">
                      {formatINR(inspectVehicleCalc.netMonthlySavingsINR)}/mo
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setInspectVehicleCalc(null)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                Close Trace
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
