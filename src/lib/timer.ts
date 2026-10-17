export function elapsedSeconds(startedAt: number, now = Date.now()) { return Math.max(0, Math.floor((now - startedAt) / 1000)); }
export function formatTime(seconds: number) { const safe = Math.max(0, seconds); return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`; }
