/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { CalculatorPage } from './pages/CalculatorPage';
import { SubsidyPage } from './pages/SubsidyPage';
import { FleetDashboardPage } from './pages/FleetDashboardPage';
import { AiAdvisorPage } from './pages/AiAdvisorPage';
import { AboutPage } from './pages/AboutPage';
import { DeliveryPlatform, NavigationTab, VehicleCategory } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [calcInitDailyKm, setCalcInitDailyKm] = useState<number>(85);
  const [calcInitPlatform, setCalcInitPlatform] = useState<DeliveryPlatform>('Zomato');
  const [calcInitSubsidyAmount, setCalcInitSubsidyAmount] = useState<number | undefined>(undefined);
  const [calcInitVehicleCategory, setCalcInitVehicleCategory] = useState<VehicleCategory | undefined>(undefined);
  const [calcInitSubsidySchemeName, setCalcInitSubsidySchemeName] = useState<string | undefined>(undefined);

  // Context passed from Calculator to AI Advisor
  const [advisorContext, setAdvisorContext] = useState<{
    city: string;
    platform: string;
    dailyKm: number;
    vehicleType: string;
    monthlyFuelSaved: number;
    ownershipModel: string;
  } | undefined>(undefined);

  // Quick calculate handler from Home page
  const handleQuickCalculate = (dailyKm: number, platform: DeliveryPlatform) => {
    setCalcInitDailyKm(dailyKm);
    setCalcInitPlatform(platform);
  };

  // Carry data from Calculator to AI Advisor
  const handleConsultAdvisorWithData = (data: {
    city: string;
    platform: string;
    dailyKm: number;
    vehicleType: string;
    monthlyFuelSaved: number;
    ownershipModel: string;
  }) => {
    setAdvisorContext(data);
  };

  // Carry confirmed subsidy from Subsidy Explorer to Calculator (Requirement 7)
  const handleUseSubsidyInCalculator = (
    amount: number,
    category: VehicleCategory,
    schemeName: string
  ) => {
    setCalcInitSubsidyAmount(amount);
    setCalcInitVehicleCategory(category);
    setCalcInitSubsidySchemeName(schemeName);
    setActiveTab('calculator');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Notification / Benchmark Notice Strip */}
      <div className="bg-emerald-950 text-emerald-200 text-[11px] py-1.5 px-4 text-center border-b border-emerald-800 flex items-center justify-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-semibold text-white">Revitalize Mobility Live Intelligence:</span>
        <span className="hidden sm:inline">
          Grounded in Q1-2025 PPAC fuel indexes &amp; Central PM E-DRIVE Scheme guidelines.
        </span>
        <button
          onClick={() => setActiveTab('subsidies')}
          className="text-emerald-300 underline font-medium hover:text-white ml-1 cursor-pointer"
        >
          Check State Policies →
        </button>
      </div>

      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        selectedCityName="Bengaluru (₹102.86/L)"
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        {activeTab === 'home' && (
          <HomePage
            onSelectTab={setActiveTab}
            onQuickCalculate={handleQuickCalculate}
          />
        )}

        {activeTab === 'calculator' && (
          <CalculatorPage
            initialDailyKm={calcInitDailyKm}
            initialPlatform={calcInitPlatform}
            initialSubsidyAmount={calcInitSubsidyAmount}
            initialVehicleCategory={calcInitVehicleCategory}
            initialSubsidySchemeName={calcInitSubsidySchemeName}
            onConsultAdvisorWithData={handleConsultAdvisorWithData}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'subsidies' && (
          <SubsidyPage
            onUseInCalculator={handleUseSubsidyInCalculator}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'fleet' && <FleetDashboardPage />}

        {activeTab === 'advisor' && (
          <AiAdvisorPage initialContext={advisorContext} />
        )}

        {activeTab === 'about' && <AboutPage onSelectTab={setActiveTab} />}
      </main>

      {/* Footer */}
      <Footer onSelectTab={setActiveTab} />
    </div>
  );
}
