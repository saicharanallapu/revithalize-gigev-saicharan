import React, { useState, useEffect } from 'react';
import {
  Compass,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info,
  Filter,
  Search,
  Sparkles,
  FileText,
  AlertCircle,
  IndianRupee,
  Layers,
  ArrowRight,
  Calculator,
  Check,
  X,
  Building,
  HelpCircle,
} from 'lucide-react';
import { SubsidyScheme, SubsidyVehicleCategory, VehicleCategory, NavigationTab } from '../types';
import { formatINR } from '../utils/formatters';

interface SubsidyPageProps {
  onUseInCalculator?: (
    amount: number,
    category: VehicleCategory,
    schemeName: string
  ) => void;
  onSelectTab?: (tab: NavigationTab) => void;
}

const INDIAN_STATES = [
  { code: 'all', name: 'All India (Central & State Policies)' },
  { code: 'delhi', name: 'Delhi NCR' },
  { code: 'maharashtra', name: 'Maharashtra' },
  { code: 'karnataka', name: 'Karnataka' },
  { code: 'tamil-nadu', name: 'Tamil Nadu' },
  { code: 'uttar-pradesh', name: 'Uttar Pradesh' },
  { code: 'gujarat', name: 'Gujarat' },
  { code: 'rajasthan', name: 'Rajasthan' },
  { code: 'telangana', name: 'Telangana' },
  { code: 'kerala', name: 'Kerala' },
  { code: 'west-bengal', name: 'West Bengal' },
  { code: 'bihar', name: 'Bihar' },
  { code: 'odisha', name: 'Odisha' },
  { code: 'punjab', name: 'Punjab' },
  { code: 'madhya-pradesh', name: 'Madhya Pradesh' },
  { code: 'andhra-pradesh', name: 'Andhra Pradesh' },
];

