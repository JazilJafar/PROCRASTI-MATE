import { describe, expect, it } from 'vitest';
import { elapsedSeconds, formatTime } from './timer';
describe('timestamp timer', () => {
  it('calculates elapsed time without interval drift', () => { expect(elapsedSeconds(1_000, 91_500)).toBe(90); });
  it('formats remaining time', () => { expect(formatTime(1505)).toBe('25:05'); expect(formatTime(-1)).toBe('00:00'); });
});
