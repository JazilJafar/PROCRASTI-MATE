let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  audioContext ??= new AudioContext();
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

export function playFocusChime(cueNumber: number): boolean {
  const context = getAudioContext();
  if (!context) return false;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = cueNumber % 3 === 0 ? 'triangle' : 'sine';
  oscillator.frequency.setValueAtTime(cueNumber % 2 === 0 ? 660 : 523.25, now);
  oscillator.frequency.exponentialRampToValueAtTime(cueNumber % 2 === 0 ? 880 : 659.25, now + 0.14);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  oscillator.connect(gain).connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + 0.3);
  return true;
}
