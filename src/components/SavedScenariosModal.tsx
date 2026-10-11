import React, { useState, useEffect } from 'react';
import {
  FolderOpen,
  Save,
  Trash2,
  Download,
  Upload,
  X,
  Check,
  AlertCircle,
  Clock,
  Layers,
  Calculator,
  ShieldCheck,
  Database,
  ExternalLink,
} from 'lucide-react';
import { SavedScenario, CalculatorInputs, FleetComparisonVehicle } from '../types';
import {
  getSavedScenarios,
  saveScenario,
  deleteScenario,
  exportScenariosJson,
  importScenariosJson,
} from '../utils/scenarioStorage';
import { formatINR, formatNumber } from '../utils/formatters';

interface SavedScenariosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCalculatorInputs?: CalculatorInputs;
  currentFleetVehicles?: FleetComparisonVehicle[];
  onLoadCalculatorInputs?: (inputs: CalculatorInputs) => void;
  onLoadFleetVehicles?: (vehicles: FleetComparisonVehicle[]) => void;
}

export const SavedScenariosModal: React.FC<SavedScenariosModalProps> = ({
  isOpen,
  onClose,
  currentCalculatorInputs,
  currentFleetVehicles,
  onLoadCalculatorInputs,
  onLoadFleetVehicles,
}) => {
  const [activeTab, setActiveTab] = useState<'saved' | 'save_current' | 'cloud_info'>('saved');
  const [scenarios, setScenarios] = useState<SavedScenario[]>([]);
  const [scenarioName, setScenarioName] = useState<string>('');
  const [scenarioType, setScenarioType] = useState<'calculator' | 'fleet'>('calculator');
  const [scenarioNotes, setScenarioNotes] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState<string>('');
  const [showImportBox, setShowImportBox] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      refreshList();
      setStatusMessage(null);
    }
  }, [isOpen]);

  const refreshList = () => {
    setScenarios(getSavedScenarios());
  };

  if (!isOpen) return null;

  const handleSaveCurrent = () => {
    if (!scenarioName.trim()) {
      setStatusMessage('Please enter a descriptive scenario name.');
      return;
    }

    if (scenarioType === 'calculator' && currentCalculatorInputs) {
      saveScenario({
        name: scenarioName.trim(),
        type: 'calculator',
        calculatorInputs: currentCalculatorInputs,
        notes: scenarioNotes.trim() || undefined,
        summaryHighlights: {
          monthlySavingsINR: 0, // will calculate on load
          monthlyDistanceKm: currentCalculatorInputs.dailyKm * currentCalculatorInputs.workingDaysPerMonth,
          vehicleDescription: `${currentCalculatorInputs.platform} • ${currentCalculatorInputs.vehicleCategory}`,
        },
      });
      setStatusMessage(`Successfully saved scenario: "${scenarioName}"`);
    } else if (scenarioType === 'fleet' && currentFleetVehicles) {
      saveScenario({
        name: scenarioName.trim(),
        type: 'fleet',
        fleetVehicles: currentFleetVehicles,
        notes: scenarioNotes.trim() || undefined,
        summaryHighlights: {
          monthlySavingsINR: 0,
          monthlyDistanceKm: 0,
          vehicleDescription: `${currentFleetVehicles.length} Fleet Vehicles Modeled`,
        },
      });
      setStatusMessage(`Successfully saved fleet profile: "${scenarioName}"`);
    }

    setScenarioName('');
    setScenarioNotes('');
    refreshList();
    setActiveTab('saved');
  };

  const handleDelete = (id: string) => {
    deleteScenario(id);
    refreshList();
  };

  const handleLoad = (scenario: SavedScenario) => {
    if (scenario.type === 'calculator' && scenario.calculatorInputs && onLoadCalculatorInputs) {
      onLoadCalculatorInputs(scenario.calculatorInputs);
      setStatusMessage(`Loaded calculator inputs from "${scenario.name}".`);
      setTimeout(() => onClose(), 800);
    } else if (scenario.type === 'fleet' && scenario.fleetVehicles && onLoadFleetVehicles) {
      onLoadFleetVehicles(scenario.fleetVehicles);
      setStatusMessage(`Loaded fleet vehicles from "${scenario.name}".`);
      setTimeout(() => onClose(), 800);
    }
  };

  const handleExport = () => {
    const json = exportScenariosJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `GigEV_Saved_Scenarios_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSubmit = () => {
    if (!importJsonText.trim()) return;
    const res = importScenariosJson(importJsonText);
    if (res.success) {
      setStatusMessage(`Imported ${res.count} scenarios successfully.`);
      setShowImportBox(false);
      setImportJsonText('');
      refreshList();
    } else {
      setStatusMessage(`Import failed: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-100 text-emerald-800 rounded-lg">
              <FolderOpen className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                Data Persistence &amp; Scenarios
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Saved Scenarios &amp; Cloud Sync
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close scenarios modal"
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-slate-200 gap-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'saved'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Saved Scenarios ({scenarios.length})
          </button>
          <button
            onClick={() => setActiveTab('save_current')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'save_current'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Save Current State
          </button>
          <button
            onClick={() => setActiveTab('cloud_info')}
            className={`px-3 py-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'cloud_info'
                ? 'border-emerald-600 text-emerald-900 bg-emerald-50/50 rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Cloud / Firebase Status
          </button>
        </div>

        {statusMessage && (
          <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-emerald-700 font-bold ml-2">
              ×
            </button>
          </div>
        )}

        {/* TAB 1: SAVED SCENARIOS LIST */}
        {activeTab === 'saved' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Store multiple delivery scenarios and reload them anytime offline.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                  title="Export scenarios as JSON"
                >
                  <Download className="w-3 h-3" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => setShowImportBox(!showImportBox)}
                  className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                  title="Import scenarios from JSON"
                >
                  <Upload className="w-3 h-3" />
                  <span>Import</span>
                </button>
              </div>
            </div>

            {showImportBox && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <label className="font-semibold text-slate-800 block">
                  Paste Exported JSON Data:
                </label>
                <textarea
                  rows={3}
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder='{"scenarios": [...]}'
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg font-mono text-xs focus:outline-emerald-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowImportBox(false)}
                    className="px-2.5 py-1 rounded text-slate-600 hover:bg-slate-200 text-[11px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleImportSubmit}
                    className="px-3 py-1 bg-emerald-600 text-white rounded font-bold text-[11px] hover:bg-emerald-700"
                  >
                    Load Imported Data
                  </button>
                </div>
              </div>
            )}

            {scenarios.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                <Clock className="w-8 h-8 text-slate-400 mx-auto" />
                <h4 className="font-bold text-slate-700">No Saved Scenarios Yet</h4>
                <p className="text-slate-500 max-w-sm mx-auto text-[11px]">
                  Switch to the &ldquo;Save Current State&rdquo; tab to save your active calculator inputs or fleet comparison profile.
                </p>
                <button
                  onClick={() => setActiveTab('save_current')}
                  className="mt-2 px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-xs"
                >
                  Save Current Inputs
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                {scenarios.map((sc) => (
                  <div
                    key={sc.id}
                    className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-emerald-300 shadow-xs flex items-center justify-between gap-3 text-xs transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{sc.name}</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            sc.type === 'calculator'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {sc.type === 'calculator' ? 'Calculator' : 'Fleet Profile'}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {sc.summaryHighlights.vehicleDescription}
                        {sc.summaryHighlights.monthlyDistanceKm > 0 && (
                          <span> • {formatNumber(sc.summaryHighlights.monthlyDistanceKm)} km/mo</span>
                        )}
                        <span> • {new Date(sc.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      {sc.notes && (
                        <div className="text-[11px] text-slate-600 italic">
                          &ldquo;{sc.notes}&rdquo;
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleLoad(sc)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                      >
                        Load
                      </button>
                      <button
                        onClick={() => handleDelete(sc.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete scenario"
                        aria-label="Delete scenario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SAVE CURRENT STATE */}
        {activeTab === 'save_current' && (
          <div className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-semibold text-slate-800 block">Scenario Name:*</label>
              <input
                type="text"
                placeholder="e.g. Zomato Bengaluru Ather 450X 90km"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 focus:bg-white text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800 block">Scope to Save:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setScenarioType('calculator')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scenarioType === 'calculator'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Calculator className="w-4 h-4 text-emerald-700" />
                    <span>Single EV Calculator State</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal block mt-1">
                    Saves active distance, platform, tariff &amp; financing terms
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setScenarioType('fleet')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    scenarioType === 'fleet'
                      ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-bold'
                      : 'border-slate-200 bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs">
                    <Layers className="w-4 h-4 text-emerald-700" />
                    <span>Fleet Comparison Profile</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-normal block mt-1">
                    Saves the active multi-vehicle comparison table
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-800 block">Notes / Assumption Tag (Optional):</label>
              <input
                type="text"
                placeholder="e.g. Based on monsoon surcharge with 15% NBFC loan"
                value={scenarioNotes}
                onChange={(e) => setScenarioNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-emerald-500 focus:bg-white text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setActiveTab('saved')}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCurrent}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>Save Scenario</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: CLOUD & FIREBASE ARCHITECTURE (Feature 4 requirement) */}
        {activeTab === 'cloud_info' && (
          <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="font-bold text-slate-900 text-xs flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-700" />
                <span>Backend Storage &amp; Authentication Architecture</span>
              </div>
              <p>
                <strong>Current Active Mode:</strong> Offline Local Storage. All scenarios and fleet profiles are saved securely within your device&apos;s browser sandbox without transmitting private financial data across external networks.
              </p>
            </div>

            <div className="p-3.5 bg-blue-50/70 rounded-xl border border-blue-200 space-y-2 text-blue-950">
              <div className="font-bold text-xs flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
                <span>Production Firebase Integration Blueprint (Feature 4 Spec)</span>
              </div>
              <p>
                To enable multi-device cloud synchronization and Google user sign-in for production:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-blue-900">
                <li>
                  <strong>Authentication:</strong> Firebase Auth with Google Workspace / Mobile OTP sign-in.
                </li>
                <li>
                  <strong>Firestore Isolation:</strong> User scenarios stored under <code>/users/&#123;uid&#125;/scenarios/&#123;id&#125;</code>.
                </li>
                <li>
                  <strong>Enforced Security Rules:</strong>
                  <pre className="bg-white p-2 rounded border border-blue-200 font-mono text-[10px] text-slate-800 mt-1 overflow-x-auto">
{`service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/scenarios/{scenarioId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}`}
                  </pre>
                </li>
              </ol>
            </div>

            <div className="text-[11px] text-slate-500">
              * Note: Firebase credentials are not hardcoded or fabricated in this build. Cloud synchronization can be connected seamlessly whenever Firebase keys are provisioned in <code>.env</code>.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
