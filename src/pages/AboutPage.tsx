import React from 'react';
import {
  ShieldCheck,
  Zap,
  Target,
  Award,
  Users,
  Compass,
  FileText,
  Mail,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface AboutPageProps {
  onSelectTab: (tab: NavigationTab) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onSelectTab }) => {
  return (
    <div className="space-y-12 py-4 sm:py-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span>Revitalize Mobility Initiative</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About GigEV & Revitalize Mobility
        </h1>
        <p className="text-xs sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Empowering Indian gig delivery workers and electric micro-fleet operators with unbiased financial clarity, authentic government subsidy data, and total cost of ownership intelligence.
        </p>
      </div>

      {/* Mission & Purpose */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Target className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Democratizing Earnings</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            India has over 12 million gig delivery partners. Petrol eats up 30-40% of their daily payout. We show riders how shifting to electric puts ₹4,500 to ₹7,000 extra cash into their pockets each month.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-teal-700" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero Fabricated Claims</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            We never inflate savings or promise phantom subsidies. Every number is grounded in official PPAC state capital fuel rates, SERC commercial power slabs, and certified Ministry of Heavy Industries gazettes.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
            <Users className="w-5 h-5 text-blue-700" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Micro-Fleet Intelligence</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Micro-aggregators operating 5 to 50 vehicles need daily lease collection tracking, battery health monitoring, and expansion modeling to build sustainable, debt-free fleet enterprises.
          </p>
        </div>
      </div>

      {/* Methodology & Formulas */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Transparent Economics
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Our Calculation Methodology
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            How GigEV computes cost per kilometer, monthly operational savings, and net profit margins:
          </p>
        </div>

        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 font-mono">
            <div className="text-slate-500 font-sans font-bold text-[11px] uppercase tracking-wide">
              1. Monthly Operating Distance:
            </div>
            <div className="text-slate-900 font-semibold">
              Monthly_Distance_km = Daily_Distance_km × Working_Days_per_Month
            </div>
            <div className="text-slate-500 font-sans text-[11px]">
              Example: 85 km/day × 26 days/month = 2,210 km / month
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 font-mono">
            <div className="text-slate-500 font-sans font-bold text-[11px] uppercase tracking-wide">
              2. Petrol Fuel Cost per KM:
            </div>
            <div className="text-slate-900 font-semibold">
              Petrol_Cost_per_km = Petrol_Price_per_Litre / Petrol_Mileage_kmpl
            </div>
            <div className="text-slate-500 font-sans text-[11px]">
              Example: ₹102.86 / 46 kmpl = ₹2.24 / km (Fuel-only running cost)
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 font-mono">
            <div className="text-slate-500 font-sans font-bold text-[11px] uppercase tracking-wide">
              3. EV Electricity Cost per KM:
            </div>
            <div className="text-slate-900 font-semibold">
              EV_Cost_per_km = Electricity_Tariff_per_kWh × (EV_Efficiency_Wh_per_km ÷ 1000)
            </div>
            <div className="text-slate-500 font-sans text-[11px]">
              Example: ₹6.80/kWh × (33 Wh/km ÷ 1000) = ₹0.22 / km
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 font-mono">
            <div className="text-slate-500 font-sans font-bold text-[11px] uppercase tracking-wide">
              4. Separate Energy and Maintenance Savings:
            </div>
            <div className="text-slate-900 font-semibold">
              Monthly_Energy_Savings = (Monthly_Distance × Petrol_Cost_per_km) - (Monthly_Distance × EV_Cost_per_km)
              <br />
              Monthly_Maintenance_Savings = Petrol_Monthly_Maintenance - EV_Monthly_Maintenance
              <br />
              Total_Operational_Savings = Monthly_Energy_Savings + Monthly_Maintenance_Savings
            </div>
            <div className="text-slate-500 font-sans text-[11px]">
              Example: (₹4,942 - ₹496) + (₹900 - ₹220) = ₹4,446 + ₹680 = ₹5,126 / month
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1.5 font-mono">
            <div className="text-slate-500 font-sans font-bold text-[11px] uppercase tracking-wide">
              5. Non-Negative Payback Horizon:
            </div>
            <div className="text-slate-900 font-semibold">
              Payback_Months = Upfront_Capital ÷ Total_Operational_Savings (if Savings &gt; 0, else &quot;No positive payback under these assumptions.&quot;)
            </div>
            <div className="text-slate-500 font-sans text-[11px]">
              Guarantees zero misleading negative payback timelines when operating costs exceed petrol.
            </div>
          </div>
        </div>
      </div>

      {/* Official Government Alignment & Data Sources */}
      <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200/90 space-y-4">
        <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-700" />
          Official Data Benchmarks & References
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <strong>Petroleum Planning & Analysis Cell (PPAC):</strong>
            <p className="text-slate-500 mt-0.5">
              Daily state capital retail fuel price notifications, Ministry of Petroleum & Natural Gas.
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <strong>PM E-DRIVE Scheme 2024-2026:</strong>
            <p className="text-slate-500 mt-0.5">
              Ministry of Heavy Industries (MHI) Gazette Guidelines for Electric 2W & 3W demand subsidies.
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <strong>State Electricity Regulatory Commissions (SERCs):</strong>
            <p className="text-slate-500 mt-0.5">
              Published tariff orders for domestic and public EV commercial charging station supply slabs.
            </p>
          </div>
          <div className="bg-white p-3 rounded-lg border border-slate-200">
            <strong>Bureau of Energy Efficiency (BEE):</strong>
            <p className="text-slate-500 mt-0.5">
              Vehicle standard testing energy consumption norms and grid CO₂ emission factors.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Box */}
      <div className="bg-emerald-950 text-white rounded-2xl p-6 sm:p-8 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-extrabold text-white">
          Ready to Calculate Your Delivery Earnings?
        </h3>
        <p className="text-xs sm:text-sm text-emerald-200 max-w-xl mx-auto">
          Start with our interactive calculator to see how much money an electric scooter or cargo loader can save you every month.
        </p>
        <button
          onClick={() => onSelectTab('calculator')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
        >
          Launch EV Savings Calculator
        </button>
      </div>
    </div>
  );
};
