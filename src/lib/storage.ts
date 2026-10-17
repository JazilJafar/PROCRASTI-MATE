import type { AppData, Settings } from '../types';
const KEY = 'procrasti-mate-data';
export const defaults: Settings = { intensity: 'savage', speech: true, sounds: false, duration: 25, camera: false, chaos: false };
export const initialData = (): AppData => ({ tasks: [], sessions: [], achievements: [], settings: defaults });
export function loadData(): AppData {
  try {
    const raw = localStorage.getItem(KEY); if (!raw) return initialData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    return { tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [], sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [], achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [], settings: { ...defaults, ...(parsed.settings || {}) } };
  } catch { return initialData(); }
}
export function saveData(data: AppData) { try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* storage can be disabled */ } }
