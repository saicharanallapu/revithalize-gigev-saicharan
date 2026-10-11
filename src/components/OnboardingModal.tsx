import React, { useState } from 'react';
import {
  Zap,
  Calculator,
  Compass,
  LayoutDashboard,
  Bot,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyDemoData: () => void;
  onResetToDefaults: () => void;
  onSelectTab: (tab: NavigationTab) => void;
  hasCustomUserData?: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onApplyDemoData,
  onResetToDefaults,
  onSelectTab,
  hasCustomUserData = false,
}) => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState<boolean>(false);

  if (!isOpen) return null;

  const steps = [
    {
      title: 'Welcome to GigEV Intelligence',
      badge: 'Platform Introduction',
      icon: <Zap className="w-6 h-6 text-emerald-700" />,
      content: (
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            <strong>GigEV</strong> is an EV financial intelligence platform built for Indian gig delivery partners (Zomato, Swiggy, Zepto, Blinkit, Porter) and commercial fleet aggregators.
          </p>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 space-y-1">
            <strong>Key Platform Principle:</strong>
            <p>
              We cut through speculative OEM marketing claims with verified mathematical calculations, official gazette subsidies, and real-world TCO comparisons.
            </p>
          </div>
          <p className="text-[11px] text-slate-500">
            Explore all features freely — no mandatory sign-in or credit card required.
          </p>
        </div>
      ),
    },
    {
      title: 'Core Platform Modules',
      badge: 'How to Navigate',
      icon: <Calculator className="w-6 h-6 text-emerald-700" />,
      content: (
        <div className="space-y-2 text-xs text-slate-600">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <strong className="text-slate-900 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-emerald-700" />
              1. EV Savings Calculator:
            </strong>
            <span className="text-[11px] text-slate-600 block">
              Calculates daily/monthly fuel savings, maintenance differences, loan EMI, and realistic payback periods.
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <strong className="text-slate-900 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-700" />
              2. EV Subsidy Explorer:
            </strong>
            <span className="text-[11px] text-slate-600 block">
              Grounded in Central PM E-DRIVE and official State gazette notifications. Distinguishes direct purchase subsidies from road tax waivers.
            </span>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
            <strong className="text-slate-900 flex items-center gap-1.5">
              <LayoutDashboard className="w-3.5 h-3.5 text-amber-700" />
              3. Fleet Dashboard &amp; AI Advisor:
            </strong>
            <span className="text-[11px] text-slate-600 block">
              Model multi-vehicle fleets, compare commercial EVs side-by-side, and ask street-smart financial questions.
            </span>
          </div>
        </div>
      ),
    },
    {
      title: 'Quickstart with Illustrative Demo Data',
      badge: 'Interactive Sandbox',
      icon: <Sparkles className="w-6 h-6 text-emerald-700" />,
      content: (
        <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
          <p>
            You can load realistic <strong>illustrative benchmark values</strong> (Zomato Bengaluru rider duty cycle: 85 km/day, 26 days/month, commercial 2W EV) to explore the system immediately.
          </p>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-[11px] space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              Demo Data Notice:
            </div>
            <p>
              Demo data values are illustrative planning benchmarks based on standard industry duty cycles. They are not fabricated real customer records.
            </p>
          </div>
        </div>
      ),
    },
  ];

  const handleApplyDemoClick = () => {
    if (hasCustomUserData) {
      setShowOverwriteConfirm(true);
    } else {
      onApplyDemoData();
      onClose();
    }
  };

  const confirmOverwrite = () => {
    onApplyDemoData();
    setShowOverwriteConfirm(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
              {steps[activeStep].icon}
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                {steps[activeStep].badge}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {steps[activeStep].title}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close onboarding modal"
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between gap-1.5">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                activeStep === idx
                  ? 'bg-emerald-600'
                  : activeStep > idx
                  ? 'bg-emerald-200'
                  : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* Overwrite Confirmation Dialog */}
        {showOverwriteConfirm ? (
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-300 text-xs text-amber-950 space-y-3">
            <div className="font-bold flex items-center gap-1.5 text-sm">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              Confirm Loading Demo Values
            </div>
            <p>
              You currently have custom numbers entered in the calculator. Loading demo values will replace your inputs with illustrative benchmark data.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowOverwriteConfirm(false)}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmOverwrite}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
              >
                Yes, Load Demo Data
              </button>
            </div>
          </div>
        ) : (
          /* Step Content */
          <div className="min-h-[140px] flex flex-col justify-center">
            {steps[activeStep].content}
          </div>
        )}

        {/* Footer Actions */}
        {!showOverwriteConfirm && (
          <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
            <button
              onClick={handleApplyDemoClick}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold border border-emerald-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              <span>Try Demo Data</span>
            </button>

            <div className="flex items-center gap-2">
              {activeStep > 0 && (
                <button
                  onClick={() => setActiveStep((prev) => prev - 1)}
                  className="px-3 py-2 rounded-lg border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Back
                </button>
              )}

              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() => setActiveStep((prev) => prev + 1)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center gap-1"
                >
                  <span>Next</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors"
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
