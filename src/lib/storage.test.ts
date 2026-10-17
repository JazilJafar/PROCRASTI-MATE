import { describe, expect, it, beforeEach } from 'vitest';
import { defaults, loadData, saveData } from './storage';
import type { AppData } from '../types';
const memory = new Map<string, string>();
beforeEach(() => { memory.clear(); Object.defineProperty(globalThis, 'localStorage', { value: { getItem: (k: string) => memory.get(k) ?? null, setItem: (k: string, v: string) => memory.set(k, v) }, configurable: true }); });
describe('local persistence', () => {
  it('round trips valid data and survives malformed data', () => {
    const data: AppData = { tasks: [{ id: '1', title: 'Ship', description: '', priority: 'high', estimate: 25, completed: false, createdAt: 1 }], sessions: [], achievements: [], settings: defaults };
    saveData(data); expect(loadData().tasks[0].title).toBe('Ship');
    memory.set('procrasti-mate-data', '{broken'); expect(loadData().tasks).toEqual([]);
  });
});
