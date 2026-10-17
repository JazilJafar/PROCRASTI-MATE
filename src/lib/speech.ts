const preferredVoiceNames = [
  'Samantha',
  'Karen',
  'Google US English',
  'Google UK English Female',
  'Microsoft Zira',
  'Microsoft Jenny',
];

const playfulOpeners = [
  'Hey, tiny focus check.',
  'Okay, bestie, quick reality check.',
  'Plot twist, it is focus time.',
  'The focus gremlin has a note for you.',
  'Friendly interruption incoming.',
];

export function speakRoast(text: string): boolean {
  if (!('speechSynthesis' in window)) return false;
  const opener = playfulOpeners[Math.floor(Math.random() * playfulOpeners.length)];
  const utterance = new SpeechSynthesisUtterance(`${opener} ... ${text}`);
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(voice =>
    preferredVoiceNames.some(name => voice.name.toLowerCase().includes(name.toLowerCase())),
  );
  utterance.voice = preferred ?? voices.find(voice => /^en(-|_)/i.test(voice.lang)) ?? voices[0];
  utterance.rate = 1.06 + Math.random() * 0.08;
  utterance.pitch = 1.08 + Math.random() * 0.1;
  utterance.volume = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
  return true;
}
