let audioContext: AudioContext | null = null;
let masterGain: GainNode | null = null;
let compressor: DynamicsCompressorNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null;
  audioContext ??= new AudioContext();
  if (!masterGain) {
    masterGain = audioContext.createGain();
    compressor = audioContext.createDynamicsCompressor();
    masterGain.gain.value = 1.8;
    compressor.threshold.value = -18;
    compressor.knee.value = 12;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.003;
    compressor.release.value = 0.2;
    masterGain.connect(compressor).connect(audioContext.destination);
  }
  if (audioContext.state === 'suspended') void audioContext.resume();
  return audioContext;
}

export function playFocusChime(cueNumber: number): boolean {
  const context = getAudioContext();
  if (!context || !masterGain) return false;
  const output = masterGain;

  const now = context.currentTime;
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = cueNumber % 3 === 0 ? 'triangle' : 'sine';
  oscillator.frequency.setValueAtTime(cueNumber % 2 === 0 ? 660 : 523.25, now);
  oscillator.frequency.exponentialRampToValueAtTime(cueNumber % 2 === 0 ? 880 : 659.25, now + 0.14);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.24, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
  oscillator.connect(gain).connect(output);
  oscillator.start(now);
  oscillator.stop(now + 0.3);
  return true;
}

export function playAttentionAlert(): boolean {
  const context = getAudioContext();
  if (!context || !masterGain) return false;
  const output = masterGain;
  const now = context.currentTime;
  [0, 0.18, 0.36, 0.54].forEach((offset, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(index % 2 ? 740 : 520, now + offset);
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.82, now + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.16);
    oscillator.connect(gain).connect(output);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + 0.18);
  });
  return true;
}

export function playQuietReminder(): boolean {
  const context = getAudioContext();
  if (!context || !masterGain) return false;
  const output = masterGain;
  const now = context.currentTime;
  [0, 0.16].forEach((offset, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(index ? 520 : 440, now + offset);
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.22, now + offset + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.12);
    oscillator.connect(gain).connect(output);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + 0.14);
  });
  return true;
}
