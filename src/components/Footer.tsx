import React from 'react';
import { Shield, Zap, ExternalLink, AlertCircle, Sparkles } from 'lucide-react';
import { NavigationTab } from '../types';

interface FooterProps {
  onSelectTab: (tab: NavigationTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
                <Zap className="w-5 h-5 fill-emerald-200 text-emerald-200" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Gig<span className="text-emerald-400">EV</span>
              </span>
              <span className="text-xs text-slate-400 font-medium border-l border-slate-700 pl-2.5">
                by Revitalize Mobility
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              GigEV is India's dedicated financial intelligence and total cost of ownership platform for gig delivery workers, commercial EV drivers, and micro-fleet aggregators. Designed to turn every delivery kilometer into maximized take-home earnings.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                <Shield className="w-3 h-3 text-emerald-400" /> PPAC Benchmark Grounded
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-emerald-950/60 border border-emerald-800 text-emerald-300">
                <Sparkles className="w-3 h-3 text-emerald-400" /> PM E-DRIVE 2024-2026 Aligned
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onSelectTab('calculator')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  EV Savings Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('subsidies')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  State & Central Subsidy Explorer
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('fleet')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Fleet Analytics Dashboard (Demo)
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('advisor')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  AI Mobility Financial Advisor
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('about')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  About Revitalize Mobility
                </button>
              </li>
            </ul>
          </div>

          {/* Data Transparency & Citations */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-200 mb-3">
              Data Transparency
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center justify-between">
                <span>PPAC Fuel Rates:</span>
                <span className="text-emerald-400 font-medium">State Capital Index</span>
              </li>
              <li className="flex items-center justify-between">
                <span>SERC Power Tariffs:</span>
                <span className="text-emerald-400 font-medium">Slab Averages</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Central Scheme:</span>
                <span className="text-emerald-400 font-medium">PM E-DRIVE</span>
              </li>
              <li className="flex items-center justify-between">
                <span>Currency:</span>
                <span className="text-white font-medium">Indian Rupees (₹)</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Methodology Disclaimer */}
        <div className="pt-6 border-t border-slate-800">
          <div className="flex items-start gap-2.5 p-3.5 rounded-lg bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-200">Compliance & Financial Modeling Disclaimer:</strong>{' '}
              All calculations, cost savings, payback timelines, and subsidy estimates provided on GigEV are intended for financial planning, comparative benchmarking, and informational assessment. Government subsidies (Central PM E-DRIVE and state transport policies) depend upon OEM homologation, Aadhaar deduplication, dealer Vahan integration, and individual state transport budget sanctions. Loan rates and approvals depend upon financial institution / NBFC underwriting criteria. Revitalize Mobility does not guarantee third-party loan sanctions or state treasury disburse dates.
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <div>
              © {new Date().getFullYear()} Revitalize Mobility Pvt. Ltd. All rights reserved.
            </div>
            <div className="flex items-center gap-4">
              <span>Bangalore • Delhi NCR • Mumbai</span>
              <span>Made for Indian Gig Riders</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
