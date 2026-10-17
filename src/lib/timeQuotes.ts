const timeQuotes = [
  'One minute is gone. Make the next one count.',
  'Time is moving. You might as well move with it.',
  'Future you is watching. Give them something useful to inherit.',
  'Small progress still counts, unlike another scroll.',
  'You do not need perfect focus. You need the next honest minute.',
  'The clock is not judging you. It is just keeping receipts.',
  'Keep going. Momentum is less dramatic than motivation, but more reliable.',
  'Another minute invested is another minute your deadline cannot steal.',
  'You are already here. That is the hardest part procrastination tries to hide.',
  'Do the next small thing before your brain opens a new tab.',
  'Time spent focusing compounds. So does time spent avoiding.',
  'A quiet minute of work beats a loud hour of planning.',
];

export function getTimeQuote(elapsedSeconds: number): string {
  const index = Math.floor(Math.max(0, elapsedSeconds) / 60) % timeQuotes.length;
  return timeQuotes[index];
}
