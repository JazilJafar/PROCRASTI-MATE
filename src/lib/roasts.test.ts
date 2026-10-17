import { describe, expect, it } from 'vitest';
import { chooseRoast } from './roasts';
describe('roast engine', () => {
  it('returns a roast for every intensity', () => { expect(chooseRoast('mild', 'tab-hidden', 1, 0, 20_000)).toBeTypeOf('string'); expect(chooseRoast('savage', 'head-turn', 2, 0, 20_000)).toBeTypeOf('string'); expect(chooseRoast('unhinged', 'face-missing', 3, 0, 20_000)).toBeTypeOf('string'); });
  it('enforces cooldown', () => { expect(chooseRoast('mild', 'tab-hidden', 1, 15_000, 20_000)).toBeNull(); });
});
