import React, { useState } from 'react';
import {
  FileText,
  Printer,
  Download,
  Copy,
  Share2,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
  Calendar,
  Building,
  Fuel,
  Zap,
  TrendingUp,
  Layers,
  IndianRupee,
} from 'lucide-react';
import {
  CalculatorInputs,
  CalculatorOutputs,
  FleetVehicleCalculation,
} from '../types';
import { formatINR, formatNumber, formatDecimal } from '../utils/formatters';

interface SavingsReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorInputs?: CalculatorInputs;
  calculatorOutputs?: CalculatorOutputs;
  fleetCalculations?: FleetVehicleCalculation[];
  reportTitle?: string;
}

export const SavingsReportModal: React.FC<SavingsReportModalProps> = ({
  isOpen,
  onClose,
  calculatorInputs,
  calculatorOutputs,
  fleetCalculations,
  reportTitle = 'GigEV Financial Intelligence Report',
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [shared, setShared] = useState<boolean>(false);
  const [shareError, setShareError] = useState<string | null>(null);

  if (!isOpen) return null;

  const generationTimestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  // Calculate fleet summaries if available
  const hasFleetData = fleetCalculations && fleetCalculations.length > 0;
  const fleetTotalVehicles = hasFleetData ? fleetCalculations.length : 0;
  const fleetTotalMonthlyDistance = hasFleetData
    ? fleetCalculations.reduce((sum, c) => sum + c.monthlyDistanceKm, 0)
    : 0;
  const fleetTotalOperatingCost = hasFleetData
    ? fleetCalculations.reduce((sum, c) => sum + c.monthlyOperatingCostINR, 0)
    : 0;
  const fleetTotalMonthlySavings = hasFleetData
    ? fleetCalculations.reduce((sum, c) => sum + c.monthlyOperatingSavingsINR, 0)
    : 0;
  const fleetTotalFinancingCost = hasFleetData
    ? fleetCalculations.reduce((sum, c) => sum + c.monthlyFinancingCostINR, 0)
    : 0;

  // Build clean text version of report for download and clipboard
  const generateReportText = (): string => {
    let lines: string[] = [];
    lines.push('===============================================================');
    lines.push('       GIGEV — GIG WORKER EV FINANCIAL INTELLIGENCE REPORT      ');
    lines.push('                 Revitalize Mobility Platform                  ');
    lines.push('===============================================================');
    lines.push(`Generated On: ${generationTimestamp}`);
    lines.push(`Report Scope: ${reportTitle}`);
    lines.push('');

    if (calculatorInputs && calculatorOutputs) {
      lines.push('---------------------------------------------------------------');
      lines.push('1. VEHICLE PROFILE & OPERATIONAL RUN');
      lines.push('---------------------------------------------------------------');
      lines.push(`City Benchmark:           ${calculatorInputs.cityId.toUpperCase()}`);
      lines.push(`Delivery Platform:        ${calculatorInputs.platform}`);
      lines.push(`Vehicle Segment:          ${calculatorInputs.vehicleCategory}`);
      lines.push(`Ownership Model:          ${calculatorInputs.ownershipModel}`);
      lines.push(`Daily Distance:           ${calculatorOutputs.dailyKm} km/day`);
      lines.push(`Monthly Working Days:     ${calculatorOutputs.workingDaysPerMonth} days/month`);
      lines.push(`Total Monthly Distance:   ${calculatorOutputs.monthlyKm.toLocaleString('en-IN')} km`);
      lines.push(`Total Annual Distance:    ${calculatorOutputs.annualKm.toLocaleString('en-IN')} km`);
      lines.push('');

      lines.push('---------------------------------------------------------------');
      lines.push('2. RUNNING COSTS (PETROL VS ELECTRIC)');
      lines.push('---------------------------------------------------------------');
      lines.push(`Petrol Price Reference:   ₹${calculatorInputs.petrolPricePerLitre}/L (PPAC Benchmark)`);
      lines.push(`Petrol Mileage:           ${calculatorInputs.petrolMileageKmpl} km/L`);
      lines.push(`Petrol Cost Per Km:       ₹${calculatorOutputs.petrolCostPerKm.toFixed(2)}/km`);
      lines.push(`Monthly Petrol Fuel Cost: ₹${Math.round(calculatorOutputs.monthlyPetrolFuelCost).toLocaleString('en-IN')}/month`);
      lines.push('');
      lines.push(`EV Energy Efficiency:     ${calculatorInputs.evEfficiencyWhPerKm} Wh/km`);
      lines.push(`Electricity Tariff:       ₹${calculatorInputs.electricityRatePerUnit}/kWh`);
      lines.push(`EV Cost Per Km:           ₹${calculatorOutputs.evCostPerKm.toFixed(2)}/km`);
      lines.push(`Monthly EV Energy Cost:   ₹${Math.round(calculatorOutputs.monthlyEvEnergyCost).toLocaleString('en-IN')}/month`);
      lines.push(`Monthly Energy Savings:   ₹${Math.round(calculatorOutputs.monthlyEnergySavings).toLocaleString('en-IN')}/month`);
      lines.push('');

      lines.push('---------------------------------------------------------------');
      lines.push('3. MAINTENANCE & OPERATIONAL SAVINGS');
      lines.push('---------------------------------------------------------------');
      lines.push(`Petrol Monthly Maint.:    ₹${calculatorOutputs.monthlyPetrolMaintenance.toLocaleString('en-IN')}/month`);
      lines.push(`EV Monthly Maint.:        ₹${calculatorOutputs.monthlyEvMaintenance.toLocaleString('en-IN')}/month`);
      lines.push(`Monthly Maint. Savings:   ₹${Math.round(calculatorOutputs.monthlyMaintenanceSavings).toLocaleString('en-IN')}/month`);
      lines.push(`GROSS OPERATING SAVINGS:  ₹${Math.round(calculatorOutputs.monthlyOperationalSavings).toLocaleString('en-IN')}/month`);
      lines.push(`ANNUAL OPERATING SAVINGS: ₹${Math.round(calculatorOutputs.annualOperationalSavings).toLocaleString('en-IN')}/year`);
      lines.push('');

      lines.push('---------------------------------------------------------------');
      lines.push('4. CAPITAL, FINANCING & PAYBACK');
      lines.push('---------------------------------------------------------------');
      lines.push(`Ex-Showroom Price:        ₹${calculatorOutputs.evExShowroomPrice.toLocaleString('en-IN')}`);
      lines.push(`Applied Subsidy:          ₹${calculatorOutputs.appliedSubsidyINR.toLocaleString('en-IN')} [User Assumption / Estimated]`);
      lines.push(`Net Vehicle Price:        ₹${calculatorOutputs.netVehiclePriceAfterSubsidy.toLocaleString('en-IN')}`);
      lines.push(`Upfront Capital:          ₹${calculatorOutputs.upfrontPayment.toLocaleString('en-IN')}`);
      lines.push(`Loan Principal:           ₹${calculatorOutputs.loanPrincipal.toLocaleString('en-IN')}`);
      lines.push(`Monthly Loan EMI:         ₹${Math.round(calculatorOutputs.monthlyEmiAmount).toLocaleString('en-IN')}/month`);
      lines.push(`Net Monthly Surplus:      ₹${Math.round(calculatorOutputs.effectiveMonthlySavingsAfterEmiOrRental).toLocaleString('en-IN')}/month (After EMI)`);
      lines.push(`Capital Payback Period:   ${calculatorOutputs.paybackDisplay}`);
      lines.push(`3-Year Net Benefit:       ₹${Math.round(calculatorOutputs.threeYearNetSavings).toLocaleString('en-IN')} TCO Advantage`);
      lines.push('');
    }

    if (hasFleetData && fleetCalculations) {
      lines.push('---------------------------------------------------------------');
      lines.push('5. MULTI-VEHICLE FLEET COMPARISON OVERVIEW');
      lines.push('---------------------------------------------------------------');
      lines.push(`Total Fleet Vehicles:     ${fleetTotalVehicles}`);
      lines.push(`Total Monthly Run:        ${fleetTotalMonthlyDistance.toLocaleString('en-IN')} km`);
      lines.push(`Combined Operating Cost:  ₹${Math.round(fleetTotalOperatingCost).toLocaleString('en-IN')}/month`);
      lines.push(`Combined Monthly Savings: ₹${Math.round(fleetTotalMonthlySavings).toLocaleString('en-IN')}/month`);
      lines.push(`Combined Financing EMI:   ₹${Math.round(fleetTotalFinancingCost).toLocaleString('en-IN')}/month`);
      lines.push('');
      lines.push('Vehicles Breakdown:');
      fleetCalculations.forEach((fc, idx) => {
        lines.push(`  [${idx + 1}] ${fc.vehicle.name} (${fc.vehicle.vehicleCategory})`);
        lines.push(`      Price: ₹${fc.vehicle.purchasePriceINR.toLocaleString('en-IN')} | Run: ${fc.monthlyDistanceKm} km/mo`);
        lines.push(`      Operating Cost: ₹${Math.round(fc.monthlyOperatingCostINR)}/mo | Monthly Savings: ₹${Math.round(fc.monthlyOperatingSavingsINR)}/mo`);
      });
      lines.push('');
    }

    lines.push('---------------------------------------------------------------');
    lines.push('6. ASSUMPTIONS & REGULATORY COMPLIANCE DISCLAIMER');
    lines.push('---------------------------------------------------------------');
    lines.push('• All calculations are generated directly using verified mathematical');
    lines.push('  formulas grounded in published PPAC retail fuel rates and state tariffs.');
    lines.push('• Subsidies listed are treated as estimated planning assumptions unless');
    lines.push('  validated against active Ministry of Heavy Industries gazette portals.');
    lines.push('• Actual fuel mileage, real-world battery range, and loan underwriting');
    lines.push('  terms depend on individual driver duty cycles and financier approval.');
    lines.push('• Revitalize Mobility never guarantees speculative future earnings.');
    lines.push('===============================================================');

    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = generateReportText();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy report:', err);
    }
  };

  const handleDownload = () => {
    const text = generateReportText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GigEV_Financial_Report_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleNativeShare = async () => {
    setShareError(null);
    const text = generateReportText();
    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title: 'GigEV Financial Intelligence Report',
          text: `Here is my EV financial assessment from Revitalize Mobility's GigEV platform:\n\n${text.slice(
            0,
            1200
          )}...\n\nGenerated via GigEV`,
        });
        setShared(true);
        setTimeout(() => setShared(false), 2500);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setShareError('Native share was cancelled or not supported.');
        }
      }
    } else {
      // Fallback: Copy to clipboard
      await handleCopy();
      setShareError('Native device sharing is not supported on this browser. Report copied to clipboard instead!');
      setTimeout(() => setShareError(null), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-6 max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileText className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                Revitalize Mobility Intelligence
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Shareable EV Financial &amp; TCO Report
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close report modal"
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs shrink-0">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Calendar className="w-3.5 h-3.5 text-emerald-700" />
            <span>Generated: {generationTimestamp}</span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
              title="Print formatted report"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold transition-colors cursor-pointer"
              title="Download text report"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Download (.txt)</span>
            </button>

            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 font-bold transition-colors cursor-pointer"
              title="Copy formatted text to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              onClick={handleNativeShare}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs cursor-pointer"
              title="Share report via device sharing"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {shareError && (
          <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{shareError}</span>
          </div>
        )}

        {/* Printable & Scrollable Report Body */}
        <div
          id="printable-savings-report"
          className="flex-1 overflow-y-auto space-y-5 text-xs text-slate-700 pr-1 border border-slate-100 rounded-xl p-4 bg-white"
        >
          {/* Report Title Header */}
          <div className="text-center pb-4 border-b border-slate-200 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Revitalize Mobility Financial Analytics
            </span>
            <h1 className="text-lg sm:text-xl font-black text-slate-900 mt-1">
              Commercial EV Operational &amp; Payback Intelligence Report
            </h1>
            <p className="text-[11px] text-slate-500">
              Personalized Financial Model for Indian Gig Delivery Partners &amp; Fleet Owners
            </p>
          </div>

          {/* Calculator Section */}
          {calculatorInputs && calculatorOutputs && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px]">
                <div>
                  <span className="text-slate-400 block">City Benchmark:</span>
                  <strong className="text-slate-800 capitalize">{calculatorInputs.cityId}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Platform:</span>
                  <strong className="text-emerald-800">{calculatorInputs.platform}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Daily Duty Cycle:</span>
                  <strong className="text-slate-800">{calculatorOutputs.dailyKm} km/day</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Monthly Schedule:</span>
                  <strong className="text-slate-800">{calculatorOutputs.workingDaysPerMonth} days/mo</strong>
                </div>
              </div>

              {/* Core Financial Numbers Matrix */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 block">
                    Monthly Operating Savings
                  </span>
                  <div className="text-xl font-black text-emerald-950">
                    {formatINR(calculatorOutputs.monthlyOperationalSavings)}
                  </div>
                  <span className="text-[10px] text-emerald-700 block">
                    Energy: {formatINR(calculatorOutputs.monthlyEnergySavings)} | Maint: {formatINR(calculatorOutputs.monthlyMaintenanceSavings)}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-600 block">
                    Monthly Financing / EMI
                  </span>
                  <div className="text-xl font-bold text-slate-900">
                    {calculatorOutputs.monthlyEmiAmount > 0
                      ? formatINR(calculatorOutputs.monthlyEmiAmount)
                      : '₹0 (Cash Paid)'}
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Net cash surplus: {formatINR(calculatorOutputs.effectiveMonthlySavingsAfterEmiOrRental)}/mo
                  </span>
                </div>

                <div className="p-3.5 bg-emerald-950 text-white rounded-xl border border-emerald-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-emerald-300 block">
                    Annual Net Savings
                  </span>
                  <div className="text-xl font-black text-white">
                    {formatINR(calculatorOutputs.annualOperationalSavings)}
                  </div>
                  <span className="text-[10px] text-emerald-300 block">
                    3-Year TCO: {formatINR(calculatorOutputs.threeYearNetSavings)} Advantage
                  </span>
                </div>
              </div>

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2">
                  <strong className="text-slate-800 text-[11px] uppercase tracking-wide block">
                    Running Cost Comparison (Per Km &amp; Monthly)
                  </strong>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span>Monthly Distance:</span>
                      <strong>{formatNumber(calculatorOutputs.monthlyKm)} km/mo</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Petrol ICE Fuel Rate:</span>
                      <strong>₹{calculatorOutputs.petrolCostPerKm.toFixed(2)}/km ({calculatorInputs.petrolMileageKmpl} km/L)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Petrol Fuel Expense:</span>
                      <strong className="text-slate-900">{formatINR(calculatorOutputs.monthlyPetrolFuelCost)}/mo</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>EV Electricity Running Rate:</span>
                      <strong className="text-emerald-800">₹{calculatorOutputs.evCostPerKm.toFixed(2)}/km ({calculatorInputs.evEfficiencyWhPerKm} Wh/km)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly EV Energy Expense:</span>
                      <strong className="text-emerald-800">{formatINR(calculatorOutputs.monthlyEvEnergyCost)}/mo</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-emerald-900">
                      <span>Monthly Energy Savings:</span>
                      <span>{formatINR(calculatorOutputs.monthlyEnergySavings)}/mo</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50/60 rounded-xl border border-slate-200 space-y-2">
                  <strong className="text-slate-800 text-[11px] uppercase tracking-wide block">
                    Capital, Subsidies &amp; Payback Period
                  </strong>
                  <div className="space-y-1.5 text-[11px]">
                    <div className="flex justify-between">
                      <span>Vehicle Purchase Price:</span>
                      <strong>{formatINR(calculatorOutputs.evExShowroomPrice)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Assumed Subsidy:</span>
                      <span className="font-semibold text-slate-700">
                        {formatINR(calculatorOutputs.appliedSubsidyINR)}{' '}
                        <span className="text-[9px] text-slate-400">(User Entered Assumption)</span>
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Net Vehicle Capital:</span>
                      <strong>{formatINR(calculatorOutputs.netVehiclePriceAfterSubsidy)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Upfront Down Payment:</span>
                      <strong>{formatINR(calculatorOutputs.upfrontPayment)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Principal:</span>
                      <strong>{formatINR(calculatorOutputs.loanPrincipal)}</strong>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-slate-900">
                      <span>Capital Payback:</span>
                      <span className={calculatorOutputs.paybackHasPositiveReturn ? 'text-emerald-800' : 'text-amber-800'}>
                        {calculatorOutputs.paybackDisplay}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fleet Section (if available) */}
          {hasFleetData && fleetCalculations && (
            <div className="space-y-3 pt-3 border-t border-slate-200">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs">
                <Layers className="w-4 h-4 text-emerald-700" />
                <span>Multi-Vehicle Fleet Comparison Summary ({fleetTotalVehicles} Vehicles)</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Combined Run:</span>
                  <strong>{formatNumber(fleetTotalMonthlyDistance)} km/mo</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Fleet Operating Cost:</span>
                  <strong>{formatINR(fleetTotalOperatingCost)}/mo</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Combined Monthly Savings:</span>
                  <strong className="text-emerald-800">{formatINR(fleetTotalMonthlySavings)}/mo</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Combined Financing EMI:</span>
                  <strong>{formatINR(fleetTotalFinancingCost)}/mo</strong>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-[11px] divide-y divide-slate-200">
                  <thead className="bg-slate-50 text-slate-600 font-bold">
                    <tr>
                      <th className="py-2 px-3">Vehicle</th>
                      <th className="py-2 px-3 text-right">Price</th>
                      <th className="py-2 px-3 text-right">Monthly Run</th>
                      <th className="py-2 px-3 text-right">Operating Cost</th>
                      <th className="py-2 px-3 text-right">Monthly Savings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {fleetCalculations.map((fc) => (
                      <tr key={fc.vehicle.id}>
                        <td className="py-2 px-3 font-medium text-slate-800">
                          {fc.vehicle.name}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {formatINR(fc.vehicle.purchasePriceINR)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {formatNumber(fc.monthlyDistanceKm)} km
                        </td>
                        <td className="py-2 px-3 text-right">
                          {formatINR(fc.monthlyOperatingCostINR)}/mo
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-800">
                          {formatINR(fc.monthlyOperatingSavingsINR)}/mo
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Legal Compliance & Disclaimer Section */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5 text-[10px] text-slate-500 leading-relaxed">
            <div className="font-bold text-slate-700 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Verified Standards, Assumptions &amp; Legal Disclaimers</span>
            </div>
            <p>
              1. <strong>Formula Accuracy:</strong> Running fuel expenses are calculated as (Petrol Price / Petrol Mileage); EV electricity cost is calculated as Electricity Tariff &times; (Wh/km &divide; 1000).
            </p>
            <p>
              2. <strong>Subsidies:</strong> Government subsidies displayed in this report are user-entered planning estimates unless supported by official Ministry of Heavy Industries (PM E-DRIVE) gazette documentation.
            </p>
            <p>
              3. <strong>No Guaranteed Earnings:</strong> Revitalize Mobility provides financial modeling tools for planning purposes. Actual fuel consumption, range, battery degradation, and financier loan underwriting will vary.
            </p>
          </div>
        </div>

        {/* Footer Close */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 shrink-0">
          <span className="text-[11px] text-slate-400">
            Revitalize Mobility • GigEV Intelligence Report
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
          >
            Close Report
          </button>
        </div>
      </div>
    </div>
  );
};
