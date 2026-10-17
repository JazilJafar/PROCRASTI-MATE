import type { EventType, Intensity } from '../types';
const messages: Record<Intensity, string[]> = {
  mild: ['Tiny detour. Your task is still waiting.', 'A brief wander. Back to the good stuff.', 'Your future self gently cleared its throat.', 'The internet will survive without you for five minutes.', 'Nice scenic route. The destination is still your task.', 'Small plot twist. Let’s return to the plan.', 'Focus is a practice, not a personality trait.', 'One tab at a time. You’ve got this.', 'Your task misses you. Awkward.', 'A little less scroll, a little more goal.'],
  savage: ['Your deadline is moving faster than your motivation.', 'That tab switch had more commitment than your work.', 'Your task is not going to complete itself. Weird, right?', 'You have successfully optimized the art of avoidance.', 'The chair is doing more work than you.', 'Your attention span just filed for independence.', 'A bold strategy: hoping the problem solves itself.', 'Your to-do list has seen things.', 'This is not focus. This is interpretive procrastination.', 'Back to work before your deadline starts laughing.'],
  unhinged: ['Breaking news: the chair has completed more work than you.', 'Your browser history is a cry for help with excellent formatting.', 'The task is aging like fine cheese while you wander.', 'You have been selected for the prestigious award of Doing Literally Anything Else.', 'A productivity ghost just left your body and took the snacks.', 'Your future self is writing a strongly worded review.', 'The deadline is outside with a tiny baseball bat.', 'You looked away and your ambition called customer support.', 'This session has entered its flop era. Reboot your focus.', 'Return to the task, brave little tab goblin.']
};
export function chooseRoast(intensity: Intensity, event: EventType, distractionCount: number, lastAt = 0, now = Date.now()): string | null {
  if (now - lastAt < 10000) return null;
  const list = messages[intensity]; const offset = (distractionCount + event.length) % list.length; return list[offset];
}
export const allRoasts = messages;