export const SubsidyPage: React.FC<SubsidyPageProps> = ({
  onUseInCalculator,
  onSelectTab,
}) => {
  const [subsidies, setSubsidies] = useState<SubsidyScheme[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters (Requirement 2)
  const [selectedState, setSelectedState] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Transfer confirmation modal state (Requirement 7)
  const [confirmModalData, setConfirmModalData] = useState<{
    isOpen: boolean;
    scheme: SubsidyScheme | null;
    amount: number;
    category: VehicleCategory;
    categoryLabel: string;
  }>({
    isOpen: false,
    scheme: null,
    amount: 0,
    category: '2w-high-speed',
    categoryLabel: 'Electric Two-Wheeler',
  });

  // Non-cash concession advisory modal state (Requirement 6)
  const [nonCashInfoModalScheme, setNonCashInfoModalScheme] = useState<SubsidyScheme | null>(null);

  useEffect(() => {
    async function fetchSubsidies() {
      try {
        setLoading(true);
        const res = await fetch('/api/subsidies');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setSubsidies(json.data);
        } else {
          setError('Could not load verified subsidy schemes.');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to reach subsidy API');
      } finally {
        setLoading(false);
      }
    }
    fetchSubsidies();
  }, []);

  // Filter schemes based on selected state, category, and search query
  const filteredSubsidies = subsidies.filter((s) => {
    // State match: 'all' matches central + all states.
    // If specific state selected: matches if scheme stateCode === selectedState OR if scheme is central (Pan-India)
    const matchesState =
      selectedState === 'all'
        ? true
        : s.stateCode === selectedState || s.category === 'central';

    // Category match
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : s.applicableCategories.includes(selectedCategory as SubsidyVehicleCategory);

    // Search query match
    const matchesSearch =
      searchTerm === '' ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.schemeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.segment.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesState && matchesCategory && matchesSearch;
  });

  // Check if current state has any active state-level scheme
  const stateHasSpecificVerifiedScheme =
    selectedState === 'all' ||
    subsidies.some((s) => s.stateCode === selectedState);

  const selectedStateName =
    INDIAN_STATES.find((st) => st.code === selectedState)?.name || selectedState;

  // Helper to determine the specific incentive amount for the active category
  const getIncentiveAmountForCategory = (
    scheme: SubsidyScheme,
    cat: string
  ): { amount: number; label: string; mappedCategory: VehicleCategory } => {
    if (cat === 'electric-3w-cargo' && scheme.incentiveAmount3WCargoINR) {
      return {
        amount: scheme.incentiveAmount3WCargoINR,
        label: 'Electric 3W Cargo Loader',
        mappedCategory: '3w-cargo',
      };
    }
    if (cat === 'electric-3w-passenger' && scheme.incentiveAmount3WPassengerINR) {
      return {
        amount: scheme.incentiveAmount3WPassengerINR,
        label: 'Electric 3W Passenger Auto',
        mappedCategory: '3w-auto',
      };
    }
    // Default to 2W or general max
    const amt = scheme.incentiveAmount2WINR || scheme.maxAmountINR;
    return {
      amount: amt,
      label: 'Electric Two-Wheeler (e-2W)',
      mappedCategory: '2w-high-speed',
    };
  };

  const handleOpenTransferModal = (scheme: SubsidyScheme) => {
    // Requirement 6: Do not automatically or inadvertently transfer an unverified or non-cash incentive
    if (!scheme.hasDirectCashSubsidy || scheme.stateCode === 'telangana') {
      setNonCashInfoModalScheme(scheme);
      return;
    }
    const { amount, label, mappedCategory } = getIncentiveAmountForCategory(
      scheme,
      selectedCategory
    );
    if (!amount || amount <= 0) {
      setNonCashInfoModalScheme(scheme);
      return;
    }
    setConfirmModalData({
      isOpen: true,
      scheme,
      amount,
      category: mappedCategory,
      categoryLabel: label,
    });
  };

  const handleConfirmTransfer = () => {
    if (confirmModalData.scheme && onUseInCalculator) {
      onUseInCalculator(
        confirmModalData.amount,
        confirmModalData.category,
        confirmModalData.scheme.title
      );
    } else if (onSelectTab) {
      onSelectTab('calculator');
    }
    setConfirmModalData((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-8 py-4 sm:py-8">
      {/* Header Banner */}
      <div className="border-b border-slate-200 pb-6 space-y-2">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
            <Compass className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            Government EV Incentives Index
          </span>
          <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
            Official Sources Grounded
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
          EV Subsidy Explorer for Gig Workers & Fleets
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          Filter verified demand subsidies, road tax exemptions, and permit waivers across Indian states and EV categories. Transfer verified incentive figures into your financial savings calculation with one click.
        </p>
      </div>

      {/* Official Government Disclaimer Box (Requirement 5 & 6) */}
      <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 flex items-start gap-3 text-xs leading-relaxed">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-amber-950">
            Official Verification & Regulatory Policy Notice:
          </strong>{' '}
          All subsidy calculations below are grounded in published Ministry of Heavy Industries Gazette notifications (PM E-DRIVE Scheme 2024–2026) and active State Transport Department policies. Subsidies are disbursed directly upfront by certified OEMs or via direct bank transfer (DBT). Revitalize Mobility presents verified policy summaries for financial planning; actual eligibility is determined by dealer Vahan portal validation and individual state budget caps.
        </div>
      </div>

      {/* Requirement 2: Interactive State & EV Category Selection Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-emerald-600" />
            Select Your State & Vehicle Segment
          </span>
          <span className="text-[11px] text-slate-500">
            Filter verified central and state incentives
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* State Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select State / Union Territory:
            </label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              {INDIAN_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>

          {/* EV Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Select EV Vehicle Category:
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            >
              <option value="all">All Vehicle Categories</option>
              <option value="electric-2w">Electric Two-Wheeler (e-2W Scooter / Bike)</option>
              <option value="electric-3w-passenger">Electric 3W Passenger (Auto / E-Rickshaw)</option>
              <option value="electric-3w-cargo">Electric 3W Cargo Loader (Delivery Box / Flatbed)</option>
            </select>
          </div>

          {/* Keyword Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Search by Scheme or City:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search e.g. PM E-DRIVE, Delhi, Scrappage..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-slate-600">
          <span className="text-[11px] font-semibold text-slate-400">Active Filters:</span>
          <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
            State: <strong>{selectedStateName}</strong>
          </span>
          <span className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium text-[11px]">
            Category:{' '}
            <strong>
              {selectedCategory === 'all'
                ? 'All Categories'
                : selectedCategory === 'electric-2w'
                ? 'Electric 2-Wheeler'
                : selectedCategory === 'electric-3w-passenger'
                ? 'Electric 3W Passenger Auto'
                : 'Electric 3W Cargo Loader'}
            </strong>
          </span>
          {(selectedState !== 'all' || selectedCategory !== 'all' || searchTerm !== '') && (
            <button
              onClick={() => {
                setSelectedState('all');
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 underline font-medium cursor-pointer ml-1"
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>

      {/* Loading & Error States */}
      {loading && (
        <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Fetching verified government gazette policy data...</p>
        </div>
      )}

      {error && !loading && (
        <div className="p-6 text-center space-y-2 bg-red-50 rounded-2xl border border-red-200 text-red-900">
          <p className="text-xs font-semibold">{error}</p>
          <p className="text-[11px] text-red-700">Please check your network and try again.</p>
        </div>
      )}

      {/* Requirement 5 & 8: Unverified / No Active State Scheme Notice */}
      {!loading && !error && selectedState !== 'all' && !stateHasSpecificVerifiedScheme && (
        <div className="p-5 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 space-y-3">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-amber-950">
                State Policy Advisory for {selectedStateName}
              </h4>
              <p className="text-xs text-amber-900 leading-relaxed">
                No active state-specific direct cash purchase subsidy is currently verified in our gazette index for <strong>{selectedStateName}</strong>. 
                <strong className="block mt-1 text-amber-950">
                  Please verify with the official scheme authority (State Transport Commissionerate / RTO).
                </strong>
              </p>
            </div>
          </div>
          <div className="p-3 bg-white/80 rounded-xl border border-amber-200 text-xs text-slate-700">
            <span className="font-bold text-emerald-800">Nationwide Coverage Available:</span>{' '}
            The <strong>Central PM E-DRIVE Scheme</strong> demand subsidy (up to ₹10,000 for e-2W and up to ₹50,000 for e-3W) applies across all states in India, including {selectedStateName}. Road tax concessions may also be applied directly at your local RTO.
          </div>
        </div>
      )}

      {/* Empty State when search has zero results */}
      {!loading && !error && filteredSubsidies.length === 0 && (
        <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
          <Compass className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">
            No matching policies found for this combination
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Please verify with the official scheme authority or reset filters to view pan-India central schemes.
          </p>
          <button
            onClick={() => {
              setSelectedState('all');
              setSelectedCategory('all');
              setSearchTerm('');
            }}
            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-semibold hover:bg-emerald-700 transition-colors"
          >
            Reset Filters to Pan-India
          </button>
        </div>
      )}

      {/* Requirement 3, 4, 6: Verified Subsidy Scheme Cards Grid */}
      {!loading && !error && filteredSubsidies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>
              Showing <strong>{filteredSubsidies.length}</strong> verified government subsidy program{filteredSubsidies.length > 1 ? 's' : ''}
            </span>
            <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ✓ Verified Against Official Gazette
            </span>
          </div>

          {/* State Clarification Advisory when Telangana is filtered */}
          {selectedState === 'telangana' && (
            <div className="p-4 rounded-xl bg-slate-900 text-white border border-slate-700 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-700 text-white">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="font-bold text-sm text-emerald-300">
                  Telangana EV Policy 2020–2030 (G.O.Ms.No. 41) Policy Clarification
                </span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                The State Government of Telangana provides <strong>100% Road Tax and Registration Fee exemptions</strong> at RTA counters for designated vehicle quotas. <strong>Official state sources do not establish any direct cash purchase subsidy</strong> (such as upfront purchase discounts or DBT cash transfers) for electric two-wheelers or three-wheelers.
              </p>
              <div className="p-2.5 bg-slate-800 rounded-lg text-amber-300 border border-slate-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-slate-200">
                  <strong className="text-amber-300">Official Requirement:</strong> Current eligibility must be confirmed with the Transport Department. The cash demand incentives shown below under PM E-DRIVE are provided separately by the Central Government (Ministry of Heavy Industries).
                </span>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSubsidies.map((scheme) => {
              const { amount: targetIncentiveAmount } =
                getIncentiveAmountForCategory(scheme, selectedCategory);

              const isTaxWaiverOnly = !scheme.hasDirectCashSubsidy || scheme.stateCode === 'telangana';

              return (
                <div
                  key={scheme.id}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                            scheme.category === 'central'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {scheme.level}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          📍 {scheme.jurisdiction}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                          isTaxWaiverOnly
                            ? 'text-amber-800 bg-amber-50 border-amber-300'
                            : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                        }`}
                      >
                        {isTaxWaiverOnly ? 'Tax & Fee Exemption Only' : 'Verified Demand Subsidy'}
                      </span>
                    </div>

                    {/* Scheme Title & Full Name */}
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 leading-snug">
                        {scheme.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {scheme.schemeName}
                      </p>
                    </div>

                    {/* Requirement 5: Explicit confirmation notice banner when eligibility cannot be auto-confirmed */}
                    {(scheme.confirmationNotice || isTaxWaiverOnly) && (
                      <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 flex items-start gap-2.5 text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold text-amber-950 block">
                            Current eligibility must be confirmed with the Transport Department.
                          </strong>
                          <span className="text-[11px] text-amber-900 block mt-0.5 leading-relaxed">
                            Statutory volume caps, vehicle quota availability, and RTA eligibility criteria are subject to official verification with the Transport Department.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Requirement 2: Clearly distinguish direct cash purchase subsidies from road tax & registration exemptions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div
                        className={`p-3 rounded-xl border ${
                          scheme.hasDirectCashSubsidy
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-700">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          Direct Cash Purchase Subsidy:
                        </div>
                        <div className="text-xs sm:text-sm font-extrabold text-slate-900 mt-1">
                          {scheme.hasDirectCashSubsidy
                            ? scheme.demandIncentiveText
                            : '₹0 — No State Cash Subsidy'}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1 leading-normal">
                          {scheme.hasDirectCashSubsidy
                            ? 'Deducted upfront by dealer at invoice or credited via DBT.'
                            : scheme.directCashSubsidyNote ||
                              'Official state notifications do not establish direct upfront cash purchase subsidies.'}
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          Statutory Concessions at RTA:
                        </div>
                        <div className="text-xs sm:text-sm font-extrabold text-emerald-900 mt-1">
                          {scheme.roadTaxExemption}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-normal">
                          {scheme.registrationWaiver} (Granted at RTA counter during registration).
                        </p>
                      </div>
                    </div>

                    {/* Requirement 1: Verified Incentive / Concession Numbers Matrix */}
                    <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200 space-y-2 text-xs">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                        {scheme.hasDirectCashSubsidy
                          ? 'Verified Incentive by Vehicle Category:'
                          : 'Statutory Concession by Vehicle Category (Tax & Fee Waiver Only):'}
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">e-2W (Scooter)</span>
                          <span className="text-xs sm:text-sm font-extrabold text-emerald-800 block mt-0.5">
                            {scheme.hasDirectCashSubsidy && scheme.incentiveAmount2WINR
                              ? formatINR(scheme.incentiveAmount2WINR)
                              : '100% Tax Waiver'}
                          </span>
                          {!scheme.hasDirectCashSubsidy && (
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              No Cash Subsidy
                            </span>
                          )}
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">e-3W Passenger</span>
                          <span className="text-xs sm:text-sm font-extrabold text-emerald-800 block mt-0.5">
                            {scheme.hasDirectCashSubsidy && scheme.incentiveAmount3WPassengerINR
                              ? formatINR(scheme.incentiveAmount3WPassengerINR)
                              : '100% Tax Waiver'}
                          </span>
                          {!scheme.hasDirectCashSubsidy && (
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              No Cash Subsidy
                            </span>
                          )}
                        </div>

                        <div className="bg-white p-2 rounded-lg border border-slate-100">
                          <span className="text-[10px] text-slate-500 block">e-3W Cargo</span>
                          <span className="text-xs sm:text-sm font-extrabold text-emerald-800 block mt-0.5">
                            {scheme.hasDirectCashSubsidy && scheme.incentiveAmount3WCargoINR
                              ? formatINR(scheme.incentiveAmount3WCargoINR)
                              : '100% Tax Waiver'}
                          </span>
                          {!scheme.hasDirectCashSubsidy && (
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              No Cash Subsidy
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 text-[11px] text-slate-600 leading-relaxed border-t border-slate-200/60">
                        <strong className="text-slate-800">Calculation Method:</strong>{' '}
                        {scheme.calculationMethod}
                      </div>
                    </div>

                    {/* Requirement 4: Statutory Vehicle Limits & Volume Caps (per official notification) */}
                    {scheme.vehicleVolumeCaps && scheme.vehicleVolumeCaps.length > 0 && (
                      <div className="space-y-1.5 bg-slate-50/80 p-3 rounded-xl border border-slate-200 text-xs">
                        <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          Statutory Vehicle Volume Quotas (per Official Notification):
                        </div>
                        <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside">
                          {scheme.vehicleVolumeCaps.map((cap, idx) => (
                            <li key={idx} className="leading-relaxed">
                              {cap}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Requirement 4: Geographic Conditions & Validity Dates */}
                    <div className="space-y-1.5 text-xs">
                      {scheme.geographicConditions && (
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-700 flex items-start gap-2">
                          <span className="font-bold text-slate-900 shrink-0">Geographic Rule:</span>
                          <span>{scheme.geographicConditions}</span>
                        </div>
                      )}
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px] text-slate-700 flex items-start gap-2">
                        <span className="font-bold text-slate-900 shrink-0">Validity Period:</span>
                        <span>{scheme.validUntil}</span>
                      </div>
                    </div>

                    {/* Road Tax & Commercial Concessions List */}
                    <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Road Tax Exemption:</strong> {scheme.roadTaxExemption}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Registration Fee Exemption:</strong> {scheme.registrationWaiver}
                        </span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>Commercial Permit:</strong> {scheme.commercialPermitExemption}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility Conditions Checklist (Requirement 4 & 5) */}
                    <div className="pt-1">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide mb-1.5">
                        Verified Eligibility Conditions:
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600 list-disc list-inside">
                        {scheme.eligibilityCriteria.map((item, idx) => (
                          <li
                            key={idx}
                            className={`leading-relaxed ${
                              item.includes('Transport Department')
                                ? 'font-semibold text-amber-950'
                                : ''
                            }`}
                          >
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirement 3: Links to official Telangana Transport Department notifications & EV Policy Document */}
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wide">
                        Official Government Sources &amp; Notifications:
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {/* Official Policy Document (PDF) */}
                        {scheme.officialPolicyDocumentUrl && (
                          <a
                            href={scheme.officialPolicyDocumentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-semibold border border-emerald-200 transition-colors text-[11px]"
                            title={`Open ${scheme.officialPolicyDocumentName || 'Official Policy Document'}`}
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{scheme.officialPolicyDocumentName || 'Official Policy Document (PDF)'}</span>
                            <ExternalLink className="w-3 h-3 text-emerald-700 ml-0.5" />
                          </a>
                        )}

                        {/* Official Transport Department Portal */}
                        <a
                          href={scheme.sourcePortalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-800 font-semibold border border-slate-200 transition-colors text-[11px]"
                          title={`Visit ${scheme.sourcePortalName}`}
                        >
                          <Building className="w-3.5 h-3.5 text-slate-600" />
                          <span>{scheme.sourcePortalName}</span>
                          <ExternalLink className="w-3 h-3 text-slate-600 ml-0.5" />
                        </a>
                      </div>

                      {scheme.officialNotificationNumber && (
                        <div className="text-[11px] text-slate-500">
                          <strong>Notification Reference:</strong> {scheme.officialNotificationNumber}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Bottom Actions: Official Link & "Use in Calculator" Button (Requirement 6 & 7) */}
                  <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Primary Source Link */}
                    <a
                      href={scheme.sourcePortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-900 font-semibold group"
                      title={`Visit ${scheme.sourcePortalName}`}
                    >
                      <Building className="w-3.5 h-3.5" />
                      <span className="underline">{scheme.sourcePortalName}</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </a>

                    {/* Requirement 6: Transfer to Calculator Action Guarded */}
                    {isTaxWaiverOnly ? (
                      <button
                        onClick={() => setNonCashInfoModalScheme(scheme)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                        title="Road tax concessions are processed at RTA registration, not as upfront vehicle price discounts"
                      >
                        <Info className="w-3.5 h-3.5 text-slate-500" />
                        <span>Tax Waiver at RTA • No Direct Cash Subsidy to Transfer</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenTransferModal(scheme)}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                      >
                        <Calculator className="w-3.5 h-3.5" />
                        <span>Use {formatINR(targetIncentiveAmount)} in Calculator</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Non-Cash Concession Informational Modal (Requirement 6) */}
      {nonCashInfoModalScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                  Statutory Concession Policy Notice
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Road Tax &amp; Registration Fee Exemption
                </h3>
              </div>
              <button
                onClick={() => setNonCashInfoModalScheme(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500 font-medium">Policy Name:</div>
                <div className="font-bold text-slate-900 text-sm">
                  {nonCashInfoModalScheme.title}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Jurisdiction: {nonCashInfoModalScheme.jurisdiction}
                </div>
              </div>

              {/* Requirement 2 & 6: Clear explanation why it cannot be transferred to upfront vehicle price */}
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-2 leading-relaxed text-xs">
                <div className="font-bold text-amber-950 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                  Why This Concession Cannot Be Transferred as a Cash Subsidy:
                </div>
                <p>
                  The <strong>{nonCashInfoModalScheme.schemeName}</strong> provides a <strong>100% statutory waiver of Motor Vehicle Road Tax and Registration Fees</strong> applied directly by Regional Transport Authority (RTA) counters upon vehicle registration.
                </p>
                <p>
                  Official state notifications <strong>do not provide an upfront direct cash purchase subsidy or DBT transfer</strong> to reduce the invoice price of the vehicle.
                </p>
                <p className="font-semibold text-amber-950">
                  “Current eligibility must be confirmed with the Transport Department.”
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 text-[11px] space-y-1">
                <strong className="text-slate-900 block">Where to Claim Direct Cash Subsidies:</strong>
                <span>
                  Direct upfront purchase demand subsidies (₹5,000/kWh up to ₹10,000 for e-2W and up to ₹50,000 for e-3W) are available under the Central Government&apos;s <strong>PM E-DRIVE Scheme</strong>. You can view and apply the PM E-DRIVE incentive from the list.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {nonCashInfoModalScheme.officialPolicyDocumentUrl && (
                <a
                  href={nonCashInfoModalScheme.officialPolicyDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Policy Document (PDF)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
              <button
                onClick={() => setNonCashInfoModalScheme(null)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors ml-auto"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for "Use in Calculator" Action (Requirement 7) */}
      {confirmModalData.isOpen && confirmModalData.scheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Confirm Incentive Transfer
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Apply Verified Subsidy to Savings Calculator
                </h3>
              </div>
              <button
                onClick={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 space-y-1">
                <div className="text-slate-500 font-medium">Selected Government Scheme:</div>
                <div className="font-bold text-slate-900 text-sm">
                  {confirmModalData.scheme.title}
                </div>
                <div className="flex items-center justify-between pt-2 mt-1 border-t border-emerald-200/70">
                  <span>Incentive for {confirmModalData.categoryLabel}:</span>
                  <span className="text-lg font-black text-emerald-900">
                    {formatINR(confirmModalData.amount)}
                  </span>
                </div>
              </div>

              {/* Requirement 7: Explicit eligibility disclaimer */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 leading-relaxed text-[11px]">
                <strong className="font-semibold block mb-0.5 text-amber-950">
                  Eligibility & Disbursement Advisory:
                </strong>
                Subsidies depend on individual vehicle homologation, Aadhaar deduplication, dealer Vahan portal integration, and state budget availability. 
                This amount will be transferred into your calculator as an <strong>estimated assumption</strong>. Actual eligibility and final dealer discount may vary.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                onClick={() => setConfirmModalData((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTransfer}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Confirm & Transfer to Calculator</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
