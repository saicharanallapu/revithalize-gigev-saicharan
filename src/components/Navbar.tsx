import React, { useState } from 'react';
import {
  Zap,
  Calculator,
  Compass,
  LayoutDashboard,
  Bot,
  Info,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { NavigationTab } from '../types';

interface NavbarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  selectedCityName?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  selectedCityName = 'Bengaluru',
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: NavigationTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Home', icon: <Zap className="w-4 h-4" /> },
    { id: 'calculator', label: 'EV Savings Calculator', icon: <Calculator className="w-4 h-4" />, badge: 'Core' },
    { id: 'subsidies', label: 'Subsidy Explorer', icon: <Compass className="w-4 h-4" /> },
    { id: 'fleet', label: 'Fleet Dashboard', icon: <LayoutDashboard className="w-4 h-4" />, badge: 'Demo' },
    { id: 'advisor', label: 'AI Financial Advisor', icon: <Bot className="w-4 h-4" />, badge: 'AI' },
    { id: 'about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  const handleTabClick = (tab: NavigationTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handleTabClick('home')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-950 flex items-center justify-center text-white shadow-md shadow-emerald-900/10 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 fill-emerald-300 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-emerald-950">
                  Gig<span className="text-emerald-600">EV</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  Revitalize Mobility
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Gig Worker EV Financial Intelligence Platform
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-emerald-950 hover:bg-emerald-50/70'
                  }`}
                >
                  <span className={isActive ? 'text-emerald-300' : 'text-slate-400 group-hover:text-emerald-600'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-emerald-800 text-emerald-200'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Benchmark City Indicator & CTA */}
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-400 font-medium">Benchmark City</div>
              <div className="text-xs font-semibold text-emerald-900 flex items-center justify-end gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {selectedCityName}
              </div>
            </div>
            <button
              onClick={() => handleTabClick('calculator')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Calculate Savings</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-emerald-950 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-emerald-100 bg-white px-4 pt-3 pb-6 shadow-xl space-y-1 animate-in slide-in-from-top-2 duration-150">
          <div className="p-2 mb-2 bg-emerald-50/60 rounded-lg border border-emerald-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900">Revitalize Mobility Platform</span>
            <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-bold">
              India Edition (₹)
            </span>
          </div>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-900 text-white font-semibold'
                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-950'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-emerald-300' : 'text-emerald-700'}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        isActive ? 'bg-emerald-800 text-emerald-200' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
