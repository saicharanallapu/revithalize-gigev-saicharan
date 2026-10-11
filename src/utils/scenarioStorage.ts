/**
 * Scenario Storage Utility
 * Provides offline scenario persistence in localStorage with support for
 * saving, loading, listing, deleting, and exporting/importing user calculation profiles.
 */

import { SavedScenario, CalculatorInputs, FleetComparisonVehicle } from '../types';

const STORAGE_KEY = 'gidev_saved_scenarios_v1';

export function getSavedScenarios(): SavedScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse saved scenarios from localStorage:', err);
    return [];
  }
}

export function saveScenario(
  scenario: Omit<SavedScenario, 'id' | 'createdAt'>
): SavedScenario {
  const existing = getSavedScenarios();
  const newScenario: SavedScenario = {
    ...scenario,
    id: `scenario-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    createdAt: new Date().toISOString(),
  };

  const updated = [newScenario, ...existing];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save scenario to localStorage:', err);
  }
  return newScenario;
}

export function deleteScenario(id: string): void {
  const existing = getSavedScenarios();
  const updated = existing.filter((s) => s.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to delete scenario from localStorage:', err);
  }
}

export function exportScenariosJson(): string {
  const scenarios = getSavedScenarios();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      app: 'GigEV — Gig Worker EV Financial Intelligence Platform',
      version: '1.0',
      scenarios,
    },
    null,
    2
  );
}

export function importScenariosJson(jsonString: string): { success: boolean; count: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonString);
    const list = Array.isArray(parsed) ? parsed : parsed.scenarios;
    if (!Array.isArray(list)) {
      return { success: false, count: 0, error: 'Invalid JSON format: missing scenarios array.' };
    }

    const existing = getSavedScenarios();
    const existingIds = new Set(existing.map((s) => s.id));
    const toAdd: SavedScenario[] = [];

    for (const item of list) {
      if (item && item.name && item.type) {
        const id = item.id && !existingIds.has(item.id) ? item.id : `imported-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        toAdd.push({
          ...item,
          id,
          createdAt: item.createdAt || new Date().toISOString(),
        });
      }
    }

    const merged = [...toAdd, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return { success: true, count: toAdd.length };
  } catch (err: any) {
    return { success: false, count: 0, error: err.message || 'JSON parsing failed' };
  }
}
