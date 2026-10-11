import React, { useState } from 'react';
import {
  Zap,
  TrendingUp,
  ShieldCheck,
  Compass,
  LayoutDashboard,
  Bot,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Fuel,
  BatteryCharging,
  Leaf,
  Sparkles,
  ChevronRight,
  Clock,
  Layers,
} from 'lucide-react';
import { NavigationTab, DeliveryPlatform } from '../types';
import { formatINR } from '../utils/formatters';

interface HomePageProps {
  onSelectTab: (tab: NavigationTab) => void;
  onQuickCalculate: (dailyKm: number, platform: DeliveryPlatform) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSelectTab, onQuickCalculate }) => {
  const [quickKm, setQuickKm] = useState<number>(85);
  const [quickPlatform, setQuickPlatform] = useState<DeliveryPlatform>('Zomato');

  // Audited quick estimation math
  const daysPerMonth = 26;
  const monthlyKm = Math.max(0, quickKm) * daysPerMonth;
  // Formula 2: petrol price ÷ mileage (Bengaluru benchmark: ₹102.86 ÷ 46 km/l)
  const petrolCostPerKm = 102.86 / 46;
  // Formula 3: electricity tariff × (Wh/km ÷ 1000) (Bengaluru benchmark: ₹6.80 × 0.033)
  const evCostPerKm = 6.8 * (33 / 1000);
  const monthlyPetrolSpend = Math.round(monthlyKm * petrolCostPerKm);
  const monthlyEvSpend = Math.round(monthlyKm * evCostPerKm);
  const monthlyEnergySavings = monthlyPetrolSpend - monthlyEvSpend;
  const monthlyMaintenanceSavings = 900 - 220; // Petrol ₹900 - EV ₹220
  const monthlySavings = monthlyEnergySavings + monthlyMaintenanceSavings;
  const annualSavings = monthlySavings * 12;

  const handleLaunchCalculator = () => {
    onQuickCalculate(quickKm, quickPlatform);
    onSelectTab('calculator');
  };

  return (
    <div className="space-y-16 py-6 sm:py-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white rounded-3xl p-6 sm:p-12 shadow-2xl border border-emerald-800/40">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Built by Revitalize Mobility for Indian Gig Deliveries</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-balance">
            Turn Every Delivery Kilometer into{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">
              Pure Earnings
            </span>
          </h1>

          <p className="text-sm sm:text-lg text-emerald-100/90 max-w-2xl mx-auto leading-relaxed">
            Stop losing 35% to 40% of your daily delivery payouts to petrol bunks. Discover your exact EV savings, verified government subsidies, and tailored financing intelligence in Indian Rupees.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onSelectTab('calculator')}
              className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 cursor-pointer"
            >
              <TrendingUp className="w-4 h-4 text-emerald-950" />
              <span>Full EV Savings Calculator</span>
              <ArrowRight className="w-4 h-4 text-emerald-950" />
            </button>
            <button
              onClick={() => onSelectTab('subsidies')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 backdrop-blur-sm transition-all cursor-pointer"
            >
              <Compass className="w-4 h-4 text-emerald-300" />
              <span>Explore Subsidies</span>
            </button>
            <button
              onClick={() => onSelectTab('advisor')}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-950 text-emerald-200 font-semibold text-sm border border-emerald-700/60 transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-400" />
              <span>Ask AI Advisor</span>
            </button>
          </div>
        </div>

        {/* Quick Instant Calculator Card on Hero */}
        <div className="relative mt-10 max-w-3xl mx-auto bg-white/95 text-slate-900 rounded-2xl p-5 sm:p-7 shadow-2xl border border-emerald-100 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Quick Estimator
                </span>
                <span className="text-xs text-slate-500 font-medium">Instant 5-Second Estimate</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-1">
                How much extra take-home pay can an EV give you?
              </h2>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400">Based on 26 active delivery days/mo</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5">
            {/* Input Controls */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between mb-1.5">
                  <span>Your Delivery Platform:</span>
                  <span className="text-emerald-700 font-bold">{quickPlatform}</span>
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['Zomato', 'Swiggy', 'Zepto', 'Blinkit', 'Shadowfax', 'Porter'] as DeliveryPlatform[]).map(
                    (p) => (
                      <button
                        key={p}
                        onClick={() => setQuickPlatform(p)}
                        className={`text-xs py-1.5 px-2 rounded-lg font-medium border text-center transition-all ${
                          quickPlatform === p
                            ? 'bg-emerald-800 text-white border-emerald-800 font-semibold shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>Daily Distance Covered:</span>
                  <span className="text-emerald-800 font-bold text-sm bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {quickKm} km / day
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="160"
                  step="5"
                  value={quickKm}
                  onChange={(e) => setQuickKm(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>30 km (Part-time)</span>
                  <span>85 km (Standard shift)</span>
                  <span>160 km (Long shift)</span>
                </div>
              </div>
            </div>

            {/* Quick Result Callout */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 rounded-xl p-4 sm:p-5 border border-emerald-200 flex flex-col justify-between">
              <div>
                <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                  Projected Monthly Operational Savings
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl sm:text-4xl font-extrabold text-emerald-950">
                    {formatINR(monthlySavings)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700">/ month</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Includes <strong className="text-emerald-900 font-bold">{formatINR(monthlyEnergySavings)}</strong> fuel/power saving + <strong className="text-emerald-900 font-bold">{formatINR(monthlyMaintenanceSavings)}</strong> maintenance savings.
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-200/70 mt-3 flex items-center justify-between">
                <div className="text-[11px] text-slate-500">
                  Petrol fuel: {formatINR(monthlyPetrolSpend)} vs EV power: {formatINR(monthlyEvSpend)}
                </div>
                <button
                  onClick={handleLaunchCalculator}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-800 hover:text-emerald-950 group"
                >
                  <span>Fine-tune details</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Target Audiences: Gig Delivery Workers vs Fleet Operators */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Tailored for India's Last-Mile Mobility Ecosystem
          </h2>
          <p className="text-sm text-slate-600">
            Whether you ride 10 hours a day for food orders or manage 25 electric cargo two-wheelers, GigEV gives you clear financial metrics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Gig Delivery Workers */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <Fuel className="w-6 h-6 text-emerald-700" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 mb-2">
              For Gig Delivery Riders
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              Food, Grocery & Parcel Delivery Partners
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              Riding for Zomato, Swiggy, Zepto, Blinkit, or Shadowfax? Don't let petrol price surges eat up your hard-earned order delivery incentives.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>₹2.25/km down to ₹0.32/km:</strong> Cut running costs by up to 85%.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>Self-Funding EMI:</strong> Fuel savings cover your vehicle loan EMI.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span><strong>No Salary Slips Needed:</strong> Guidance on EV micro-loans from specialized NBFCs.</span>
              </li>
            </ul>

            <button
              onClick={() => onSelectTab('calculator')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-900 group"
            >
              <span>Calculate your delivery route savings</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Card 2: Fleet Owners & Hub Managers */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
              <LayoutDashboard className="w-6 h-6 text-teal-700" />
            </div>
            <div className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-800 border border-teal-200 mb-2">
              For Micro-Aggregators & Fleet Hubs
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              EV Fleet Operators & Micro-Hub Owners
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
              Operating or scaling a fleet of 5 to 50+ electric two-wheelers or three-wheelers leased to gig delivery partners across urban hubs.
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Daily Lease Recovery Tracking:</strong> Monitor daily driver rent collection.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Battery SoC & Telematics:</strong> Monitor battery health and prevent mid-shift lockouts.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span><strong>Fleet Expansion ROI:</strong> Simulate margins on adding 10, 25, or 50 new EV assets.</span>
              </li>
            </ul>

            <button
              onClick={() => onSelectTab('fleet')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 hover:text-teal-900 group"
            >
              <span>Explore Fleet Telematics Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Comparative Economics: Petrol 2W vs Fixed EV vs Swappable EV */}
      <section className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 sm:p-10 space-y-6">
        <div className="max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Real Economics Comparison
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            How the 3 Delivery Mobility Models Compare
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Benchmarked against a standard 85 km daily delivery shift over 26 days (2,210 km/month).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Petrol Scooter */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Legacy Option</span>
              <span className="text-[10px] bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded">High Bleed</span>
            </div>
            <h4 className="text-base font-bold text-slate-900">Petrol 110cc Scooter</h4>
            <div className="text-2xl font-extrabold text-red-600">
              ₹2.45 <span className="text-xs text-slate-500 font-normal">/ km</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Monthly Fuel:</span>
                <span className="font-semibold text-slate-900">₹4,970</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Oil & Service:</span>
                <span className="font-semibold text-slate-900">₹900</span>
              </div>
              <div className="flex justify-between font-bold text-red-700 pt-1 border-t border-slate-100">
                <span>Total Monthly Cost:</span>
                <span>₹5,870</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 italic">
              Vulnerable to frequent fuel price hikes and engine oil wear.
            </p>
          </div>

          {/* Fixed Battery EV */}
          <div className="bg-emerald-950 text-white rounded-xl p-5 border border-emerald-800 space-y-3 shadow-lg relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase">Highest Profit</span>
              <span className="text-[10px] bg-emerald-500 text-emerald-950 font-bold px-2 py-0.5 rounded">
                Recommended
              </span>
            </div>
            <h4 className="text-base font-bold text-white">Fixed Battery EV (Home Charged)</h4>
            <div className="text-2xl font-extrabold text-emerald-300">
              ₹0.32 <span className="text-xs text-emerald-200 font-normal">/ km</span>
            </div>
            <div className="space-y-1.5 text-xs text-emerald-100 pt-2 border-t border-emerald-800/80">
              <div className="flex justify-between">
                <span>Monthly Electricity:</span>
                <span className="font-semibold text-white">₹510</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Maintenance:</span>
                <span className="font-semibold text-white">₹220</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-300 pt-1 border-t border-emerald-800/80">
                <span>Total Monthly Cost:</span>
                <span>₹730</span>
              </div>
            </div>
            <div className="text-[11px] text-emerald-300 font-semibold bg-emerald-900/60 p-2 rounded border border-emerald-800">
              🔥 Net Monthly Saving: +₹5,140 / mo!
            </div>
          </div>

          {/* Battery Swapping */}
          <div className="bg-white rounded-xl p-5 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Zero Downtime</span>
              <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded">High Uptime</span>
            </div>
            <h4 className="text-base font-bold text-slate-900">Battery Swap BaaS (Zypp / Battery Smart)</h4>
            <div className="text-2xl font-extrabold text-teal-700">
              ₹1.15 <span className="text-xs text-slate-500 font-normal">/ km</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Monthly Swap Subscription:</span>
                <span className="font-semibold text-slate-900">₹2,210</span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Maintenance:</span>
                <span className="font-semibold text-slate-900">₹180</span>
              </div>
              <div className="flex justify-between font-bold text-teal-800 pt-1 border-t border-slate-100">
                <span>Total Monthly Cost:</span>
                <span>₹2,390</span>
              </div>
            </div>
            <div className="text-[11px] text-teal-800 font-semibold bg-teal-50 p-2 rounded border border-teal-200">
              ⚡ Swap in 90 seconds, zero battery degradation worry.
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Verified Benchmark Strip */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Grounded in Official Indian Policy & Tariffs</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Transparent, Verifiable Data Sources
            </h3>
            <p className="text-xs text-slate-500 max-w-xl">
              Unlike generic calculators, GigEV uses live city benchmark data from the Petroleum Planning & Analysis Cell (PPAC), state electricity regulatory commissions (SERCs), and certified PM E-DRIVE guidelines.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSelectTab('subsidies')}
              className="px-4 py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors"
            >
              View State Subsidy Rules
            </button>
            <button
              onClick={() => onSelectTab('about')}
              className="px-4 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            >
              Calculation Methodology
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
