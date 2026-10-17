import { describe, expect, it } from 'vitest';
import { awardAchievements } from './achievements';
describe('achievements', () => {
  it('awards once from real completed sessions', () => {
    const session = { id: 's', startedAt: 0, endedAt: 1, duration: 1500, distractions: 0, completed: true };
    const once = awardAchievements([session], [], []); const twice = awardAchievements([session], [], once);
    expect(once.map(a => a.id)).toEqual(expect.arrayContaining(['first-blood', 'locked-in', 'unbothered'])); expect(twice).toHaveLength(once.length);
  });
});
